import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { view: 'list'; collectionId?: string | null }
  | { view: 'create'; collectionId?: string | null }
  | { view: 'edit'; ruleId: string; collectionId?: string | null }
  | { view: 'action-button' }
  | { view: 'image-storage' }
  | { view: 'design-1' }
  | { view: 'design-2' }
  | { view: 'design-3' }
  | { view: 'design-4' };

export function parsePath(path: string): Route {
  const cleanPath = path.replace(/^#/, '');

  if (!cleanPath || cleanPath === '/') {
    return { view: 'list', collectionId: null };
  }

  if (cleanPath === 'create') {
    return { view: 'create', collectionId: null };
  }

  if (cleanPath === 'action-button') {
    return { view: 'action-button' };
  }

  if (cleanPath === 'image-storage') {
    return { view: 'image-storage' };
  }

  if (cleanPath === '1') {
    return { view: 'design-1' };
  }
  
  if (cleanPath === '2') {
    return { view: 'design-2' };
  }
  
  if (cleanPath === '3') {
    return { view: 'design-3' };
  }
  
  if (cleanPath === '4') {
    return { view: 'design-4' };
  }

  // Edit without collection context: edit/:ruleId
  const editMatch = cleanPath.match(/^edit\/([^/]+)$/);
  if (editMatch) {
    return { view: 'edit', ruleId: editMatch[1], collectionId: null };
  }

  // Collection routes with nested actions: collection/:collectionId/...
  const collectionCreateMatch = cleanPath.match(/^collection\/([^/]+)\/create$/);
  if (collectionCreateMatch) {
    return { view: 'create', collectionId: collectionCreateMatch[1] };
  }

  const collectionEditMatch = cleanPath.match(/^collection\/([^/]+)\/edit\/([^/]+)$/);
  if (collectionEditMatch) {
    return { view: 'edit', collectionId: collectionEditMatch[1], ruleId: collectionEditMatch[2] };
  }

  // Collection list view: collection/:collectionId
  const collectionMatch = cleanPath.match(/^collection\/([^/]+)$/);
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
      if (route.collectionId) {
        return `collection/${route.collectionId}/create`;
      }
      return 'create';
    case 'edit':
      if (route.collectionId) {
        return `collection/${route.collectionId}/edit/${route.ruleId}`;
      }
      return `edit/${route.ruleId}`;
    case 'action-button':
      return 'action-button';
    case 'image-storage':
      return 'image-storage';
    case 'design-1':
      return '1';
    case 'design-2':
      return '2';
    case 'design-3':
      return '3';
    case 'design-4':
      return '4';
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
