import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    statusCode: 429,
    success: false,
    message: "Too many authentication requests. Please try again later.",
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    statusCode: 429,
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
