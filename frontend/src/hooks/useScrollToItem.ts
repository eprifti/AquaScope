/**
 * Hook to scroll to and highlight a specific item card when navigating
 * from TankTabs with ?item=<id> query param.
 */
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Scrolls to and highlights a card element when `?item=<id>` is present.
 *
 * @param items - The full list of items (used to find which page the item is on)
 * @param itemsPerPage - Items per page (pass 0 for non-paginated pages)
 * @param setPage - State setter for the current page (optional, only for paginated pages)
 */
export function useScrollToItem<T extends { id: string }>(
  items: T[],
  itemsPerPage?: number,
  setPage?: (page: number) => void,
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const targetId = searchParams.get('item')

  useEffect(() => {
    if (!targetId || items.length === 0) return

    // For paginated pages, jump to the correct page
    if (itemsPerPage && setPage) {
      const idx = items.findIndex(i => i.id === targetId)
      if (idx !== -1) {
        setPage(Math.floor(idx / itemsPerPage) + 1)
      }
    }

    // Wait for re-render, then scroll + highlight
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`card-${targetId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('ring-2', 'ring-ocean-500', 'ring-offset-2')
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-ocean-500', 'ring-offset-2')
          }, 3000)
        }
        // Clean up the item param from the URL
        searchParams.delete('item')
        setSearchParams(searchParams, { replace: true })
      }, 150)
    })
  }, [targetId, items])
}
