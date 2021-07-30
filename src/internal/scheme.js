import getPath from 'lodash/get'
import setPath from 'lodash/set'
import merge from 'lodash/merge'


export const isFieldReducer = test => test.__field_reducer === true
export const isBlock = test => test.__block === true
export const isDataBlock = test => test.__data_block === true

const buildPath = (...args) => args.filter(Boolean).join('.')

export const SchemeRenderer = (scheme, initialValue, handlerInstance) => {
  // redering time code
  const blocks = {}

  return (newValue, oldValue, path) => {
    const result = merge({}, oldValue, newValue)

    const renderSchemePart = (part, basePath) => {
      for (const key of Object.keys(part)) {
        const entry = part[key]
        const fullPath = buildPath(path, basePath, key)

        if (typeof entry === 'function') {

          if (isFieldReducer(entry)) {
            setPath(result, fullPath, entry(result, oldValue, fullPath))

          } else if (isBlock(entry)) {
            if (!blocks[fullPath]) {
              const partialOldValue = getPath(oldValue, fullPath)
              blocks[fullPath] = entry(partialOldValue)
            }

            const partialNewValue = getPath(result, fullPath)
            setPath(result, fullPath, blocks[fullPath](partialNewValue, fullPath, handlerInstance))

          } else {
            setPath(result, fullPath, entry())
          }

        } else if (typeof entry === 'object') {

          renderSchemePart(entry, key)

        } else {
          setPath(result, fullPath, entry)
        }
      }
    }

    renderSchemePart(scheme)

    return result
  }
}
