import { wrapHandler } from '../'

const onCreateHandler = (fn) => wrapHandler(() => {
  let run = false
  return (...args) => {
    if (run) {
      return
    }

    run = true

    fn(...args)
  }
})

export default onCreateHandler
