import {
  isHandler,
  wrapHandler,
  BlockHandler,
  HandlerFunction,
} from "./handler";

export default function composeHandlers<TBlockValue = Record<string, any>>(
  ...handlersOrFunctions: Array<BlockHandler<TBlockValue> | HandlerFunction<TBlockValue>>
) {
  return wrapHandler<TBlockValue>(() => {
    const handlers = handlersOrFunctions.map((h) =>
      isHandler(h) ? (h as BlockHandler)() : h
    );

    return (value, update, oldValue) => {
      const prevValue = oldValue;
      let nextValue = value;

      const patchedUpdate = (newValue) => {
        oldValue = nextValue;
        nextValue = update(newValue);

        return nextValue;
      };

      for (const handler of handlers) {
        handler(nextValue, patchedUpdate, prevValue);
      }
    };
  });
}
