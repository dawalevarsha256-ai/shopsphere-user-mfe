export type Page = 'login' | 'signup' | 'profile';

export interface PageProps {
  onNavigate: (page: Page) => void;
}
