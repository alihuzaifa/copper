import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { randomInt } from "crypto";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "copper-management-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const parseResult = insertUserSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid user data", errors: parseResult.error.errors });
      }
      
      const userData = parseResult.data;
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });
      
      // Generate and store OTP for verification
      const otp = randomInt(100000, 999999).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expire in 10 minutes
      
      await storage.createOtp({
        userId: user.id,
        otp,
        expiresAt,
      });
      
      // In a real system, you would send the OTP to the user's email or phone
      // For this demo, we'll just include it in the response
      console.log(`OTP for ${user.email}: ${otp}`);
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json({ 
          user,
          requiresVerification: true
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  
  app.post("/api/verify-otp", async (req, res, next) => {
    try {
      const { otp } = req.body;
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user!.id;
      const validOtp = await storage.getOtp(userId, otp);
      
      if (!validOtp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Mark the OTP as used
      await storage.markOtpAsUsed(validOtp.id);
      
      // Update user verification status
      const updatedUser = await storage.updateUserVerification(userId, true);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to verify user" });
      }
      
      return res.status(200).json({ message: "User verified successfully", user: updatedUser });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/resend-otp", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user!.id;
      
      // Generate new OTP
      const otp = randomInt(100000, 999999).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expire in 10 minutes
      
      await storage.createOtp({
        userId,
        otp,
        expiresAt,
      });
      
      // In a real system, you would send the OTP to the user's email or phone
      console.log(`New OTP for user ${userId}: ${otp}`);
      
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/reset-password-request", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return res.status(200).json({ message: "If your email exists in our system, you will receive a password reset OTP" });
      }
      
      // Generate OTP for password reset
      const otp = randomInt(100000, 999999).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expire in 10 minutes
      
      await storage.createOtp({
        userId: user.id,
        otp,
        expiresAt,
      });
      
      // In a real system, you would send the OTP to the user's email
      console.log(`Password reset OTP for ${email}: ${otp}`);
      
      return res.status(200).json({ message: "If your email exists in our system, you will receive a password reset OTP" });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP and new password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid request" });
      }
      
      const validOtp = await storage.getOtp(user.id, otp);
      
      if (!validOtp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Mark the OTP as used
      await storage.markOtpAsUsed(validOtp.id);
      
      // Update user's password
      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storage.updateUserPassword(user.id, hashedPassword);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
