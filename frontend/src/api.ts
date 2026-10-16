import type {
    RegisterData,
    RegisterResponse,
    LoginData,
    LoginResponse,
} from "./types/auth";

const API_BASE_URL = "http://localhost:8000/api";

type ApiOptions = Omit<RequestInit, "credentials">;

export interface InternshipRecord {
    id: number;
    title: string;
    company: string;
    location: string;
    internship_type: string;
    skills: string;
    stipend: string;
    deadline: string | null;
    description: string;
    source_url: string;
    status: string;
}

export interface HackathonRecord {
    id: number;
    title: string;
    organizer: string;
    location: string;
    event_type: string;
    themes: string;
    participation_mode: "online" | "offline" | "hybrid";
    registration_deadline: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string;
    source_url: string;
    status: string;
}

function getCsrfToken(): string | null {
    const csrfCookie = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("csrftoken="));

    return csrfCookie
        ? decodeURIComponent(csrfCookie.split("=")[1])
        : null;
}

async function initializeCsrf(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/accounts/csrf/`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to initialize CSRF protection");
    }
}

async function apiRequest<T = unknown>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<T> {
    const method = (options.method ?? "GET").toUpperCase();
    const headers = new Headers(options.headers);

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        await initializeCsrf();

        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            throw new Error("CSRF token not found");
        }

        headers.set("X-CSRFToken", csrfToken);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
    });

    const data: unknown = await response.json();

    if (!response.ok) {
        const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
                ? data.error
                : typeof data === "object" &&
                    data !== null &&
                    "detail" in data &&
                    typeof data.detail === "string"
                  ? data.detail
                  : typeof data === "object" &&
                      data !== null &&
                      "message" in data &&
                      typeof data.message === "string"
                    ? data.message
                    : "Request failed";

        throw new Error(message);
    }

    return data as T;
}

async function registerUser(
    data: RegisterData,
): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>("/accounts/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

async function loginUser(
    data: LoginData,
): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/accounts/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

async function getInternships(): Promise<InternshipRecord[]> {
    const data = await apiRequest<InternshipRecord[] | { results: InternshipRecord[] }>(
        "/internships/",
    );
    return Array.isArray(data) ? data : data.results;
}

async function getHackathons(): Promise<HackathonRecord[]> {
    const data = await apiRequest<HackathonRecord[] | { results: HackathonRecord[] }>(
        "/hackathons/",
    );
    return Array.isArray(data) ? data : data.results;
}

export {
    API_BASE_URL,
    apiRequest,
    registerUser,
    loginUser,
    getInternships,
    getHackathons,
};