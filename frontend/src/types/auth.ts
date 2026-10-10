
export type RegisterData = {
    username: string;
    email: string;
    password: string;
};

export type RegisterResponse = {
    message: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
};
