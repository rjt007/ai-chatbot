const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];

function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Config is read lazily via a getter proxy so that process.env values
// set after module load (e.g. in test setup) are picked up correctly.
const config = new Proxy(
  {},
  {
    get(_target, prop) {
      const mapping = {
        port: () => parseInt(process.env.PORT, 10) || 5000,
        mongodbUri: () => process.env.MONGODB_URI,
        jwtSecret: () => process.env.JWT_SECRET,
        geminiApiKey: () => process.env.GEMINI_API_KEY,
        geminiModel: () => process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        nodeEnv: () => process.env.NODE_ENV || 'development',
      };
      return mapping[prop] ? mapping[prop]() : undefined;
    },
  }
);

module.exports = { config, validateEnv };
