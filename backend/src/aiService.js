const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config();

const geminiKey = process.env.GEMINI_API_KEY;
const fallbackApiKey = process.env.POLLINATIONS_API_KEY;
const fallbackBaseUrl = process.env.POLLINATIONS_BASE_URL || 'https://gen.pollinations.ai';
const fallbackModel = process.env.POLLINATIONS_MODEL || 'openai';

const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

const buildPrompt = (articleContent) => `
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

const parseJsonFromModel = (rawText) => {
  const text = String(rawText || '')
    .replace(/```json/gi, '')
    .replace(/```/gi, '')
    .trim();

  return JSON.parse(text);
};

const summarizeWithGemini = async (prompt) => {
  if (!genAI) {
    return null;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return parseJsonFromModel(result.response.text());
};

const summarizeWithFallback = async (prompt) => {
  if (!fallbackApiKey) {
    return null;
  }

  const response = await axios.post(
    `${fallbackBaseUrl}/v1/chat/completions`,
    {
      model: fallbackModel,
      messages: [
        { role: 'user', content: prompt }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${fallbackApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  const content = response?.data?.choices?.[0]?.message?.content;
  return parseJsonFromModel(content);
};

const summarizeArticle = async (articleContent) => {
  const prompt = buildPrompt(articleContent);

  try {
    const geminiResult = await summarizeWithGemini(prompt);
    if (geminiResult) {
      return geminiResult;
    }
  } catch (error) {
    console.error('❌ Gemini lỗi, chuyển qua API dự phòng:', error.message);
  }

  try {
    const fallbackResult = await summarizeWithFallback(prompt);
    if (fallbackResult) {
      console.log('ℹ️ Đang dùng API dự phòng cho tác vụ tóm tắt.');
      return fallbackResult;
    }
  } catch (error) {
    console.error('❌ API dự phòng cũng lỗi:', error.message);
  }

  return null;
};

module.exports = { summarizeArticle };
