const express = require('express')
const serveIndex = require('serve-index')
const path = require('path')
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

module.exports = (app, serveIndexMiddleware, serveLogFiles, serveKeyFiles) => {
  /**
   * The code must run in an express app
   */
  if (!app) {
    app = express()
  }

  // Add security headers to the response
  app.use(function(req, res, next) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Prevent clickjacking
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); // Control referrer information
    next();
  });

  /* /ftp directory browsing */
  app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: true }))

  app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
  app.use('/.well-known', express.static('.well-known'))

  /* /encryptionkeys directory browsing */
  app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  app.use('/encryptionkeys/:file', serveKeyFiles()) // Ensure proper path sanitization in serveKeyFiles() to prevent path traversal

  /* /logs directory browsing */
  app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' }))
  app.use('/support/logs/:file', serveLogFiles()) // Ensure proper path sanitization in serveLogFiles() to prevent path traversal

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(express.static(path.resolve('frontend/dist/frontend')))
  app.use(cookieParser('kekse'))