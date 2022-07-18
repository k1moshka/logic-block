import setPath from 'lodash/set'

import { BlockHandler, HandlerInstance } from '../handler'

export const createHandlerFactory = (handler: BlockHandler) => {
  // returns partial handler instance
  // for connect to parent partial handler
  return (selfRender) => {
    const handlerFn = handler()

    let parentHandlerInstance
    let pathToBlock
    let updatedValue

    const update = (newValue: Record<string, any>): Record<string, any> => {
      updatedValue = selfRender(newValue, pathToBlock, parentHandlerInstance)

      if (parentHandlerInstance) {
        parentHandlerInstance.updateWithValue(pathToBlock, updatedValue)
      }

      return updatedValue
    }

    return {

      getPath: (): string => pathToBlock,

      wrapParentHandler(_parentHandlerInstance: HandlerInstance, path: string) {
        parentHandlerInstance = _parentHandlerInstance
        pathToBlock = path
      },

      invoke(value: Record<string, any>, oldValue: Record<string, any>): Record<string, any> {
        updatedValue = value
        handlerFn && handlerFn(value, update, oldValue)

        return updatedValue
      },

      updateWithValue(path: string, valueAtPath: Record<string, any>): Record<string, any> {
        return update(setPath({}, path, valueAtPath))
      }

    }
  }
}