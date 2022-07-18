import getPath from "lodash/get";
import { UpdateFunction, wrapHandler } from "../handler";

export type MemoHandlerFunction = (
  ...args: [
    ...depsValues: Array<any>,
    update: UpdateFunction,
    value: Record<string, any>,
    oldValue: Record<string, any>
  ]
) => any;

export default function memoHandler(
  fn: MemoHandlerFunction,
  fields: Array<string>
) {
  return wrapHandler(
    () =>
      (
        value: Record<string, any>,
        update: UpdateFunction,
        oldValue: Record<string, any>
      ) => {
        const anyFieldsWasChanged = fields.reduce((acc, fld) => {
          return acc || getPath(value, fld) !== getPath(oldValue, fld);
        }, false);

        if (anyFieldsWasChanged) {
          fn(
            ...fields.map((fld) => getPath(value, fld)),
            update,
            value,
            oldValue
          );
        }
      }
  );
}
