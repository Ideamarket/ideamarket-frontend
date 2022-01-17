import axios from 'axios'

const client = axios.create({ baseURL: process.env.IDEAMARKET_BACKEND_HOST })
const BASE_URL =
  process.env.IDEAMARKET_BACKEND_HOST || 'http://server-dev.ideamarket.io'

export default client

export const registerAccount = ({ signedWalletAddress }) =>
  client.post(`${BASE_URL}/userAccounts`, {
    signedWalletAddress,
  })
export const loginAccount = ({ signedWalletAddress }) =>
  client.post(`${BASE_URL}/userAccounts/authenticate`, {
    signedWalletAddress,
  })

export const getAccount = ({ token }) =>
  client.get(`${BASE_URL}/userAccounts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

export const updateAccount = ({ requestBody, token }) =>
  client.patch(`${BASE_URL}/userAccounts`, requestBody, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

export const uploadAccountPhoto = ({ formData, token }) =>
  client.post(`${BASE_URL}/userAccounts/profilePhoto`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'content-Type': 'multipart/form-data',
    },
  })

export const sendAccountEmailVerificationCode = ({ token }) =>
  client.get(`${BASE_URL}/userAccounts/emailVerification`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
