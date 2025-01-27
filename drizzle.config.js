export default {
  dialect: "postgresql",
  schema: "./src/utils/db/schema.ts",
  out: "./drizzle",

  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
    connectionString: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
  },
};
