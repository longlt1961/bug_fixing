/* Rate limiting */
  app.enable('trust proxy')
  app.use('/rest/user/reset-password', rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    // Use X-Forwarded-For header to get the client IP address, trusting the proxy. Fallback to ip.
    keyGenerator ({ ip, headers }) { return ip }
  }))