import option from "../option";

test("option should set default value if not provided", () => {
  const reducer = option(1, [1]);

  const value = reducer({}, {}, "");
  expect(value).toBe(1);
});

test("option should change if new value in available options", () => {
  const reducer = option(1, [1, 2]);

  const value = reducer({ a: 2 }, { a: 1 }, "a");
  expect(value).toBe(2);
});

test("option should not change if value isnot in available options, and should set previous value", () => {
  const reducer = option(1, [1, 2]);

  const value = reducer({ r: 4 }, { r: 2 }, "r");
  expect(value).toBe(2);
});
