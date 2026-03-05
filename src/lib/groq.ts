import Groq from "groq-sdk";

// Singleton — instantiated once, reused across requests
// privacy: no disk writes
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;

// IMPORTANT: This file must only be imported in server-side code (route.ts)
// Never import in Client Components or hooks

