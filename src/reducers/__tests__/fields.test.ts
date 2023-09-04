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
});

test("fields reducer takes current value and current block value arguments properly", () => {
  const fn = jest.fn((a, currentValue, blockValue) => {
    return a + 1;
  });
  const reducer = fields<number, [number, number]>(fn, ["a"]);

  reducer({ a: 1, c: 100 }, {}, "c", undefined);

  expect(fn.mock.calls[0][1]).toBe(100);
  expect(fn.mock.calls[0][2]).toEqual(
    expect.objectContaining({ a: 1, c: 100 })
  );
});
