import getPath from 'lodash/get'

import { createFieldReducer } from '../createFieldReducer'

const value = (defaultValue) =>
  createFieldReducer((v, oldValue, path) => {
    if (typeof oldValue === 'undefined') {
      // initial render
      if (typeof defaultValue === 'function') {
        return getPath(v, path, defaultValue(v))
      } else {
        return getPath(v, path, defaultValue)
      }
    }

    return getPath(v, path)
  })

export default value
