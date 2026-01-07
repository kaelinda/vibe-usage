// @ts-nocheck
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  main: {
    entry: 'src/main/index.ts',
    vite: {
      build: {
        outDir: 'dist/main'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    entry: 'src/preload/index.ts',
    vite: {
      build: {
        outDir: 'dist/preload'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src/renderer',
    vite: {
      plugins: [vue()],
      build: {
        outDir: 'dist/renderer'
      }
    }
  }
})
