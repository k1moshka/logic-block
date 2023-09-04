import { HandlerInstance } from "./handler";

export const isFieldReducer = (test: any) => test.__field_reducer === true;

type FieldReducerFunction<T = any, TBlockValue = Record<string, any>> = (
  newValue: TBlockValue,
  oldValue: TBlockValue | undefined | null,
  path: string,
  parentHandlerInstance?: HandlerInstance
) => T;

export type FieldReducerInstance<T = any, TBlockValue = Record<string, any>> = FieldReducerFunction<T, TBlockValue> & {
  __field_reducer: boolean;
};

export const createFieldReducer = <T = any, TBlockValue = Record<string, any>>(
  reducerFn: FieldReducerFunction<T, TBlockValue>
) => {
  const fieldReducer: FieldReducerInstance<T, TBlockValue> = (
    newValue,
    oldValue,
    path,
    parentHandlerInstance
  ) => {
    return reducerFn(newValue, oldValue, path, parentHandlerInstance);
  };

  fieldReducer.__field_reducer = true;
  return fieldReducer;
};
