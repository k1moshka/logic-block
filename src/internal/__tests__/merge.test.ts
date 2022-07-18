import { merge } from "../merge";

test("merge should rewrite arrays", () => {
  const result = merge({}, { a: { b: [1, 2, 3], c: 2 } }, { a: { b: [33] } });

  expect(result).toEqual({ a: { b: [33], c: 2 } });
});
