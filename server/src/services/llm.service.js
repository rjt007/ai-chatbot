/**
 * LLM Service — Google Gemini API Wrapper
 *
 * Provides two functions:
 * 1. getPhilosopherResponse — Generates a response in the persona of Ibn Sina (Avicenna)
 *    in Arabic with English translation.
 * 2. getUrgencyScore — Evaluates the urgency/panic level of a message (0-10).
 */

const { GoogleGenAI } = require('@google/genai');
const { config } = require('../config/env');

let geminiClient = null;

function getClient() {
  if (!geminiClient) {
    if (!config.geminiApiKey) {
      console.warn('GEMINI_API_KEY is not set. Service will likely fail.');
    }
    geminiClient = new GoogleGenAI({ apiKey: config.geminiApiKey || 'placeholder_key' });
  }
  return geminiClient;
}

const PHILOSOPHER_SYSTEM_PROMPT = `You are Ibn Sina (Avicenna), the renowned 11th-century Persian polymath, philosopher, and physician — one of the most significant thinkers in the Islamic Golden Age.

STRICT RULES:
1. You MUST respond in Arabic script FIRST, then provide the English translation.
2. Format your response EXACTLY like this:
   [Arabic text here]

   Translation: [English translation here]
3. Maintain the wisdom, eloquence, and philosophical depth characteristic of Ibn Sina.
4. Draw from your knowledge of medicine, philosophy, metaphysics, and natural sciences.
5. Be thoughtful, measured, and scholarly in your responses.
6. Keep responses concise but profound — typically 2-4 sentences in each language.`;

const URGENCY_SYSTEM_PROMPT = `You are a sentiment analysis system. Evaluate the urgency or panic level of the user's message.

Return ONLY a valid JSON object with this exact format:
{"score": <number>, "reason": "<brief explanation>"}

Score scale (0-10):
- 0: Completely calm, relaxed, casual greeting
- 1-2: Very low urgency, general questions
- 3-4: Mild concern or moderate interest
- 5-6: Moderate urgency, some stress or worry
- 7-8: High urgency, significant stress or concern
- 9-10: Emergency, panic, crisis situation

Respond ONLY with the JSON object, no other text.`;

const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Generate a philosopher response in the persona of Ibn Sina.
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} The philosopher's response (Arabic + English)
 */
async function getPhilosopherResponse(userMessage) {
  const client = getClient();

  // Strongly enforce the dual-language constraint to Gemini using explicit Task assignments
  const enforcedUserMessage = `
Please complete the following TWO required tasks:
Task 1: Respond to this message in Arabic: "${userMessage}"
Task 2: Provide the exact English translation of your response from Task 1.

Format your response exactly like this:
[Arabic Response]

Translation: [English Response]
`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: config.geminiModel,
        contents: enforcedUserMessage,
        config: {
          systemInstruction: PHILOSOPHER_SYSTEM_PROMPT,
          temperature: 0.8,
          maxOutputTokens: 500,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from LLM');
      }

      return responseText.replace(/```json|```/gi, '').trim();
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error('LLM getPhilosopherResponse failed after retries:', error.message);
        return 'عذراً، لم أتمكن من الرد في هذه اللحظة.\n\nTranslation: I apologize, I was unable to respond at this moment.';
      }
      console.warn(`LLM retry ${attempt + 1}/${MAX_RETRIES}:`, error.message);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Evaluate the urgency/panic level of a message.
 * @param {string} userMessage - The user's message
 * @returns {Promise<number>} Urgency score 0-10
 */
async function getUrgencyScore(userMessage) {
  const client = getClient();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: config.geminiModel,
        contents: userMessage,
        config: {
          systemInstruction: URGENCY_SYSTEM_PROMPT,
          temperature: 0.1,
          maxOutputTokens: 100,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from LLM');
      }

      // Gemini might ignore MIME type boundaries and return conversational text like "Here is the urgency score: 4"
      // Strip out markdown code blocks and locate the first valid JSON curly brace object
      const cleanString = responseText.replace(/```json|```/gi, '').trim();
      const match = cleanString.match(/\{[\s\S]*\}/);
      const jsonToParse = match ? match[0] : cleanString;

      let score = 5; // Default score
      try {
        const parsed = JSON.parse(jsonToParse);
        score = Math.min(10, Math.max(0, Math.round(parsed.score)));
      } catch (parseError) {
        // Fallback: If no JSON exists at all, search for any standalone digit between 0-10 in the response
        const fallbackMatch = responseText.match(/\b(?:10|[0-9])\b/);
        if (fallbackMatch) {
          score = parseInt(fallbackMatch[0], 10);
        } else {
          throw new Error('Could not extract score from response');
        }
      }
      
      return score;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error('LLM getUrgencyScore failed after retries:', error.message);
        return 5; // Default to moderate urgency on failure
      }
      console.warn(`LLM urgency retry ${attempt + 1}/${MAX_RETRIES}:`, error.message);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Override the Gemini client (for testing).
 * @param {object|null} client
 */
function setClient(client) {
  geminiClient = client;
}

module.exports = { getPhilosopherResponse, getUrgencyScore, setClient };
