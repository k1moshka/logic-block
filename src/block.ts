import { SchemeRenderer } from "./internal/scheme";
import { createHandlerFactory } from "./internal/createHandlerFactory";
import { merge } from "./internal/merge";
import {
  BlockHandler,
  wrapHandler,
  HandlerInstance,
} from "./handler";

export type BlockInstanceOptions<T = Record<string, any>> = {
  handleUpdate?: (newValue: T) => void;
};
export type BlockInstanceUpdatedFields<T = Record<string, any>> =
  | Partial<T>
  | ((value: any) => Partial<T>);
export type BlockInstance<T = Record<string, any>> = {
  (
    updatedFields?: BlockInstanceUpdatedFields<T>,
    path?: string,
    parentHandlerInstance?: HandlerInstance
  ): T;
  __block_instance: boolean;
};
export type BlockFactory<
  T = Record<string, any>,
  TScheme = Record<string, any>
> = {
  (
    initialValues?: Partial<T>,
    options?: BlockInstanceOptions<T>
  ): BlockInstance<T>;
  __getScheme: () => TScheme;
  __getHandler: () => BlockHandler<T>;
  __block: boolean;
};

const HANDLER_LOOP_LIMIT = 100;

export const isBlock = (test) => test.__block === true;

export const Block = <T = Record<string, any>, TScheme = Record<string, any>>(
  scheme: TScheme,
  handlerFn?: BlockHandler<T>
): BlockFactory<T, TScheme> => {
  // handlerFn - handler that defines in definition-time
  let handlerFactory;
  if (typeof handlerFn === "function") {
    handlerFactory = createHandlerFactory(handlerFn);
  } else {
    handlerFactory = createHandlerFactory(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      wrapHandler(() => () => {})
    );
  }

  const blockFactory = (
    initialValue?: Partial<T>,
    options: BlockInstanceOptions<T> = {}
  ) => {
    const { handleUpdate } = options;

    const handlerInstance = handlerFactory(HandlerRenderer);

    const renderScheme = SchemeRenderer(scheme, initialValue, handlerInstance);

    let currentValue;
    let handlerOldValue;
    let isInitialRender = true;

    function HandlerRenderer(
      newValue = initialValue,
      path,
      parentHandlerInstance
    ) {
      let result;
      if (handlerOldValue) {
        result = renderScheme(merge({}, handlerOldValue, newValue));
        currentValue = handlerOldValue;
        // update handler old value due to work multiple sync update function in the same handler
        // example:
        // --------------------------
        // update({a: 1}); update({b: 1});
        // this invokes will updated both fields 'a' and 'b'
        // but ig we dont set handler old value it will cause to update only from last invoke of 'update'
        // --------------------------
        handlerOldValue = result;
      } else {
        // if not, means that update was invoked async
        result = BlockInstance(newValue, path, parentHandlerInstance);
      }

      return result;
    }

    function BlockInstance(
      newValue: BlockInstanceUpdatedFields<T> = initialValue,
      path?: string,
      parentHandlerInstance?: HandlerInstance
    ) {
      // parentHandler - isntance of parent handler
      handlerInstance.wrapParentHandler(parentHandlerInstance, path);

      let newValueSlice;
      if (typeof newValue === "function") {
        newValueSlice = newValue(currentValue);
      } else {
        newValueSlice = newValue;
      }

      if (
        typeof newValueSlice !== "object" &&
        typeof newValueSlice !== "undefined"
      ) {
        throw new Error(
          "BlockInstance newValue argument should be an undefined value or an object or a function which returns object with only updated values"
        );
      }

      const updatedValue = merge({}, currentValue, newValueSlice);
      let result = renderScheme(updatedValue, currentValue);

      let step = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        handlerOldValue = result;

        const executedResult = handlerInstance.invoke(result, currentValue);
        const valueIsNotChanged = executedResult === result;

        result = executedResult;
        handlerOldValue = undefined;

        if (valueIsNotChanged) {
          break;
        }

        step += 1;

        if (step >= HANDLER_LOOP_LIMIT) {
          console.error("Limit of handler loop is reached.");
          break;
        }
      }

      if (!isInitialRender) {
        handleUpdate && handleUpdate(result);
      }

      handlerOldValue = undefined;
      currentValue = result;
      isInitialRender = false;

      return result;
    }
    BlockInstance.__block_instance = true;

    return BlockInstance;
  };
  blockFactory.__getScheme = () => merge({}, scheme) as TScheme;
  blockFactory.__getHandler = () => handlerFn;
  blockFactory.__block = true;

  return blockFactory;
};
