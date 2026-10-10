import { useEffect } from 'react';

/** Sets the document title for the current page, with a product suffix. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · SecureAuth` : 'SecureAuth';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
