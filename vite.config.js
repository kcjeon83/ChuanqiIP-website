import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:   resolve(__dirname, 'index.html'),
        news1:  resolve(__dirname, 'news/mir2-25th.html'),
        news2:  resolve(__dirname, 'news/mir2-update.html'),
        news3:  resolve(__dirname, 'news/mir2-field.html'),
        news4:  resolve(__dirname, 'news/mir3-dungeon.html'),
      }
    }
  }
})
