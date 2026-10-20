import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { useAuth } from './AuthContext'

const STORAGE_KEY = 'cleanid-booking'
const ORDERS_STORAGE_PREFIX = 'cleanid-orders:'

const initialState = {
  serviceId: '',
  variant: 'Standar',
  addonIds: [],
  selectedDate: '',
  selectedTime: '',
  addressId: '',
  notes: '',
  promoCode: '',
  paymentMethod: 'Transfer Bank',
  orders: [],
}

function bookingReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...initialState, ...action.payload, orders: state.orders }
    case 'SET_ORDERS':
      return { ...state, orders: action.payload }
    case 'SET_SERVICE':
      return { ...state, serviceId: action.payload }
    case 'SET_VARIANT':
      return { ...state, variant: action.payload }
    case 'SET_ADDONS':
      return { ...state, addonIds: action.payload }
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload }
    case 'SET_TIME':
      return { ...state, selectedTime: action.payload }
    case 'SET_ADDRESS':
      return { ...state, addressId: action.payload }
    case 'SET_NOTES':
      return { ...state, notes: action.payload }
    case 'SET_PROMO':
      return { ...state, promoCode: action.payload }
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload }
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] }
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((order) => (order.id === action.payload.id ? action.payload : order)),
      }
    case 'RESET':
      return initialState
    case 'RESET_FORM':
      return { ...state, serviceId: '', variant: 'Standar', addonIds: [], selectedDate: '', selectedTime: '', addressId: '', notes: '', promoCode: '', paymentMethod: 'Transfer Bank' }
    default:
      return state
  }
}

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)
  const { user } = useAuth()
  const [ordersUserId, setOrdersUserId] = useState(null)
  const [ordersLoading, setOrdersLoading] = useState(Boolean(user?.id))
  const [ordersError, setOrdersError] = useState('')
  const userId = user?.id || null
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'HYDRATE', payload: parsed })
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    const { orders, ...booking } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(booking))
  }, [state])

  useEffect(() => {
    setOrdersLoading(Boolean(userId))
    setOrdersError('')
    if (!userId) {
      dispatch({ type: 'SET_ORDERS', payload: [] })
      setOrdersUserId(null)
      setOrdersLoading(false)
      return
    }

    try {
      const key = `${ORDERS_STORAGE_PREFIX}${encodeURIComponent(userId)}`
      const saved = localStorage.getItem(key)
      let orders = saved ? JSON.parse(saved) : []
      if (!Array.isArray(orders)) throw new Error('Format riwayat pesanan tidak valid.')

      orders = orders.filter((order) => order.userId === userId)
      dispatch({ type: 'SET_ORDERS', payload: orders })
      setOrdersUserId(userId)
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Riwayat pesanan gagal dimuat.')
      dispatch({ type: 'SET_ORDERS', payload: [] })
      setOrdersUserId(userId)
    } finally {
      setOrdersLoading(false)
    }
  }, [userId])

  const value = useMemo(
    () => ({
      ...state,
      orders: ordersUserId === userId ? state.orders : [],
      ordersLoading: ordersLoading || Boolean(userId && ordersUserId !== userId),
      ordersError,
      setService: (serviceId) => dispatch({ type: 'SET_SERVICE', payload: serviceId }),
      setVariant: (variant) => dispatch({ type: 'SET_VARIANT', payload: variant }),
      setAddons: (addonIds) => dispatch({ type: 'SET_ADDONS', payload: addonIds }),
      setDate: (selectedDate) => dispatch({ type: 'SET_DATE', payload: selectedDate }),
      setTime: (selectedTime) => dispatch({ type: 'SET_TIME', payload: selectedTime }),
      setAddress: (addressId) => dispatch({ type: 'SET_ADDRESS', payload: addressId }),
      setNotes: (notes) => dispatch({ type: 'SET_NOTES', payload: notes }),
      setPromoCode: (promoCode) => dispatch({ type: 'SET_PROMO', payload: promoCode }),
      setPaymentMethod: (paymentMethod) => dispatch({ type: 'SET_PAYMENT', payload: paymentMethod }),
      addOrder: (order) => {
        if (!userId) throw new Error('Masuk diperlukan untuk menyimpan pesanan.')
        if (order.userId !== userId) throw new Error('Pesanan tidak cocok dengan akun aktif.')
        const orders = [order, ...state.orders.filter((item) => item.id !== order.id)]
        localStorage.setItem(`${ORDERS_STORAGE_PREFIX}${encodeURIComponent(userId)}`, JSON.stringify(orders))
        dispatch({ type: 'SET_ORDERS', payload: orders })
        setOrdersUserId(userId)
      },
      updateOrder: (order) => {
        if (!userId || order.userId !== userId) throw new Error('Pesanan bukan milik akun aktif.')
        const orders = state.orders.map((item) => (item.id === order.id ? order : item))
        localStorage.setItem(`${ORDERS_STORAGE_PREFIX}${encodeURIComponent(userId)}`, JSON.stringify(orders))
        dispatch({ type: 'SET_ORDERS', payload: orders })
      },
      resetBooking: () => dispatch({ type: 'RESET_FORM' }),
    }),
    [state, userId, ordersUserId, ordersLoading, ordersError],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) throw new Error('useBooking must be used inside BookingProvider')
  return context
}
