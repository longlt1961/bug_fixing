const express = require('express')
const path = require('path')
const serveIndex = require('serve-index')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const cookieParser = require('cookie-parser')

const app = express()

const servePublicFiles = () => (req, res) => res.end(`public file ${req.params.file}`)
const serveQuarantineFiles = () => (req, res) => res.end(`quarantine file ${req.params.file}`)
const serveKeyFiles = () => (req, res) => res.end(`key file ${req.params.file}`)

const serveIndexMiddleware = (req, res, next) => {
  next()
}

// Sanitize file names to prevent path traversal (middleware function)
const sanitizeFilename = (req, res, next) => {
  const filename = path.basename(req.params.file); // Extract filename and remove any path components
  if (filename !== req.params.file) {
    // Detect attempts to access files outside the intended directory
    console.warn('Path traversal attempt detected:', req.originalUrl);
    return res.status(400).send('Invalid filename');
  }
  req.params.file = filename;
  next();
};

/* /ftp directory browsing and file download */
  app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: true }))
  // Add filename sanitization middleware to prevent path traversal vulnerabilities
  app.use('/ftp(?!/quarantine)/:file', sanitizeFilename, servePublicFiles())
  // Add filename sanitization middleware to prevent path traversal vulnerabilities
  app.use('/ftp/quarantine/:file', sanitizeFilename, serveQuarantineFiles())

  app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
  app.use('/.well-known', express.static('.well-known'))

  /* /encryptionkeys directory browsing */
  app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  // Add filename sanitization middleware to prevent path traversal vulnerabilities
  app.use('/encryptionkeys/:file', sanitizeFilename, serveKeyFiles())

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  // Move static file serving to after specific routes to prevent shadowing
  app.use(cookieParser('kekse'))
  app.use(express.static(path.resolve('frontend/dist/frontend')))