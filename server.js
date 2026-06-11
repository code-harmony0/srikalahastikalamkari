const { createServer } = require('http');
const { parse } = require('url');
require('dotenv').config({ path: '.env.local', quiet: true });
require('dotenv').config({ quiet: true });
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on port ${port}`);
  });
});
