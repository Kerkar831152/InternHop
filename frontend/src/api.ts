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


export interface RecommendedInternship extends InternshipRecord {
    match_score: number;
    match_reasons: string[];
}

export interface RecommendedHackathon extends HackathonRecord {
    match_score: number;
    match_reasons: string[];
}

export interface RecommendationsResponse {
    internships: RecommendedInternship[];
    hackathons: RecommendedHackathon[];
}


export interface SavedOpportunityRecord {
    id: number;
    type: "internship" | "hackathon";
    opportunity_id: number;
}


export async function getRecommendations(): Promise<RecommendationsResponse> {
    return apiRequest<RecommendationsResponse>(
        "/opportunities/recommendations/",
    );
}


export async function getSavedOpportunities(): Promise<SavedOpportunityRecord[]> {
    const data = await apiRequest<{
        saved_opportunities: SavedOpportunityRecord[];
    }>("/accounts/saved/");

    return data.saved_opportunities;
}

export async function toggleSavedOpportunity(
    type: "internship" | "hackathon",
    opportunityId: number,
): Promise<{
    saved: boolean;
    type: "internship" | "hackathon";
    opportunity_id: number;
}> {
    return apiRequest("/accounts/saved/toggle/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type,
            opportunity_id: opportunityId,
        }),
    });
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

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();

    if (!text) {
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return undefined as T;
    }

    let data: unknown;

    try {
        data = JSON.parse(text);
    } catch {
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        throw new Error("The server returned an invalid response.");
    }

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
                    : `Request failed with status ${response.status}`;

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


export async function deleteInternship(id: number): Promise<void> {
    await apiRequest(`/internships/${id}/`, {
        method: "DELETE",
    });
}


async function getHackathons(): Promise<HackathonRecord[]> {
    const data = await apiRequest<HackathonRecord[] | { results: HackathonRecord[] }>(
        "/hackathons/",
    );
    return Array.isArray(data) ? data : data.results;
}


export async function deleteHackathon(id: number): Promise<void> {
    await apiRequest(`/hackathons/${id}/`, {
        method: "DELETE",
    });
}


export interface UserProfile {
    degree: string;
    study_year: number | null;
    skills: string[];
    preferred_roles: string[];
    preferred_locations: string[];
    work_mode: "" | "remote" | "onsite" | "hybrid";
}

interface UserProfileResponse {
    profile: UserProfile;
}

export async function getUserProfile(): Promise<UserProfile> {
    const data = await apiRequest<UserProfileResponse>(
        "/accounts/profile/"
    );

    return data.profile;
}

export async function updateUserProfile(
    profile: Partial<UserProfile>
): Promise<UserProfile> {
    const data = await apiRequest<UserProfileResponse>(
        "/accounts/profile/update/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profile),
        }
    );

    return data.profile;
}


export {
    API_BASE_URL,
    apiRequest,
    registerUser,
    loginUser,
    getInternships,
    getHackathons,
};