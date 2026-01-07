export interface PlatformClient {
  getUsage(): Promise<{
    tokensUsed: number
    tokensRemaining?: number
    quotaTotal?: number
    costEstimate?: number
  }>
}

export interface PlatformConfig {
  id: string
  name: string
  apiEndpoint: string
  authType?: string
}

export interface PlatformRegistry {
  getClient(platformId: string, apiKey: string): PlatformClient | null
  hasPlatform(platformId: string): boolean
  getSupportedPlatforms(): Array<{ id: string; name: string }>
}

export function createPlatformRegistry(): PlatformRegistry {
  const clients = new Map<string, new (config: PlatformConfig, apiKey: string) => PlatformClient>()

  function register(platformId: string, clientClass: new (config: PlatformConfig, apiKey: string) => PlatformClient) {
    clients.set(platformId, clientClass)
  }

  function getClient(platformId: string, apiKey: string): PlatformClient | null {
    const ClientClass = clients.get(platformId)
    if (!ClientClass) return null

    const config: PlatformConfig = {
      id: platformId,
      name: platformId,
      apiEndpoint: '',
      authType: 'bearer'
    }

    return new ClientClass(config, apiKey)
  }

  function hasPlatform(platformId: string): boolean {
    return clients.has(platformId)
  }

  function getSupportedPlatforms(): Array<{ id: string; name: string }> {
    return Array.from(clients.entries()).map(([id, _]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1)
    }))
  }

  return {
    register,
    getClient,
    hasPlatform,
    getSupportedPlatforms
  }
}

export const platformRegistry = createPlatformRegistry()

// Register platform clients
// These will be imported and registered when their modules are loaded
platformRegistry.getSupportedPlatforms()
