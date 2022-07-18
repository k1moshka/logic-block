import getPath from "lodash/get";

import { createFieldReducer } from "../createFieldReducer";

export type ReduceReducerFunction<
  T = any,
  TBlockValue = Record<string, any>
> = (blockInstanceValue: TBlockValue, fieldValue: T) => T;

const reduce = <T = any, TBlockValue = Record<string, any>>(
  reduceFn: ReduceReducerFunction<T, TBlockValue>
) =>
  createFieldReducer<T, TBlockValue>((value: TBlockValue, _, path) => {
    return reduceFn(value, getPath(value, path));
  });

export default reduce;
