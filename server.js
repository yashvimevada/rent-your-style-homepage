import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Static Assets ───────────────────────────────────────────
app.use("/assets", express.static(path.join(__dirname, "client", "assets")));
app.use("/admin/assets", express.static(path.join(__dirname, "admin", "assets")));
app.use(express.static(path.join(__dirname, "client"), { index: false }));

// ─── Route handler ───────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith("/admin")) {
    res.sendFile(path.join(__dirname, "admin", "index.html"));
  } else {
    res.sendFile(path.join(__dirname, "client", "index.html"));
  }
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║         WardrobeX - Rent Your Style          ║
  ╠══════════════════════════════════════════════╣
  ║                                              ║
  ║   🛍  Client:  http://localhost:${PORT}          ║
  ║   🔐 Admin:   http://localhost:${PORT}/admin     ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
  `);
});
