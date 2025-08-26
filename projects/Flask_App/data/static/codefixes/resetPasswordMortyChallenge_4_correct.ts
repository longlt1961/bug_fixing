/* Rate limiting */
  app.enable('trust proxy')
  app.use('/rest/user/reset-password', rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
  }))
  app.use('/rest/user/login', rateLimit({ // Added rate limiting to /rest/user/login endpoint
   windowMs: 5 * 60 * 1000,
   max: 100,
 }))