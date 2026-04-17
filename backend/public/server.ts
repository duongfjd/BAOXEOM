import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.wzpixqfyjfedbqbqcczk:@Duongfjd2004@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/articles", async (req, res) => {
    try {
      const { category, limit = 20, offset = 0 } = req.query;
      let query = "SELECT * FROM articles";
      const params: any[] = [];

      if (category && category !== "all") {
        query += " WHERE category = $1";
        params.push(category);
      }

      query += " ORDER BY published_at DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
      params.push(limit, offset);

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const result = await pool.query("SELECT DISTINCT category FROM articles WHERE category IS NOT NULL");
      res.json(result.rows.map(row => row.category));
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM articles WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
