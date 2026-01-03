import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Cloud Run provides the port via the PORT environment variable.
// We fallback to 8080 if it's not set locally.
const port = process.env.PORT || 8080;

// Serve static files from the build directory (dist)
app.use(express.static('dist'));

// Handle client-side routing by returning index.html for all non-static requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});