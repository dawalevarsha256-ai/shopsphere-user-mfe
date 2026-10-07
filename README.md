# ShopSphere – User Micro-Frontend (`userMfe`)

## 1. Purpose
Login, Signup and Profile for ShopSphere. Runs standalone for development and is exposed to the Host via Module Federation. The Host owns the navbar, so this MFE has **no navbar**.

## 2. Tech stack
React 18, TypeScript, Vite 5, plain CSS (scoped with `um-` prefix), `@originjs/vite-plugin-federation`.

## 3–4. Install & run
```bash
npm install
npm run dev            # standalone dev  -> http://localhost:5174
npm run serve:remote   # build + serve remoteEntry.js for the Host -> http://localhost:5174/assets/remoteEntry.js
```
> With this plugin, `remoteEntry.js` only exists after a **build**. The Host cannot load the remote from `npm run dev`; use `serve:remote`.

## 5. Folder structure
```
src/
├── components/   AuthCard.tsx, FormField.tsx (reusable)
├── pages/        Login.tsx, Signup.tsx, Profile.tsx
├── services/     auth.ts (localStorage mock auth)
├── hooks/        useAuthUser.ts
├── utils/        validation.ts
├── styles/       user.css (scoped), dev.css (standalone only)
├── UserApp.tsx   exposed entry (./UserApp)
├── main.tsx      standalone entry only
└── types.ts
```

## 6. Pages
`/login`, `/signup`, `/profile`

## 7. Authentication approach
Mock only. `shopsphere_user` = `{name, email, password, createdAt}` (saved at signup). `shopsphere_auth` = `"true"` (set at login, removed at logout). Login compares against the stored user. A `shopsphere-auth-change` window event fires on every change so the Host navbar can switch Login ↔ Profile. Passwords are plain text: prototype only.

## 8. Module Federation setup (`vite.config.ts`)
- name: `userMfe`, filename: `remoteEntry.js`
- exposes: `./UserApp` (the component) and `./auth` (helpers: `isLoggedIn`, `getCurrentUser`, `logout`, `AUTH_EVENT`)
- shared: `react`, `react-dom` (Host must also share them, same major version)

`UserApp` props: `page?: 'login'|'signup'|'profile'`, `onNavigate?: (path) => void`, `basePath?: string`.

## 9. How Bhumika integrates it
**a) Host `vite.config.ts`** (same plugin as above; adjust if your Host uses another federation plugin):
```ts
federation({
  name: 'host',
  remotes: {
    userMfe: 'http://localhost:5174/assets/remoteEntry.js',
    // productMfe, cartMfe from Jatin/Vanshika...
  },
  shared: ['react', 'react-dom'],
})
```
Also set `build: { target: 'esnext' }`.

**b) Type declarations** – `src/remotes.d.ts` in the Host:
```ts
declare module 'userMfe/UserApp' {
  import { FC } from 'react';
  const UserApp: FC<{ page?: 'login' | 'signup' | 'profile'; onNavigate?: (path: string) => void; basePath?: string }>;
  export default UserApp;
}
declare module 'userMfe/auth' {
  export const AUTH_EVENT: string;
  export function isLoggedIn(): boolean;
  export function getCurrentUser(): { name: string; email: string; createdAt: string } | null;
  export function logout(): void;
}
```

**c) Host routes (react-router-dom v6)**:
```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
const UserApp = lazy(() => import('userMfe/UserApp'));

function UserRoutes() {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Routes>
        <Route path="/login"   element={<UserApp page="login"   onNavigate={navigate} />} />
        <Route path="/signup"  element={<UserApp page="signup"  onNavigate={navigate} />} />
        <Route path="/profile" element={<UserApp page="profile" onNavigate={navigate} />} />
      </Routes>
    </Suspense>
  );
}
```
(Put these `<Route>`s in the Host's main `<Routes>`; use `basePath="/user"` and `/user/login` paths if you prefer a prefix.)

**d) Navbar Login/Profile toggle** (optional):
```tsx
const { isLoggedIn, AUTH_EVENT } = await import('userMfe/auth');
// useState(isLoggedIn()); window.addEventListener(AUTH_EVENT, () => setLoggedIn(isLoggedIn()));
// show <Link to="/profile">Profile</Link> if logged in, else <Link to="/login">Login</Link>
```
Or read `localStorage.getItem('shopsphere_auth') === 'true'` directly.

## 10. Testing checklist
**Login**: empty email → "Email is required." · `abc` → "Enter a valid email address." · empty password → "Password is required." · valid signed-up credentials → success banner, then Profile · wrong credentials / no account → "Invalid email or password." · button shows "Logging in…" and is disabled while loading.
**Signup**: all empty → 4 errors · bad email · password < 6 chars · mismatch → "Passwords do not match." · valid → success banner, redirect to Login, `shopsphere_user` in localStorage.
**Profile**: logged in → name, email, status, member since · logged out → "You're not logged in" + Go to login · Logout clears `shopsphere_auth`, goes to Login · refresh after login keeps profile.
**Integration**: MFE loads in Host · Host Login/Profile links work · auth persists across Host pages · Signup↔Login links navigate via Host router · no CSS changes to other MFEs (inspect: all rules start with `.um-root`) · test at 1280px, 768px, 375px.
**API testing note**: this MFE has no backend calls; the "API" under test is `services/auth.ts` (`signup`, `login`, `logout`, `getCurrentUser`).

## Common errors and fixes
| Problem | Fix |
|---|---|
| Host can't load `remoteEntry.js` / 404 | Run `npm run serve:remote` (build first), check URL ends `/assets/remoteEntry.js` |
| CORS error | Already enabled in `vite.config.ts`; make sure port 5174 matches Host's `remotes` URL |
| "Invalid hook call" / two Reacts | Host and remote must both list `react`, `react-dom` in `shared`, same versions |
| `Cannot find module 'userMfe/UserApp'` (TS) | Add the `remotes.d.ts` from step 9b |
| Top-level await / build target error | Set `build.target: 'esnext'` in both configs |
| Changes not visible in Host | Rebuild the remote (no HMR for remotes with this plugin) |
| "Router inside Router" | Don't add a router to the MFE; it's built to use the Host's `navigate` |
| Login always fails | Sign up first (mock auth needs a stored user); clear storage if corrupted |
| Font not Inter | Offline/blocked Google Fonts; falls back to system font |
