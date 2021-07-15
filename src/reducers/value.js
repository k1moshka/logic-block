import getPath from 'lodash/get'

import { createFieldReducer } from '../createFieldReducer'

const value = (defaultValue) =>
  createFieldReducer((v, _, path) => {
    const fieldValue = getPath(v, path)
    if (typeof fieldValue === 'undefined' && typeof defaultValue === 'function') {
      return defaultValue(v)
    }


    return getPath(v, path, defaultValue)
  })

export default value
