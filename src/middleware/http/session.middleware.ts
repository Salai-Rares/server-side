import { apiContainer } from "@/infrastructure/di/container.api";
import { TYPES } from "@/shared/types";
import connectRedis from "connect-redis";
import session from "express-session";
import { Redis as RedisType } from "ioredis";
const redisClient = apiContainer.get<RedisType>(TYPES.RedisThirdParty);
const RedisStore = connectRedis(session);
const redisStore = new RedisStore({ client: redisClient });

export const sessionMiddleware = session({
  store: redisStore,
  name: "sid",
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: process.env.NODE_ENV === "production"
      ? 1000 * 60 * 60 * 24 * 7  // 7 days
      : 1000 * 60 * 1,           // 1 minute for development/testing
  },
});


