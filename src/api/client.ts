import axios from 'axios'
import type { TokenRefreshResponse } from '../types/auth'

// ── access token 메모리 저장 ──
// localStorage가 아닌 모듈 변수에 저장한다.
// XSS로 localStorage를 털어도 토큰에 접근할 수 없다.
// 탭 새로고침 시 사라지지만, silent refresh로 복구된다.

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

// ── axios 인스턴스 ──

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true, // 쿠키 전송 (refresh token)
  headers: { 'Content-Type': 'application/json' },
})

// ── request 인터셉터: Bearer 토큰 자동 부착 ──

client.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── response 인터셉터: 401 → refresh → retry 큐 ──
// 동시에 여러 요청이 401을 받아도 refresh는 1번만 실행.
// 나머지는 큐에 대기 후 새 토큰으로 일괄 재시도.

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401이 아니거나, 이미 재시도한 요청이면 그대로 에러
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // 인증 엔드포인트 자체의 401은 refresh하지 않는다
    if (originalRequest.url?.includes('/api/auth/')) {
      return Promise.reject(error)
    }

    // 이미 다른 요청이 refresh 중이면 큐에 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(client(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // refresh는 인터셉터가 없는 raw axios로 호출 (무한 루프 방지)
      const { data } = await axios.post<TokenRefreshResponse>(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/refresh`,
        {},
        { withCredentials: true },
      )
      const newToken = data.accessToken
      setAccessToken(newToken)
      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return client(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      setAccessToken(null)
      // React 밖의 모듈에서 AuthContext에 알리는 유일한 방법
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default client
