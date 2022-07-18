import { HandlerFunction, UpdateFunction, wrapHandler } from "../handler";

const onCreateHandler = (fn: HandlerFunction) =>
  wrapHandler(() => {
    let run = false;
    return (
      value: Record<string, any>,
      update: UpdateFunction,
      oldValue: Record<string, any>
    ) => {
      if (run) {
        return;
      }

      run = true;

      fn(value, update, oldValue);
    };
  });

export default onCreateHandler;
