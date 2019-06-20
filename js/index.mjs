import { html, render } from "https://unpkg.com/htm/preact/standalone.mjs"
import genColor from "https://unpkg.com/@qvvg/gen-color@1.0.0"
import shh from "https://unpkg.com/@qvvg/silence@0.1.0"
import counter from "./domain/counter.mjs"
import withEntity, { handleInit, handleTell, debug } from "./utils/withEntity.mjs"

const RenderCounter = ({ id, count, inc = id => counter.tell(id, "inc") }) =>
  count == null
    ? html`
        <button>Loading...<//>
      `
    : html`
        <button onClick=${shh(_ => inc(id))}>${id}: ${count}<//>
      `

const Counter = withEntity([
  debug(true),
  handleInit(({ Ok, self }, props) => {
    counter.init(props.id)
    counter.tell(props.id, "subscribe", self())
    return Ok(props)
  }),
  handleTell(counter.events.count, ({ Ok, injectProps }, state, { count }) => {
    injectProps({ count })
    return Ok(state)
  }),
])(RenderCounter)

const App = html`
  <div class="root">
    <h3>${genColor()}<//>
    <div class="buttons">
      <${Counter} id=${"Foo"} />
      <${Counter} id=${"Bar"} />
    </div>
  <//>
`

render(App, document.getElementById("app"))
