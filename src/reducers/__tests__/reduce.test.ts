import reduce from "../reduce";

test("reduce valid reduces new value", () => {
  const reducer = reduce((val) => {
    return val.a + val.b;
  });

  const result = reducer({ a: 1, b: 100 }, {}, "s");
  expect(result).toBe(101);
});
