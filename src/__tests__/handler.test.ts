/* eslint-disable @typescript-eslint/no-empty-function */
import Block, { value, createHandler, wrapHandler } from "..";

describe("handler works properly", () => {
  test("handler can get value", () => {
    const handler = jest.fn(() => {});
    const block = Block(
      {
        a: value(1),
      },
      createHandler(handler)
    );

    const instance = block();

    instance();
    instance({ a: 2 });

    expect(handler.mock.calls.length).toBe(2);
    expect((handler.mock.calls[0] as any)[0]).toEqual({ a: 1 });
    expect((handler.mock.calls[1] as any)[0]).toEqual({ a: 2 });
  });

  test("handler can update value", () => {
    const handler = jest.fn(({ a }, update) => {
      if (a === 1) {
        update({ a: 2 });
      }
    });
    const block = Block(
      {
        a: value(1),
      },
      createHandler(handler)
    );

    const instance = block();

    instance();

    expect(handler.mock.calls.length).toBe(2);
    expect(handler.mock.calls[0][0]).toEqual({ a: 1 });
    expect(handler.mock.calls[1][0]).toEqual({ a: 2 });
  });

  test("handler in nested block should create only once", () => {
    const updateFn = jest.fn(() => {});
    const fn = jest.fn(() => updateFn);

    const block = Block({
      a: Block(
        {
          b: value(1),
        },
        wrapHandler(fn)
      ),
    });
    const instance = block();

    instance();
    instance({ a: { b: 2 } });
    instance({ a: { b: 3 } });
    instance({ a: { b: 4 } });
    instance({ a: { b: 5 } });

    expect(updateFn.mock.calls.length).toBe(5);
    expect(fn.mock.calls.length).toBe(1);
  });

  test("handler in array of blocks works properly", () => {
    const fn = jest.fn(() => {});

    const block = Block({
      a: [
        Block(
          {
            b: value(1),
          },
          createHandler(fn)
        ),
      ],
    });
    const instance = block();

    instance();
    instance({ a: [{ b: 2 }] });
    instance({ a: [{ b: 3 }] });
    instance({ a: [{ b: 4 }] });
    instance({ a: [{ b: 5 }] });

    expect(fn.mock.calls.length).toBe(5);
  });
});
