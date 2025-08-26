/* Rate limiting */
  app.enable('trust proxy')
  app.use('/rest/user/reset-password', rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10, // Limit each IP to 10 requests per windowMs
    // Use the IP address directly instead of relying on X-Forwarded-For
    keyGenerator ({ headers, ip }) { return ip }
  }))