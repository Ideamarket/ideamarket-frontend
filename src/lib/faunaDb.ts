import faunadb from 'faunadb'

/**
 * faunadb query
 */
export const q = faunadb.query

/**
 * Creates a new faunadb client
 */
export function getClient() {
  return new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  })
}
