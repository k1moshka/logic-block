// export type Render = (Object) => Object

// export type PartialContext = (selfRender: Render) => ContextInstance

// export type ContextInstance = {
//   getPath: () => string,
//   wrapParentContext: (parent: ContextInstance, path: string) => void,
//   invoke: (newValue: Object, oldValue: Object) => void
// }

export const createCtxFactory = (contextHandler) => {
  // returns partial context instance
  // for connect to parent context partial context
  return (selfRender) => {
    let parentCtxInstance
    let pathToBlock
    let updatedValue

    const update = (newValue) => {
      updatedValue = selfRender(newValue, pathToBlock, parentCtxInstance)

      if (parentCtxInstance) {
        parentCtxInstance.updateWithValue(pathToBlock, updatedValue)
      }
    }

    return {

      getPath: () => pathToBlock,

      wrapParentContext(parentContextInstance, path) {
        parentCtxInstance = parentContextInstance
        pathToBlock = path
      },

      invoke(value, oldValue) {
        updatedValue = value
        contextHandler && contextHandler(value, update, oldValue)

        return updatedValue
      },

      updateWithValue(path, valueAtPath) {
        update({ [path]: valueAtPath })
      }

    }
  }
}
