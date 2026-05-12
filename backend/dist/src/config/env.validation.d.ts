export declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
    REDIS_URL: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    REVALIDATION_SECRET: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
