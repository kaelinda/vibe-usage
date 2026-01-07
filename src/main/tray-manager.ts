// @ts-nocheck
import { Tray, Menu, nativeImage, BrowserWindow, Notification } from 'electron'
import path from 'path'
import { Channel } from '../shared/constants/ipc-channels'

let tray: Tray | null = null
let popupWindow: BrowserWindow | null = null

export function createTrayManager(mainWindow: BrowserWindow): Tray {
  const iconPath = getIconPath()
  const icon = nativeImage.createFromPath(iconPath)

  tray = new Tray(icon)
  tray.setToolTip('VibeUsage - AI Token Usage Monitor')

  updateContextMenu(mainWindow)
  setupTrayListeners(mainWindow)

  return tray
}

function updateContextMenu(mainWindow: BrowserWindow) {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Dashboard',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: 'Refresh Now',
      click: () => {
        mainWindow.webContents.send('usage:refresh')
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        mainWindow.close()
      }
    }
  ])

  tray?.setContextMenu(contextMenu)
}

function setupTrayListeners(mainWindow: BrowserWindow) {
  tray?.on('click', () => {
    togglePopup(mainWindow)
  })

  tray?.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.webContents.on('alert:triggered', (_event, data) => {
    showNotification(data)
  })
}

function getIconPath(): string {
  const icons: Record<string, string> = {
    darwin: 'resources/icons/iconTemplate.png',
    win32: 'resources/icons/icon.ico',
    linux: 'resources/icons/icon.png'
  }
  return path.join(process.cwd(), icons[process.platform] || icons.linux)
}

function togglePopup(mainWindow: BrowserWindow) {
  if (popupWindow) {
    if (popupWindow.isVisible()) {
      popupWindow.hide()
    } else {
      showPopup(mainWindow)
    }
  } else {
    showPopup(mainWindow)
  }
}

function showPopup(mainWindow: BrowserWindow) {
  popupWindow = new BrowserWindow({
    width: 320,
    height: 420,
    frame: false,
    show: false,
    skipTaskbar: true,
    resizable: false,
    alwaysOnTop: process.platform === 'win32',
    parent: mainWindow,
    modal: process.platform === 'darwin',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  const popupPath = path.join(process.cwd(), 'dist/renderer/tray-popup.html')
  popupWindow.loadURL(`file://${popupPath}`)

  popupWindow.once('ready-to-show', () => {
    popupWindow?.show()
  })

  popupWindow.on('blur', () => {
    if (process.platform !== 'darwin') {
      popupWindow?.hide()
    }
  })

  popupWindow.on('close', (e: Event) => {
    e.preventDefault()
    popupWindow?.hide()
  })
}

function showNotification(data: { alert: { modelId: string }; percentage: number; tokensUsed: number }) {
  if (Notification.isSupported()) {
    new Notification({
      title: data.percentage >= 100 ? 'Usage Alert' : 'Usage Warning',
      body: `${data.tokensUsed.toLocaleString()} tokens used (${data.percentage.toFixed(1)}%)`,
      icon: path.join(process.cwd(), 'resources/icons/icon.png')
    }).show()
  }
}

export function updateTrayBadge(text: string, color: string) {
  if (tray) {
    tray.setToolTip(`VibeUsage${text ? ` - ${text}` : ''}`)
  }
}

export function destroyTray() {
  tray?.destroy()
  tray = null
  popupWindow?.close()
  popupWindow = null
}
