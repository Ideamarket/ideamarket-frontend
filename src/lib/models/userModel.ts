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
 * Returns the public profile of the user
 */
export async function fetchUserPublicProfile(username: string | string[]) {
  try {
    const data = await getClient().query<Partial<User>>(
      q.Let(
        {
          userProfile: q.Get(q.Match(q.Index('user_by_username'), username)),
        },
        {
          email: q.Select(['data', 'email'], q.Var('userProfile')),
          bio: q.Select(['data', 'bio'], q.Var('userProfile')),
          ethAddresses: q.Select(
            ['data', 'ethAddresses'],
            q.Var('userProfile')
          ),
          visibilityOptions: q.Let(
            {
              userPreferences: q.Select(
                ['data', 'visibilityOptions'],
                q.Var('userProfile')
              ),
            },
            {
              email: q.Select(['email'], q.Var('userPreferences')),
              bio: q.Select(['bio'], q.Var('userPreferences')),
              ethAddresses: q.Select(
                ['ethAddresses'],
                q.Var('userPreferences')
              ),
            }
          ),
        }
      )
    )

    const response: Partial<User> = {}
    if (data.visibilityOptions?.email) {
      response.email = data.email
    }
    if (data.visibilityOptions?.bio) {
      response.bio = data.bio
    }
    if (data.visibilityOptions?.ethAddresses) {
      response.ethAddresses = data.ethAddresses
    }

    return response
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
