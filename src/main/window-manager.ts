// @ts-nocheck
import { BrowserWindow, screen, shell } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

export function createWindowManager() {
  function createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    mainWindow = new BrowserWindow({
      width: Math.min(1200, width - 100),
      height: Math.min(800, height - 100),
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      },
      show: false,
      backgroundColor: '#ffffff',
      titleBarStyle: 'default',
      autoHideMenuBar: true
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow?.show()
      mainWindow?.focus()
    })

    mainWindow.on('closed', () => {
      mainWindow = null
    })

    mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    return mainWindow
  }

  function loadFile(filePath: string) {
    const devServerUrl = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL
    if (devServerUrl) {
      const url = new URL(filePath, devServerUrl)
      mainWindow?.loadURL(url.toString())
      return
    }
    mainWindow?.loadFile(path.join(process.cwd(), 'dist/renderer', filePath))
  }

  function show() {
    mainWindow?.show()
  }

  function hide() {
    mainWindow?.hide()
  }

  function close() {
    mainWindow?.close()
  }

  return {
    createMainWindow,
    loadFile,
    show,
    hide,
    close,
    getMainWindow: () => mainWindow
  }
}
