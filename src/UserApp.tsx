import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import type { Page } from './types';
import './styles/user.css';

export interface UserAppProps {
  /** Controlled mode: Host decides which page to show (e.g. from its route). */
  page?: Page;
  /** Called when the MFE wants to navigate. Host should call its router here. */
  onNavigate?: (path: string) => void;
  /** Prefix for paths, e.g. "/user" -> "/user/login". Default "". */
  basePath?: string;
}

const pathToPage = (path: string): Page =>
  path.includes('signup') ? 'signup' : path.includes('profile') ? 'profile' : 'login';

export default function UserApp({ page, onNavigate, basePath = '' }: UserAppProps) {
  const [localPage, setLocalPage] = useState<Page>(() => pathToPage(window.location.pathname));
  const current: Page = page ?? localPage;

  // Standalone mode only: react to browser back/forward.
  useEffect(() => {
    const onPop = () => setLocalPage(pathToPage(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = (to: Page) => {
    const path = `${basePath}/${to}`;
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      setLocalPage(to);
    }
  };

  return (
    <div className="um-root">
      {current === 'login' && <Login onNavigate={go} />}
      {current === 'signup' && <Signup onNavigate={go} />}
      {current === 'profile' && <Profile onNavigate={go} />}
    </div>
  );
}
