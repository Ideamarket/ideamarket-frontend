import axios from 'axios'

const client = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_IDEAMARKET_BACKEND_HOST ||
    'https://server-dev.ideamarket.io',
})

export default client

export const registerAccount = ({ signedWalletAddress }) =>
  client.post(`/account`, {
    signedWalletAddress,
  })
export const loginAccount = ({ signedWalletAddress }) =>
  client.post(`/account/authenticate`, {
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

export const getPublicProfile = async ({ username }) => {
  const response = await client.get(
    `/account/publicProfile?username=${username}`,
    {
      headers: {
        // TODO: pass in token if there is one
        // Authorization: `Bearer ${token}`,
      },
    }
  )

  return response?.data?.data
}
