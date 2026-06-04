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
  return { pathname: ctx ? ctx.path : '/' };
}

export function useParams() {
  return {} as Record<string, string>;
}

export function Routes({ children }: { children: React.ReactNode }) {
  const ctx = useContext(RouterContext);
  const currentPath = ctx ? ctx.path : '/';

  let match: React.ReactNode = null;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && !match) {
      const { path, index } = child.props as any;
      if (index && currentPath === '/') {
        match = child;
      } else if (path === currentPath || (path && currentPath.startsWith(path) && path !== '/')) {
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
