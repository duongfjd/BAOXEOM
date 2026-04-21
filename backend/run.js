const { initDB, pool } = require('./src/db');
const { fetchNews } = require('./src/newsService');
const { summarizeArticle } = require('./src/aiService');

const runPipeline = async () => {
  console.log('🚀 [GitHub Action] Khởi chạy luồng lấy tin tức 1-Lần...', new Date().toLocaleString());
  await initDB();

  const articles = await fetchNews();
  if (!articles || articles.length === 0) {
    console.log('Không có bài báo mới nào.');
    process.exit(0);
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
      console.log(`🤖 AI đang phân tích: ${article.title}`);

      const aiResult = await summarizeArticle(contentForAi);

      if (aiResult) {
        const insertQuery = `
          INSERT INTO articles (url, original_title, title_vi, summary_vi, category, published_at, source_name, author, url_to_image, full_content_vi)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
          article.urlToImage || null,
          aiResult.full_content_vi || null
        ]);
        console.log(`✅ Đã cất vào Supabase: [${aiResult.category}] ${aiResult.title_vi}`);
      }
    } catch (error) {
      console.error(`❌ Lỗi tại bài báo (${article.title}):`, error.message);
    } finally {
      client.release();
    }
  }

  console.log('🎉 Hoàn thành lô API mới nhất và đóng Github Action!');
  process.exit(0);
};

runPipeline();
