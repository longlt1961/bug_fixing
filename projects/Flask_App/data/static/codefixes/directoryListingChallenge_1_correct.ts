app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
  app.use('/.well-known', express.static('.well-known'))

  /* /encryptionkeys directory browsing */
  // Removed serveIndex middleware to prevent unauthorized directory browsing of encryption keys.
  // The serveKeyFiles() middleware likely provides the intended access control.
  app.use('/encryptionkeys/:file', serveKeyFiles())

  /* /logs directory browsing */
  // Removed serveIndex middleware to prevent unauthorized directory browsing of log files.
  // The serveLogFiles() middleware likely provides the intended access control.
  app.use('/support/logs/:file', serveLogFiles())

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(express.static(path.resolve('frontend/dist/frontend')))
  app.use(cookieParser('kekse'))