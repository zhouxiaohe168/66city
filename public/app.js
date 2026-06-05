/* ====================================================================
   66 的城市 · 主应用逻辑 v0.3
   依赖：questions.js (QUESTION_BANK, ENCOURAGES)
   ==================================================================== */

// ============================================================
// 【常量配置】
// ============================================================
const SUBJECTS = {
  chinese:  { name: '语文',   emoji: '📖', mascot: '🐼' },
  math:     { name: '数学',   emoji: '🧮', mascot: '🦊' },
  english:  { name: '英语',   emoji: '🔤', mascot: '🐨' },
  thinking: { name: '思维',   emoji: '🧩', mascot: '🦉' },
  ai:       { name: 'AI启蒙', emoji: '🤖', mascot: '🤖' },
  boss:     { name: '大挑战', emoji: '👑', mascot: '🐉' },
};

const BUILDINGS = [
  { emoji: '🏠', name: '小木屋',  cost: 0   },
  { emoji: '🌳', name: '大树',    cost: 15  },
  { emoji: '🏪', name: '小卖部',  cost: 40  },
  { emoji: '🏫', name: '学校',    cost: 80  },
  { emoji: '🏥', name: '医院',    cost: 140 },
  { emoji: '🎡', name: '摩天轮',  cost: 220 },
  { emoji: '🏰', name: '城堡',    cost: 320 },
  { emoji: '🚀', name: '火箭',    cost: 450 },
];

const PETS = [
  { emoji: '🐶', name: '小狗',   unlockAt: 5   },
  { emoji: '🐱', name: '小猫',   unlockAt: 15  },
  { emoji: '🐰', name: '兔子',   unlockAt: 30  },
  { emoji: '🐼', name: '熊猫',   unlockAt: 50  },
  { emoji: '🦊', name: '狐狸',   unlockAt: 75  },
  { emoji: '🐨', name: '考拉',   unlockAt: 100 },
  { emoji: '🦉', name: '猫头鹰', unlockAt: 130 },
  { emoji: '🐲', name: '小龙',   unlockAt: 170 },
  { emoji: '🦄', name: '独角兽', unlockAt: 220 },
  { emoji: '🐉', name: '大龙',   unlockAt: 280 },
  { emoji: '🦖', name: '恐龙',   unlockAt: 350 },
  { emoji: '🐧', name: '企鹅',   unlockAt: 420 },
];

// 卡皮巴拉 99 的配置
const CAPY_STAGES = [
  { emoji: '🥔', label: '幼年', minIq: 0   },   // 小小一只
  { emoji: '🦫', label: '少年', minIq: 30  },
  { emoji: '🦫', label: '成年', minIq: 80  },
  { emoji: '🦫', label: '智者', minIq: 150 },   // 戴眼镜？用文字表达
];

const CAPY_SHOP = {
  food: [
    { id: 'food1', emoji: '🥬', name: '普通菜叶',  cost: 0,  hunger: 15, mood: 5,  desc: '免费的，但只能填肚子' },
    { id: 'food2', emoji: '🌽', name: '新鲜玉米',  cost: 8,  hunger: 30, mood: 15, desc: '香甜可口' },
    { id: 'food3', emoji: '🍎', name: '水灵苹果',  cost: 15, hunger: 40, mood: 25, desc: '99 的最爱！' },
    { id: 'food4', emoji: '🍰', name: '生日蛋糕',  cost: 30, hunger: 60, mood: 50, desc: '超级豪华！' },
  ],
  shelter: [
    { id: 'shel1', emoji: '🏕️', name: '小帐篷',  cost: 0,   desc: '初始的家'  },
    { id: 'shel2', emoji: '🏡', name: '小木屋',  cost: 60,  desc: '有窗户啦！' },
    { id: 'shel3', emoji: '🏠', name: '大房子',  cost: 150, desc: '空间更大'   },
    { id: 'shel4', emoji: '🏰', name: '豪华城堡',cost: 400, desc: '王者住所'   },
  ],
  toys: [
    { id: 'toy1', emoji: '🎾', name: '小球',     cost: 10,  mood: 20, desc: '滚来滚去很好玩' },
    { id: 'toy2', emoji: '🧸', name: '毛绒熊',   cost: 25,  mood: 35, desc: '温暖的拥抱' },
    { id: 'toy3', emoji: '🎠', name: '小木马',   cost: 50,  mood: 60, desc: '99 最喜欢骑' },
  ],
};

// ============================================================
// 【状态管理】
// ============================================================
const DEFAULT_STATE = {
  name: '泽宇', nickname: '66',
  coin: 0, level: 1, streak: 0, maxStreak: 0,
  totalQs: 0, totalRight: 0,
  hintUsed: 0, hintLevelSum: 0, indepRight: 0,
  aiCallsUsed: 0,  // 用过 AI 陪练的次数
  todayCount: 0, todayDate: new Date().toDateString(),
  timeSpent: 0, unlockedBuildings: 1, unlockedPets: [],
  dailyTasks: null,
  loginDays: 0, lastLoginDate: null,
  history: {},
  mistakes: [],  // 错题记录
  subjectStats: {
    chinese:  { total: 0, right: 0 },
    math:     { total: 0, right: 0 },
    english:  { total: 0, right: 0 },
    thinking: { total: 0, right: 0 },
    ai:       { total: 0, right: 0 },
  },
  // 99 卡皮巴拉
  capy: {
    name: '99',
    hunger: 80,    // 0-100，0 是最饿
    mood: 80,      // 心情
    energy: 100,   // 体力
    iq: 0,         // 智力（从答题获得）
    stage: 0,      // 成长阶段
    sleeping: false,
    lastUpdate: Date.now(),
    ownedFood: ['food1'],
    ownedToys: [],
    currentShelter: 'shel1',
    ownedShelters: ['shel1'],
  },
  // 设置
  settings: {
    parentPwd: '0417',  // 默认密码 = 泽宇生日 0417
    focusLimit: true,
    autoSpeak: true,
    aiGen: true,
  },
  // AI 生成的题缓存
  aiQuestions: {},
  // 会话 ID（用于 AI 对话上下文）
  sessionId: 'sess_' + Math.random().toString(36).slice(2, 10),
};

let state = loadState();
initDaily();

function loadState() {
  try {
    const raw = localStorage.getItem('city66_state_v3');
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const s = JSON.parse(raw);
    const today = new Date().toDateString();
    if (s.todayDate !== today) {
      s.todayDate = today;
      s.todayCount = 0;
      s.dailyTasks = null;
    }
    // 补齐缺失字段（升级时）
    const merged = JSON.parse(JSON.stringify(DEFAULT_STATE));
    for (const k in s) {
      if (typeof s[k] === 'object' && s[k] !== null && !Array.isArray(s[k]) && typeof merged[k] === 'object') {
        merged[k] = { ...merged[k], ...s[k] };
      } else {
        merged[k] = s[k];
      }
    }
    return merged;
  } catch(e) {
    console.error('loadState error', e);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  state.todayDate = new Date().toDateString();
  try {
    localStorage.setItem('city66_state_v3', JSON.stringify(state));
  } catch(e) {
    console.warn('保存失败（可能空间不足）');
  }
}

// ============================================================
// 【每日任务 + 打卡】
// ============================================================
function initDaily() {
  if (!state.dailyTasks) {
    state.dailyTasks = [
      { id: 'answer10', text: '答对 10 道题', goal: 10, progress: 0, reward: 20, done: false, emo: '✏️' },
      { id: 'sub3',     text: '玩 3 个不同科目', goal: 3, progress: 0, reward: 15, done: false, emo: '🌈', subs: [] },
      { id: 'streak5',  text: '连续答对 5 题', goal: 5, progress: 0, reward: 25, done: false, emo: '🔥' },
      { id: 'feed99',   text: '喂 99 一次',    goal: 1, progress: 0, reward: 10, done: false, emo: '🦫' },
    ];
  }
  const today = new Date().toDateString();
  if (state.lastLoginDate !== today) {
    if (state.lastLoginDate) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      state.loginDays = (state.lastLoginDate === yesterday) ? state.loginDays + 1 : 1;
    } else {
      state.loginDays = 1;
    }
    state.lastLoginDate = today;
  }
  saveState();
}

function updateDailyTasks(event) {
  let changed = false;
  state.dailyTasks.forEach(t => {
    if (t.done) return;
    if (t.id === 'answer10' && event.type === 'correct') {
      t.progress += 1;
      if (t.progress >= t.goal) completeTask(t);
    }
    if (t.id === 'sub3' && event.type === 'subject') {
      if (!t.subs.includes(event.sub)) {
        t.subs.push(event.sub);
        t.progress = t.subs.length;
        if (t.progress >= t.goal) completeTask(t);
      }
    }
    if (t.id === 'streak5' && event.type === 'correct') {
      if (state.streak >= t.goal && !t.done) {
        t.progress = t.goal;
        completeTask(t);
      }
    }
    if (t.id === 'feed99' && event.type === 'feed') {
      t.progress = 1;
      completeTask(t);
    }
    changed = true;
  });
  function completeTask(t) {
    t.done = true;
    state.coin += t.reward;
    toast(`🎉 任务完成：${t.text} +${t.reward}🪙`);
  }
  if (changed) { updateTopbar(); updateDailyStrip(); saveState(); }
}

function updateDailyStrip() {
  const done = state.dailyTasks.filter(t => t.done).length;
  const total = state.dailyTasks.length;
  $('#dailyText').textContent = `${done}/${total} 完成`;
  $('#dailyBar').style.width = (done/total*100) + '%';
}

// ============================================================
// 【智能出题飞轮】
// ============================================================
function pickQuestions(subject, count = 5) {
  const pool = [...(QUESTION_BANK[subject] || [])];
  // 加入 AI 生成的缓存题
  const ai = (state.aiQuestions && state.aiQuestions[subject]) || [];
  pool.push(...ai);

  const now = Date.now();
  const scored = pool.map((q, idx) => {
    const key = subject + '_' + idx;
    const h = state.history[key];
    let score = 100;
    if (h) {
      const acc = h.right / Math.max(1, h.tries);
      const usedHint = (h.hintMax || 0) > 0;
      if (acc < 0.5) score = 90;
      else if (acc < 0.8) score = 60;
      else score = usedHint ? 45 : 25;
      const daysAgo = (now - h.lastSeen) / 86400000;
      if (daysAgo < 3) score *= 0.4;
      if (daysAgo < 1) score *= 0.3;
      if (acc < 0.5 && daysAgo >= 3 && daysAgo <= 7) score *= 1.8;
    }
    score *= (0.7 + Math.random() * 0.6);
    return { q, idx, score, key };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(x => ({ ...x.q, _key: x.key, _subject: subject, _idx: x.idx }));
}

function recordAnswer(key, isRight, topic, subject, hintLevelUsed, aiUsed) {
  if (!state.history[key]) {
    state.history[key] = { tries: 0, right: 0, lastSeen: 0, topic, hintMax: 0 };
  }
  const h = state.history[key];
  h.tries += 1;
  if (isRight) h.right += 1;
  h.lastSeen = Date.now();
  h.topic = topic;
  h.hintMax = Math.max(h.hintMax || 0, hintLevelUsed);

  state.subjectStats[subject].total += 1;
  if (isRight) state.subjectStats[subject].right += 1;
  state.totalQs += 1;
  if (isRight) state.totalRight += 1;
  if (isRight && hintLevelUsed === 0 && !aiUsed) state.indepRight += 1;
  if (hintLevelUsed > 0) {
    state.hintUsed += 1;
    state.hintLevelSum += hintLevelUsed;
  }
  if (aiUsed) state.aiCallsUsed += 1;
  state.todayCount += 1;

  // 错题本
  if (!isRight) {
    const q = currentQuiz.questions[currentQuiz.idx];
    state.mistakes.push({
      q: q.q, opts: q.opts, a: q.a, topic, subject,
      wrongAt: Date.now(),
    });
    state.mistakes = state.mistakes.slice(-50);  // 保留最近 50 个
  }
  saveState();
}

// ============================================================
// 【99 卡皮巴拉·核心逻辑】
// ============================================================
const CAPY_DECAY_PER_HOUR = { hunger: 10, mood: 8, energy: 6 };

function capyTick() {
  const now = Date.now();
  const hours = (now - state.capy.lastUpdate) / 3600000;
  if (hours > 0.01) {
    state.capy.hunger = Math.max(0, state.capy.hunger - CAPY_DECAY_PER_HOUR.hunger * hours);
    state.capy.mood   = Math.max(0, state.capy.mood   - CAPY_DECAY_PER_HOUR.mood * hours);
    if (state.capy.sleeping) {
      state.capy.energy = Math.min(100, state.capy.energy + 25 * hours);
      // 睡够了自动醒
      if (state.capy.energy >= 100) {
        state.capy.sleeping = false;
      }
    } else {
      state.capy.energy = Math.max(0, state.capy.energy - CAPY_DECAY_PER_HOUR.energy * hours);
    }
    state.capy.lastUpdate = now;
    // 更新成长阶段
    const stage = CAPY_STAGES.findIndex(s => state.capy.iq < s.minIq) - 1;
    state.capy.stage = stage < 0 ? CAPY_STAGES.length - 1 : stage;
    saveState();
  }
}

function capyGainIq(amount) {
  state.capy.iq += amount;
  state.capy.mood = Math.min(100, state.capy.mood + 3);
  const oldStage = state.capy.stage;
  const newStage = CAPY_STAGES.findIndex(s => state.capy.iq < s.minIq) - 1;
  state.capy.stage = newStage < 0 ? CAPY_STAGES.length - 1 : newStage;
  if (state.capy.stage > oldStage) {
    toast(`🎉 99 成长为「${CAPY_STAGES[state.capy.stage].label}」阶段！`);
    celebrate();
  }
  saveState();
}

function feedCapy(foodId) {
  const food = CAPY_SHOP.food.find(f => f.id === foodId);
  if (!food) return;
  if (state.capy.hunger >= 95) { toast('99 现在不饿啦~'); return; }
  state.capy.hunger = Math.min(100, state.capy.hunger + food.hunger);
  state.capy.mood = Math.min(100, state.capy.mood + food.mood);
  saveState();
  updateCapyUI();
  const big = $('#capyBig');
  if (big) { big.classList.add('eating'); setTimeout(() => big.classList.remove('eating'), 2000); }
  toast(`${food.emoji} 99 吃得很开心~`);
  updateDailyTasks({ type: 'feed' });
}

function playCapy(toyId) {
  const toy = CAPY_SHOP.toys.find(t => t.id === toyId);
  if (!toy) return;
  if (state.capy.energy < 10) { toast('99 太累了，让它休息一下~'); return; }
  state.capy.mood = Math.min(100, state.capy.mood + toy.mood);
  state.capy.energy = Math.max(0, state.capy.energy - 8);
  saveState();
  updateCapyUI();
  toast(`${toy.emoji} 99 玩得好开心~`);
}

function sleepCapy() {
  state.capy.sleeping = !state.capy.sleeping;
  if (state.capy.sleeping) {
    toast('💤 99 开始睡觉啦~');
  } else {
    toast('🌞 99 醒来啦！');
  }
  state.capy.lastUpdate = Date.now();
  saveState();
  updateCapyUI();
}

function buyShopItem(type, id) {
  let item;
  if (type === 'food') item = CAPY_SHOP.food.find(f => f.id === id);
  if (type === 'shelter') item = CAPY_SHOP.shelter.find(s => s.id === id);
  if (type === 'toy') item = CAPY_SHOP.toys.find(t => t.id === id);
  if (!item) return;
  if (state.coin < item.cost) { toast('金币不够，多做题赚金币~'); return; }
  state.coin -= item.cost;
  if (type === 'food') {
    if (!state.capy.ownedFood.includes(id)) state.capy.ownedFood.push(id);
  } else if (type === 'shelter') {
    if (!state.capy.ownedShelters.includes(id)) state.capy.ownedShelters.push(id);
    state.capy.currentShelter = id;
  } else if (type === 'toy') {
    if (!state.capy.ownedToys.includes(id)) state.capy.ownedToys.push(id);
  }
  saveState();
  updateTopbar();
  updateCapyUI();
  toast(`🎉 购买了「${item.name}」！`);
}

function updateCapyUI() {
  const c = state.capy;
  const stage = CAPY_STAGES[c.stage];
  // 小面板
  const emoji = c.sleeping ? '😴' : stage.emoji;
  $('#capyEmoji').textContent = emoji;
  $('#capyAge').textContent = stage.label;
  let moodText = '开心~';
  if (c.hunger < 30) moodText = '有点饿…';
  else if (c.mood < 30) moodText = '有点孤单…';
  else if (c.energy < 20) moodText = '好困啊…';
  else if (c.mood > 80) moodText = '超开心！';
  if (c.sleeping) moodText = '呼噜呼噜~';
  $('#capyMood').textContent = moodText;
  $('#barHunger').style.width = c.hunger + '%';
  $('#barMood').style.width = c.mood + '%';
  $('#barEnergy').style.width = c.energy + '%';
  $('#barIq').style.width = Math.min(100, c.iq) + '%';

  // 场景里的小卡皮
  $('#capySprite').textContent = c.sleeping ? '😴' : stage.emoji;
  const shelter = CAPY_SHOP.shelter.find(s => s.id === c.currentShelter) || CAPY_SHOP.shelter[0];
  $('#capyShelter').textContent = shelter.emoji;
  $('#zzz').style.display = c.sleeping ? 'block' : 'none';
}

// ============================================================
// 【朗读 TTS · 智能中英文分段】
// ============================================================
// 把一段混合文本按中英文拆成片段
// 例如："'red' 是什么颜色？" → [{text:'red',lang:'en'}, {text:'是什么颜色？',lang:'zh'}]
function splitByLang(text, defaultLang) {
  // 判断一个字符的语言类型
  // 英文字母/数字/英文标点连在一起算英文段
  // 中文字符/中文标点算中文段
  // 空格/通用标点（如 ,.?!）跟随前一段
  const segments = [];
  let buf = '';
  let curLang = null;  // 'zh' | 'en'
  const isZh = c => /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(c);
  const isEn = c => /[a-zA-Z]/.test(c);

  for (const ch of text) {
    let chLang;
    if (isZh(ch)) chLang = 'zh';
    else if (isEn(ch)) chLang = 'en';
    else chLang = null;  // 空格、数字、通用标点、emoji：跟前段走

    if (chLang && curLang && chLang !== curLang) {
      // 语言切换，把现在的 buf 作为一段保存
      if (buf.trim()) segments.push({ text: buf, lang: curLang });
      buf = '';
    }
    buf += ch;
    if (chLang) curLang = chLang;
  }
  if (buf.trim()) segments.push({ text: buf, lang: curLang || (defaultLang === 'en-US' ? 'en' : 'zh') });
  return segments;
}

function speak(text, lang = 'zh-CN') {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel();

    // 如果指定了 en-US（英语题朗读题目），就全部用英语念（不拆段）
    // 因为英语题的"题目部分"就是要完整英语体验
    // 但其他场景（提示、AI 回复、手动点 🔊）都走智能分段
    if (lang === 'en-US') {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.9; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
      return;
    }

    // 中文为主的文本 → 智能分段
    const segments = splitByLang(text, lang);
    segments.forEach((seg, i) => {
      const u = new SpeechSynthesisUtterance(seg.text);
      u.lang = seg.lang === 'en' ? 'en-US' : 'zh-CN';
      // 英文稍慢一点，更清晰
      u.rate = seg.lang === 'en' ? 0.85 : 0.9;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    });
  } catch(e) { console.warn('TTS fail', e); }
}
function stopSpeak() { try { window.speechSynthesis.cancel(); } catch(e){} }

// ============================================================
// 【答题流程】
// ============================================================
let currentQuiz = null;
let currentHintLevel = 0;
let currentAiUsed = false;
let sessionStartTime = null;
let focusWarningShown = false;

function startQuiz(subject) {
  if (subject === 'boss') {
    if (state.level < 3) { toast('城市等级达到 3 才能挑战哦~'); return; }
    startBossQuiz();
    return;
  }
  if (subject === 'aigame') {
    startAiGame();
    return;
  }

  const qs = pickQuestions(subject, 5);
  if (qs.length < 5) { toast('题目不够啦~'); return; }
  currentQuiz = {
    subject, questions: qs, idx: 0,
    rightCount: 0, coinEarned: 0, maxStreak: 0,
    startTime: Date.now(), currentStreak: 0,
    hintUsedInQuiz: 0, aiUsedInQuiz: false,
  };
  if (!sessionStartTime) sessionStartTime = Date.now();
  updateDailyTasks({ type: 'subject', sub: subject });
  $('#quizOverlay').classList.add('active');
  $('#subTag').textContent = SUBJECTS[subject].name;
  $('#mascot').textContent = SUBJECTS[subject].mascot;
  showQuestion();

  // 如果开启了 AI 生成，后台补题
  if (state.settings.aiGen) bgFetchAiQuestions(subject);
}

function startBossQuiz() {
  const allQs = [];
  ['chinese','math','english','thinking','ai'].forEach(sub => {
    const picked = pickQuestions(sub, 2);
    picked.forEach(q => allQs.push(q));
  });
  allQs.sort(() => Math.random() - 0.5);
  currentQuiz = {
    subject: 'boss', questions: allQs.slice(0, 8), idx: 0,
    rightCount: 0, coinEarned: 0, maxStreak: 0,
    startTime: Date.now(), currentStreak: 0,
    hintUsedInQuiz: 0, aiUsedInQuiz: false,
  };
  $('#quizOverlay').classList.add('active');
  $('#subTag').textContent = '👑 大挑战';
  $('#mascot').textContent = '🐉';
  showQuestion();
}

function showQuestion() {
  const q = currentQuiz.questions[currentQuiz.idx];
  currentHintLevel = 0;
  currentAiUsed = false;
  $('#hintArea').classList.remove('show');
  $('#hintArea').innerHTML = '';
  $('#aiReply').classList.remove('show');
  $('#aiReply').innerHTML = '';
  $('#question').innerHTML = q.q;
  $('#counter').textContent = `${currentQuiz.idx+1}/${currentQuiz.questions.length}`;
  const pct = (currentQuiz.idx / currentQuiz.questions.length) * 100;
  $('#progressBar').style.width = pct + '%';

  const encourages = (window.ENCOURAGES && window.ENCOURAGES.before) || ['来，这题简单~'];
  $('#mascotBubble').textContent = encourages[Math.floor(Math.random() * encourages.length)];

  const optsEl = $('#options');
  optsEl.innerHTML = '';
  optsEl.className = 'options' + (q.opts.some(o => o.length > 8) ? ' single-col' : '');
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(i, btn);
    optsEl.appendChild(btn);
  });
  $('#feedback').classList.remove('show');
  $('#nextBtn').classList.remove('show');

  if (q._subject === 'english' && q.read && state.settings.autoSpeak) {
    setTimeout(() => speak(q.q, 'en-US'), 300);
  }

  // 专注时长检查
  checkFocusLimit();
}

function showNextHint() {
  const q = currentQuiz.questions[currentQuiz.idx];
  if (!q.hints || currentHintLevel >= 3) return;
  currentHintLevel += 1;
  currentQuiz.hintUsedInQuiz = Math.max(currentQuiz.hintUsedInQuiz, currentHintLevel);
  const area = $('#hintArea');
  area.classList.add('show');
  const labels = ['💡 提示 1 · 引导思考', '📝 提示 2 · 举例子', '📖 提示 3 · 讲解'];
  const hintText = q.hints[currentHintLevel - 1];
  const wrapper = document.createElement('div');
  wrapper.className = 'hint-level';
  wrapper.innerHTML = `<span class="hint-badge">${labels[currentHintLevel-1]}</span><span class="hint-text">${hintText}</span>`;
  area.appendChild(wrapper);
  const oldMore = area.querySelector('.hint-more');
  if (oldMore) oldMore.remove();
  if (currentHintLevel < 3) {
    const moreBtn = document.createElement('button');
    moreBtn.className = 'hint-more';
    moreBtn.textContent = currentHintLevel === 1 ? '还不明白，再给点提示' : '还需要更多帮助';
    moreBtn.onclick = showNextHint;
    area.appendChild(moreBtn);
  }
  speak(hintText);
}

async function askAiTutor(wrongChoice) {
  const q = currentQuiz.questions[currentQuiz.idx];
  currentAiUsed = true;
  currentQuiz.aiUsedInQuiz = true;
  const area = $('#aiReply');
  area.classList.add('show');
  area.innerHTML = `
    <div class="ai-head">🤖 Claude 大哥哥</div>
    <div class="ai-loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span> 思考中...</div>
  `;
  try {
    const resp = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: q.q,
        options: q.opts,
        correctAnswer: q.a,
        wrongAnswer: wrongChoice !== undefined ? wrongChoice : q.a,
        subject: SUBJECTS[q._subject] ? SUBJECTS[q._subject].name : q._subject,
        sessionId: state.sessionId,
      }),
    });
    const data = await resp.json();
    area.innerHTML = `
      <div class="ai-head">🤖 Claude 大哥哥</div>
      <div>${escapeHtml(data.reply || '嗯…这题有点难~')}</div>
    `;
    if (data.offline) {
      area.innerHTML += `<div style="font-size:11px;color:var(--ink-soft);margin-top:4px">(当前是离线模式，需要配置后端才能使用AI陪练)</div>`;
    }
    speak(data.reply);
  } catch(e) {
    area.innerHTML = `
      <div class="ai-head">🤖 Claude 大哥哥</div>
      <div>（AI 大哥哥暂时来不了，再看看提示吧~）</div>
    `;
    console.error(e);
  }
}

function handleAnswer(choice, btn) {
  const q = currentQuiz.questions[currentQuiz.idx];
  const isRight = choice === q.a;
  const allBtns = document.querySelectorAll('.option');
  allBtns.forEach(b => b.disabled = true);

  recordAnswer(q._key, isRight, q.topic, q._subject, currentHintLevel, currentAiUsed);

  if (isRight) {
    btn.classList.add('right');
    currentQuiz.rightCount += 1;
    currentQuiz.currentStreak += 1;
    currentQuiz.maxStreak = Math.max(currentQuiz.maxStreak, currentQuiz.currentStreak);
    state.streak = currentQuiz.currentStreak;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
    let gain = 5 + Math.min(currentQuiz.currentStreak - 1, 5) * 2;
    if (currentHintLevel > 0) gain = Math.max(1, gain - currentHintLevel);
    if (currentQuiz.subject === 'boss') gain *= 2;
    state.coin += gain;
    currentQuiz.coinEarned += gain;

    // 99 得到智力点
    capyGainIq(1);
    saveState();
    flyCoin(btn, gain);
    updateTopbar();
    renderBuildings();
    updateCapyUI();
    updateDailyTasks({ type: 'correct' });

    const E = window.ENCOURAGES || {};
    let msg;
    if (currentQuiz.currentStreak >= 10) msg = (E.right10 || ['👑 10 连对！'])[0];
    else if (currentQuiz.currentStreak >= 5) msg = pickRand(E.right5) || '5 连对！';
    else if (currentQuiz.currentStreak >= 3) msg = pickRand(E.right3) || '3 连对！';
    else msg = pickRand(E.right1) || '答对了！';
    $('#mascotBubble').textContent = msg;

    const fb = $('#feedback');
    fb.className = 'feedback correct show';
    const marks = [currentHintLevel > 0 ? ' · 提示🔍' : '', currentAiUsed ? ' · AI🤖' : ''].join('');
    fb.innerHTML = `<div class="title">✅ 答对啦！+${gain}🪙${marks}</div>${q.tip || ''}`;
  } else {
    btn.classList.add('wrong');
    allBtns[q.a].classList.add('reveal');
    currentQuiz.currentStreak = 0;
    state.streak = 0;
    saveState();
    updateTopbar();
    const fb = $('#feedback');
    fb.className = 'feedback incorrect show';
    const finalHint = q.hints ? q.hints[2] : (q.tip || '下次记住哦~');
    fb.innerHTML = `<div class="title">💡 没事，再想想~</div>${finalHint}`;
    const E = window.ENCOURAGES || {};
    $('#mascotBubble').textContent = pickRand(E.wrong) || '没关系，学会了就好~';

    // 答错时，如果开了 AI，主动推送一个 AI 引导（只对中等和难度以上）
    if (state.settings.aiGen && !currentAiUsed) {
      setTimeout(() => askAiTutor(choice), 600);
    }
  }
  $('#nextBtn').classList.add('show');
}

function nextQuestion() {
  currentQuiz.idx += 1;
  if (currentQuiz.idx >= currentQuiz.questions.length) endQuiz();
  else showQuestion();
}

function endQuiz() {
  const mins = Math.round((Date.now() - currentQuiz.startTime) / 60000);
  state.timeSpent += Math.max(1, mins);
  saveState();
  $('#quizOverlay').classList.remove('active');
  stopSpeak();

  const newP = checkNewPet();
  if (newP) renderPets();

  const right = currentQuiz.rightCount;
  const total = currentQuiz.questions.length;
  const ratio = right / total;
  let emoji, title, sub;
  if (ratio === 1) { emoji = '🏆'; title = '全对！太厉害啦！'; sub = '66 是小天才~'; celebrate(); }
  else if (ratio >= 0.8) { emoji = '🎉'; title = '好棒！'; sub = '再接再厉！'; celebrate(); }
  else if (ratio >= 0.6) { emoji = '👍'; title = '不错哦'; sub = '继续加油~'; }
  else { emoji = '💪'; title = '下次会更好！'; sub = '错题已记录，过几天再来练~'; }
  $('#resultEmoji').textContent = emoji;
  $('#resultTitle').textContent = title;
  $('#resultSub').textContent = sub;
  $('#rsRight').textContent = right + '/' + total;
  $('#rsCoin').textContent = currentQuiz.coinEarned;
  $('#rsStreak').textContent = currentQuiz.maxStreak;

  const npEl = $('#newPet');
  if (newP) {
    npEl.classList.add('show');
    $('#newPetEmoji').textContent = newP.emoji;
    $('#newPetName').textContent = newP.name;
  } else {
    npEl.classList.remove('show');
  }

  // 99 的反馈
  const cg = $('#capyGained');
  if (right > 0) {
    cg.classList.add('show');
    cg.innerHTML = `🦫 <b>99 也变聪明了：</b>+${right} 智力点<br><span style="font-size:11px;color:var(--ink-soft)">你每答对一题，99 就学到一点！</span>`;
  } else {
    cg.classList.remove('show');
  }

  $('#resultOverlay').classList.add('active');
}

function checkNewPet() {
  for (let i = 0; i < PETS.length; i++) {
    const p = PETS[i];
    if (!state.unlockedPets.includes(i) && state.totalRight >= p.unlockAt) {
      state.unlockedPets.push(i);
      saveState();
      return p;
    }
  }
  return null;
}

// ============================================================
// 【专注时长控制】
// ============================================================
function checkFocusLimit() {
  if (!state.settings.focusLimit) return;
  if (!sessionStartTime) return;
  const mins = (Date.now() - sessionStartTime) / 60000;
  if (mins >= 20 && !focusWarningShown) {
    focusWarningShown = true;
    setTimeout(() => {
      $('#focusOverlay').classList.add('active');
      sessionStartTime = Date.now();
      focusWarningShown = false;
    }, 500);
  }
}

// ============================================================
// 【AI 生成题目 · 后台拉取】
// ============================================================
async function bgFetchAiQuestions(subject) {
  // 每天最多调 3 次后台生成，避免 API 费用
  const today = new Date().toDateString();
  const key = 'aiGen_' + subject + '_' + today;
  const count = parseInt(localStorage.getItem(key) || '0');
  if (count >= 3) return;

  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, count: 3, difficulty: 2 }),
    });
    const data = await resp.json();
    if (data.ok && data.questions && data.questions.length) {
      if (!state.aiQuestions[subject]) state.aiQuestions[subject] = [];
      state.aiQuestions[subject].push(...data.questions);
      // 限制缓存大小
      if (state.aiQuestions[subject].length > 30) {
        state.aiQuestions[subject] = state.aiQuestions[subject].slice(-30);
      }
      saveState();
      localStorage.setItem(key, (count + 1).toString());
      console.log(`[AI Gen] 为 ${subject} 新增 ${data.questions.length} 道题`);
    }
  } catch(e) {
    // 静默失败，不打扰用户
  }
}

// ============================================================
// 【AI 游戏：教 AI 认水果】
// ============================================================
const AI_GAME_FRUITS = [
  { emoji: '🍎', name: '苹果' },
  { emoji: '🍌', name: '香蕉' },
  { emoji: '🍊', name: '橙子' },
  { emoji: '🍇', name: '葡萄' },
  { emoji: '🍉', name: '西瓜' },
  { emoji: '🍓', name: '草莓' },
  { emoji: '🥝', name: '猕猴桃' },
  { emoji: '🍑', name: '桃子' },
  { emoji: '🍐', name: '梨' },
  { emoji: '🍍', name: '菠萝' },
];

const aiGameState = {
  step: 'intro',
  trainingData: [],   // [{ emoji, label }]
  currentFruits: [],  // 当前显示的 5 个水果
  testIdx: 0,
  correctCount: 0,
  totalTest: 0,
};

function startAiGame() {
  aiGameState.step = 'training';
  aiGameState.trainingData = [];
  aiGameState.testIdx = 0;
  aiGameState.correctCount = 0;
  aiGameState.totalTest = 0;
  // 随机选 5 种水果给 66 标注（训练集）
  const shuffled = [...AI_GAME_FRUITS].sort(() => Math.random() - 0.5);
  aiGameState.currentFruits = shuffled.slice(0, 5);
  $('#aigameOverlay').classList.add('active');
  renderAiGame();
}

function renderAiGame() {
  const area = $('#aiGameArea');
  const intro = $('#aiGameIntro');

  if (aiGameState.step === 'training') {
    intro.innerHTML = `
      <b>第 1 步：教 AI 认水果 🌟</b><br>
      AI 宝宝什么都不懂。请你点击每个水果，告诉它是什么。
    `;
    area.innerHTML = `
      <div class="fruit-grid" id="fruitGrid"></div>
      <div class="label-input-row" id="labelInputRow" style="display:none">
        <input type="text" id="labelInput" placeholder="这是什么水果？">
        <button id="labelSave">教 AI</button>
      </div>
      <button class="game-step-btn" id="doneTrainBtn" disabled>
        完成教学 (${aiGameState.trainingData.length}/5) →
      </button>
    `;
    const grid = $('#fruitGrid');
    aiGameState.currentFruits.forEach((fruit, i) => {
      const card = document.createElement('div');
      card.className = 'fruit-card';
      const labeled = aiGameState.trainingData.find(t => t.emoji === fruit.emoji);
      if (labeled) card.classList.add('labeled');
      card.innerHTML = `
        <div class="fruit-emoji">${fruit.emoji}</div>
        <div class="fruit-label">${labeled ? labeled.label : '点我教 AI'}</div>
      `;
      card.onclick = () => {
        aiGameState.activeLabel = i;
        $('#labelInputRow').style.display = 'flex';
        $('#labelInput').value = labeled ? labeled.label : '';
        $('#labelInput').focus();
      };
      grid.appendChild(card);
    });

    const saveBtn = $('#labelSave');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const val = $('#labelInput').value.trim();
        if (!val) return;
        const fruit = aiGameState.currentFruits[aiGameState.activeLabel];
        const existing = aiGameState.trainingData.findIndex(t => t.emoji === fruit.emoji);
        if (existing >= 0) aiGameState.trainingData[existing] = { emoji: fruit.emoji, label: val };
        else aiGameState.trainingData.push({ emoji: fruit.emoji, label: val });
        $('#labelInputRow').style.display = 'none';
        renderAiGame();
      };
    }

    const doneBtn = $('#doneTrainBtn');
    if (aiGameState.trainingData.length >= 5) {
      doneBtn.disabled = false;
      doneBtn.onclick = () => {
        aiGameState.step = 'testing';
        aiGameState.testIdx = 0;
        aiGameState.correctCount = 0;
        // 测试集：从已标注的随机出，混入 1 个未标注
        const tested = [...aiGameState.trainingData].sort(() => Math.random() - 0.5).slice(0, 3);
        const unseen = AI_GAME_FRUITS.filter(f => !aiGameState.trainingData.find(t => t.emoji === f.emoji));
        if (unseen.length) tested.push({ emoji: unseen[0].emoji, label: '?' });
        aiGameState.testSet = tested;
        aiGameState.totalTest = tested.length;
        renderAiGame();
      };
    }
  }
  else if (aiGameState.step === 'testing') {
    intro.innerHTML = `
      <b>第 2 步：测试 AI 🔬</b><br>
      看看 AI 学到了什么。现在考考它！(${aiGameState.testIdx + 1}/${aiGameState.totalTest})
    `;
    const current = aiGameState.testSet[aiGameState.testIdx];
    area.innerHTML = `
      <div style="text-align:center;padding:14px 0">
        <div style="font-size:70px;margin-bottom:8px">${current.emoji}</div>
        <div style="font-size:15px;color:var(--ink-soft);margin-bottom:12px">AI 看到了这个水果，它认识吗？</div>
      </div>
      <div class="ai-says" id="aiSays">
        <span class="ai-emoji">🤖</span>
        <span id="aiGuess">让我想想...</span>
      </div>
      <div id="testActionArea"></div>
    `;

    // AI 做预测
    setTimeout(async () => {
      try {
        const resp = await fetch('/api/ai-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainingData: aiGameState.trainingData,
            testItem: { emoji: current.emoji },
          }),
        });
        const data = await resp.json();
        const pred = data.prediction || '我不知道';
        $('#aiGuess').innerHTML = pred === '我不认识这个，你能教我吗？'
          ? `<b>我不认识这个水果...</b>你能教我吗？`
          : `我觉得这是 <b>"${pred}"</b>！`;

        const testArea = $('#testActionArea');
        if (pred === '我不认识这个，你能教我吗？') {
          // 让小朋友教
          testArea.innerHTML = `
            <div style="text-align:center;margin-top:8px;font-size:13px">
              ✨ 这就是 AI 的样子：没学过的它就不会！<br>告诉它答案，它下次就记住了。
            </div>
            <div class="label-input-row" style="margin-top:8px">
              <input type="text" id="teachInput" placeholder="这是什么？">
              <button id="teachBtn">告诉 AI</button>
            </div>
          `;
          $('#teachBtn').onclick = () => {
            const val = $('#teachInput').value.trim();
            if (!val) return;
            aiGameState.trainingData.push({ emoji: current.emoji, label: val });
            toast('🧠 AI 学到了新知识！');
            aiGameState.testIdx += 1;
            if (aiGameState.testIdx >= aiGameState.totalTest) aiGameState.step = 'result';
            renderAiGame();
          };
        } else {
          // 让小朋友判断对不对
          testArea.innerHTML = `
            <div style="text-align:center;margin-top:8px;font-size:13px">AI 说对了吗？</div>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="game-step-btn" style="background:linear-gradient(180deg,var(--right),#15803d);font-size:14px" id="yesBtn">✅ 对！</button>
              <button class="game-step-btn" style="background:linear-gradient(180deg,var(--wrong),#991b1b);font-size:14px" id="noBtn">❌ 错！</button>
            </div>
          `;
          $('#yesBtn').onclick = () => {
            aiGameState.correctCount += 1;
            toast('👏 AI 答对啦！');
            aiGameState.testIdx += 1;
            if (aiGameState.testIdx >= aiGameState.totalTest) aiGameState.step = 'result';
            renderAiGame();
          };
          $('#noBtn').onclick = () => {
            toast('AI 答错了，但这是学习的一部分~');
            aiGameState.testIdx += 1;
            if (aiGameState.testIdx >= aiGameState.totalTest) aiGameState.step = 'result';
            renderAiGame();
          };
        }
      } catch(e) {
        $('#aiGuess').textContent = '嗯... 让我想想';
        console.error(e);
      }
    }, 800);
  }
  else if (aiGameState.step === 'result') {
    const acc = Math.round((aiGameState.correctCount / aiGameState.totalTest) * 100);
    intro.innerHTML = `<b>🎉 AI 训练结束！</b>`;
    area.innerHTML = `
      <div style="text-align:center;padding:14px 0">
        <div style="font-size:60px">${acc >= 80 ? '🏆' : acc >= 50 ? '🎉' : '💪'}</div>
        <h3 style="margin:8px 0">AI 答对了 ${aiGameState.correctCount}/${aiGameState.totalTest}（${acc}%）</h3>
        <div style="padding:12px;background:var(--paper-2);border-radius:12px;margin-top:10px;text-align:left;font-size:13px;line-height:1.6">
          <b>🧠 你学到了什么？</b><br>
          · AI 需要被"教"才会认识东西<br>
          · 训练得越多，AI 越准<br>
          · 没学过的，AI 就不会——这就是"训练数据"的重要性<br>
          · 你现在就是 AI 的老师！
        </div>
      </div>
      <button class="game-step-btn" onclick="startAiGame()">再来一次</button>
    `;
    // 给奖励
    state.coin += 15;
    state.subjectStats.ai.total += 1;
    state.subjectStats.ai.right += 1;
    capyGainIq(2);
    saveState();
    updateTopbar();
    updateCapyUI();
    updateCounts();
    celebrate();
  }
}

// ============================================================
// 【AI 自由聊天】
// ============================================================
async function sendChatMessage() {
  const input = $('#chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendChatMsg('user', text);
  // 占位
  const loadingId = 'msg_' + Date.now();
  appendChatMsg('ai', '<div class="ai-loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>', loadingId);

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId: state.sessionId }),
    });
    const data = await resp.json();
    const msgEl = document.getElementById(loadingId);
    if (msgEl) msgEl.querySelector('.chat-bubble').innerHTML = escapeHtml(data.reply || '嗯…');
  } catch(e) {
    const msgEl = document.getElementById(loadingId);
    if (msgEl) msgEl.querySelector('.chat-bubble').textContent = '网络有点问题~';
  }
}

function appendChatMsg(who, text, id) {
  const msgs = $('#chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + who;
  if (id) div.id = id;
  div.innerHTML = `
    <div class="chat-avatar">${who === 'user' ? '😀' : '🤖'}</div>
    <div class="chat-bubble">${text}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// ============================================================
// 【UI 渲染】
// ============================================================
function updateTopbar() {
  $('#coin').textContent = state.coin;
  $('#level').textContent = state.level;
  $('#streak').textContent = state.streak;
}

function renderBuildings() {
  const el = $('#buildings');
  el.innerHTML = '';
  const visible = BUILDINGS.slice(0, Math.min(BUILDINGS.length, Math.max(4, state.unlockedBuildings + 1)));
  visible.forEach((b, idx) => {
    const unlocked = idx < state.unlockedBuildings;
    const canAfford = !unlocked && state.coin >= b.cost;
    const div = document.createElement('div');
    div.className = 'building' + (unlocked ? '' : ' locked');
    div.innerHTML = `
      <div class="building-emoji">${b.emoji}</div>
      ${!unlocked ? '<div class="lock">🔒</div>' : ''}
      <div class="building-label">${b.name}${!unlocked ? ` · ${b.cost}🪙` : ''}</div>
      ${canAfford ? '<div class="badge">!</div>' : ''}
    `;
    if (!unlocked && canAfford) {
      div.onclick = () => {
        state.coin -= b.cost;
        state.unlockedBuildings += 1;
        state.level = Math.max(state.level, state.unlockedBuildings);
        saveState();
        updateTopbar();
        renderBuildings();
        renderBossLock();
        celebrate();
        toast(`🎉 解锁了 ${b.name}！`);
      };
    }
    el.appendChild(div);
  });
}

function renderPets() { /* 小宠物显示在收集册里，场景里主要是 99 */ }

function updateCounts() {
  ['chinese','math','english','thinking','ai'].forEach(sub => {
    const s = state.subjectStats[sub];
    $('#cnt-' + sub).textContent = `${s.right}题`;
  });
}

function renderBossLock() {
  const bossBtn = document.querySelector('[data-sub="boss"]');
  if (state.level >= 3) {
    bossBtn.classList.remove('locked');
    $('#cnt-boss').textContent = '挑战';
  } else {
    bossBtn.classList.add('locked');
    $('#cnt-boss').textContent = `Lv.${state.level}/3`;
  }
}

// ============================================================
// 【卡皮巴拉面板 UI】
// ============================================================
function openCapyPanel() {
  const c = state.capy;
  const stage = CAPY_STAGES[c.stage];
  $('#capyBig').textContent = c.sleeping ? '😴' : stage.emoji;
  $('#capyBig').className = 'capy-big' + (c.sleeping ? ' sleeping' : '');
  $('#bigHunger').style.width = c.hunger + '%';
  $('#bigMood').style.width = c.mood + '%';
  $('#bigEnergy').style.width = c.energy + '%';
  $('#bigIq').style.width = Math.min(100, c.iq/1.5) + '%';
  $('#bigHungerNum').textContent = Math.round(c.hunger);
  $('#bigMoodNum').textContent = Math.round(c.mood);
  $('#bigEnergyNum').textContent = Math.round(c.energy);
  $('#bigIqNum').textContent = Math.round(c.iq);
  renderCapyTab('feed');
  $('#capyOverlay').classList.add('active');
}

function renderCapyTab(tab) {
  document.querySelectorAll('.capy-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  const content = $('#capyTabContent');
  if (tab === 'feed') {
    content.innerHTML = '<div style="font-size:13px;margin-bottom:6px;color:var(--ink-soft)">拥有的食物：</div>';
    state.capy.ownedFood.forEach(id => {
      const food = CAPY_SHOP.food.find(f => f.id === id);
      if (!food) return;
      content.innerHTML += `
        <div class="shop-item">
          <span class="shop-emoji">${food.emoji}</span>
          <div class="shop-info">
            <div class="shop-name">${food.name}</div>
            <div class="shop-desc">${food.desc}</div>
          </div>
          <button onclick="feedCapy('${id}')">喂食</button>
        </div>
      `;
    });
  }
  else if (tab === 'toy') {
    content.innerHTML = '<div style="font-size:13px;margin-bottom:6px;color:var(--ink-soft)">玩具：</div>';
    if (state.capy.ownedToys.length === 0) {
      content.innerHTML += '<div style="text-align:center;padding:20px;color:var(--ink-soft);font-size:13px">还没有玩具，去商店买一个吧~</div>';
    } else {
      state.capy.ownedToys.forEach(id => {
        const toy = CAPY_SHOP.toys.find(t => t.id === id);
        if (!toy) return;
        content.innerHTML += `
          <div class="shop-item">
            <span class="shop-emoji">${toy.emoji}</span>
            <div class="shop-info">
              <div class="shop-name">${toy.name}</div>
              <div class="shop-desc">${toy.desc} · 心情 +${toy.mood}</div>
            </div>
            <button onclick="playCapy('${id}')">玩耍</button>
          </div>
        `;
      });
    }
  }
  else if (tab === 'sleep') {
    const c = state.capy;
    content.innerHTML = `
      <div style="text-align:center;padding:10px">
        <div style="font-size:40px">${c.sleeping ? '😴' : '🦫'}</div>
        <div style="margin:10px 0;font-size:14px">
          ${c.sleeping ? '99 正在呼呼大睡...' : '99 的体力：' + Math.round(c.energy) + '/100'}
        </div>
        <div style="font-size:12px;color:var(--ink-soft);margin-bottom:10px">
          ${c.sleeping ? '睡觉能恢复体力。' : c.energy < 50 ? '99 有点累了，让它睡一会儿吧~' : '99 精神饱满！'}
        </div>
        <button onclick="sleepCapy()" style="padding:10px 24px;background:linear-gradient(180deg,#d0b3ff,#8b5cf6);color:white;border:3px solid var(--ink);border-radius:12px;font-family:'ZCOOL KuaiLe';font-size:16px;cursor:pointer;box-shadow:0 4px 0 var(--ink);font-weight:700">
          ${c.sleeping ? '☀️ 叫醒 99' : '💤 让 99 睡觉'}
        </button>
      </div>
    `;
  }
  else if (tab === 'shop') {
    content.innerHTML = '';
    content.innerHTML += '<div style="font-size:13px;margin-bottom:4px;font-weight:700">🍖 食物</div>';
    CAPY_SHOP.food.forEach(f => {
      const owned = state.capy.ownedFood.includes(f.id);
      content.innerHTML += renderShopItem('food', f, owned);
    });
    content.innerHTML += '<div style="font-size:13px;margin:8px 0 4px;font-weight:700">🏠 住所</div>';
    CAPY_SHOP.shelter.forEach(s => {
      const owned = state.capy.ownedShelters.includes(s.id);
      const current = state.capy.currentShelter === s.id;
      content.innerHTML += renderShopItem('shelter', s, owned, current);
    });
    content.innerHTML += '<div style="font-size:13px;margin:8px 0 4px;font-weight:700">🎾 玩具</div>';
    CAPY_SHOP.toys.forEach(t => {
      const owned = state.capy.ownedToys.includes(t.id);
      content.innerHTML += renderShopItem('toy', t, owned);
    });
  }
}

function renderShopItem(type, item, owned, current) {
  const canBuy = !owned && state.coin >= item.cost;
  const btnText = current ? '使用中' : owned ? (type === 'shelter' ? '使用' : '已有') : `${item.cost}🪙`;
  const disabled = owned && type !== 'shelter';
  return `
    <div class="shop-item ${owned ? 'owned' : ''}">
      <span class="shop-emoji">${item.emoji}</span>
      <div class="shop-info">
        <div class="shop-name">${item.name}</div>
        <div class="shop-desc">${item.desc}</div>
      </div>
      <button ${!canBuy && !owned ? 'disabled' : ''} ${current ? 'disabled' : ''}
        onclick="${current ? '' : owned && type === 'shelter' ? `useShelter('${item.id}')` : `buyShopItem('${type}', '${item.id}')`}">
        ${btnText}
      </button>
    </div>
  `;
}

function useShelter(id) {
  state.capy.currentShelter = id;
  saveState();
  updateCapyUI();
  renderCapyTab('shop');
  toast('🏠 已切换住所');
}

// ============================================================
// 【家长中心】
// ============================================================
function openParentGate() {
  $('#gatePwd').value = '';
  $('#gateError').textContent = '';
  $('#parentGateOverlay').classList.add('active');
  setTimeout(() => $('#gatePwd').focus(), 100);
}

function checkParentPwd() {
  const pwd = $('#gatePwd').value;
  if (pwd === state.settings.parentPwd) {
    $('#parentGateOverlay').classList.remove('active');
    openParent();
  } else {
    $('#gateError').textContent = '密码错误，再试试？';
    $('#gatePwd').value = '';
  }
}

function openParent() {
  const acc = state.totalQs ? Math.round(state.totalRight / state.totalQs * 100) : 0;
  const indep = state.totalRight ? Math.round(state.indepRight / state.totalRight * 100) : 100;
  $('#pTotal').textContent = state.totalQs;
  $('#pAcc').textContent = acc + '%';
  $('#pTime').textContent = state.timeSpent + '分';
  $('#pToday').textContent = state.todayCount;
  $('#pDays').textContent = state.loginDays + '天';
  $('#pIndep').textContent = indep + '%';

  const sb = $('#skillBars');
  sb.innerHTML = '';
  Object.entries(SUBJECTS).forEach(([k, v]) => {
    if (k === 'boss') return;
    const s = state.subjectStats[k];
    const pct = s.total ? Math.round(s.right / s.total * 100) : 0;
    sb.innerHTML += `
      <div class="skill-row">
        <div class="name">${v.emoji} ${v.name}</div>
        <div class="bar-bg"><div class="bar" style="width:${pct}%"></div></div>
        <div class="pct">${s.right}/${s.total}</div>
      </div>
    `;
  });

  const weak = [];
  Object.entries(state.history).forEach(([key, h]) => {
    if (h.tries >= 1 && h.right / h.tries < 0.6) weak.push(h.topic);
    else if (h.tries >= 1 && h.hintMax >= 2) weak.push(h.topic);
  });
  const weakSet = [...new Set(weak)];
  const wl = $('#weakList');
  wl.innerHTML = weakSet.length === 0
    ? '<li style="background:#dcfce7;border-color:var(--right)">🎉 暂无明显薄弱点</li>'
    : weakSet.slice(0, 15).map(t => `<li>${t}</li>`).join('');

  const avgLevel = state.hintUsed ? (state.hintLevelSum / state.hintUsed).toFixed(1) : 0;
  $('#hintStats').innerHTML = `
    · 用过提示的题：${state.hintUsed} 次<br>
    · 平均提示深度：${avgLevel}/3 层<br>
    · 求助 AI 陪练：${state.aiCallsUsed} 次<br>
    · 独立答对率：${indep}%<br>
    · 建议：独立答对率 > 80% 可以加难度；< 50% 则多用提示和 AI 陪练引导。
  `;

  // 设置
  $('#setFocusLimit').checked = state.settings.focusLimit;
  $('#setAutoSpeak').checked = state.settings.autoSpeak;
  $('#setAIGen').checked = state.settings.aiGen;

  $('#parentOverlay').classList.add('active');
}

function resetAll() {
  if (!confirm('确定要清空所有数据吗？金币、进度、学习记录、99 都会重置。')) return;
  localStorage.removeItem('city66_state_v3');
  state = loadState();
  initDaily();
  updateAllUI();
  closeOverlay('parentOverlay');
  toast('已重置 ~ 重新开始啦！');
}

function exportData() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `66city_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('数据已导出~');
}

// ============================================================
// 【收集册】
// ============================================================
function openCollection() {
  const tl = $('#taskList');
  tl.innerHTML = '';
  state.dailyTasks.forEach(t => {
    tl.innerHTML += `
      <div class="task-item ${t.done ? 'done' : ''}">
        <span class="emo">${t.emo}</span>
        <span class="txt">${t.text}（${t.progress}/${t.goal}）</span>
        <span class="rwd">${t.done ? '✓' : '+' + t.reward + '🪙'}</span>
      </div>
    `;
  });

  const pc = $('#petCollection');
  pc.innerHTML = '';
  PETS.forEach((p, i) => {
    const got = state.unlockedPets.includes(i);
    pc.innerHTML += `
      <div class="pet-slot ${got ? '' : 'empty'}" title="${got ? p.name : `答对 ${p.unlockAt} 题解锁`}">
        ${got ? p.emoji : '?'}
      </div>
    `;
  });
  $('#petCount').textContent = state.unlockedPets.length;
  $('#petTotal').textContent = PETS.length;

  const bc = $('#bdCollection');
  bc.innerHTML = '';
  BUILDINGS.forEach((b, i) => {
    const got = i < state.unlockedBuildings;
    bc.innerHTML += `
      <div class="pet-slot ${got ? '' : 'empty'}" title="${got ? b.name : `${b.cost}🪙 解锁`}">
        ${got ? b.emoji : '?'}
      </div>
    `;
  });
  $('#bdCount').textContent = state.unlockedBuildings;
  $('#bdTotal').textContent = BUILDINGS.length;

  // 错题本
  const ml = $('#mistakeList');
  const recent = state.mistakes.slice(-10).reverse();
  if (recent.length === 0) {
    ml.innerHTML = '<div style="text-align:center;padding:10px;color:var(--ink-soft)">🎉 还没有错题哦~</div>';
  } else {
    ml.innerHTML = recent.map(m => `
      <div style="background:#fff;border:2px solid var(--ink);border-radius:8px;padding:6px 10px;margin-bottom:4px">
        <div style="font-weight:700">${SUBJECTS[m.subject] ? SUBJECTS[m.subject].emoji : ''} ${escapeHtml(m.q)}</div>
        <div style="color:var(--ink-soft);font-size:11px">正确答案：${escapeHtml(m.opts[m.a])} · ${m.topic}</div>
      </div>
    `).join('');
  }

  $('#collectionOverlay').classList.add('active');
}

// ============================================================
// 【特效 / 工具函数】
// ============================================================
function flyCoin(fromEl, amount) {
  const rect = fromEl.getBoundingClientRect();
  const coinRect = document.querySelector('.stat-chip.coin').getBoundingClientRect();
  for (let i = 0; i < Math.min(amount, 8); i++) {
    setTimeout(() => {
      const coin = document.createElement('div');
      coin.className = 'flying-coin';
      coin.textContent = '🪙';
      coin.style.left = (rect.left + rect.width/2) + 'px';
      coin.style.top = (rect.top + rect.height/2) + 'px';
      coin.style.setProperty('--dx', (coinRect.left + coinRect.width/2 - rect.left - rect.width/2) + 'px');
      coin.style.setProperty('--dy', (coinRect.top + coinRect.height/2 - rect.top - rect.height/2) + 'px');
      document.body.appendChild(coin);
      setTimeout(() => coin.remove(), 1000);
    }, i * 80);
  }
}

function celebrate() {
  const el = $('#celebrate');
  el.classList.add('show');
  el.innerHTML = '';
  const colors = ['#ffd23f','#ff8fab','#4ecdc4','#a78bfa','#ff6b6b','#6bbf59'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.animationDelay = (Math.random() * 0.5) + 's';
    c.style.animationDuration = (1.5 + Math.random()) + 's';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.appendChild(c);
  }
  setTimeout(() => el.classList.remove('show'), 2500);
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

function closeOverlay(id) { $('#' + id).classList.remove('active'); }
function $(sel) { return document.querySelector(sel); }
function pickRand(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ============================================================
// 【事件绑定 & 初始化】
// ============================================================
function updateAllUI() {
  updateTopbar();
  renderBuildings();
  renderPets();
  updateCounts();
  updateDailyStrip();
  renderBossLock();
  updateCapyUI();
}

function init() {
  // 等题库加载
  if (typeof QUESTION_BANK === 'undefined' || !QUESTION_BANK.chinese) {
    return setTimeout(init, 50);
  }
  capyTick();
  updateAllUI();

  // ---- 事件 ----
  document.querySelectorAll('.subject-btn').forEach(btn => {
    btn.addEventListener('click', () => startQuiz(btn.dataset.sub));
  });
  $('#closeQuiz').onclick = () => {
    if (confirm('确定退出本轮挑战吗？进度不会保存哦。')) {
      $('#quizOverlay').classList.remove('active');
      currentQuiz = null; stopSpeak();
    }
  };
  $('#nextBtn').onclick = nextQuestion;
  $('#againBtn').onclick = () => {
    $('#resultOverlay').classList.remove('active');
    if (currentQuiz && currentQuiz.subject !== 'boss') startQuiz(currentQuiz.subject);
    else startQuiz('chinese');
  };
  $('#homeBtn').onclick = () => {
    $('#resultOverlay').classList.remove('active');
    updateCounts(); updateDailyStrip();
  };
  $('#parentBtn').onclick = openParentGate;
  $('#collectionBtn').onclick = openCollection;
  $('#chatBtn').onclick = () => $('#chatOverlay').classList.add('active');
  $('#dailyStrip').onclick = openCollection;

  $('#hintBtn').onclick = () => {
    $('#hintBtn').classList.add('active');
    setTimeout(() => $('#hintBtn').classList.remove('active'), 400);
    showNextHint();
  };
  $('#speakBtn').onclick = () => {
    $('#speakBtn').classList.add('active');
    setTimeout(() => $('#speakBtn').classList.remove('active'), 400);
    if (!currentQuiz) return;
    const q = currentQuiz.questions[currentQuiz.idx];
    // 英语题整句用英语发音；其他题走智能分段（中文念中文、英文念英文）
    speak(q.q, q._subject === 'english' ? 'en-US' : 'zh-CN');
    // 其实上面一行：传 'zh-CN' 会自动触发智能分段，英语单词会用英语念
  };
  $('#aiBtn').onclick = () => {
    $('#aiBtn').classList.add('active');
    setTimeout(() => $('#aiBtn').classList.remove('active'), 400);
    askAiTutor();
  };

  // 家长密码
  $('#gateSubmit').onclick = checkParentPwd;
  $('#gatePwd').addEventListener('keypress', e => {
    if (e.key === 'Enter') checkParentPwd();
  });

  // 卡皮巴拉
  $('#capySprite').onclick = openCapyPanel;
  $('#capyPanel').onclick = openCapyPanel;
  document.querySelectorAll('.capy-tab').forEach(t => {
    t.onclick = () => renderCapyTab(t.dataset.tab);
  });

  // AI 游戏
  $('#aiGameReset').onclick = startAiGame;

  // 聊天
  $('#chatSend').onclick = sendChatMessage;
  $('#chatInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // 设置
  $('#setFocusLimit').onchange = e => { state.settings.focusLimit = e.target.checked; saveState(); };
  $('#setAutoSpeak').onchange = e => { state.settings.autoSpeak = e.target.checked; saveState(); };
  $('#setAIGen').onchange = e => { state.settings.aiGen = e.target.checked; saveState(); };
  $('#setPwdBtn').onclick = () => {
    const newPwd = $('#setPwd').value;
    if (!/^\d{4}$/.test(newPwd)) { toast('密码必须是 4 位数字'); return; }
    state.settings.parentPwd = newPwd;
    saveState();
    $('#setPwd').value = '';
    toast('密码已更新');
  };
  $('#exportBtn').onclick = exportData;

  // 遮罩关闭
  ['parentOverlay','collectionOverlay','capyOverlay','aigameOverlay','chatOverlay','parentGateOverlay','focusOverlay'].forEach(id => {
    $('#' + id).onclick = (e) => {
      if (e.target.id === id) $('#' + id).classList.remove('active');
    };
  });

  // 定期更新 99 状态（每 30 秒）
  setInterval(() => {
    capyTick();
    updateCapyUI();
  }, 30000);

  // 欢迎
  if (state.totalQs === 0) {
    setTimeout(() => toast('👋 你好泽宇！99 在等你一起冒险~'), 500);
  } else if (state.loginDays > 1) {
    setTimeout(() => toast(`🎉 连续第 ${state.loginDays} 天来啦！`), 500);
  }

  // 暴露给全局（HTML 里的 onclick 用）
  window.closeOverlay = closeOverlay;
  window.resetAll = resetAll;
  window.feedCapy = feedCapy;
  window.playCapy = playCapy;
  window.sleepCapy = sleepCapy;
  window.buyShopItem = buyShopItem;
  window.useShelter = useShelter;
  window.startAiGame = startAiGame;
}

document.addEventListener('DOMContentLoaded', init);
