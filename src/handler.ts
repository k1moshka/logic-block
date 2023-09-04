type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type UpdateFunction<
  TBlockValue = Record<string, any>
> = (updatedFields: RecursivePartial<TBlockValue>) => TBlockValue;

export type HandlerInstance<TBlockValue = Record<string, any>> = {
  getPath: () => string;
  wrapParentHandler: (
    parent: HandlerInstance<TBlockValue>,
    path: string
  ) => void;
  invoke: (newValue: TBlockValue, oldValue: TBlockValue) => TBlockValue;
  updateWithValue: (path: string, valueAtPath: TBlockValue) => TBlockValue;
};

export type HandlerFunctionResult = Promise<void> | void;

export type HandlerFunction<TBlockValue = Record<string, any>> = (
  value: TBlockValue,
  update: UpdateFunction<TBlockValue>,
  oldValue: TBlockValue
) => HandlerFunctionResult;
export type BlockHandler<T = Record<string, any>> = {
  (): HandlerFunction<T>;
  __block_handler: boolean;
};

export const isHandler = (test: any) => test && test.__block_handler === true;

export const wrapHandler = <TBlockValue = Record<string, any>>(
  handler: () => HandlerFunction<TBlockValue>
): BlockHandler<TBlockValue> => {
  const returnHandler: BlockHandler<TBlockValue> = handler.bind({});
  returnHandler.__block_handler = true;

  return returnHandler;
};

export const createHandler = <TBlockValue = Record<string, any>>(
  fn: HandlerFunction<TBlockValue>
): BlockHandler<TBlockValue> => wrapHandler<TBlockValue>(() => fn);
