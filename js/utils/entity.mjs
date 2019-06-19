const noop = () => ent => ent

export default function Entity(mods = []) {
  if (!(this instanceof Entity)) return new Entity(...arguments)
  this.node = {
    withName: null,
    label: "*",
    ns: key => `${this.node.label}::${key}`,
    config: {},
    deps: () => ({}),
    handleInit: ({ Ok }, init) => Ok(init),
    handleTell: {},
    handleAsk: {},
    handleContinue: {},
    handleTimeout: ({ Ok }, state) => Ok(state),
    handleTerminate: (_ctx, _state, reason) => reason,
  }
  this.node = mods.reduce((node, mod) => mod(node), this.node)
  this.callback = () => {}
}

export const label = label => n => ((n.label = label), n)
export const withName = fn => n => ((n.withName = fn), n)
export const config = (key, value) => n => ((n.config[key] = value), n)
export const deps = fn => n => ((n.deps = fn), n)
export const broadcast = noop

export const handleInit = fn => n => ((n.handleInit = fn), n)
export const handleTell = (key, fn) => n => ((n.handleTell[key] = fn), n)
export const handleAsk = (key, fn) => n => ((n.handleAsk[key] = fn), n)
export const handleContinue = (key, fn) => n => ((n.handleContinue[key] = fn), n)
export const handleTimeout = fn => n => ((n.handleTimeout = fn), n)
export const handleTerminate = fn => n => ((n.handleTerminate = fn), n)
