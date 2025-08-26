/* Rate limiting */
  app.use('/rest/user/reset-password', rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100, // Limit each IP to 100 requests per windowMs
    // Use the real IP address for rate limiting to prevent spoofing via X-Forwarded-For header
    keyGenerator ({ headers, ip }) { return ip }
  }))