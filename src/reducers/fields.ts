import getPath from "lodash/get";

import { createFieldReducer } from "../createFieldReducer";

export type FieldsReducerFunction<
  T = any,
  TDepValues extends Array<any> = Array<any>,
  TBlockValue = Record<string, any>
> = (
  ...args: [...depsValues: TDepValues, fieldValue: T, blockValue: TBlockValue]
) => T;

const fields = <
  T = any,
  TDepValues extends Array<any> = Array<any>,
  TBlockValue = Record<string, any>
>(
  reduceFn: FieldsReducerFunction<T, TDepValues, TBlockValue>,
  deps: Array<string>
) =>
  createFieldReducer<T, TBlockValue>((value, _, path) => {
    return reduceFn(
      ...(deps.map((dep) => getPath(value, dep)) as TDepValues),
      getPath(value, path),
      value
    );
  });

export default fields;
