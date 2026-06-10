import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  return ctx ? ctx.navigate : () => {};
}

export function useLocation() {
  const ctx = useContext(RouterContext);
  const pathname = ctx ? ctx.path.split('?')[0] : '/';
  return { pathname };
}

export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void] {
  const params = new URLSearchParams(window.location.search);
  const setParams = (_p: URLSearchParams) => {}; // read-only for now
  return [params, setParams];
}

export function useParams() {
  const ctx = useContext(RouterContext);
  const path = ctx ? ctx.path : '/';
  const segments = path.split('?')[0].split('/');
  // /meeting-requests/:id or /meeting-requests/:id/edit
  if (segments[1] === 'meeting-requests') {
    const id = segments[2];
    if (id && id !== 'new') {
      return { id };
    }
  }
  // /venue-explorer/:id
  if (segments[1] === 'venue-explorer' && segments[2]) {
    return { id: segments[2] };
  }
  return {} as Record<string, string>;
}

function matchPath(pattern: string, path: string): boolean {
  if (pattern === path) return true;
  const patternSegments = pattern.split('/');
  const pathSegments = path.split('/');
  if (patternSegments.length !== pathSegments.length) return false;
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSeg = patternSegments[i];
    const pathSeg = pathSegments[i];
    if (patternSeg.startsWith(':')) {
      continue;
    }
    if (patternSeg !== pathSeg) {
      return false;
    }
  }
  return true;
}

export function Routes({ children }: { children: React.ReactNode }) {
  const ctx = useContext(RouterContext);
  const fullPath = ctx ? ctx.path : '/';
  const currentPath = fullPath.split('?')[0];

  let match: React.ReactNode = null;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && !match) {
      const { path, index } = child.props as any;
      if (index && currentPath === '/') {
        match = child;
      } else if (path && matchPath(path, currentPath)) {
        match = child;
      }
    }
  });

  return match;
}

export function Route({ element }: { path?: string; index?: boolean; element: React.ReactNode }) {
  return <>{element}</>;
}

export function Link({ to, children, ...props }: any) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
