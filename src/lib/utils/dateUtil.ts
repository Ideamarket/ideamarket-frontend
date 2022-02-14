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

/**
 * This function returns the time difference in days between 2 dates
 */
export function getTimeDifferenceIndays(date1: Date, date2: Date) {
  const differenceInTime = Math.abs(date1.getTime() - date2.getTime())
  return Math.ceil(differenceInTime / (1000 * 3600 * 24))
}
