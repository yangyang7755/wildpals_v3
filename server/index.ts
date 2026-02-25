import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { 
  sendVerificationEmail, 
  verifyEmail, 
  checkVerificationStatus,
  resendVerificationEmail 
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/send-verification", sendVerificationEmail);
  app.get("/api/auth/verify-email", verifyEmail);
  app.get("/api/auth/check-verification", checkVerificationStatus);
  app.post("/api/auth/resend-verification", resendVerificationEmail);

  return app;
}
