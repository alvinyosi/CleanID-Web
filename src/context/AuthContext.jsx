import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const STORAGE_KEY = 'cleanid-auth'

function readStoredUser() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null

  try {
    const user = JSON.parse(saved)
    if (!user || typeof user !== 'object' || !user.email) return null
    return normalizeUser(user)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

const initialState = (() => {
  const user = readStoredUser()
  return {
    user,
    isAuthenticated: Boolean(user),
    loading: false,
  }
})()

function normalizeUser(user) {
  const avatar = typeof user.avatar === 'string' && !user.avatar.includes('photo-1500648767791-00dcc994a43e')
    ? user.avatar
    : null
  return {
    ...user,
    id: user.id || user.email.trim().toLowerCase(),
    avatar,
  }
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: normalizeUser(action.payload),
        isAuthenticated: true,
        loading: false,
      }
    case 'HYDRATE':
      return {
        user: action.payload,
        isAuthenticated: Boolean(action.payload),
        loading: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, loading: false }
    default:
      return state
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    dispatch({ type: 'HYDRATE', payload: readStoredUser() })
  }, [])

  useEffect(() => {
    if (state.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state.user])

  const value = useMemo(
    () => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      login: (user) => dispatch({ type: 'LOGIN', payload: user }),
      logout: () => dispatch({ type: 'LOGOUT' }),
      updateUser: (payload) => dispatch({ type: 'UPDATE_USER', payload }),
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
