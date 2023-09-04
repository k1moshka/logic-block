import getPath from "lodash/get";
import { UpdateFunction, HandlerFunctionResult, wrapHandler } from "../handler";

export type MemoHandlerFunction<
  TBlockValue = Record<string, any>,
  TDepValues extends Array<any> = Array<any>
> = (
  ...args: [
    ...depsValues: TDepValues,
    update: UpdateFunction<TBlockValue>,
    value: TBlockValue,
    oldValue: TBlockValue
  ]
) => HandlerFunctionResult;

export default function memoHandler<
  TBlockValue = Record<string, any>,
  TDepValues extends Array<any> = Array<any>,
>(fn: MemoHandlerFunction<TBlockValue, TDepValues>, fields: Array<string>) {
  return wrapHandler<TBlockValue>(() => (value, update, oldValue) => {
    const anyFieldsWasChanged = fields.reduce((acc, fld) => {
      return acc || getPath(value, fld) !== getPath(oldValue, fld);
    }, false);

    if (anyFieldsWasChanged) {
      fn(
        ...(fields.map((fld) => getPath(value, fld)) as TDepValues),
        update,
        value,
        oldValue
      );
    }
  });
}
