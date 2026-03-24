import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin for the server
const adminApp = admin.apps.length === 0 
  ? admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  : admin.app();

const db = getFirestore(adminApp, process.env.FIREBASE_DATABASE_ID || '(default)');

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Auth Middleware to verify Firebase ID Token
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Enforce email verification for security
    if (!decodedToken.email_verified) {
      console.warn(`[SECURITY] Auth attempt with unverified email: ${decodedToken.email} (IP: ${req.ip})`);
      return res.status(403).json({ error: "Forbidden: Email not verified" });
    }

    // Attach user info to request
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error(`[SECURITY] Auth verification failure (IP: ${req.ip}):`, error instanceof Error ? error.message : "Invalid token");
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Rate limiting to prevent abuse
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
      res.status(options.statusCode).send(options.message);
    }
  });

  // Speed limiter to slow down repeated requests (frustrates bots)
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: (hits) => hits * 100, // add 100ms of delay per hit above 50
  });

  // Stricter limiter for AI extraction
  const extractionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 extractions per hour
    message: { error: "Extraction limit reached. Please try again in an hour." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stricter limiter for saving (prevents database pollution)
  const saveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 saves per 15 minutes
    message: { error: "Save limit reached. Please wait a few minutes." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Health check limiter (prevents scanning)
  const healthLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 health checks per minute
    message: { error: "Too many health checks." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(cors({
    origin: (origin, callback) => {
      // Allow all origins, including chrome-extension://
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Security headers and logging
  app.use(helmet({
    contentSecurityPolicy: false, // Vite handles CSP in dev, and we have a custom setup for extension
    crossOriginEmbedderPolicy: false,
  }));
  app.use(morgan('combined')); // Standard Apache combined log format
  
  app.use(express.json());
  app.use(speedLimiter); // Apply speed limiting globally
  app.use(limiter);      // Apply general rate limiting globally

  // API routes
  app.get("/api/health", healthLimiter, (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User status endpoint (Beta: Everyone is Pro)
  app.get("/api/user-status", authenticate, async (req, res) => {
    res.json({ 
      isPro: true,
      subscriptionStatus: 'beta'
    });
  });

  // AI Summarization (Beta Feature)
  app.post("/api/summarize", authenticate, async (req, res) => {
    const userId = (req as any).user.uid;
    const { url, title, content } = req.body;

    try {
      const prompt = content 
        ? `Summarize this article content in 3 concise bullet points: ${content}`
        : `Summarize this article titled "${title}" at ${url} in 3 concise bullet points.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ urlContext: {} }]
        }
      });

      res.json({ summary: result.text });
    } catch (error: any) {
      console.error("Summarization error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Article metadata extraction endpoint (Authenticated, Rate limited, and secure)
  app.post("/api/extract", authenticate, extractionLimiter, async (req, res) => {
    const { url } = req.body;
    const userId = (req as any).user.uid;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      console.log(`Extracting metadata for URL: ${url} (User: ${userId})`);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract the following information from this article: ${url}
        1. Title
        2. A short excerpt (max 150 chars)
        3. The main thumbnail image URL
        4. The full main text content of the article (ignore ads, sidebars, and navigation).
        
        Return the result as a JSON object.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              thumbnail: { type: Type.STRING },
              content: { type: Type.STRING, description: "The full text content of the article" }
            },
            required: ["title", "excerpt", "content"]
          },
          tools: [{ urlContext: {} }]
        }
      });

      const metadata = JSON.parse(response.text);
      res.json({ success: true, metadata });
    } catch (error) {
      console.error("Gemini extraction error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to extract article metadata",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Save route (Authenticated and Rate Limited)
  app.post("/api/save", authenticate, saveLimiter, async (req, res) => {
    const { url, title, excerpt, groupId } = req.body;
    const userId = (req as any).user.uid;

    if (!url || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Verify group ownership if groupId is provided
      if (groupId) {
        const groupDoc = await db.collection('groups').doc(groupId).get();
        if (!groupDoc.exists || groupDoc.data()?.userId !== userId) {
          return res.status(403).json({ error: "Forbidden: You do not own this group" });
        }
      }

      console.log(`Attempting to save article for user ${userId} to database ${process.env.FIREBASE_DATABASE_ID || '(default)'}`);
      const docRef = await db.collection('articles').add({
        userId,
        url,
        title,
        excerpt: excerpt || "Saved from ArticulusDock Extension",
        savedAt: Timestamp.now(),
        isRead: false,
        tags: [],
        groupId: groupId || null
      });
      console.log(`Article saved successfully with ID: ${docRef.id}`);
      res.json({ success: true, id: docRef.id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error saving article to Firestore:", errorMessage);
      res.status(500).json({ 
        success: false,
        error: errorMessage, 
        details: errorMessage
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[ERROR] Uncaught exception on ${req.method} ${req.url}:`, err);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: process.env.NODE_ENV === 'production' ? "An unexpected error occurred." : err.message
    });
  });

  // Only listen if not on Vercel (Vercel handles the server lifecycle)
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

// Export the app for Vercel
const appPromise = startServer();
export default appPromise;
