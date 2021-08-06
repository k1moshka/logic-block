import mergeWith from 'lodash/mergeWith'

export const merge = (...args) =>
  mergeWith(...args, (_, srcVal) => {
    if (Array.isArray(srcVal)) {
      return srcVal
    }
  })