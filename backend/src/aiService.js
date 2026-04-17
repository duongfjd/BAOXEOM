const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const summarizeArticle = async (articleContent) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Tóm tắt và phân tích bài báo sau, sau đó trả về cấu trúc JSON gồm các trường:
- "title_vi": Tiêu đề bài báo dịch sang tiếng Việt.
- "summary_vi": Tóm tắt ngắn gọn bài báo trong khoảng 50 từ.
- "category": Phân loại chuyên mục (Chọn 1 trong: Thể thao, Pháp luật, Công nghệ).
- "full_content_vi": Viết lại nội dung bài báo một cách chi tiết bằng tiếng Việt. Hãy dựa vào nội dung gốc để phát triển, kéo dài, và làm cho bài báo thêm phong phú, sinh động (như một bài báo hoàn chỉnh, có mở bài, diễn biến và kết luận nếu cần thiết).

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
