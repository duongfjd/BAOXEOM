const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        original_title TEXT,
        title_vi TEXT,
        summary_vi TEXT,
        category TEXT,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Thêm các cột bổ sung dựa theo JSON NewsAPI
    await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_name TEXT;`);
    await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT;`);
    await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS url_to_image TEXT;`);
    
    console.log('✅ Bảng articles đã sẵn sàng với cấu trúc mới.');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo DB:', error);
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initDB
};
