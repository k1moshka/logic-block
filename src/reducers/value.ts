import getPath from "lodash/get";

import { createFieldReducer } from "../createFieldReducer";

type InitialValueFunction<T, TBlockValue> = { (initialBlockValue: TBlockValue): T }

const value = <T = any, TBlockValue = Record<string, any>>(
  defaultValue?: T | InitialValueFunction<T, TBlockValue>
) =>
  createFieldReducer<T, TBlockValue>((v: TBlockValue, oldValue, path) => {
    if (typeof oldValue === "undefined") {
      // initial render
      if (typeof defaultValue === "function") {
        return getPath(v, path, (defaultValue as InitialValueFunction<T, TBlockValue>)(v));
      } else {
        return getPath(v, path, defaultValue);
      }
    }

    return getPath(v, path);
  });

export default value;
