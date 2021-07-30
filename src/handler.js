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
