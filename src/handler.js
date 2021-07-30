import setPath from 'lodash/set'

export type Render = (partialUpdatedValues: Object) => Object

export type PartialHandler = (selfRender: Render) => HandlerInstance

export type HandlerInstance = {
  getPath: () => string,
  wrapParentHandler: (parent: HandlerInstance, path: string) => void,
  invoke: (newValue: Object, oldValue: Object) => Object,
  updateWithValue: (path: string, valueAtPath: Object) => Object
}

export type HandlerFunction = (value: Object, update: Function, oldValue: Object) => {}
export type BlockHandler = () => HandlerFunction

export const isHandler = test => test.__block_handler === true

export const wrapHandler = (handler: BlockHandler): BlockHandler => {
  handler.__block_handler = true

  return handler
}

export const createHandler = (fn: HandlerFunction): BlockHandler => wrapHandler(() => fn)


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
