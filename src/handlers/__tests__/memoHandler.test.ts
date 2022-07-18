/* eslint-disable @typescript-eslint/no-empty-function */
import { Block } from "../../block";
import { value } from "../../reducers";
import memoHandler from "../memoHandler";

describe("memoHandler works as expected", () => {
  test("memoHandler detects only fields in config", () => {
    const fn = jest.fn(() => {});
    const block = Block(
      {
        a: value(1),
        b1: {
          b2: value(2),
        },
        c: value(3),
      },
      memoHandler(fn, ["a", "b1.b2"])
    );

    const instance = block();
    instance();
    expect(fn.mock.calls.length).toBe(1);
    expect((fn.mock.calls[0] as any)[0]).toBe(1);
    expect((fn.mock.calls[0] as any)[1]).toBe(2);
  });

  test("memoHandler work only if target fields were updated", () => {
    const fn = jest.fn(() => {});
    const block = Block(
      {
        a: value(1),
        b1: {
          b2: value(2),
        },
        c: value(3),
      },
      memoHandler(fn, ["a", "b1.b2"])
    );

    const instance = block();
    instance();
    expect(fn.mock.calls.length).toBe(1);
    instance({ c: 44 });
    expect(fn.mock.calls.length).toBe(1);
    instance({ b1: { b2: 33 } });
    expect(fn.mock.calls.length).toBe(2);
  });

  test("memo handler can update properly", () => {
    const fn = jest.fn((a, update, { b }) => {
      if (a) {
        update({ b: b + 1 });
      }
    });
    const block = Block(
      {
        a: value(false),
        b: value(1),
      },
      memoHandler(fn as any, ["a"])
    );

    const instance = block();
    instance();
    instance({ a: true });
    instance({ a: false });
    const result = instance({ a: true }); // run here

    expect(result).toEqual({ a: true, b: 3 });
    expect(fn.mock.calls.length).toBe(4);
  });

  test("memo handler in nested block works well", () => {
    const block = Block(
      {
        a: Block(
          {
            b: value(false),
            c: value(1),
          },
          memoHandler(
            (...deps) => {
              const [b, update] = deps;
              if (b) {
                update({ c: 2 });
              }
            },
            ["b"]
          )
        ),
      },
      undefined
    );

    const instance = block();
    const result = instance({ a: { b: true } });

    expect(result).toEqual({ a: { b: true, c: 2 } });
  });

  test("memoHandler self invokes when should update value", () => {
    const memoFn = jest.fn((a, update) => {
      if (a === 1 || a === 2) {
        update({ a: a + 1 });
      }
    });
    const b = Block(
      {
        a: value(1),
      },
      memoHandler(memoFn as any, ["a"])
    );
    const instance = b();
    const res = instance();

    expect(res).toEqual({ a: 3 });
    expect(memoFn.mock.calls.length).toBe(3);
  });
});
