import merge from 'lodash/merge'

import { createChangesInstance } from './changes'
import { createCtxFactory } from './context'
import { SchemeRenderer } from './scheme'

export const Block = (scheme, contextHandler) => {
  // контекст это обработчик который определяется на стадии определения блока
  let contextFactory
  if (typeof contextHandler === 'function') {
    contextFactory = createCtxFactory(contextHandler)
  } else {
    contextFactory = createCtxFactory(() => { })
  }


  const blockInstance = (initialValue, options = {}) => {
    // ctx - это инстанс котекста, который может запускать обработчик при рендере
    const { handleUpdate, handleChanges } = options
    const changesDetector = typeof handleChanges === 'function'
      && createChangesInstance(handleChanges)

    const contextInstance = contextFactory(DataBlock)

    const renderScheme = SchemeRenderer(scheme, initialValue, contextInstance)

    let currentValue = initialValue
    let isInitialRender = true

    function DataBlock(newValue = initialValue, path, parentContextInstance) {
      // parentContext - это инстанс контекста родителя
      contextInstance.wrapParentContext(parentContextInstance, path)

      const updatedValue = merge({}, currentValue, newValue)
      const result = renderScheme(updatedValue, currentValue)

      const executedResult = contextInstance.invoke(result, currentValue)

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