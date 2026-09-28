import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security headers (CSP, X-Frame-Options, X-Content-Type-Options, HSTS, ...).
  // Registered before express.static so static pages get them too.
  //
  // The CSP is tailored to what the pages actually load rather than helmet's
  // stock defaults, which would break the app:
  //  - smartsense-app.html embeds the other pages as same-origin <iframe>s,
  //    so framing is limited to our own origin ('self' / SAMEORIGIN), not denied.
  //  - the pages use inline <script> blocks and inline on*= handlers, so
  //    script-src and script-src-attr need 'unsafe-inline'. Moving that JS into
  //    external files would let this be tightened later.
  //  - Spline 3D viewer (unpkg + prod.spline.design) needs WebAssembly, workers
  //    and its own scene/asset fetches; Chart.js comes from jsDelivr;
  //    Google Fonts supplies the typefaces.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "'wasm-unsafe-eval'",
            "https://unpkg.com",
            "https://cdn.jsdelivr.net",
          ],
          "script-src-attr": ["'unsafe-inline'"],
          "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
          "img-src": ["'self'", "data:", "blob:", "https://*.spline.design"],
          "media-src": ["'self'", "data:", "blob:", "https://*.spline.design"],
          "connect-src": [
            "'self'",
            "https://*.spline.design",
            "https://unpkg.com",
            "https://cdn.jsdelivr.net",
          ],
          "worker-src": ["'self'", "blob:"],
          "frame-src": ["'self'"],
          "frame-ancestors": ["'self'"],
          "object-src": ["'none'"],
          "base-uri": ["'self'"],
          "form-action": ["'self'"],
        },
      },
      // Same-origin framing only (the app shell iframes its own pages).
      frameguard: { action: "sameorigin" },
      // Keep the browser's existing referrer behaviour instead of no-referrer.
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
