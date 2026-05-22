const { z } = require('zod');

const EnvSchema = z.object({
  NMS_API_BASE_URL: z.string().url().optional(),
  NMS_USE_MOCKS: z
    .union([z.literal('true'), z.literal('false')])
    .default('true')
    .transform((v) => v === 'true'),
  NMS_GOOGLE_MAPS_KEY: z.string().optional(),
  NMS_SENTRY_DSN: z.string().optional(),
  NMS_DEFAULT_LOCALE: z.enum(['en', 'ar']).default('en'),
});

function loadEnv(source = process.env) {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

module.exports = { EnvSchema, loadEnv };
