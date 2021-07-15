import getPath from 'lodash/get'

import { createFieldReducer } from '../createFieldReducer'

const reduce = (reduceFn) =>
  createFieldReducer((value, _, path) => {
    return reduceFn(value, getPath(value, path))
  })

export default reduce
