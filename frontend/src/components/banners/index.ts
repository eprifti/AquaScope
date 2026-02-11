import ReefBanner from './ReefBanner'
import PlantedBanner from './PlantedBanner'

export type BannerTheme = 'reef' | 'planted' | 'custom'

export const banners: Record<string, React.ComponentType> = {
  reef: ReefBanner,
  planted: PlantedBanner,
}

export { ReefBanner, PlantedBanner }
