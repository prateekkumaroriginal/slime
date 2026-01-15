import { createContext, useContext, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useHashRoute, parsePath, routeToPath } from './use-hash-route';

interface RouteContextValue {
  route: ReturnType<typeof useHashRoute>['route'];
  navigate: ReturnType<typeof useHashRoute>['navigate'];
  params: Record<string, string>;
}

const RouteContext = createContext<RouteContextValue | null>(null);

export function useRoute() {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a Routes component');
  }
  return context;
}

interface RoutesProps {
  children: ReactNode;
}

export function Routes({ children }: RoutesProps) {
  const { route, navigate } = useHashRoute();

  const params = useMemo((): Record<string, string> => {
    if (route.view === 'edit') {
      return { ruleId: route.ruleId };
    }
    if (route.view === 'list' && route.collectionId) {
      return { collectionId: route.collectionId };
    }
    return {} as Record<string, string>;
  }, [route]);

  const contextValue: RouteContextValue = useMemo(
    () => ({ route, navigate, params }),
    [route, navigate, params]
  );

  return <RouteContext.Provider value={contextValue}>{children}</RouteContext.Provider>;
}

interface RouteProps {
  path: string;
  element: ReactNode;
}

export function Route({ path, element }: RouteProps) {
  const { route } = useRoute();
  const currentPath = routeToPath(route);

  // Simple pattern matching
  const patternParts = path.split('/').filter(Boolean);
  const pathParts = currentPath.split('/').filter(Boolean);

  if (patternParts.length === 0 && pathParts.length === 0) {
    return <>{element}</>;
  }

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const matches = patternParts.every((part, i) => 
    part.startsWith(':') || part === pathParts[i]
  );

  return matches ? <>{element}</> : null;
}

export function useNavigate() {
  const { navigate } = useRoute();

  return useCallback(
    (path: string) => navigate(parsePath(path)),
    [navigate]
  );
}
