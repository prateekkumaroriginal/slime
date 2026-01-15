import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { view: 'list'; collectionId?: string | null }
  | { view: 'create' }
  | { view: 'edit'; ruleId: string }
  | { view: 'action-button' }
  | { view: 'image-storage' };

export function parsePath(path: string): Route {
  const cleanPath = path.replace(/^#/, '');

  if (!cleanPath || cleanPath === '/') {
    return { view: 'list', collectionId: null };
  }

  if (cleanPath === 'create') {
    return { view: 'create' };
  }

  if (cleanPath === 'action-button') {
    return { view: 'action-button' };
  }

  if (cleanPath === 'image-storage') {
    return { view: 'image-storage' };
  }

  const editMatch = cleanPath.match(/^edit\/(.+)$/);
  if (editMatch) {
    return { view: 'edit', ruleId: editMatch[1] };
  }

  // Collection routes: collection/:collectionId
  const collectionMatch = cleanPath.match(/^collection\/(.+)$/);
  if (collectionMatch) {
    return { view: 'list', collectionId: collectionMatch[1] };
  }

  return { view: 'list', collectionId: null };
}

export function routeToPath(route: Route): string {
  switch (route.view) {
    case 'list':
      if (route.collectionId) {
        return `collection/${route.collectionId}`;
      }
      return '';
    case 'create':
      return 'create';
    case 'edit':
      return `edit/${route.ruleId}`;
    case 'action-button':
      return 'action-button';
    case 'image-storage':
      return 'image-storage';
  }
}

function toHash(route: Route): string {
  const path = routeToPath(route);
  return path ? `#${path}` : '';
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parsePath(window.location.hash));

  useEffect(() => {
    function handleHashChange() {
      setRoute(parsePath(window.location.hash));
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((newRoute: Route) => {
    const hash = toHash(newRoute);
    window.location.hash = hash;
    setRoute(newRoute);
  }, []);

  return { route, navigate };
}
