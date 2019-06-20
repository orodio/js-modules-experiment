import {
  Entity,
  label,
  withName,
  debug,
  config,
  deps,
  broadcast,
  handleInit,
  handleTell,
  handleAsk,
} from "https://unpkg.com/@qvvg/entity@1.0.0/entity.mjs"

export default Entity([
  debug(true),

  label("counter"),

  withName((id, label) => `${label}--${id}`),

  config("delta", 1),

  deps(_ => ({
    getCount: () => Promise.resolve(15),
  })),

  broadcast("count", state => ({ id: state.id, count: state.count })),

  handleInit(async ({ Ok, deps }, id) => {
    const count = await deps.getCount(id)
    const subs = new Set()
    return Ok({ id, subs, count })
  }),

  handleTell("subscribe", ({ Ok, broadcast }, state, sub) => {
    state.subs.add(sub)
    broadcast.count([sub], state)
    return Ok(state)
  }),

  handleTell("unsubscribe", ({ Ok }, state, sub) => {
    state.subs.delete(sub)
    return Ok(state)
  }),

  handleTell("inc", ({ Ok, broadcast, config }, state, delta) => {
    state.count = state.count + (delta || config.delta)
    broadcast.count(state.subs, state)
    return Ok(state)
  }),

  handleTell("dec", ({ Ok, broadcast, config }, state, delta) => {
    state.count = state.count - (delta || config.delta)
    broadcast.count(state.subs, state)
    return Ok(state)
  }),

  handleAsk("count", ({ Reply }, state) => {
    return Reply(state.count, state)
  }),
])
