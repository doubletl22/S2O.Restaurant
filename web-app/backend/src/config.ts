import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PORT: Number(process.env.BACKEND_PORT || 4000),
  DATABASE_URL: process.env.DATABASE_URL || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "CHANGE_ME_ACCESS",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "CHANGE_ME_REFRESH",
  ACCESS_TTL: Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 900),
  REFRESH_TTL: Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 1209600),

  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379"
};
