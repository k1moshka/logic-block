import { SchemeRenderer } from './internal/scheme'
import { createHandlerFactory } from './internal/createHandlerFactory'
import { merge } from './internal/merge'
import { type BlockHandler } from './handler'

export type BlockInstanceOptions = {
  handleUpdate: (newValue: Object) => void
}
export type BlockFactory = (initialValues: Object, options: BlockInstanceOptions) => (Object) => Object


const HANDLER_LOOP_LIMIT = 100

export const isBlock = test => test.__block === true

export const Block = (scheme: Object, handlerFn: BlockHandler): BlockFactory => {
  // handlerFn - handler that defines in definition-time
  let handlerFactory
  if (typeof handlerFn === 'function') {
    handlerFactory = createHandlerFactory(handlerFn)
  } else {
    handlerFactory = createHandlerFactory(() => { })
  }


  const blockFactory = (initialValue, options = {}) => {
    const { handleUpdate } = options

    const handlerInstance = handlerFactory(HandlerRenderer)

    const renderScheme = SchemeRenderer(scheme, initialValue, handlerInstance)

    let currentValue
    let handlerOldValue
    let isInitialRender = true

    function HandlerRenderer(newValue = initialValue, path, parentHandlerInstance) {
      let result
      if (handlerOldValue) {
        result = renderScheme(merge({}, handlerOldValue, newValue))
        currentValue = handlerOldValue
        // update handler old value due to work multiple sync update function in the same handler
        // example:
        // --------------------------
        // update({a: 1}); update({b: 1});
        // this invokes will updated both fields 'a' and 'b'
        // but ig we dont set handler old value it will cause to update only from last invoke of 'update'
        // --------------------------
        handlerOldValue = result
      } else {
        // if not, means that update was invoked async
        result = BlockInstance(newValue, path, parentHandlerInstance)
      }

      return result
    }

    function BlockInstance(newValue = initialValue, path, parentHandlerInstance) {
      // parentHandler - isntance of parent handler
      handlerInstance.wrapParentHandler(parentHandlerInstance, path)

      let newValueSlice
      if (typeof newValue === 'function') {
        newValueSlice = newValue(currentValue)
      } else {
        newValueSlice = newValue
      }

      if (typeof newValueSlice !== 'object' && typeof newValueSlice !== 'undefined') {
        throw new Error('BlockInstance newValue argument should be an undefined value or an object or a function which returns object with only updated values')
      }

      const updatedValue = merge({}, currentValue, newValueSlice)
      let result = renderScheme(updatedValue, currentValue)

      let step = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        handlerOldValue = result

        const executedResult = handlerInstance.invoke(result, currentValue)
        const valueIsNotChanged = executedResult === result

        result = executedResult
        handlerOldValue = undefined

        if (valueIsNotChanged) {
          break
        }

        step += 1

        if (step >= HANDLER_LOOP_LIMIT) {
          console.error('Limit of handler loop is reached.')
          break
        }
      }

      if (!isInitialRender) {
        handleUpdate && handleUpdate(result)
      }

      handlerOldValue = undefined
      currentValue = result
      isInitialRender = false

      return result
    }
    BlockInstance.__block_instance = true

    return BlockInstance
  }
  blockFactory.__getScheme = () => merge({}, scheme)
  blockFactory.__getHandler = () => handlerFn
  blockFactory.__block = true


  return blockFactory
}