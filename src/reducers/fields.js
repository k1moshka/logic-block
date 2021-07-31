import getPath from 'lodash/get'

import { createFieldReducer } from '../createFieldReducer'

const fields = (reduceFn, deps) =>
  createFieldReducer((value, _, path) => {
    return reduceFn(
      ...deps.map(dep => getPath(value, dep)),
      getPath(value, path),
      value
    )
  })

export default fields
