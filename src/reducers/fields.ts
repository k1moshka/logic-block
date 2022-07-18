import getPath from "lodash/get";

import { createFieldReducer } from "../createFieldReducer";

export type FieldsReducerFunction<
  T = any,
  TDepValues extends Array<any> = Array<any>
> = (
  ...args: [...depsValues: TDepValues, fieldPath: string, fieldValue: any]
) => T;

const fields = <
  T = any,
  TDepValues extends Array<any> = Array<any>,
  TBlockValue = Record<string, any>
>(
  reduceFn: FieldsReducerFunction<T, TDepValues>,
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
