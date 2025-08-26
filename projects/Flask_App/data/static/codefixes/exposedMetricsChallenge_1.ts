/* Serve metrics */
let metricsUpdateLoop: any
const Metrics = metrics.observeMetrics()
app.get('/metrics', security.denyAll(), metrics.serveMetrics())
errorhandler.title = `${config.get<string>('application.name')} (Express ${utils.version('express')})`

export async function start (readyCallback: any) {
  const datacreatorEnd = startupGauge.startTimer({ task: 'datacreator' })
-  await sequelize.sync({ force: true })
-  await datacreator()
-  datacreatorEnd()
+  try {
+    await sequelize.sync({ force: true })
+    await datacreator()
+    datacreatorEnd()
+  } catch (error) {
+    // Catch and log errors during sequelize sync or datacreator
+    logger.error('Error during sequelize sync or datacreator:', error)
+    process.exit(1) // Exit the process to prevent further issues
+  }
+
   const port = process.env.PORT ?? config.get('server.port')
   process.env.BASE_PATH = process.env.BASE_PATH ?? config.get('server.basePath')