import 'dotenv/config';

if (!process.env.APP_NAME || !process.env.APP_VERSION) {
  throw new Error("Missing required environment variables: APP_NAME, APP_VERSION");
}

export const config = {
  appName: process.env.APP_NAME!,
  appVersion: process.env.APP_VERSION!,
};
