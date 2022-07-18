export type UpdateFunction<T = Record<string, any>> = (
  updatedFields: Partial<T>
) => T;

export type HandlerInstance<T = Record<string, any>> = {
  getPath: () => string;
  wrapParentHandler: (parent: HandlerInstance<T>, path: string) => void;
  invoke: (newValue: T, oldValue: T) => T;
  updateWithValue: (path: string, valueAtPath: T) => T;
};

export type HandlerFunction<T = Record<string, any>> = (
  value: T,
  update: UpdateFunction,
  oldValue: T
) => Promise<void> | void;
export type BlockHandler<T = Record<string, any>> = {
  (): HandlerFunction<T>;
  __block_handler: boolean;
};

export const isHandler = (test: any) => test && test.__block_handler === true;

// TODO: wrapHandler should use inside () => (value, update, oldValue) => Promise<any> | void
export const wrapHandler = <T = Record<string, any>>(
  handler: () => HandlerFunction<T>
): BlockHandler<T> => {
  const returnHandler = handler.bind({});
  returnHandler.__block_handler = true;

  return returnHandler;
};

export const createHandler = <T = Record<string, any>>(
  fn: HandlerFunction<T>
): BlockHandler<T> => wrapHandler<T>(() => fn);
