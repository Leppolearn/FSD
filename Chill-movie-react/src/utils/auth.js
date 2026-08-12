const USER_KEY = 'chill_user'
const SESSION_KEY = 'chill_authenticated'

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

export const registerUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(SESSION_KEY, 'true')
}

export const loginUser = () => localStorage.setItem(SESSION_KEY, 'true')
export const logoutUser = () => localStorage.removeItem(SESSION_KEY)
export const isAuthenticated = () => localStorage.getItem(SESSION_KEY) === 'true'
