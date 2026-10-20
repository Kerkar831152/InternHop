export type Page =
    | "home"
    | "login"
    | "register"
    | "admin"
    | "saved"
    | "profile"
    | "recommendations";
    
export interface NavbarProps {
    isAuthenticated: boolean;
    isAdmin: boolean;
    username: string | null;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}