const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { initDB, pool } = require('./db');
const { fetchNews } = require('./newsService');
const { summarizeArticle } = require('./aiService');

const app = express();
app.use(cors());
app.use(express.json());

// Phục vụ thư mục public chứa giao diện HTML
app.use(express.static(path.join(__dirname, '../public')));

// API Endpoint cho giao diện HTML gọi tới
app.get('/api/articles', async (req, res) => {
  try {
    const client = await pool.connect();
    // Lấy 20 bài báo mới nhất
    const result = await client.query('SELECT * FROM articles ORDER BY published_at DESC LIMIT 20');
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Lỗi khi truy xuất DB:', error);
    res.status(500).json({ error: error.message });
  }
});

const processNews = async () => {
  console.log('🚀 Bắt đầu tiến trình thu thập và xử lý tin tức...', new Date().toLocaleString());
  
  const articles = await fetchNews();
  if (!articles || articles.length === 0) {
    console.log('Không có bài báo mới nào.');
    return;
  }

  for (const article of articles) {
    if (article.title === '[Removed]') continue;
    
    const client = await pool.connect();
    try {
      const checkResult = await client.query('SELECT id FROM articles WHERE url = $1', [article.url]);
      if (checkResult.rows.length > 0) {
        console.log(`⏩ Bỏ qua bài cũ: ${article.title}`);
        continue;
      }

      const contentForAi = `${article.title}\n\n${article.description || ''}\n\n${article.content || ''}`;
      console.log(`🤖 AI Đang xử lý: ${article.title}`);
      
      const aiResult = await summarizeArticle(contentForAi);
      
      if (aiResult) {
        const insertQuery = `
          INSERT INTO articles (url, original_title, title_vi, summary_vi, category, published_at, source_name, author, url_to_image)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await client.query(insertQuery, [
          article.url,
          article.title,
          aiResult.title_vi,
          aiResult.summary_vi,
          aiResult.category,
          new Date(article.publishedAt),
          article.source?.name || null,
          article.author || null,
          article.urlToImage || null
        ]);
        console.log(`✅ Lưu thành công: [${aiResult.category}] ${aiResult.title_vi}`);
      }
    } catch (error) {
      console.error(`❌ Lỗi bài báo (${article.title}):`, error.message);
    } finally {
      client.release();
    }
  }
  console.log('🎉 Xử lý xong mẻ tin tức hiện tại!');
};

const PORT = 3000;

const startSystem = async () => {
  await initDB();

  // Khởi động Express Server
  app.listen(PORT, () => {
    console.log(`🌐 Máy chủ giao diện đang chạy tại: http://localhost:${PORT}`);
  });

  // Chạy luôn luồng quét tin 1 lần
  await processNews();

  // Cấu hình chạy định kỳ mỗi 4 tiếng
  console.log('⏰ Cron job quét tin đã đặt ngưỡng 4 tiếng/lần.');
  cron.schedule('0 */4 * * *', () => {
    processNews();
  });
};

startSystem();
