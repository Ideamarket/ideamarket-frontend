export const sortStringByOrder = (orderDirection) => (a: any, b: any) => {
  return orderDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
}

export const sortNumberByOrder = (orderDirection) => (a: any, b: any) => {
  return orderDirection === 'asc' ? a - b : b - a
}
