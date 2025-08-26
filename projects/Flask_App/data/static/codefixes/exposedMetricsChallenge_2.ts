/* Serve metrics */
const Metrics = metrics.observeMetrics()
app.get('/metrics', metrics.serveMetrics())
errorhandler.title = `${config.get<string>('application.name')} (Express ${utils.version('express')})`

export async function start (readyCallback: any) {
  const datacreatorEnd = startupGauge.startTimer({ task: 'datacreator' })
  await sequelize.sync({ force: true })
+  // Handle potential errors during data creation to prevent unhandled promise rejections
   try {
     await datacreator()
   } catch (error) {
     logger.error('Error during data creation:', error)
   }
+
   datacreatorEnd()
   const port = process.env.PORT ?? config.get('server.port')
   process.env.BASE_PATH = process.env.BASE_PATH ?? config.get('server.basePath')