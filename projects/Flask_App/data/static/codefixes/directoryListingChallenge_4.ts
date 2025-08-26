/* /ftp directory browsing and file download */
 const path = require('path'); // Import the 'path' module

// Add security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

 // Function to sanitize file paths
 const sanitizeFilePath = (filePath) => {
   // Resolve the absolute path and normalize it
   const absolutePath = path.resolve(filePath);
   // Check if the resolved path is within the intended directory
   return path.normalize(absolutePath);
 };

 app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: false }))
 app.use('/ftp(?!/quarantine)/:file', servePublicFiles())
 app.use('/ftp/quarantine/:file', serveQuarantineFiles())

 app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
 app.use('/.well-known', express.static('.well-known'))

 /* /encryptionkeys directory browsing */
 app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
 app.use('/encryptionkeys/:file', serveKeyFiles())

 /* /logs directory browsing */
 app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' }))
 app.use('/support/logs/:file', serveLogFiles())

 /* Swagger documentation for B2B v2 endpoints */
 app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

 // Serve static files from the frontend
 //app.use(express.static(path.join(__dirname, 'frontend/dist/frontend')));
 app.use(express.static(path.resolve('frontend/dist/frontend')))
 app.use(cookieParser('kekse'))