// @ts-nocheck
import initSqlJs, { Database } from 'sql.js'
import path from 'path'

interface PlatformConfig {
  id: string
  name: string
  apiEndpoint: string
  description?: string
  options?: {
    authType: 'api_key' | 'bearer' | 'oauth2'
    requiresOrg?: boolean
    customHeaders?: Record<string, string>
  }
  createdAt: string
  updatedAt: string
}

interface ModelConfig {
  id: string
  platformId: string
  name: string
  displayName: string
  quotaTotal: number
  quotaPeriod?: 'monthly' | 'daily' | 'rolling'
  createdAt: string
  updatedAt: string
}

interface UsageRecord {
  id: number
  modelId: string
  timestamp: string
  tokensUsed: number
  tokensRemaining?: number
  quotaTotal?: number
  costEstimate?: number
  metadata?: {
    apiCalls?: number
    promptTokens?: number
    completionTokens?: number
  }
}

interface AlertRule {
  id: string
  modelId: string
  thresholdType: 'percentage' | 'absolute'
  thresholdValue: number
  isEnabled: boolean
  notificationMethod: 'system' | 'tray' | 'both'
  lastTriggered?: string
  createdAt: string
  updatedAt: string
}

interface UserPreferences {
  id: string
  refreshInterval: number
  theme: 'light' | 'dark' | 'system'
  notificationsEnabled: boolean
  startWithSystem: boolean
  defaultView: 'dashboard' | 'history' | 'settings'
  dataRetentionDays: number
  showCosts: boolean
  currency: string
  trayConfig: {
    showOnHover: boolean
    summaryItems: number
    showBadge: boolean
    badgeColor: 'percentage' | 'threshold' | 'fixed'
    fixedBadgeColor?: string
  }
  updatedAt: string
}

export class StorageService {
  private db: Database | null = null
  private dbPath: string
  private initialized: boolean = false
  private initPromise: Promise<void> | null = null

  constructor() {
    this.dbPath = path.join(process.cwd(), 'vibe-usage.db')
    this.initPromise = this.initDatabase()
  }

  async waitForInit(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) await this.initPromise
  }

  private async initDatabase() {
    const sqlJs = await initSqlJs()

    try {
      const fs = require('fs')
      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath)
        this.db = new sqlJs.Database(fileBuffer)
      } else {
        this.db = new sqlJs.Database()
      }
    } catch {
      this.db = new sqlJs.Database()
    }

    this.initializeSchema()
    this.initialized = true
  }

  private saveToFile() {
    if (this.db) {
      const data = this.db.export()
      const buffer = Buffer.from(data)
      const fs = require('fs')
      fs.writeFileSync(this.dbPath, buffer)
    }
  }

  private runSql(sql: string, params?: unknown[]): { lastInsertRowid: number; changes: number } {
    if (!this.db) throw new Error('Database not initialized')
    this.db.run(sql, params || [])
    return { lastInsertRowid: this.db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] as number || 0, changes: this.db.getRowsModified() }
  }

  private getOne<T>(sql: string, params?: unknown[]): T | null {
    if (!this.db) throw new Error('Database not initialized')
    const stmt = this.db.prepare(sql)
    stmt.bind(params || [])
    if (stmt.step()) {
      const row = stmt.getAsObject()
      stmt.free()
      return row as T
    }
    stmt.free()
    return null
  }

  private getAll<T>(sql: string, params?: unknown[]): T[] {
    if (!this.db) throw new Error('Database not initialized')
    const results: T[] = []
    const stmt = this.db.prepare(sql)
    stmt.bind(params || [])
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T)
    }
    stmt.free()
    return results
  }

  private initializeSchema() {
    this.runSql(`CREATE TABLE IF NOT EXISTS platforms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      api_endpoint TEXT NOT NULL,
      description TEXT,
      auth_type TEXT DEFAULT 'api_key',
      requires_org INTEGER DEFAULT 0,
      custom_headers TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

    this.runSql(`CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      platform_id TEXT NOT NULL,
      name TEXT NOT NULL,
      display_name TEXT,
      quota_total INTEGER DEFAULT -1,
      quota_period TEXT DEFAULT 'monthly',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
    )`)

    this.runSql(`CREATE TABLE IF NOT EXISTS usage_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      tokens_used INTEGER NOT NULL,
      tokens_remaining INTEGER,
      quota_total INTEGER,
      cost_estimate REAL,
      api_calls INTEGER,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
    )`)

    this.runSql(`CREATE TABLE IF NOT EXISTS alert_rules (
      id TEXT PRIMARY KEY,
      model_id TEXT NOT NULL,
      threshold_type TEXT NOT NULL,
      threshold_value REAL NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      notification_method TEXT DEFAULT 'both',
      last_triggered TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
    )`)

    this.runSql(`CREATE TABLE IF NOT EXISTS user_prefs (
      id TEXT PRIMARY KEY DEFAULT 'default',
      refresh_interval INTEGER DEFAULT 60,
      theme TEXT DEFAULT 'system',
      notifications_enabled INTEGER DEFAULT 1,
      start_with_system INTEGER DEFAULT 0,
      default_view TEXT DEFAULT 'dashboard',
      data_retention_days INTEGER DEFAULT 30,
      show_costs INTEGER DEFAULT 1,
      currency TEXT DEFAULT 'USD',
      tray_config TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

    this.runSql(`CREATE INDEX IF NOT EXISTS idx_usage_model_time ON usage_records(model_id, timestamp DESC)`)
    this.runSql(`CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_records(timestamp DESC)`)
    this.runSql(`CREATE INDEX IF NOT EXISTS idx_models_platform ON models(platform_id)`)

    const existingPrefs = this.getOne<{ id: string }>('SELECT id FROM user_prefs WHERE id = ?', ['default'])
    if (!existingPrefs) {
      this.runSql(`INSERT INTO user_prefs (id, refresh_interval, theme, notifications_enabled, start_with_system, default_view, data_retention_days, show_costs, currency, tray_config)
        VALUES ('default', 60, 'system', 1, 0, 'dashboard', 30, 1, 'USD', '{"showOnHover":true,"summaryItems":5,"showBadge":true,"badgeColor":"percentage"}')`)
    }
  }

  getAllPlatforms(): PlatformConfig[] {
    return this.getAll<PlatformConfig>('SELECT * FROM platforms ORDER BY created_at DESC')
  }

  getPlatformById(id: string): PlatformConfig | undefined {
    return this.getOne<PlatformConfig>('SELECT * FROM platforms WHERE id = ?', [id])
  }

  addPlatform(config: Omit<PlatformConfig, 'createdAt' | 'updatedAt'>): PlatformConfig | null {
    try {
      this.runSql(`INSERT INTO platforms (id, name, api_endpoint, description, auth_type, requires_org, custom_headers) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [config.id, config.name, config.apiEndpoint, config.description || null, config.options?.authType || 'api_key', config.options?.requiresOrg ? 1 : 0, config.options?.customHeaders ? JSON.stringify(config.options.customHeaders) : null])
      this.saveToFile()
      return this.getPlatformById(config.id) ?? undefined
    } catch { return undefined }
  }

  updatePlatform(id: string, updates: Partial<PlatformConfig>): PlatformConfig | undefined {
    try {
      const fields: string[] = []
      const values: unknown[] = []
      if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
      if (updates.apiEndpoint !== undefined) { fields.push('api_endpoint = ?'); values.push(updates.apiEndpoint) }
      if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description) }
      if (fields.length === 0) return this.getPlatformById(id) ?? undefined
      fields.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)
      this.runSql(`UPDATE platforms SET ${fields.join(', ')} WHERE id = ?`, values)
      this.saveToFile()
      return this.getPlatformById(id) ?? undefined
    } catch { return undefined }
  }

  removePlatform(id: string): boolean {
    try {
      this.runSql('DELETE FROM platforms WHERE id = ?', [id])
      this.saveToFile()
      return true
    } catch { return false }
  }

  getAllModels(): ModelConfig[] {
    return this.getAll<ModelConfig>('SELECT * FROM models ORDER BY created_at DESC')
  }

  getModelsByPlatform(platformId: string): ModelConfig[] {
    return this.getAll<ModelConfig>('SELECT * FROM models WHERE platform_id = ? ORDER BY created_at DESC', [platformId])
  }

  addModel(config: Omit<ModelConfig, 'createdAt' | 'updatedAt'>): ModelConfig | null {
    try {
      this.runSql(`INSERT INTO models (id, platform_id, name, display_name, quota_total, quota_period) VALUES (?, ?, ?, ?, ?, ?)`,
        [config.id, config.platformId, config.name, config.displayName, config.quotaTotal, config.quotaPeriod || 'monthly'])
      this.saveToFile()
      return this.getModelById(config.id) ?? null
    } catch { return null }
  }

  getModelById(id: string): ModelConfig | undefined {
    return this.getOne<ModelConfig>('SELECT * FROM models WHERE id = ?', [id])
  }

  updateModel(id: string, updates: Partial<ModelConfig>): ModelConfig | null {
    try {
      const fields: string[] = []
      const values: unknown[] = []
      if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
      if (updates.displayName !== undefined) { fields.push('display_name = ?'); values.push(updates.displayName) }
      if (updates.quotaTotal !== undefined) { fields.push('quota_total = ?'); values.push(updates.quotaTotal) }
      if (fields.length === 0) return this.getModelById(id) ?? null
      fields.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)
      this.runSql(`UPDATE models SET ${fields.join(', ')} WHERE id = ?`, values)
      this.saveToFile()
      return this.getModelById(id) ?? null
    } catch { return null }
  }

  removeModel(id: string): boolean {
    try {
      this.runSql('DELETE FROM models WHERE id = ?', [id])
      this.saveToFile()
      return true
    } catch { return false }
  }

  addUsageRecord(record: Omit<UsageRecord, 'id'>): number {
    const result = this.runSql(`INSERT INTO usage_records (model_id, timestamp, tokens_used, tokens_remaining, quota_total, cost_estimate, api_calls, prompt_tokens, completion_tokens, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [record.modelId, record.timestamp || new Date().toISOString(), record.tokensUsed, record.tokensRemaining || null, record.quotaTotal || null, record.costEstimate || null, record.metadata?.apiCalls || null, record.metadata?.promptTokens || null, record.metadata?.completionTokens || null, record.metadata ? JSON.stringify(record.metadata) : null])
    this.saveToFile()
    return result.lastInsertRowid
  }

  getUsageHistory(modelId: string, days: number): UsageRecord[] {
    return this.getAll<UsageRecord>(`SELECT * FROM usage_records WHERE model_id = ? AND timestamp >= datetime('now', ?) ORDER BY timestamp DESC`, [modelId, `-${days} days`])
  }

  getLatestUsage(modelId: string): UsageRecord | undefined {
    return this.getOne<UsageRecord>(`SELECT * FROM usage_records WHERE model_id = ? ORDER BY timestamp DESC LIMIT 1`, [modelId])
  }

  cleanupOldRecords(days: number): number {
    const result = this.runSql(`DELETE FROM usage_records WHERE timestamp < datetime('now', ?)`, [`-${days} days`])
    this.saveToFile()
    return result.changes
  }

  getAllAlertRules(): AlertRule[] {
    return this.getAll<AlertRule>('SELECT * FROM alert_rules ORDER BY created_at DESC')
  }

  getAlertRulesByModel(modelId: string): AlertRule[] {
    return this.getAll<AlertRule>('SELECT * FROM alert_rules WHERE model_id = ? ORDER BY created_at DESC', [modelId])
  }

  addAlertRule(config: Omit<AlertRule, 'createdAt' | 'updatedAt'>): AlertRule | null {
    try {
      this.runSql(`INSERT INTO alert_rules (id, model_id, threshold_type, threshold_value, is_enabled, notification_method) VALUES (?, ?, ?, ?, ?, ?)`,
        [config.id, config.modelId, config.thresholdType, config.thresholdValue, config.isEnabled ? 1 : 0, config.notificationMethod])
      this.saveToFile()
      return this.getAlertRuleById(config.id) ?? null
    } catch { return null }
  }

  getAlertRuleById(id: string): AlertRule | undefined {
    return this.getOne<AlertRule>('SELECT * FROM alert_rules WHERE id = ?', [id])
  }

  updateAlertRule(id: string, updates: Partial<AlertRule>): AlertRule | null {
    try {
      const fields: string[] = []
      const values: unknown[] = []
      if (updates.thresholdType !== undefined) { fields.push('threshold_type = ?'); values.push(updates.thresholdType) }
      if (updates.thresholdValue !== undefined) { fields.push('threshold_value = ?'); values.push(updates.thresholdValue) }
      if (updates.isEnabled !== undefined) { fields.push('is_enabled = ?'); values.push(updates.isEnabled ? 1 : 0) }
      if (updates.notificationMethod !== undefined) { fields.push('notification_method = ?'); values.push(updates.notificationMethod) }
      if (updates.lastTriggered !== undefined) { fields.push('last_triggered = ?'); values.push(updates.lastTriggered) }
      if (fields.length === 0) return this.getAlertRuleById(id) ?? null
      fields.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)
      this.runSql(`UPDATE alert_rules SET ${fields.join(', ')} WHERE id = ?`, values)
      this.saveToFile()
      return this.getAlertRuleById(id) ?? null
    } catch { return null }
  }

  removeAlertRule(id: string): boolean {
    try {
      this.runSql('DELETE FROM alert_rules WHERE id = ?', [id])
      this.saveToFile()
      return true
    } catch { return false }
  }

  getUserPreferences(): UserPreferences {
    const prefs = this.getOne<Record<string, unknown>>('SELECT * FROM user_prefs WHERE id = ?', ['default'])
    if (prefs) {
      return {
        id: prefs.id as string,
        refreshInterval: prefs.refresh_interval as number,
        theme: prefs.theme as 'light' | 'dark' | 'system',
        notificationsEnabled: Boolean(prefs.notifications_enabled),
        startWithSystem: Boolean(prefs.start_with_system),
        defaultView: prefs.default_view as 'dashboard' | 'history' | 'settings',
        dataRetentionDays: prefs.data_retention_days as number,
        showCosts: Boolean(prefs.show_costs),
        currency: prefs.currency as string,
        trayConfig: prefs.tray_config ? JSON.parse(prefs.tray_config as string) : { showOnHover: true, summaryItems: 5, showBadge: true, badgeColor: 'percentage' },
        updatedAt: prefs.updated_at as string
      }
    }
    return { id: 'default', refreshInterval: 60, theme: 'system', notificationsEnabled: true, startWithSystem: false, defaultView: 'dashboard', dataRetentionDays: 30, showCosts: true, currency: 'USD', trayConfig: { showOnHover: true, summaryItems: 5, showBadge: true, badgeColor: 'percentage' }, updatedAt: new Date().toISOString() }
  }

  updateUserPreferences(prefs: Partial<UserPreferences>): UserPreferences | null {
    try {
      const fields: string[] = []
      const values: unknown[] = []
      if (prefs.refreshInterval !== undefined) { fields.push('refresh_interval = ?'); values.push(prefs.refreshInterval) }
      if (prefs.theme !== undefined) { fields.push('theme = ?'); values.push(prefs.theme) }
      if (prefs.notificationsEnabled !== undefined) { fields.push('notifications_enabled = ?'); values.push(prefs.notificationsEnabled ? 1 : 0) }
      if (prefs.startWithSystem !== undefined) { fields.push('start_with_system = ?'); values.push(prefs.startWithSystem ? 1 : 0) }
      if (prefs.defaultView !== undefined) { fields.push('default_view = ?'); values.push(prefs.defaultView) }
      if (prefs.dataRetentionDays !== undefined) { fields.push('data_retention_days = ?'); values.push(prefs.dataRetentionDays) }
      if (prefs.showCosts !== undefined) { fields.push('show_costs = ?'); values.push(prefs.showCosts ? 1 : 0) }
      if (prefs.currency !== undefined) { fields.push('currency = ?'); values.push(prefs.currency) }
      if (prefs.trayConfig !== undefined) { fields.push('tray_config = ?'); values.push(JSON.stringify(prefs.trayConfig)) }
      if (fields.length === 0) return this.getUserPreferences()
      fields.push('updated_at = CURRENT_TIMESTAMP')
      values.push('default')
      this.runSql(`UPDATE user_prefs SET ${fields.join(', ')} WHERE id = ?`, values)
      this.saveToFile()
      return this.getUserPreferences()
    } catch { return null }
  }
}
