import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { view: 'list' }
  | { view: 'create' }
  | { view: 'edit'; ruleId: string }
  | { view: 'action-button' }
  | { view: 'image-storage' };

function parseHash(hash: string): Route {
  // Remove leading # if present
  const cleanHash = hash.replace(/^#/, '');

  if (!cleanHash) {
    return { view: 'list' };
  }

  // Parse routes
  if (cleanHash === 'create') {
    return { view: 'create' };
  }

  if (cleanHash === 'action-button') {
    return { view: 'action-button' };
  }

  if (cleanHash === 'image-storage') {
    return { view: 'image-storage' };
  }

  // Parse edit route: edit/{ruleId}
  const editMatch = cleanHash.match(/^edit\/(.+)$/);
  if (editMatch) {
    return { view: 'edit', ruleId: editMatch[1] };
  }

  // Unknown route, default to list
  return { view: 'list' };
}

function toHash(route: Route): string {
  switch (route.view) {
    case 'list':
      return '';
    case 'create':
      return '#create';
    case 'edit':
      return `#edit/${route.ruleId}`;
    case 'action-button':
      return '#action-button';
    case 'image-storage':
      return '#image-storage';
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    function handleHashChange() {
      setRoute(parseHash(window.location.hash));
    }

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = useCallback((newRoute: Route) => {
    const hash = toHash(newRoute);
    window.location.hash = hash;
    setRoute(newRoute);
  }, []);

  return { route, navigate };
}
