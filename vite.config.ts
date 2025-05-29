import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  base: '/formkit-primevue/', // <--- 이 줄을 추가하세요!
  test: {
    // enable jest-like global test APIs
    globals: true,

    // simulate DOM with happy-dom
    // (requires installing happy-dom as a peer dependency)
    environment: 'happy-dom',

    coverage: {
      exclude: ['dev/**', 'docs/**'],
    },
  },
})
