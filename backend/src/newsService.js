const axios = require('axios');
require('dotenv').config();

const fetchNews = async () => {
  try {
    const today = new Date();
    today.setDate(today.getDate() - 2);
    const dateStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD

    const response = await axios.get(process.env.NEWS_API_URL, {
      params: {
        q: 'Apple OR Technology OR Sports OR Law',
        from: dateStr,
        sortBy: 'popularity',
        apiKey: process.env.NEWS_API_KEY,
        pageSize: 5 // Giới hạn lấy 5 bài viết mỗi lần chạy để test tránh vượt mức API
      }
    });

    if (response.data.status === 'ok') {
      console.log(`📰 Lấy thành công ${response.data.articles.length} bài báo từ NewsAPI`);
      return response.data.articles;
    }
    return [];
  } catch (error) {
    console.error('❌ Lỗi khi lấy tin tức:', error.message);
    return [];
  }
};

module.exports = { fetchNews };
