// export type Render = (Object) => Object

// export type PartialHandler = (selfRender: Render) => HandlerInstance

// export type HandlerInstance = {
//   getPath: () => string,
//   wrapParentHandler: (parent: HandlerInstance, path: string) => void,
//   invoke: (newValue: Object, oldValue: Object) => void
// }

export const createHandlerFactory = (handlerFn) => {
  // returns partial handler instance
  // for connect to parent partial handler
  return (selfRender) => {
    let parentCtxInstance
    let pathToBlock
    let updatedValue

    const update = (newValue) => {
      updatedValue = selfRender(newValue, pathToBlock, parentCtxInstance)

      if (parentCtxInstance) {
        return parentCtxInstance.updateWithValue(pathToBlock, updatedValue)
      }

      return updatedValue
    }

    return {

      getPath: () => pathToBlock,

      wrapParentHandler(parentHandlerInstance, path) {
        parentCtxInstance = parentHandlerInstance
        pathToBlock = path
      },

      invoke(value, oldValue) {
        updatedValue = value
        handlerFn && handlerFn(value, update, oldValue)

        return updatedValue
      },

      updateWithValue(path, valueAtPath) {
        update({ [path]: valueAtPath })
      }

    }
  }
}
