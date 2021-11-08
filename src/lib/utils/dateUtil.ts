/**
 * This function returns the least date among the given 2 dates (in ISO format)
 */
export function getLeastDate({
  date1,
  date2,
}: {
  date1: string
  date2: string
}) {
  return new Date(date1) <= new Date(date2) ? date1 : date2
}

/**
 * This function returns the greatest date among the given 2 dates (in ISO format)
 */
export function getGreatestDate({
  date1,
  date2,
}: {
  date1: string
  date2: string
}) {
  return new Date(date1) >= new Date(date2) ? date1 : date2
}
