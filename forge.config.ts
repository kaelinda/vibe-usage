// @ts-nocheck
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { VitePlugin } from '@electron-forge/plugin-vite'

const config = {
  packagerConfig: {
    name: 'VibeUsage',
    executableName: 'vibe-usage',
    icon: 'resources/icons/icon',
    appBundleId: 'app.vibeusage',
    appCategoryType: 'public.app-category.developer-tools'
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: 'resources/icons/icon.ico'
    }),
    new MakerZIP(),
    new MakerDeb(),
    new MakerDMG()
  ],
  plugins: [
    new VitePlugin({
      main: {
        entry: 'src/main/index.ts'
      },
      preload: {
        entry: 'src/preload/index.ts'
      },
      renderer: {}
    })
  ]
}

export default config
