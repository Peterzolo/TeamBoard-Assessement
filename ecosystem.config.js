module.exports = {
  apps: [
    {
      name: 'nus-dynamic-backend',
      script: 'dist/main.js',
      instances: 1, // Set to 'max' for cluster mode
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      node_args: '--expose-gc',
      env: {
        NODE_ENV: 'development',
        // Optional: tune memory monitor behavior without code changes
        MEMORY_WARNING_THRESHOLD: '97',
        MEMORY_CRITICAL_THRESHOLD: '99',
        MEMORY_MONITOR_ENABLED: 'false',
        MEMORY_MONITOR_LOGS_ENABLED: 'false',
        REMINDERS_LOGS_ENABLED: 'false',
      },
      env_production: {
        NODE_ENV: 'production',
        MEMORY_WARNING_THRESHOLD: '97',
        MEMORY_CRITICAL_THRESHOLD: '99',
        // If you know the container memory limit (MB), set it so monitoring uses RSS/limit
        // MEMORY_LIMIT_MB: '512',
        MEMORY_MONITOR_ENABLED: 'true',
        MEMORY_MONITOR_LOGS_ENABLED: 'true',
        REMINDERS_LOGS_ENABLED: 'true',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
  ],
};
