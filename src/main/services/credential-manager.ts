import keytar from 'keytar'

const SERVICE_NAME = 'VibeUsage'

export class CredentialManager {
  async setPassword(platformId: string, password: string): Promise<boolean> {
    try {
      await keytar.setPassword(SERVICE_NAME, platformId, password)
      return true
    } catch {
      return false
    }
  }

  async getPassword(platformId: string): Promise<string | null> {
    try {
      return await keytar.getPassword(SERVICE_NAME, platformId)
    } catch {
      return null
    }
  }

  async deletePassword(platformId: string): Promise<boolean> {
    try {
      await keytar.deletePassword(SERVICE_NAME, platformId)
      return true
    } catch {
      return false
    }
  }

  async findCredentials(service: string): Promise<Array<{ account: string; password: string }>> {
    try {
      return await keytar.findCredentials(service)
    } catch {
      return []
    }
  }
}
