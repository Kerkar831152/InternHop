export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
}

export interface RegisterResponse {
    message: string;
}

export interface LoginProps {
    onLoginSuccess: (username: string) => void;
    onGoToRegister: () => void;
}

export interface RegisterProps {
    onRegistrationSuccess: () => void;
    onGoToLogin: () => void;
}