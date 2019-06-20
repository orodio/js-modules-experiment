import { send, spawn } from "https://unpkg.com/@qvvg/datum@0.1.9"
export { send, spawn }
import Signal from "./signal.mjs"

const noop = () => ent => ent

const tell = (address, verb, msg) => send({ to: address, meta: { type: "tell", verb } }, msg)
const ask = (address, verb, msg) =>
  new Promise(ok => {
    const from = spawn(async ctx => ok((await ctx.receive()).value))
    send({ to: address, from, meta: { type: "ask", verb } }, msg)
  })
const dump = address =>
  new Promise(ok => {
    const from = spawn(async ctx => ok((await ctx.receive()).value))
    send({ to: address, from, meta: { type: "dump" } })
  })
const stop = (address, reason) => send({ to: address, meta: { type: "stop" } }, reason)
const init = (ent, initState, opts) => spawn(ent, initState, opts)

export default function Entity(mods = []) {
  if (!(this instanceof Entity)) return new Entity(...arguments)
  this.node = {
    withName: null,
    label: "*",
    ns: key => `${this.node.label}/${key}`,
    config: {},
    broadcast: {},
    deps: () => ({}),
    handleInit: ({ Ok }, init) => Ok(init),
    handleTell: {},
    handleAsk: {},
    handleInfo: ({ Ok }, state) => Ok(state),
    handleContinue: {},
    handleTimeout: ({ Ok }, state) => Ok(state),
    handleTerminate: (_ctx, _state, reason) => reason,
  }
  this.node = mods.reduce((node, mod) => mod(node), this.node)
  this.callback = buildCallbackFromNode(this.node)
  this.events = Object.keys(this.node.broadcast).reduce((ex, e) => ({ ...ex, [e]: this.node.ns(e) }), {})
  this.withName = id => (this.node.withName != null ? this.node.withName(id, this.node.label) : id)
  this.init = (initState, opts) => spawn(this, initState, opts)
  this.stop = (address, reason) => stop(this.withName(address), reason)
  this.ask = (address, ...args) => ask(this.withName(address), ...args)
  this.tell = (address, ...args) => tell(this.withName(address), ...args)
  this.dump = address => dump(this.withName(address))
}

export const label = label => n => ((n.label = label), n)
export const withName = fn => n => ((n.withName = fn), n)
export const config = (key, value) => n => ((n.config[key] = value), n)
export const deps = fn => n => ((n.deps = fn), n)
export const broadcast = (key, fn) => n => {
  n.broadcast[key] = (pids, ...args) => {
    const msg = fn(...args)
    const event = n.ns(key)
    for (let pid of pids) tell(pid, event, msg)
  }
  return n
}
Entity.init = init
Entity.stop = stop
Entity.dump = dump
Entity.tell = tell
Entity.ask = ask

export const debug = bool => n => ((n.debug = bool), n)

export const handleInit = fn => n => ((n.handleInit = fn), n)
export const handleTell = (key, fn) => n => ((n.handleTell[key] = fn), n)
export const handleAsk = (key, fn) => n => ((n.handleAsk[key] = fn), n)
export const handleInfo = fn => n => ((n.handleInfo = fn), n)
export const handleContinue = (key, fn) => n => ((n.handleContinue[key] = fn), n)
export const handleTimeout = fn => n => ((n.handleTimeout = fn), n)
export const handleTerminate = fn => n => ((n.handleTerminate = fn), n)

function buildCallbackFromNode(node) {
  return async (context, initialState) => {
    const ctx = Ctx(context, node)
    var signal = await node.handleInit(ctx, initialState)
    var timeout = null

    const dismissTimeout = () => {
      if (timeout == null) return
      clearTimeout(timeout)
      timeout = null
    }

    const scheduleTimeout = ({ ms, args }) => {
      timeout = setTimeout(() => {
        send({ to: ctx.self(), from: ctx.self(), meta: { type: "timeout" } }, { ms, args })
      }, ms)
    }

    while (1) {
      let letter = null
      try {
        switch (true) {
          case Signal.isStop(signal):
            if (typeof signal.reason === "object") {
              const { label, pid, error, ...more } = signal.reason
              console.error(`EntityError: ${pid}<${label}>`, "--", error.message, "\n\n", more, "\n\n", error.stack)
              signal.reason = "Internal Error"
            }
            try {
              return node.handleTerminate(ctx, signal.state, signal.reason)
            } catch (err) {
              console.error(err)
              return "x.x -- so close, error in terminate function"
            }

          case Signal.hasTimeout(signal):
            scheduleTimeout(signal.timeout)
            signal = Signal.scrubTimeout(signal)
            break

          case Signal.hasContinue(signal):
            signal = await execContinue(node, ctx, signal.state, signal.continue)
            break

          case Signal.isOk(signal):
            letter = await context.receive()
            dismissTimeout()
            signal = await execMessage(node, ctx, signal.state, letter)
            break

          default:
            signal = ctx.Stop(signal.state, "Unknown Signal Type")
            break
        }
      } catch (error) {
        signal = ctx.Stop(signal.state, {
          wat: "Entity Signal Handler",
          label: node.label,
          pid: ctx.self(),
          signal,
          error,
        })
      }
    }
  }
}

const isTell = message => message.meta.type === "tell"
const isAsk = message => message.meta.type === "ask"
const isDump = message => message.meta.type === "dump"
const isTimeout = message => message.meta.type === "timeout"
const isStop = message => message.meta.type === "stop"

const execTell = (node, ctx, state, { meta: { verb }, value }) => node.handleTell[verb](ctx, state, value)
const execAsk = (node, ctx, state, { meta: { verb }, value }) => node.handleAsk[verb](ctx, state, value)
const execInfo = (node, ctx, state, message) => node.handleInfo(ctx, state, message)
const execDump = (_node, { Reply }, state, _message) => Reply(state, state)
const execTimeout = (node, ctx, state, { value: { args } }) => node.handleTimeout(ctx, state, ...args)

async function execMessage(node, ctx, state, message) {
  const from = message.from
  var signal = null
  if (from != null) ctx.reply = value => send({ to: from, from: ctx.self(), meta: { type: "reply" } }, value)

  try {
    switch (true) {
      case isStop(message):
        signal = ctx.Stop(state, message.value)
        break
      case isDump(message):
        signal = ctx.Reply(state, state)
        break
      case isTell(message):
        signal = await execTell(node, ctx, state, message)
        break
      case isAsk(message):
        signal = await execAsk(node, ctx, state, message)
        break
      case isTimeout(message):
        signal = await execTimeout(node, ctx, state, message)
        break
      default:
        signal = await execInfo(node, ctx, state, message)
        break
    }
  } catch (error) {
    return ctx.Stop(state, {
      wat: "Entity Mailbox Handler",
      label: node.label,
      pid: ctx.self(),
      currentState: state,
      receivedMessage: message,
      error,
    })
  }

  if (from != null && Signal.hasReply(signal)) ctx.reply(signal.reply)
  return Signal.scrubReply(signal)
}

function execContinue(node, ctx, state, { verb, args }) {
  return node.handleContinue[verb](ctx, state, ...args)
}

function Ctx(context, node) {
  if (!(this instanceof Ctx)) return new Ctx(...arguments)
  this.self = context.self
  this.Stop = Signal.Stop
  this.Ok = Signal.Ok
  this.Reply = Signal.Reply
  this.Continue = Signal.Continue
  this.Timeout = Signal.Timeout
  this.reply = () => {}
  this.deps = node.deps()
  this.config = node.config
  this.broadcast = node.broadcast
  for (let key of Object.keys(context.extra)) this[key] = context.extra[key]
}
