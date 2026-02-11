/**
 * Module Settings Context
 *
 * Provides app-wide access to which modules are enabled/disabled.
 * Loaded once on app start, refreshable from Admin page.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { adminApi } from '../api'
import type { ModuleSettings } from '../types'

const DEFAULT_SETTINGS: ModuleSettings = {
  photos: true,
  notes: true,
  livestock: true,
  equipment: true,
  consumables: true,
  maintenance: true,
  icp_tests: true,
}

interface ModuleSettingsContextValue {
  modules: ModuleSettings
  isLoaded: boolean
  refresh: () => Promise<void>
  isEnabled: (module: keyof ModuleSettings) => boolean
}

const ModuleSettingsContext = createContext<ModuleSettingsContextValue>({
  modules: DEFAULT_SETTINGS,
  isLoaded: false,
  refresh: async () => {},
  isEnabled: () => true,
})

export function ModuleSettingsProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<ModuleSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const data = await adminApi.getModuleSettings()
      setModules({ ...DEFAULT_SETTINGS, ...data } as ModuleSettings)
    } catch {
      // If the endpoint fails (e.g. not logged in yet), keep defaults
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isEnabled = useCallback(
    (module: keyof ModuleSettings) => modules[module] ?? true,
    [modules],
  )

  return (
    <ModuleSettingsContext.Provider value={{ modules, isLoaded, refresh, isEnabled }}>
      {children}
    </ModuleSettingsContext.Provider>
  )
}

export function useModuleSettings() {
  return useContext(ModuleSettingsContext)
}
