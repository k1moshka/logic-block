import merge from 'lodash/merge'

import { createChangesInstance } from './changes'
import { createHandlerFactory } from './handler'
import { SchemeRenderer } from './scheme'

export const Block = (scheme, handlerFn) => {
  // контекст это обработчик который определяется на стадии определения блока
  let handlerFactory
  if (typeof handlerFn === 'function') {
    handlerFactory = createHandlerFactory(handlerFn)
  } else {
    handlerFactory = createHandlerFactory(() => { })
  }


  const blockInstance = (initialValue, options = {}) => {
    // ctx - это инстанс котекста, который может запускать обработчик при рендере
    const { handleUpdate, handleChanges } = options
    const changesDetector = typeof handleChanges === 'function'
      && createChangesInstance(handleChanges)

    const handlerInstance = handlerFactory(DataBlock)

    const renderScheme = SchemeRenderer(scheme, initialValue, handlerInstance)

    let currentValue = initialValue
    let isInitialRender = true

    function DataBlock(newValue = initialValue, path, parentHandlerInstance) {
      // parentHandler - это инстанс хэндлера родителя
      handlerInstance.wrapParentHandler(parentHandlerInstance, path)

      const updatedValue = merge({}, currentValue, newValue)
      const result = renderScheme(updatedValue, currentValue)

      const executedResult = handlerInstance.invoke(result, currentValue)

      if (!isInitialRender) {
        handleUpdate && handleUpdate(executedResult)
        changesDetector && changesDetector.checkValues(executedResult, currentValue)
      }

      currentValue = executedResult
      isInitialRender = false

      return executedResult
    }
    DataBlock.__data_block = true

    return DataBlock
  }
  blockInstance.__getScheme = () => merge({}, scheme)
  blockInstance.__block = true


  return blockInstance
}