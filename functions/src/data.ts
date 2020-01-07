export type Role = "admin" | "customer" | "provider_admin" | "provider_worker";

export interface User {
    username?: string;
    role?: Role;
}

export interface CustomUser {
    username: string;
    password: string;
    encrypted?: boolean;
}
