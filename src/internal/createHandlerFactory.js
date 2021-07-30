import setPath from 'lodash/set'

import { type BlockHandler, type HandlerInstance } from '../handler'

export const createHandlerFactory = (handler: BlockHandler) => {
  // returns partial handler instance
  // for connect to parent partial handler
  return (selfRender) => {
    const handlerFn = handler()

    let parentCtxInstance
    let pathToBlock
    let updatedValue

    const update = (newValue: Object): Object => {
      updatedValue = selfRender(newValue, pathToBlock, parentCtxInstance)

      if (parentCtxInstance) {
        parentCtxInstance.updateWithValue(pathToBlock, updatedValue)
      }

      return updatedValue
    }

    return {

      getPath: (): string => pathToBlock,

      wrapParentHandler(parentHandlerInstance: HandlerInstance, path: string) {
        parentCtxInstance = parentHandlerInstance
        pathToBlock = path
      },

      invoke(value: Object, oldValue: Object): Object {
        updatedValue = value
        handlerFn && handlerFn(value, update, oldValue)

        return updatedValue
      },

      updateWithValue(path: string, valueAtPath: Object): Object {
        return update(setPath({}, path, valueAtPath))
      }

    }
  }
}