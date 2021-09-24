import { isUsernameTaken } from 'lib/models/userModel'
import { isUsernameValid } from './isUsernameValid'

export async function verifyUsername({
  inputUsername: username,
  sessionUsername,
}: {
  inputUsername?: string
  sessionUsername?: string
}): Promise<{ verifiedUsername?: string; error?: string }> {
  let inputUsername = username?.trim()?.toLowerCase()

  // Imput username is blank
  if (!inputUsername) {
    return {
      error: 'Username cannot be blank',
    }
  }

  // Input username is same as session username => No need to check anything
  if (inputUsername === sessionUsername) {
    return {
      verifiedUsername: inputUsername,
    }
  }

  // Session username is present => Username cannot be updated
  if (sessionUsername) {
    return {
      error: 'Username cannot be updated',
    }
  }

  // Session username is not present => Check whether username is valid or not
  if (!isUsernameValid(inputUsername)) {
    return { error: 'Username is not valid' }
  }

  // Session username is not present => Check whether username is available or not
  if (await isUsernameTaken(inputUsername)) {
    return {
      error: 'Username is not available',
    }
  }

  return { verifiedUsername: inputUsername }
}
