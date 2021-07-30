import getPath from 'lodash/get'
import { wrapHandler } from '../handler'

export default function memoHandler(fn, fields) {
  return wrapHandler(() => (value, update, oldValue) => {
    const anyFieldsWasChanged = fields.reduce((acc, fld) => {
      return acc || getPath(value, fld) !== getPath(oldValue, fld)
    }, false)

    if (anyFieldsWasChanged) {
      fn(...fields.map(fld => getPath(value, fld)), update, value, oldValue)
    }
  })
}
