import Block, { withHandler, createHandler } from "../../index";

test("with handler should copy and add handler to block", () => {
  const handlerFn = jest.fn();
  const handler = createHandler(handlerFn);

  const block = withHandler(Block({ a: 1 }), handler);

  const instance = block();
  instance({});
  instance({});

  expect(handlerFn.mock.calls.length).toBe(2);
});
