import getPath from 'lodash/get'


export const isFieldReducer = test => test.__field_reducer === true
export const isBlock = test => test.__block === true
export const isDataBlock = test => test.__data_block === true

export const buildPath = (...args) => args.filter(Boolean).join('.')

export const SchemeRenderer = (scheme, initialValue, handlerInstance) => {
  // redering time code

  return (newValue, oldValue, path) => {

    const renderSchemePart = (part, basePath) => {
      return Object.keys(part).reduce((result, key) => {
        const entry = part[key]

        if (typeof entry === 'function') {

          if (isFieldReducer(entry)) {
            const fullPath = buildPath(path, basePath, key)
            result[key] = entry(newValue, oldValue, fullPath)
          } else if (isBlock(entry)) {
            const fullPath = buildPath(path, basePath, key)
            const partialNewValue = getPath(newValue, fullPath)
            const partialOldValue = getPath(oldValue, fullPath)
            result[key] = entry(partialOldValue)(partialNewValue, fullPath, handlerInstance)
          } else {
            result[key] = entry()
          }

        } else if (typeof entry === 'object') {

          result[key] = renderSchemePart(entry, key)

        } else {
          result[key] = entry
        }

        return result
      }, {})
    }

    return renderSchemePart(scheme)
  }
}