export const isFieldReducer = test => test.__field_reducer === true

export const createFieldReducer = (reducerFn) => {
  const fieldReducer = (newValue, oldValue, path, parentHandlerInstance) => {
    return reducerFn(newValue, oldValue, path, parentHandlerInstance)
  }

  fieldReducer.__field_reducer = true
  return fieldReducer
}
