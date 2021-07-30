export const isFieldReducer = test => test.__field_reducer === true

export const createFieldReducer = (reducerFn) => {
  const fieldReducer = (newValue, oldValue, path) => {
    return reducerFn(newValue, oldValue, path)
  }

  fieldReducer.__field_reducer = true
  return fieldReducer
}
