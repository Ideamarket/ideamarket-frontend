/**
 * Returns whether the username is valid or not
 */
export function isUsernameValid(username: string): boolean {
  return !/[^a-z0-9_]/giu.test(username)
}
