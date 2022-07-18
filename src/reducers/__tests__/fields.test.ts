import fields from "../fields";

test("fields valid reduces new value", () => {
  const fn = jest.fn((a, b) => {
    return a + b;
  });
  const reducer = fields<number, [number, number]>(fn, ["a", "b"]);

  const result = reducer({ a: 1, b: 2, c: 100 }, {}, "c", undefined);

  expect(result).toBe(3);
  expect(fn.mock.calls[0][0]).toBe(1);
  expect(fn.mock.calls[0][1]).toBe(2);
  expect((fn.mock.calls[0] as any)[2]).toBe(100);
});
