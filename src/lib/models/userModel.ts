import { getClient, q } from 'lib/faunaDb'
import { User } from 'next-auth'

/**
 * Updates the user settings by userId
 */
export function updateUserSettings({
  userId,
  userSettings,
}: {
  userId: string
  userSettings: Partial<User>
}) {
  return getClient().query(
    q.Update(q.Ref(q.Collection('users'), userId), {
      data: userSettings,
    })
  )
}

/**
 * Returns whether the username is already taken or not
 */
export function isUsernameTaken(username: string): Promise<boolean> {
  return getClient().query(
    q.If(q.Exists(q.Match(q.Index('user_by_username'), username)), true, false)
  )
}
