const { initDB, pool } = require('./src/db');
const { fetchNews } = require('./src/newsService');
const { summarizeArticle } = require('./src/aiService');

const runTest = async () => {
  console.log('🚀 Chạy test nhanh với gemini-2.5-flash...', new Date().toLocaleString());
  await initDB();
  
  const articles = await fetchNews();
  if (!articles || articles.length === 0) {
    console.log('Không có bài báo mới nào.');
    process.exit(0);
  }

  for (const article of articles) {
    if (article.title === '[Removed]') continue;
    
    const contentForAi = `${article.title}\n\n${article.description || ''}\n\n${article.content || ''}`;
    console.log(`🤖 AI (gemini-2.5-flash) đang xử lý bài: ${article.title}`);
    
    // Test exclusively the AI function
    const aiResult = await summarizeArticle(contentForAi);
    
    if (aiResult) {
      console.log(`✅ Kết quả test thành công:`);
      console.log(`- Tiêu đề: ${aiResult.title_vi}`);
      console.log(`- Tóm tắt: ${aiResult.summary_vi}`);
      console.log(`- Phân loại: ${aiResult.category}`);
      break; // Test 1 bài là đủ để chứng minh API đang hoạt động
    } else {
      console.log('❌ Vẫn lỗi không lấy được dữ liệu. Kiểm tra API Key.');
    }
  }
  process.exit(0);
};

runTest();
