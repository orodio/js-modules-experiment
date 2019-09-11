import {
  html,
  render
} from "https://unpkg.com/htm@2.1.1/preact/standalone.mjs";
import Counter from "./app/counter.mjs";

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
`;

render(App, document.getElementById("ROOT"));
