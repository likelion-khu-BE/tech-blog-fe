import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // 백엔드 refresh token 쿠키가 SameSite=Strict라서
    // 프론트(3000)↔백엔드(8080) 다른 포트면 쿠키가 안 간다.
    // 프록시로 같은 origin으로 만들어 쿠키 정상 전송.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
