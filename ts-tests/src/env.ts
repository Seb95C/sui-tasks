import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  SUI_NETWORK: z.string(),
  RECIPIENT_ADDRESS: z.string(),
  USER_SECRET_KEY: z.string().optional(), // Keep for backward compatibility
  USER_SECRET_KEY1: z.string().optional(),
  USER_SECRET_KEY2: z.string().optional(),
  USER_SECRET_KEY3: z.string().optional(),
  USER_SECRET_KEY4: z.string().optional(),
  JIRA_ENGINE_PACKAGE_ID: z.string().optional(),
  REGISTRY_OBJECT_ID: z.string().optional(),
});

// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsedEnv.error.format(), null, 2)
  );
  process.exit(1); // Exit the process to prevent runtime issues
}

export const ENV = parsedEnv.data;
