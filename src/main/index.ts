// @ts-nocheck
import { app, BrowserWindow, Tray } from 'electron'
import { createWindowManager } from './window-manager'
import { createTrayManager } from './tray-manager'
import { setupIpcHandlers } from './ipc/handlers'
import { platformRegistry } from './services/platform-registry'
import { StorageService } from './services/storage-service'
import { CredentialManager } from './services/credential-manager'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const storageService = new StorageService()
const credentialManager = new CredentialManager()

app.whenReady().then(() => {
  const windowManager = createWindowManager()
  mainWindow = windowManager.createMainWindow()
  windowManager.loadFile('index.html')

  tray = createTrayManager(mainWindow)

  setupIpcHandlers({
    storageService,
    credentialManager,
    platformRegistry
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = windowManager.createMainWindow()
      windowManager.loadFile('index.html')
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  tray?.destroy()
})
