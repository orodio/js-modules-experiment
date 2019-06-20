import { html } from "https://unpkg.com/htm@2.1.1/preact/standalone.mjs"
import shh from "https://unpkg.com/@qvvg/silence@1.0.0/silence.mjs"
import counter from "../domains/counter.mjs"
import withCounter from "../sidecars/with-counter.mjs"

const injectedInc = id => counter.tell(id, "inc")
const injectedDec = id => counter.tell(id, "dec")

export const Counter = ({ counterId, count, inc = injectedInc, dec = injectedDec }) =>
  count == null
    ? html`
        <div>Loading...</div>
      `
    : html`
        <div class="Counter">
          <p class="Counter__Label">
            ${counterId}: ${count}
          <//>
          <div class="Counter_Buttons">
            <button class="Counter__Button" onClick=${shh(_ => dec(counterId))}>Dec<//>
            <button class="Counter__Button" onClick=${shh(_ => inc(counterId))}>Inc<//>
          </div>
        <//>
      `

export default withCounter(Counter)
