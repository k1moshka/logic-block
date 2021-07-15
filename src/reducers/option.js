import getPath from 'lodash/get'

import { createFieldReducer } from '../createFieldReducer'


const option = (defaultValue, valueOptions) =>
  createFieldReducer((value, oldValue, path) => {
    const newFieldValue = getPath(value, path)
    if (valueOptions.includes(newFieldValue)) {
      return newFieldValue
    }

    const oldFieldValue = getPath(oldValue, path)
    if (valueOptions.includes(oldFieldValue)) {
      return oldFieldValue
    }

    return defaultValue

  })

export default option
