import { app, PORT, setupFrontend, initializeVectorStore } from './app';
import 'dotenv/config';

async function startServer() {
  // Initialize vector store from persistence (may auto-init builtin knowledge)
  await initializeVectorStore();

  // Setup frontend (Vite in dev, static files in prod)
  await setupFrontend();

  // Start listening
  app.listen(PORT, () => {
    const isDev = process.env.NODE_ENV !== 'production';
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API endpoint: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎯 Mode: ${isDev ? 'development (with Vite HMR)' : 'production'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
