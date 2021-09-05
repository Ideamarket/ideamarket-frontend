import { getClient, q } from 'lib/faunaDb'
import { User } from 'next-auth'

/**
 * Updates the user settings by userId
 */
export async function updateUserSettings({
  userId,
  userSettings,
}: {
  userId: string
  userSettings: Partial<User>
}) {
  try {
    await getClient().query(
      q.Update(q.Ref(q.Collection('users'), userId), {
        data: userSettings,
      })
    )
  } catch (error) {
    console.error(error)
  }
}

/**
 * Returns whether the username is already taken or not
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
  try {
    const response = await getClient().query<boolean>(
      q.If(
        q.Exists(q.Match(q.Index('user_by_username'), username)),
        true,
        false
      )
    )
    return response
  } catch (error) {
    console.error(error)
  }
}
