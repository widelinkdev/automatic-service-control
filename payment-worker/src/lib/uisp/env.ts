import { config as loadDotEnvConfig } from 'dotenv';
import { z } from 'zod';

loadDotEnvConfig();

const envSchema = z.object({
  UISP_URL: z.string().default(''),
  UISP_KEY: z.string().default(''),
});

type Env = z.infer<typeof envSchema>;

const getConfig = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment variable validation error:', result.error);
    process.exit(1);
  }

  return result.data;
};

export const env = getConfig();
