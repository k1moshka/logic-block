import getPath from 'lodash/get'

import { createFieldReducer } from '../createFieldReducer'

import fields from './fields'

const memo = (reduceFn, deps) =>
  createFieldReducer((value, oldValue, path) => {
    const shouldUpdate = (value, prevValue) => {
      if (value === undefined && prevValue === undefined) {
        return true
      }

      for (const dep of deps) {
        if (getPath(value, dep) !== getPath(prevValue, dep)) {
          return true
        }
      }

      return false
    }

    const FieldsReducer = fields(reduceFn, deps)

    if (shouldUpdate(value, oldValue)) {
      return FieldsReducer(value, oldValue, path)
    }

    return getPath(value, path)
  })

export default memo
