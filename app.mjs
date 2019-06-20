import { html, render } from "/proxy/html.mjs"
import Counter from "/comps/counter.mjs"

export const App = html`
  <div>
    <div class="row">
      <${Counter} counterId="foo" />
      <${Counter} counterId="foo" />
      <${Counter} counterId="foo" />
    </div>
    <div class="row">
      <${Counter} counterId="bar" />
      <${Counter} counterId="bar" />
    </div>
    <div class="row">
      <${Counter} counterId="a" />
      <${Counter} counterId="b" />
      <${Counter} counterId="c" />
      <${Counter} counterId="d" />
      <${Counter} counterId="e" />
    </div>
    <div class="row">
      <${Counter} counterId="foo" />
      <${Counter} counterId="bar" />
      <${Counter} counterId="a" />
      <${Counter} counterId="foo" />
      <${Counter} counterId="e" />
    </div>
  </div>
`

render(App, document.getElementById("ROOT"))
