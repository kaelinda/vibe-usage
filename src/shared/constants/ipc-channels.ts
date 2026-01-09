export const Channel = {
  // Platform channels
  Platforms: {
    GetAll: 'platforms:get-all',
    GetById: 'platforms:get-by-id',
    GetModels: 'platforms:get-models',
    Add: 'platforms:add',
    Update: 'platforms:update',
    Remove: 'platforms:remove',
    FetchUsage: 'platforms:fetch-usage',
  },

  // Model channels
  Models: {
    GetAll: 'models:get-all',
    GetByPlatform: 'models:get-by-platform',
    GetById: 'models:get-by-id',
    Add: 'models:add',
    Update: 'models:update',
    Remove: 'models:remove',
  },

  // Usage channels
  Usage: {
    GetHistory: 'usage:get-history',
    GetLatest: 'usage:get-latest',
    AddRecord: 'usage:add-record',
    ForceRefresh: 'usage:force-refresh',
  },

  // Alert channels
  Alerts: {
    GetAll: 'alerts:get-all',
    GetByModel: 'alerts:get-by-model',
    GetById: 'alerts:get-by-id',
    Add: 'alerts:add',
    Update: 'alerts:update',
    Remove: 'alerts:remove',
  },

  // Preferences channels
  Preferences: {
    Get: 'preferences:get',
    Update: 'preferences:update',
    SetPollingInterval: 'preferences:set-polling-interval',
  },

  // Credential channels
  Credentials: {
    Get: 'credentials:get',
    Set: 'credentials:set',
    Remove: 'credentials:remove',
  },

  // App channels
  App: {
    Quit: 'app:quit',
    Reload: 'app:reload',
  },

  // Window channels
  Window: {
    Minimize: 'window:minimize',
    Maximize: 'window:maximize',
    Close: 'window:close',
  },
} as const
