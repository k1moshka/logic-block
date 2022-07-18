/* eslint-disable @typescript-eslint/no-empty-function */
import { Block } from "../block";
import { memoHandler } from "../handlers";
import composeHandlers from "../composeHandlers";
import { value } from "../reducers";

describe("composeHandlers works properly", () => {
  test("composeHandlers pass new values properly", () => {
    const fn1 = jest.fn((a, update) => {
      if (a === 1) {
        update({ a: 2 });
      }
    });
    const fn2 = jest.fn((value, update) => {
      if (value.a === 2) {
        update({ a: 3 });
      }
    });
    const fn3 = jest.fn(() => {});

    const block = Block(
      { a: value(1) },
      composeHandlers(memoHandler(fn1 as any, ["a"]), fn2, fn3)
    );
    const instance = block();

    const result = instance();

    expect(fn1.mock.calls.length).toBe(2);
    expect(fn1.mock.calls[0][0]).toEqual(1);
    expect(fn1.mock.calls[1][0]).toEqual(3); // because run after first loop of all handlers

    expect(fn2.mock.calls.length).toBe(2);
    expect(fn2.mock.calls[0][0]).toEqual({ a: 2 });
    expect(fn2.mock.calls[1][0]).toEqual({ a: 3 });

    expect(fn3.mock.calls.length).toBe(2);
    expect((fn3.mock.calls[0] as any)[0]).toEqual({ a: 3 });
    expect((fn3.mock.calls[1] as any)[0]).toEqual({ a: 3 });

    expect(result).toEqual({ a: 3 });
  });

  test("second memo handler handle block properly", () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const block = Block(
      {
        a: value(1),
        b: value(2),
      },
      composeHandlers(memoHandler(fn1, ["b"]), memoHandler(fn2, ["a"]))
    );

    const instance = block();
    instance();
    instance({ a: 2 });

    expect(fn1.mock.calls.length).toBe(1);
    expect(fn2.mock.calls.length).toBe(2);
  });

  test("all memo handlers can handle changes in one render", () => {
    const fn1 = jest.fn((i, b, update) => {
      if (i) {
        update({ d: 100 });
      }
    });
    const fn2 = jest.fn((i, a, update) => {
      if (i) {
        update({ c: 50 });
      }
    });
    const block = Block(
      {
        a: value(1),
        b: value(2),
        c: value(1),
        d: value(1),
        i: value(false),
      },
      composeHandlers(
        memoHandler(fn1 as any, ["i", "b"]),
        memoHandler(fn2 as any, ["i", "a"])
      )
    );

    const instance = block();
    instance();
    const res = instance({ i: true, a: 4, b: 5 });

    expect(res).toEqual({
      i: true,
      a: 4,
      b: 5,
      c: 50,
      d: 100,
    });
  });
});
