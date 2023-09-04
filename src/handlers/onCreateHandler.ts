import { HandlerFunction, wrapHandler } from "../handler";

const onCreateHandler = <TBlockValue = Record<string, any>>(
  fn: HandlerFunction<TBlockValue>
) =>
  wrapHandler<TBlockValue>(() => {
    let run = false;
    return (value, update, oldValue) => {
      if (run) {
        return;
      }

      run = true;

      fn(value, update, oldValue);
    };
  });

export default onCreateHandler;
