import axios from 'axios'

const client = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_IDEAMARKET_BACKEND_HOST ||
    'https://server-dev.ideamarket.io',
})

export default client

export const loginAccount = ({ signedWalletAddress }) =>
  client.post(`/account/signIn`, {
    signedWalletAddress,
  })

export const getAccount = ({ jwt }) =>
  client.get(`/account`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })

export const updateAccount = ({ requestBody, token }) =>
  client.patch(`/account`, requestBody, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

export const uploadAccountPhoto = ({ formData, token }) =>
  client.post(`/account/profilePhoto`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'content-Type': 'multipart/form-data',
    },
  })

export const sendVerificationCodeToAccountEmail = ({ token, email }) =>
  client.get(`/account/emailVerification`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      email,
    },
  })

export const checkAccountEmailVerificationCode = ({ token, code, email }) =>
  client.post(
    `/account/emailVerification`,
    { code, email },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

export const getPublicProfile = async ({ username, walletAddress }) => {
  if (!username && !walletAddress) return null

  try {
    const response = await client.get(`/account/publicProfile`, {
      params: {
        username,
        walletAddress,
      },
      headers: {
        // TODO: pass in token if there is one
        // Authorization: `Bearer ${token}`,
      },
    })

    // If no user data returned, then at least return object with walletAddress that we already knew (if it was passed in)
    return response?.data?.data?.account
      ? response?.data?.data?.account
      : { walletAddress }
  } catch (error) {
    console.error(`getPublicProfile for ${username} failed`)
    return null
  }
}

export const getLockingAPR = () => client.get(`general/apr`)
