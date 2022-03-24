import { isHandler, wrapHandler, type BlockHandler, type HandlerFunction } from './handler'

export default function composeHandlers(...handlersOrFunctions: Array<BlockHandler | HandlerFunction>): BlockHandler {
  return wrapHandler(() => {
    const handlers = handlersOrFunctions.map(h => isHandler(h) ? h() : h)

    return (value, update, oldValue) => {
      let prevValue = oldValue
      let nextValue = value

      const patchedUpdate = (newValue) => {
        oldValue = nextValue
        nextValue = update(newValue)

        return nextValue
      }

      for (let handler of handlers) {
        handler(nextValue, patchedUpdate, prevValue)
      }
    }
  })
}
