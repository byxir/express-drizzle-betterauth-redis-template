import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "src/lib/authConfig";
import redisClient from "src/db/redis";
import { RateLimitError } from "src/utils/error";
import {
  WINDOW_SIZE_IN_SECONDS,
  MAX_NUMBER_OF_REQUESTS_AUTH_USER_PER_WINDOW_SIZE,
  MAX_NUMBER_OF_REQUESTS_NOT_LOGGEDIN_USER_PER_WINDOW_SIZE
} from "../config";

const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  let ttl: number;
  // Try to read Better Auth session
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

  if (session && session.user) {
    const userKey = `user:${session.user.id}`;
    const numberOfRequestByAuthorizedUser = await redisClient.incr(userKey);

    if (numberOfRequestByAuthorizedUser === 1) {
      await redisClient.expire(userKey, WINDOW_SIZE_IN_SECONDS);
      ttl = WINDOW_SIZE_IN_SECONDS;
    } else {
      ttl = await redisClient.ttl(userKey);
    }
    res.setHeader("X-Rate-Limit", ttl);

    if (numberOfRequestByAuthorizedUser >= MAX_NUMBER_OF_REQUESTS_AUTH_USER_PER_WINDOW_SIZE) {
      throw new RateLimitError("Too many requests! Rate Limit Exceeded!");
    } else {
      next();
    }
  } else {
    //If the request is sent by user that isn't logged in
    //We use their IP address as key to store their number of
    //requests made as key in redis
    //If we are using reverse-proxy like `nginx` then we should
    //use `app.set('trust proxy')` in express to get the IP
    //Then we can use `req.ip` to get the IP of the user.
    //Source: https://expressjs.com/en/guide/behind-proxies.html
    //Cloudflare sets `X-Forwarded-For` header for every requests.
    //So, we need to use `req.headers["X-Forwarded-For"]` to get the IP
    //Source: https://developers.cloudflare.com/support/troubleshooting/restoring-visitor-ips/restoring-original-visitor-ips/
    //In short, it might be best if we use `express-rate-limit` and `rate-limit-redis`
    //library to rate limit as we already use Redis but it will need installing
    //another two dependency for rate limiting user.
    const clientIP = req.socket.remoteAddress;

    if (clientIP) {
      const numberOfRequestByNotLoggedInUser = await redisClient.incr(clientIP);

      //If it is their first visit
      if (numberOfRequestByNotLoggedInUser === 1) {
        await redisClient.expire(clientIP, WINDOW_SIZE_IN_SECONDS);
        ttl = WINDOW_SIZE_IN_SECONDS;
      } else {
        ttl = await redisClient.ttl(clientIP);
      }

      res.setHeader("X-RateLimit-TTL", ttl);
      if (numberOfRequestByNotLoggedInUser >= MAX_NUMBER_OF_REQUESTS_NOT_LOGGEDIN_USER_PER_WINDOW_SIZE) {
        throw new RateLimitError("Rate Limit Exceeded! Login to use more!");
      } else {
        next();
      }
    } else {
      console.info(
        "Request made by user who isn't logged in and could not identify their IP address. Check if the request is from localhost!"
      );
    }
  }
};

export default rateLimiter;
