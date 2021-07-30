import lodashHas from 'lodash/has'
import getPath from 'lodash/get'
import setPath from 'lodash/set'

export const REMOVED_FIELD = Symbol('REMOVED_FIELD')

function calcChanges(newValue, oldValue, fields) {
  const diff = {}
  for (const path of fields) {
    const newVal = getPath(newValue, path)
    const oldVal = getPath(oldValue, path)

    if (oldVal !== newVal) {
      if (newVal === undefined) {
        setPath(diff, path, REMOVED_FIELD)
      } else {
        setPath(diff, path, newVal)
      }
    }
  }

  return diff
}

export const createChangesInstance = (registerFn) => {
  const fields = []
  const addField = (path) => !fields.includes(path) && fields.push(path)

  const hases = []
  const hasAlls = []
  const hasAnies = []

  const api = {}
  const has = (path, fn) => {
    fields.push(path)
    hases.push([path, fn])

    return api
  }
  const hasAll = (...args) => {
    const fn = args.pop()
    args.forEach(f => addField(f))
    hasAlls.push([args, fn])

    return api
  }
  const hasAny = (...args) => {
    const fn = args.pop()
    args.forEach(f => addField(f))

    hasAnies.push([args, fn])

    return api
  }
  api.has = has
  api.hasAll = hasAll
  api.hasAny = hasAny

  registerFn(api)

  return {
    api,
    checkValues (value, oldValue) {
      const diff = calcChanges(value, oldValue, fields)

      hases.forEach(([path, fn]) => {
        if (lodashHas(diff, path)) {
          const newVal = getPath(diff, path)
          fn(
            newVal === REMOVED_FIELD
              ? undefined
              : newVal,
            diff
          )
        }
      })

      hasAnies.forEach(([fields, fn]) => {
        let hasDiff = false
        for (const path of fields) {
          if (lodashHas(diff, path)) {
            hasDiff = true
            break
          }
        }

        if (hasDiff) {
          fn(diff)
        }
      })

      hasAlls.forEach(([fields, fn]) => {
        for (const path of fields) {
          if (!lodashHas(diff, path)) {
            return
          }
        }
        fn(diff)
      })
    }
  }
}


