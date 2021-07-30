import merge from 'lodash/merge'

import { createChangesInstance } from './internal/changes'
import { SchemeRenderer } from './internal/scheme'
import { createHandlerFactory } from './internal/createHandlerFactory'

const HANDLER_LOOP_LIMIT = 100

export const isBlock = test => test.__block === true

export const Block = (scheme, handlerFn) => {
  // handlerFn это обработчик который определяется на стадии определения блока
  let handlerFactory
  if (typeof handlerFn === 'function') {
    handlerFactory = createHandlerFactory(handlerFn)
  } else {
    handlerFactory = createHandlerFactory(() => { })
  }


  const blockFactory = (initialValue, options = {}) => {
    const { handleUpdate, handleChanges } = options
    const changesDetector = typeof handleChanges === 'function'
      && createChangesInstance(handleChanges)

    const handlerInstance = handlerFactory(HandlerRenderer)

    const renderScheme = SchemeRenderer(scheme, initialValue, handlerInstance)

    let currentValue = initialValue
    let handlerStashValue
    let isInitialRender = true

    function HandlerRenderer(newValue = initialValue, path, parentHandlerInstance) {
      if (handlerStashValue) {
        return renderScheme(merge({}, handlerStashValue, newValue))
      }

      // if not, means that update was invoked async
      BlockInstance(newValue, path, parentHandlerInstance)
    }

    function BlockInstance(newValue = initialValue, path, parentHandlerInstance) {
      // parentHandler - это инстанс хэндлера родителя
      handlerInstance.wrapParentHandler(parentHandlerInstance, path)

      const updatedValue = merge({}, currentValue, newValue)
      let result = renderScheme(updatedValue, currentValue)

      let step = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        handlerStashValue = result

        const executedResult = handlerInstance.invoke(result, currentValue)
        const valueIsNotChanged = executedResult === result

        result = executedResult
        currentValue = handlerStashValue
        handlerStashValue = undefined

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
        changesDetector && changesDetector.checkValues(result, currentValue)
      }

      handlerStashValue = undefined
      currentValue = result
      isInitialRender = false

      return result
    }
    BlockInstance.__data_block = true

    return BlockInstance
  }
  blockFactory.__getScheme = () => merge({}, scheme)
  blockFactory.__block = true


  return blockFactory
}