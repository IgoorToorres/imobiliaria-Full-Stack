import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Injeta o token Bearer em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@imobiliaria:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trata erros globais de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@imobiliaria:token')
      localStorage.removeItem('@imobiliaria:usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
