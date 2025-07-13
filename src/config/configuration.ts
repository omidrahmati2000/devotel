export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'job_offers',
  },
  environment: process.env.NODE_ENV || 'development',
  api: {
    provider1: {
      url: process.env.API_PROVIDER1_URL || 'https://assignment.devotel.io/api/provider1/jobs',
    },
    provider2: {
      url: process.env.API_PROVIDER2_URL || 'https://assignment.devotel.io/api/provider2/jobs',
    },
  },
  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.HTTP_MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.HTTP_RETRY_DELAY || '1000', 10),
  },
  scheduler: {
    enabled: process.env.SCHEDULER_ENABLED === 'true',
    cronExpression: process.env.CRON_EXPRESSION || '0 */6 * * *',
  },
});
