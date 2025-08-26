const express = require('express')
const path = require('path')
const serveIndex = require('serve-index')
const swaggerUi = require('swagger-ui-express')
const cookieParser = require('cookie-parser')

module.exports = function (app, servePublicFiles, serveQuarantineFiles, serveKeyFiles, serveLogFiles, serveIndexMiddleware, swaggerDocument) {
  /* /ftp file download */
  app.use('/ftp(?!/quarantine)/:file', servePublicFiles())
  app.use('/ftp/quarantine/:file', serveQuarantineFiles())

  app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
  // Prevent directory traversal vulnerability
  app.use('/.well-known', express.static('.well-known', { dotfiles: 'ignore' }))

  /* /encryptionkeys directory browsing */
  app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  app.use('/encryptionkeys/:file', serveKeyFiles())

  /* /logs directory browsing */
  app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' }))
  app.use('/support/logs/:file', serveLogFiles())

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  // Prevent directory traversal vulnerability
  app.use(express.static(path.resolve('frontend/dist/frontend'), { index: 'index.html', dotfiles: 'ignore' }))
  // Use a strong secret for cookie parsing
  app.use(cookieParser(process.env.COOKIE_SECRET || 'your_long_random_string'))
}