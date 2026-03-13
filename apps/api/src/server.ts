import app from './app';

const PORT = process.env['PORT'] ?? 3001;

app.listen(PORT, () => {
  console.log(`🚀 depaneurIA API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Catalog: http://localhost:${PORT}/api/v1/catalog`);
});
