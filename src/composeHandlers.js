import { isHandler, wrapHandler, type BlockHandler, type HandlerFunction } from './handler'

export default function composeHandlers(...handlersOrFunctions: Array<BlockHandler | HandlerFunction>): BlockHandler {
  return wrapHandler(() => {
    const handlers = handlersOrFunctions.map(h => isHandler(h) ? h() : h)

    return (value, update, oldValue) => {
      let breakChain = false

      const patchedUpdate = (newValue) => {
        const nextValue = update(newValue)

        breakChain = true

        return nextValue
      }

      for (let handler of handlers) {
        handler(value, patchedUpdate, oldValue)

        if (breakChain) {
          return
        }
      }
    }
  })
}
