/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

async function app () {
  const { default: validateDependencies } = await import('./lib/startup/validateDependenciesBasic')
  await validateDependencies()

  const server = await import('./server')
  await server.start()
}

app()
  .catch(err => {
    // Log the error and exit the process to prevent unhandled rejections.
    console.error('Application startup failed:', err)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  })