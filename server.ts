import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("apartment.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM announcements").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO announcements (title, content, type) VALUES (?, ?, ?)");
  insert.run("단지 내 소독 안내", "금일 오후 2시부터 4시까지 각 세대 소독이 진행될 예정입니다.", "general");
  insert.run("엘리베이터 점검 안내", "내일 오전 10시부터 12시까지 101동 엘리베이터 점검이 있습니다.", "warning");
  insert.run("주차장 물청소 실시", "이번주 토요일 지하 1층 주차장 물청소를 실시하오니 차량을 이동해 주시기 바랍니다.", "general");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/announcements", (req, res) => {
    const announcements = db.prepare("SELECT * FROM announcements ORDER BY created_at DESC").all();
    res.json(announcements);
  });

  app.post("/api/announcements", (req, res) => {
    const { title, content, type } = req.body;
    const result = db.prepare("INSERT INTO announcements (title, content, type) VALUES (?, ?, ?)").run(title, content, type || 'general');
    res.json({ id: result.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
