export type Page = "home" | "login" | "register" | "admin";

export interface NavbarProps {
    isAuthenticated: boolean;
    isAdmin: boolean;
    username: string | null;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}