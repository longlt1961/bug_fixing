/* /ftp directory browsing and file download */
  app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: true }))
  // Add input validation to the :file parameter to prevent path traversal vulnerabilities
  app.use('/ftp(?!/quarantine)/:file([a-zA-Z0-9._-]+)', servePublicFiles())
  // Add input validation to the :file parameter to prevent path traversal vulnerabilities
  app.use('/ftp/quarantine/:file([a-zA-Z0-9._-]+)', serveQuarantineFiles())

  app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
  app.use('/.well-known', express.static('.well-known'))

  /* /encryptionkeys directory browsing */
  app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  // Add input validation to the :file parameter to prevent path traversal vulnerabilities
  app.use('/encryptionkeys/:file([a-zA-Z0-9._-]+)', serveKeyFiles())

  /* /logs directory browsing */
  // Add input validation to the :file parameter to prevent path traversal vulnerabilities
  app.use('/support/logs/:file([a-zA-Z0-9._-]+)', serveLogFiles())

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(express.static(path.resolve('frontend/dist/frontend')))
  app.use(cookieParser('kekse'))