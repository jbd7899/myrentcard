import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false to work in development
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

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
      done(null, user);
    } catch (error) {
      console.error("[Auth Debug] Deserialization error:", error);
      done(error);
    }
  });

  // Add authentication debugging middleware
  app.use((req, res, next) => {
    console.log(`[Auth Debug] ${req.method} ${req.path}`);
    console.log(`[Auth Debug] isAuthenticated: ${req.isAuthenticated()}`);
    if (req.user) {
      console.log(`[Auth Debug] User: ${JSON.stringify(req.user)}`);
    }
    next();
  });

  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await storage.hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Session creation error:", err);
          return next(err);
        }
        console.log("Login successful for user:", user.id);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    console.log("Logging out user:", req.user?.id);
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthenticated user access attempt");
      return res.sendStatus(401);
    }
    console.log("Authenticated user access:", req.user?.id);
    res.json(req.user);
  });
}