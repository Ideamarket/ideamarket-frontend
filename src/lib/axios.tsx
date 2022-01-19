import axios from 'axios'

const client = axios.create({ baseURL: process.env.IDEAMARKET_BACKEND_HOST })
const BASE_URL =
  process.env.IDEAMARKET_BACKEND_HOST || 'https://server-dev.ideamarket.io'

export default client

export const registerAccount = ({ signedWalletAddress }) =>
  client.post(`${BASE_URL}/account`, {
    signedWalletAddress,
  })
export const loginAccount = ({ signedWalletAddress }) =>
  client.post(`${BASE_URL}/account/authenticate`, {
    signedWalletAddress,
  })

export const getAccount = ({ token }) =>
  client.get(`${BASE_URL}/account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

export const updateAccount = ({ requestBody, token }) =>
  client.patch(`${BASE_URL}/account`, requestBody, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

export const uploadAccountPhoto = ({ formData, token }) =>
  client.post(`${BASE_URL}/account/profilePhoto`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'content-Type': 'multipart/form-data',
    },
  })

export const sendVerificationCodeToAccountEmail = ({ token }) =>
  client.get(`${BASE_URL}/account/emailVerification`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

export const checkAccountEmailVerificationCode = ({ token, code }) =>
  client.post(
    `${BASE_URL}/account/emailVerification`,
    { code },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

export const getPublicProfile = async ({ username }) => {
  const response = await client.get(
    `${BASE_URL}/account/publicProfile?username=${username}`,
    {
      headers: {
        // TODO: pass in token if there is one
        // Authorization: `Bearer ${token}`,
      },
    }
  )

  return response?.data?.data
}
