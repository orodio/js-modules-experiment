import { html, render } from "https://unpkg.com/htm/preact/standalone.mjs"
import genColor from "https://unpkg.com/@qvvg/gen-color@1.0.0"
import shh from "https://unpkg.com/@qvvg/silence@0.1.0"
import { spawn, send } from "https://unpkg.com/@qvvg/datum@0.1.5"
import counter from "./domain/counter.mjs"

window.counter = counter
console.log(counter)

const App = html`
  <div class="root">
    <h3>${genColor()}<//>
    <div class="buttons">
      <button onClick=${shh(_ => send("foo", "inc"))}>Inc<//>
      <button onClick=${shh(_ => send("foo", "dec"))}>Dec<//>
    </div>
  <//>
`

render(App, document.getElementById("app"))
