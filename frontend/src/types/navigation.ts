export type Page =
    | "home"
    | "login"
    | "register"
    | "admin"
    | "saved"
    | "profile"
    | "recommendations"
    | "explore"
    | "internships"
    | "hackathons"
    | "verify"
    | "assistant"
    | "about";

export interface NavbarProps {
    isAuthenticated: boolean;
    isAdmin: boolean;
    username: string | null;
    activePage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}