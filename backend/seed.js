const { initDB, pool } = require('./src/db');
async function seed() {
  try {
    await initDB();
    const client = await pool.connect();
    await client.query(`
      INSERT INTO articles (url, original_title, title_vi, summary_vi, category, published_at, source_name, author, url_to_image) 
      VALUES 
      ('https://example.com/mock-apple-ai-2', 'Apple Reportedly Testing Glasses AI', 'Apple thử nghiệm Kính thông minh AI (Mới)', 
      'Rò rỉ thông tin cho thấy Apple đang bí mật phát triển và thử nghiệm các thiết kế gọng kính thông minh. Sản phẩm được cho là sẽ tích hợp sâu Trí tuệ Nhân tạo để phân tích môi trường xung quanh.', 
      'Công nghệ', NOW(), 'Báo Công Nghệ Mới', 'Phạm Hồng Dương', 'https://i0.wp.com/9to5mac.com/wp-content/uploads/sites/6/2026/04/dope-thief.jpg' ),
      
      ('https://example.com/mock-law-2', 'New Law on Technology Passed', 'Thông qua Luật Bảo Mật Thông Tin Mới',
      'Chính phủ vừa thông qua dự luật yêu cầu các công ty công nghệ phải có chứng chỉ AI và đảm bảo tính minh bạch dữ liệu người dùng 100%.', 
      'Pháp luật', NOW(), 'Báo Pháp Luật', 'John Wick', 'https://www.inspiredtaste.net/wp-content/uploads/2026/04/Beef-Birria-Recipe-1.jpg')
      ON CONFLICT DO NOTHING;
    `);
    client.release();
    console.log('✅ Đã tạo dữ liệu giả lập thành công để test giao diện.');
  } catch (error) {
    console.error('Lỗi khi seed:', error);
  } finally {
    process.exit(0);
  }
}
seed();
