import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import { requireAuth } from "../middlewares/requireAuth.js";
dotenv.config();
const router = express.Router();

// OpenRouter is OpenAI-compatible, so the OpenAI SDK works by pointing at the
// OpenRouter base URL. The API key is read from the server environment and is
// never sent to the client.
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,   // must not be undefined
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:8080",
    "X-Title": "Peer Learning AI",
  },
});

// Allowed models. Requests specifying any other model are rejected to
// prevent cost escalation via expensive third-party models.
const ALLOWED_MODELS = new Set([
  "openai/gpt-3.5-turbo",
  "openai/gpt-4o-mini",
]);

// Server-side cap on tokens per request, regardless of what the caller sends.
const MAX_TOKENS_CAP = 512;

// Maximum length for the server-defined system prompt injected on every request.
const MAX_SYSTEM_PROMPT_LENGTH = 500;

// Fixed system prompt injected server-side. Callers cannot override this because
// accepting a caller-supplied systemPrompt verbatim allows full AI persona override
// and policy bypass. See issue #180.
const SYSTEM_PROMPT = "You are a helpful peer-learning assistant. Answer questions about coding, study techniques, and academic topics in a clear and supportive way.";

// Simple in-memory rate limiter: max 20 requests per authenticated user per minute.
// Entries for users whose window has expired are evicted on each request to prevent
// the Map from growing unboundedly as user count increases (issue #179).
const requestCounts = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

// Evict all stale entries whose window has expired.
// Called before each rate-limit check to keep memory bounded.
const evictStaleEntries = () => {
  const now = Date.now();
  for (const [key, entry] of requestCounts.entries()) {
    if (now - entry.windowStart >= WINDOW_MS) {
      requestCounts.delete(key);
    }
  }
};

const rateLimiter = (req, res, next) => {
  const userId = req.user.id;
  const now = Date.now();

  evictStaleEntries();

  const entry = requestCounts.get(userId);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    requestCounts.set(userId, { count: 1, windowStart: now });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests. Please wait before sending more messages.",
    });
  }

  entry.count += 1;
  next();
};

router.post("/chat", requireAuth, rateLimiter, async (req, res) => {
  try {
    const {
      messages,
      model = "openai/gpt-3.5-turbo",
      max_tokens,
      temperature = 0.7,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "A non-empty messages array is required." });
    }

    // Validate each message has the expected shape to avoid sending malformed
    // requests upstream.
    const isValid = messages.every(
      (m) =>
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant" || m.role === "system") &&
        typeof m.content === "string"
    );

    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Each message must have a role (user|assistant|system) and a string content field." });
    }

    // Reject unknown models to prevent cost escalation.
    if (!ALLOWED_MODELS.has(model)) {
      return res.status(400).json({ error: "Requested model is not allowed." });
    }

    // Cap token count server-side regardless of caller input.
    const safeMaxTokens = Math.min(
      typeof max_tokens === "number" ? max_tokens : MAX_TOKENS_CAP,
      MAX_TOKENS_CAP
    );

    // Prepend the fixed server-defined system prompt.
    // systemPrompt is no longer accepted from the request body to prevent
    // caller-supplied persona overrides (issue #180).
    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await openrouter.chat.completions.create({
      model,
      messages: chatMessages,
      max_tokens: safeMaxTokens,
      temperature,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "Failed to get a response from the AI service." });
  }
});

export default router;
