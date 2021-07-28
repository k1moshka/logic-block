export function composeChainHandlers(...handlers) {
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

    for (let handler of handlers) {
      handler(nextValue, patchedUpdate, prevValue)

      if (breakChain) {
        return
      }
    }
  }
}

export default function composeHandlers(...handlers) {
  return (...args) => {
    for (let handler of handlers) {
      handler(...args)
    }
  }
}
