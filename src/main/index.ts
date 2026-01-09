// @ts-nocheck
import { app, BrowserWindow, Tray } from 'electron'
import { createWindowManager } from './window-manager'
import { createTrayManager } from './tray-manager'
import { setupIpcHandlers } from './ipc/handlers'
import { platformRegistry } from './services/platform-registry'
import { StorageService } from './services/storage-service'
import { CredentialManager } from './services/credential-manager'
import { UsagePoller } from './services/usage-poller'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

async function main() {
  const storageService = new StorageService()
  const credentialManager = new CredentialManager()

  // Wait for storage to initialize before creating UsagePoller
  await storageService.waitForInit()

  // Initialize UsagePoller with all dependencies
  const usagePoller = new UsagePoller(platformRegistry, storageService, credentialManager)

  app.whenReady().then(() => {
    const windowManager = createWindowManager()
    mainWindow = windowManager.createMainWindow()
    windowManager.loadFile('index.html')

    tray = createTrayManager(mainWindow)

    setupIpcHandlers({
      storageService,
      credentialManager,
      platformRegistry,
      usagePoller
    })

    // Start usage polling
    usagePoller.startPolling()

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
    // Stop polling before quitting
    usagePoller.stopPolling()
    tray?.destroy()
  })
}

main()
