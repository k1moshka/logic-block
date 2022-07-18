export function updateArray(atIndex: number, value: any): Array<any> {
  return Array.from({ length: atIndex + 1 }, (_, idx) => {
    if (idx === atIndex) {
      return value;
    }
    return undefined;
  });
}
