import { debug, handleInit, handleTell } from "https://unpkg.com/@qvvg/entity@1.0.0/entity.mjs"
import { withEntity } from "https://unpkg.com/@qvvg/with-entity@1.0.0/with-entity.mjs"
import counter from "./counter-domain.mjs"

export default withEntity([
  debug(true),

  handleInit(({ Ok, self }, props) => {
    counter.init(props.counterId)
    counter.tell(props.counterId, "subscribe", self())
    return Ok(props)
  }),

  handleTell(counter.events.count, ({ Ok, injectProps }, state, { count }) => {
    injectProps({ count })
    return Ok(state)
  }),
])
