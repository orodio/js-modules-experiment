import { html, Component } from "https://unpkg.com/htm/preact/standalone.mjs"
import Entity, {
  label,
  debug,
  config,
  deps,
  broadcast,
  handleInit,
  handleTell,
  handleAsk,
  handleInfo,
  handleContinue,
  handleTimeout,
  handleTerminate,
  spawn,
  send,
} from "./entity.mjs"

export {
  label,
  debug,
  config,
  deps,
  broadcast,
  handleInit,
  handleTell,
  handleAsk,
  handleInfo,
  handleContinue,
  handleTimeout,
  handleTerminate,
  spawn,
  send,
}

export default (mods = []) => Comp => {
  const displayName = Comp.displayName || Comp.name || "[sc]"
  const sidecar = Entity(mods)

  return class extends Component {
    constructor(props) {
      super(props)
      this.state = {}
      this.$sidecard = sidecar.init(props, {
        label: `[${displayName}]`,
        inject: {
          injectProps: state => this.mount && this.setState(state),
        },
      })
    }

    componentDidMount() {
      this.mount = true
    }

    componentWillUnmount() {
      this.mount = false
      sidecar.stop(this.$sidecar, "Unmounted")
    }

    render() {
      return html`
        <${Comp} ...${this.props} ...${this.state} />
      `
    }
  }
}
