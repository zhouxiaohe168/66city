// ============================================================
// 66 的城市 · 后端服务
// 部署：Replit / 任何支持 Node.js 的平台
// 职责：
//   1. 代理 Claude API（保护 API key 不暴露给前端）
//   2. AI 陪练对话接口（苏格拉底式引导）
//   3. AI 生成题目接口（缓存避免重复消费）
//   4. 托管前端静态文件
// ============================================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';  // Sonnet 4.5，性价比高

// 简单内存缓存（生产环境建议换 SQLite）
const cache = {
  generatedQuestions: {},  // { "chinese_汉字识字_1": [题目...] }
  conversations: {},       // { sessionId: [{role, content}, ...] }
};

// ======== Claude API 调用 ========
function callClaude(messages, systemPrompt = '', maxTokens = 1024) {
  return new Promise((resolve, reject) => {
    if (!API_KEY) {
      return reject(new Error('NO_API_KEY'));
    }
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages,
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'API error'));
          const text = parsed.content && parsed.content[0] ? parsed.content[0].text : '';
          resolve(text);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ======== 读请求体 ========
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch(e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// ======== JSON 响应 ========
function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

// ======== 静态文件服务 ========
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  filePath = path.join(__dirname, 'public', filePath);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ============================================================
// 【AI 陪练】答错时的苏格拉底式引导
// ============================================================
async function handleTutor(req, res) {
  try {
    const body = await readBody(req);
    const { question, options, correctAnswer, wrongAnswer, subject, sessionId } = body;

    if (!API_KEY) {
      return sendJson(res, 200, {
        ok: true,
        reply: '（AI 陪练未配置 · 离线模式）再看看提示一步步想哦~',
        offline: true,
      });
    }

    const sysPrompt = `你是 Claude，现在是 7 岁一年级小朋友"周泽宇（小名66）"的学习陪练。

风格要求：
- 说话像一个温柔的大哥哥，亲切有趣，不要像老师或家长
- 用 66 能理解的话，不要用术语
- 用苏格拉底式引导：不直接说答案，先问他"你是怎么想的？"、"为什么选这个？"
- 每次回复控制在 2-3 句话，不要长篇大论
- 多用"我们"而不是"你"，像朋友一起想
- 可以偶尔用表情，但不要太多（最多 1-2 个）
- 如果他答对了，真心赞美具体的地方
- 如果答错了，温柔指出，引导他重新想

背景：66 7 岁，刚上一年级，最喜欢小动物（养了只叫 99 的卡皮巴拉）。`;

    const history = cache.conversations[sessionId] || [];
    const userMsg = `【${subject}题】${question}
选项：${options.map((o, i) => `${'ABCD'[i]}. ${o}`).join(' / ')}
正确答案：${'ABCD'[correctAnswer]}. ${options[correctAnswer]}
66 选了：${'ABCD'[wrongAnswer]}. ${options[wrongAnswer]}

作为陪练，简短地（2-3 句）回应 66，用苏格拉底方式引导他想一想，不要直接给答案。`;

    const messages = [...history, { role: 'user', content: userMsg }];
    const reply = await callClaude(messages, sysPrompt, 300);

    // 保存对话上下文
    if (sessionId) {
      cache.conversations[sessionId] = [...history, { role: 'user', content: userMsg }, { role: 'assistant', content: reply }].slice(-10);
    }

    sendJson(res, 200, { ok: true, reply });
  } catch(e) {
    console.error('tutor error', e);
    sendJson(res, 200, {
      ok: false,
      reply: '（AI 大哥哥没来，先看提示再想想~）',
      error: e.message,
    });
  }
}

// ============================================================
// 【AI 自由陪聊】66 可以和 Claude 聊学习话题
// ============================================================
async function handleChat(req, res) {
  try {
    const body = await readBody(req);
    const { message, sessionId } = body;

    if (!API_KEY) {
      return sendJson(res, 200, {
        ok: true,
        reply: '（AI 大哥哥还没来报到，等爸爸配置好就能聊啦！）',
        offline: true,
      });
    }

    const sysPrompt = `你是 Claude，现在在和 7 岁一年级小朋友"周泽宇（小名66）"聊天。

风格：
- 温柔、有趣、像一个懂很多的大哥哥
- 说话简短（2-4 句），多用具体的例子，不讲大道理
- 鼓励他多问问题，培养好奇心
- 如果他问学习相关，引导他自己思考而不是直接给答案
- 如果他问的太难，用简单的话解释
- 避免任何不适合儿童的话题（暴力、恐怖、成人内容）
- 可以聊学习、自然、动物、小游戏、他的卡皮巴拉"99"

背景：66 7 岁，一年级，养了一只卡皮巴拉叫"99"。`;

    const history = cache.conversations['chat_' + sessionId] || [];
    const messages = [...history, { role: 'user', content: message }].slice(-10);
    const reply = await callClaude(messages, sysPrompt, 400);

    cache.conversations['chat_' + sessionId] = [...messages, { role: 'assistant', content: reply }].slice(-10);
    sendJson(res, 200, { ok: true, reply });
  } catch(e) {
    console.error('chat error', e);
    sendJson(res, 200, { ok: false, reply: '我有点走神了，再说一遍好吗？', error: e.message });
  }
}

// ============================================================
// 【AI 生成题目】根据学科+难度生成新题
// ============================================================
async function handleGenerate(req, res) {
  try {
    const body = await readBody(req);
    const { subject, topic, count = 3, difficulty = 1 } = body;

    if (!API_KEY) {
      return sendJson(res, 200, { ok: false, questions: [], offline: true });
    }

    const cacheKey = `${subject}_${topic || 'any'}_${difficulty}`;
    // 优先用缓存的题（但每次返回不同的）
    const cached = cache.generatedQuestions[cacheKey] || [];
    if (cached.length >= count * 3) {
      const shuffled = [...cached].sort(() => Math.random() - 0.5);
      return sendJson(res, 200, { ok: true, questions: shuffled.slice(0, count), fromCache: true });
    }

    const subjectDesc = {
      chinese: '语文（识字、拼音、词语、古诗、阅读）',
      math: '数学（20 以内加减法、图形、时间、人民币）',
      english: '英语（字母、数字、颜色、动物、日常用语）',
      thinking: '思维训练（规律、逻辑推理、脑筋急转弯）',
      ai: 'AI 启蒙（什么是 AI、AI 如何学习、AI 的应用）',
    }[subject] || subject;

    const sysPrompt = `你是为一年级小朋友（7 岁）出题的专家。要求：
- 符合一年级知识水平和心理发展
- 有趣、贴近生活、不枯燥
- 4 个选项，1 个正确
- 每题必须有三层提示（引导思考→举例子→直接讲解）
- 必须严格返回 JSON 数组，不要任何其他文字说明

JSON 格式（严格遵守）：
[
  {
    "q": "题目",
    "opts": ["选项A","选项B","选项C","选项D"],
    "a": 0,
    "topic": "知识点",
    "difficulty": 1,
    "hints": ["第1层引导不给答案","第2层给例子","第3层直接讲解"],
    "tip": "答对后的简短小知识"
  }
]`;

    const userMsg = `请为一年级学生生成 ${count} 道 ${subjectDesc} 的题目${topic ? '，侧重知识点：' + topic : ''}。难度 ${difficulty}/3。
要求创新、有趣、避免常见套路。直接返回 JSON 数组。`;

    const reply = await callClaude([{ role: 'user', content: userMsg }], sysPrompt, 2000);
    // 从回复中提取 JSON
    let questions = [];
    try {
      const match = reply.match(/\[[\s\S]*\]/);
      if (match) questions = JSON.parse(match[0]);
    } catch(e) { console.error('parse generated questions fail', e); }

    // 去重 + 验证
    questions = questions.filter(q =>
      q.q && Array.isArray(q.opts) && q.opts.length === 4 &&
      typeof q.a === 'number' && q.a >= 0 && q.a < 4 &&
      Array.isArray(q.hints) && q.hints.length === 3
    );

    // 合并到缓存
    if (!cache.generatedQuestions[cacheKey]) cache.generatedQuestions[cacheKey] = [];
    cache.generatedQuestions[cacheKey].push(...questions);
    // 限制缓存大小
    if (cache.generatedQuestions[cacheKey].length > 50) {
      cache.generatedQuestions[cacheKey] = cache.generatedQuestions[cacheKey].slice(-50);
    }

    sendJson(res, 200, { ok: true, questions, fromCache: false });
  } catch(e) {
    console.error('generate error', e);
    sendJson(res, 200, { ok: false, questions: [], error: e.message });
  }
}

// ============================================================
// 【AI 启蒙游戏】"教 AI 认水果" 的判断接口
// AI 根据 66 的训练数据，尝试识别新图片
// ============================================================
async function handleAiGame(req, res) {
  try {
    const body = await readBody(req);
    const { trainingData, testItem } = body;
    // 这里不真的调 AI，而是模拟一个简单的规则：
    // trainingData: [{ emoji: '🍎', label: '苹果' }, ...]
    // testItem: { emoji: '🍌' }
    // 简单匹配：如果训练数据中有，返回该 label；否则 "我不知道"
    const match = trainingData.find(t => t.emoji === testItem.emoji);
    if (match) {
      sendJson(res, 200, { ok: true, prediction: match.label, confidence: 1 });
    } else {
      // 没见过的，让 AI 猜——返回"我不认识"
      sendJson(res, 200, { ok: true, prediction: '我不认识这个，你能教我吗？', confidence: 0 });
    }
  } catch(e) {
    sendJson(res, 200, { ok: false, error: e.message });
  }
}

// ======== 健康检查 ========
function handleHealth(req, res) {
  sendJson(res, 200, {
    ok: true,
    hasApiKey: !!API_KEY,
    model: MODEL,
    uptime: process.uptime(),
  });
}

// ============================================================
// 主路由
// ============================================================
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;

  // API 路由
  if (pathname === '/api/health') return handleHealth(req, res);
  if (pathname === '/api/tutor' && req.method === 'POST') return handleTutor(req, res);
  if (pathname === '/api/chat' && req.method === 'POST') return handleChat(req, res);
  if (pathname === '/api/generate' && req.method === 'POST') return handleGenerate(req, res);
  if (pathname === '/api/ai-game' && req.method === 'POST') return handleAiGame(req, res);

  // 静态文件
  return serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════╗
║   66的城市 · 后端服务已启动               ║
║   Port:  ${PORT}                              ║
║   API Key: ${API_KEY ? '✓ 已配置' : '✗ 未配置（AI 陪练将使用离线模式）'}
║   Model: ${MODEL}    ║
╚══════════════════════════════════════════╝
`);
});
