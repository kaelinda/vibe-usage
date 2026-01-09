// @ts-nocheck
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main'
    },
    resolve: {
      alias: {
        '@platforms': path.resolve(__dirname, 'platforms')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload'
    }
  },
  renderer: {
    root: 'src/renderer',
    publicDir: '../../public',
    plugins: [vue()],
    base: './',
    build: {
      outDir: 'dist/renderer'
    }
  }
})
