import { useEffect, useState } from 'react';
import { AUTH_EVENT, getCurrentUser, type PublicUser } from '../services/auth';

/** Returns the logged-in user (or null) and stays in sync with auth changes. */
export function useAuthUser(): PublicUser | null {
  const [user, setUser] = useState<PublicUser | null>(getCurrentUser);

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener('storage', sync); // other tabs
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return user;
}
