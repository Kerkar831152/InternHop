export type Page = "home" | "login" | "register";

export interface NavbarProps {
    isAuthenticated: boolean;
    username: string | null;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}