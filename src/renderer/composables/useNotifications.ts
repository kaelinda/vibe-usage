import { ref, onMounted, onUnmounted } from 'vue'

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
}

export function useNotifications() {
  const permission = ref<NotificationPermission>('default')

  async function requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return false
    }

    permission.value = await Notification.requestPermission()
    return permission.value === 'granted'
  }

  function show(payload: NotificationPayload): Notification | null {
    if (permission.value !== 'granted') {
      console.warn('Notification permission not granted')
      return null
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/vite.svg',
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  }

  return {
    permission,
    requestPermission,
    show,
  }
}

export function useAlertNotifications() {
  const { show } = useNotifications()

  function notifyNearLimit(modelName: string, percentage: number) {
    return show({
      title: 'Usage Warning',
      body: `${modelName} is at ${percentage.toFixed(0)}% of quota`,
    })
  }

  function notifyOverLimit(modelName: string) {
    return show({
      title: 'Usage Alert',
      body: `${modelName} has exceeded its quota!`,
    })
  }

  function notifyNewRecord(modelName: string, tokens: number) {
    return show({
      title: 'Usage Update',
      body: `${modelName}: ${tokens.toLocaleString()} tokens used`,
    })
  }

  return {
    notifyNearLimit,
    notifyOverLimit,
    notifyNewRecord,
  }
}
