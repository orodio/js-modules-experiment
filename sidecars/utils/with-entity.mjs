import { html, Component } from "https://unpkg.com/htm@2.1.1/preact/standalone.mjs"
import { Entity } from "https://unpkg.com/@qvvg/entity@1.0.0/entity.mjs"

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
