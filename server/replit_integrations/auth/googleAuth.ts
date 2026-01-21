import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any) {
  const email = profile.emails?.[0]?.value;
  const firstName = profile.name?.givenName || "";
  const lastName = profile.name?.familyName || "";
  const profileImageUrl = profile.photos?.[0]?.value || "";

  const user = await authStorage.upsertUserByGoogleId({
    googleId: profile.id,
    email,
    firstName,
    lastName,
    profileImageUrl,
  });

  return user;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await upsertUser(profile);
          // Store tokens in user session
          const sessionUser = {
            id: user.id,
            googleId: user.googleId,
            email: user.email,
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          };
          done(null, sessionUser);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, {
      id: user.id,
      googleId: user.googleId,
      email: user.email,
      expires_at: user.expires_at,
    });
  });

  passport.deserializeUser(async (sessionUser: any, done) => {
    try {
      // Development mode bypass
      if (process.env.NODE_ENV === "development" && sessionUser.id === "dev-user") {
        return done(null, {
          id: "dev-user",
          email: "REEDGLOBALEQUITYTRUST@GMAIL.COM",
          googleId: "dev-google-id",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        });
      }

      const user = await authStorage.getUser(sessionUser.id);
      if (!user) {
        return done(null, false);
      }
      // Combine db user with session data
      done(null, { ...user, ...sessionUser });
    } catch (err) {
      done(err);
    }
  });

  // Google OAuth login route
  app.get("/api/login", passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }));

  // Google OAuth callback route
  app.get("/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth",
      failureMessage: true,
    }),
    (req, res) => {
      // Successful authentication, redirect to home
      res.redirect("/");
    }
  );

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.redirect("/");
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Development mode bypass
  if (process.env.NODE_ENV === "development") {
    if (!req.user) {
      req.user = {
        id: "dev-user",
        email: "REEDGLOBALEQUITYTRUST@GMAIL.COM",
        googleId: "dev-google-id",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };
    }
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if session has expired
  const now = Math.floor(Date.now() / 1000);
  if (user.expires_at && now > user.expires_at) {
    // Session expired, user needs to re-authenticate
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }

  return next();
};
