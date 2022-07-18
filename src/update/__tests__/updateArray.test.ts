import Block, { value } from "../../index";
import { updateArray } from "../updateArray";

describe("updateArray tests", () => {
  test("updateArray works properly", () => {
    const result = updateArray(4, { a: 1 });

    expect(result).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      { a: 1 },
    ]);
  });

  test("updateArray updating in block works properly", () => {
    const block = Block({
      a: [Block({ b: value(1) }), Block({ b: value(1) })],
    });
    const instance = block({ a: updateArray(0, { b: 10 }) });
    const initial = instance();
    const result = instance({ a: updateArray(1, { b: 12 }) });

    expect(initial).toEqual({
      a: [{ b: 10 }, { b: 1 }],
    });
    expect(result).toEqual({
      a: [{ b: 10 }, { b: 12 }],
    });
  });
});
