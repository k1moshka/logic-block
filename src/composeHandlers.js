import { isHandler, wrapHandler } from './handler'

export function composeChainHandlers(...handlersOrFunctions) {
  return wrapHandler(() => {
    let nextValue = undefined
    let prevValue = undefined

    return (value, update, oldValue) => {
      nextValue = value
      prevValue = oldValue || prevValue

      let breakChain = false

      const patchedUpdate = (newValue) => {
        prevValue = nextValue
        nextValue = update(newValue)

        breakChain = true
      }

      for (let handler of handlersOrFunctions) {
        handler(nextValue, patchedUpdate, prevValue)

        if (breakChain) {
          return
        }
      }
    }
  })
}

export default function composeHandlers(...handlersOrFunctions) {
  return wrapHandler(() => {
    const handlers = handlersOrFunctions.map(h => isHandler(h) ? h() : h)

    return (...args) => {
      for (let handler of handlers) {
        handler(...args)
      }
    }
  })
}
