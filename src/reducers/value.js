import getPath from 'lodash/get'

import { createFieldReducer } from '../createFieldReducer'

const value = (defaultValue) =>
  createFieldReducer((v, _, path) => getPath(v, path, defaultValue))

export default value
