import { html, Component } from "../../proxy/html.mjs"
import { Entity } from "../../proxy/entity.mjs"

export const withEntity = (mods = []) => Comp => {
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
