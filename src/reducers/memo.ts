import getPath from "lodash/get";

import { createFieldReducer } from "../createFieldReducer";

import fields, { FieldsReducerFunction } from "./fields";

const memo = <
  T = any,
  TDepValues extends Array<any> = Array<any>,
  TBlockValue = Record<string, any>
>(
  reduceFn: FieldsReducerFunction<T, TDepValues>,
  deps: Array<string>
) =>
  createFieldReducer<T, TBlockValue>((value, oldValue, path, parentHandlerInstance) => {
    const shouldUpdate = <T>(value: T, prevValue: T) => {
      if (prevValue === undefined) {
        return true;
      }

      for (const dep of deps) {
        if (getPath(value, dep) !== getPath(prevValue, dep)) {
          return true;
        }
      }

      return false;
    };

    const FieldsReducer = fields(reduceFn, deps);

    if (shouldUpdate(value, oldValue)) {
      return FieldsReducer(value, oldValue, path, parentHandlerInstance);
    }

    return getPath(value, path);
  });

export default memo;
