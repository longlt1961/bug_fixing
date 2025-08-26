const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const express = require('express')
const serveIndex = require('serve-index')
const swaggerUi = require('swagger-ui-express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerDocument = require('./swagger.json')
const path = require('path')

function sanitizeInput(req, res, next) {
  if (req.params.file) {
    const sanitizedFile = sanitizeFilename(req.params.file);
    if (req.params.file !== sanitizedFile) {
      return res.status(400).send('Invalid filename');
    }
    req.params.file = sanitizedFile;
  }
  next();
}

const app = express()
const port = 3000

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url)
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors())

  /* /ftp directory browsing and file download */
  app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: true }))
  app.use('/ftp(?!/quarantine)/:file', sanitizeInput, servePublicFiles()) // Sanitize filename to prevent path traversal
  app.use('/ftp/quarantine/:file', sanitizeInput, serveQuarantineFiles()) // Sanitize filename to prevent path traversal

  app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
  app.use('/.well-known', express.static('.well-known'))

  /* /encryptionkeys directory browsing */
  app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  app.use('/encryptionkeys/:file', serveKeyFiles())

  /* /logs directory browsing */
  app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true }))
  app.use('/support/logs/:file', serveLogFiles())

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(express.static(path.resolve('frontend/dist/frontend')))
  app.use(cookieParser('kekse'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})