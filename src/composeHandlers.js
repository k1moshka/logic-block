import { isHandler, wrapHandler, type BlockHandler, type HandlerFunction } from './handler'

export default function composeHandlers(...handlersOrFunctions: Array<BlockHandler | HandlerFunction>): BlockHandler {
  return wrapHandler(() => {
    let nextValue = undefined
    let prevValue = undefined

    const handlers = handlersOrFunctions.map(h => isHandler(h) ? h() : h)


    return (value, update, oldValue) => {
      nextValue = value
      prevValue = oldValue || prevValue

      let breakChain = false

      const patchedUpdate = (newValue) => {
        prevValue = nextValue
        nextValue = update(newValue)

        breakChain = true
      }

      for (let handler of handlers) {
        handler(nextValue, patchedUpdate, prevValue)

        if (breakChain) {
          return
        }
      }
    }
  })
}
