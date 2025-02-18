import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage.js";
import { User as SelectUser } from "@shared/schema.js";
import cors from "cors";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  // Enable CORS with credentials
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  const isDevelopment = process.env.NODE_ENV !== 'production';
  console.log(`[Auth Debug] Running in ${isDevelopment ? 'development' : 'production'} mode`);

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    name: 'rentcard.sid',
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      domain: undefined
    }
  };

  // Debug session configuration
  console.log('[Auth Debug] Session settings:', {
    ...sessionSettings,
    secret: '[REDACTED]',
    store: '[SessionStore]'
  });

  app.set('trust proxy', 1); // Trust first proxy

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Add session debug middleware
  app.use((req, res, next) => {
    const oldEnd = res.end;
    // @ts-ignore
    res.end = function (...args) {
      console.log('[Auth Debug] Response Headers:', res.getHeaders());
      // @ts-ignore
      oldEnd.apply(res, args);
    };
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`[Auth Debug] Attempting login for user: ${username}`);
        const user = await storage.getUserByUsername(username);

        if (!user) {
          console.log(`[Auth Debug] User not found: ${username}`);
          return done(null, false, { message: "User not found" });
        }

        const isValidPassword = await storage.comparePasswords(password, user.password);
        console.log(`[Auth Debug] Password validation result for ${username}: ${isValidPassword}`);

        if (!isValidPassword) {
          return done(null, false, { message: "Invalid password" });
        }

        console.log(`[Auth Debug] Login successful for user: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error("[Auth Debug] Login error:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    console.log(`[Auth Debug] Serializing user: ${user.id}`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`[Auth Debug] Deserializing user: ${id}`);
      const user = await storage.getUser(id);
      if (!user) {
        console.log(`[Auth Debug] Failed to deserialize user: ${id} - User not found`);
        return done(null, false);
      }
      console.log(`[Auth Debug] Successfully deserialized user: ${id}`);
      done(null, user);
    } catch (error) {
      console.error("[Auth Debug] Deserialization error:", error);
      done(error);
    }
  });

  // Auth routes with improved error handling and logging
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('[Auth Debug] Registration attempt:', { username: req.body.username });

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log('[Auth Debug] Registration failed: Username exists');
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await storage.hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      console.log('[Auth Debug] User created successfully:', { id: user.id });

      req.login(user, (err) => {
        if (err) {
          console.error('[Auth Debug] Login after registration failed:', err);
          return next(err);
        }
        console.log('[Auth Debug] Login after registration successful');
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("[Auth Debug] Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('[Auth Debug] Login attempt:', { username: req.body.username });
    console.log('[Auth Debug] Session before login:', req.session);
    console.log('[Auth Debug] Headers:', req.headers);

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("[Auth Debug] Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log('[Auth Debug] Authentication failed:', info?.message);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("[Auth Debug] Session creation error:", err);
          return next(err);
        }
        console.log("[Auth Debug] Login successful for user:", user.id);
        console.log('[Auth Debug] Session after login:', req.session);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    console.log("[Auth Debug] Logging out user:", req.user?.id);
    console.log("[Auth Debug] Session before logout:", req.session);

    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('rentcard.sid', {
          domain: process.env.NODE_ENV === 'production' ? '.myrentcard.com' : undefined,
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        });
        console.log("[Auth Debug] Logout successful, session destroyed");
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('[Auth Debug] User check request');
    console.log('[Auth Debug] Session:', req.session);
    console.log('[Auth Debug] isAuthenticated:', req.isAuthenticated());
    console.log('[Auth Debug] Headers:', req.headers);

    if (!req.isAuthenticated()) {
      console.log("[Auth Debug] Unauthenticated user access attempt");
      return res.sendStatus(401);
    }
    console.log("[Auth Debug] Authenticated user access:", req.user?.id);
    res.json(req.user);
  });
}