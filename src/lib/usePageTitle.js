import { useEffect } from 'react'

export const DEFAULT_PAGE_TITLE = 'CleanID | Jasa Kebersihan Profesional'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title === DEFAULT_PAGE_TITLE ? title : `${title} | CleanID`

    return () => {
      document.title = DEFAULT_PAGE_TITLE
    }
  }, [title])
}
