const IS_ACCOUNT_ENABLED =
  typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('IS_ACCOUNT_ENABLED'))
    : null

export default IS_ACCOUNT_ENABLED
