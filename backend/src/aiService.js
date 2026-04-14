const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const summarizeArticle = async (articleContent) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Tóm tắt bài báo sau trong 50 từ, dịch sang tiếng Việt, và trả về định dạng JSON gồm các trường: "title_vi", "summary_vi", "category" (Chọn 1 trong: Thể thao, Pháp luật, Công nghệ).
Nội dung bài báo:
${articleContent}

LƯU Ý QUAN TRỌNG:
Chỉ trả về JSON hợp lệ, KHÔNG bọc trong markdown (\`\`\`json hay \`\`\`).
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    // Xử lý dọn dẹp kết quả phòng trường hợp AI trả về markdown
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('❌ Lỗi khi gọi Gemini API:', error.message);
    return null;
  }
};

module.exports = { summarizeArticle };
