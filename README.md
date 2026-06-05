# 66 的城市 🏙️🦫

> 为 7 岁男孩周泽宇（小名 66）定制的学习应用
> 陪伴他和卡皮巴拉 99 一起成长

![version](https://img.shields.io/badge/version-0.3.0-brightgreen)
![age](https://img.shields.io/badge/age-7%20years-blue)
![stack](https://img.shields.io/badge/stack-Node.js%20+%20Vanilla%20JS-orange)

---

## 🎯 这是什么

一个游戏化的学习网页应用，把一年级的学习内容做成可爱、好玩、有成就感的"城市建造 + 宠物养成"游戏。

### 核心功能

- **📚 5 大学科**：语文、数学、英语、思维、AI 启蒙，共 196+ 道精选题
- **💡 分层提示**：每题有 3 层提示（引导→例子→讲解），家长友好
- **🤖 Claude AI 陪练**：答错时 AI 用苏格拉底式引导，不直接给答案
- **🎮 AI 启蒙游戏**："教 AI 认水果" 让孩子亲手训练 AI，理解原理
- **🦫 卡皮巴拉 99**：喂食、玩耍、睡觉，答题时 99 也变聪明
- **🏙️ 城市建造**：8 级建筑，从小木屋到火箭
- **🐾 12 只收集宠物**：累计答对数解锁
- **👑 大挑战**：跨学科 Boss 关卡
- **📊 家长中心**：数据飞轮、薄弱点、提示使用分析（密码保护）
- **⏰ 专注控制**：20 分钟提醒休息
- **🔊 智能朗读**：英语题自动朗读，不认识的字一键朗读

---

## 📁 项目结构

```
66city-v03/
├── server.js           # Node.js 后端（Claude API 代理）
├── package.json        # Node 项目配置
├── .replit             # Replit 配置
├── replit.nix          # Replit 环境
├── .gitignore          # Git 忽略
├── .env.example        # 环境变量示例
├── README.md           # 本文档
└── public/
    ├── index.html      # 主页面
    ├── styles.css      # 样式
    ├── app.js          # 主逻辑
    └── questions.js    # 题库
```

---

## 🚀 一、推送到 GitHub

### 第一次创建仓库

**1. 在 GitHub 上创建新仓库**
- 登录 https://github.com
- 右上角 `+` → `New repository`
- 仓库名：`66city`（或任意名字）
- **不要勾选** "Add a README"、"Add .gitignore" 等
- 点击 `Create repository`

**2. 在本地推送**

打开终端，`cd` 进这个项目目录，依次运行：

```bash
# 初始化 Git 仓库
git init

# 把所有文件加入暂存
git add .

# 第一次提交
git commit -m "Initial commit: 66city v0.3"

# 设置主分支名为 main
git branch -M main

# 关联到你的 GitHub 仓库（把 YOUR_USERNAME 换成你的）
git remote add origin https://github.com/YOUR_USERNAME/66city.git

# 推送
git push -u origin main
```

> 💡 如果提示要输入密码，GitHub 已经不支持密码推送了，需要用 **Personal Access Token**。  
> 生成方法：GitHub 右上角头像 → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → 勾选 `repo` 权限。  
> 生成的 token 当成密码用。

### 以后更新代码

```bash
git add .
git commit -m "更新：描述你改了什么"
git push
```

---

## 🌐 二、在 Replit 上部署

**1. 登录 Replit**

打开 https://replit.com ，登录或注册（可以用 GitHub 账号）。

**2. 导入仓库**

- 点击右上角 `Create Repl`
- 选择 `Import from GitHub`
- 粘贴你的仓库地址（如 `https://github.com/YOUR_USERNAME/66city`）
- 点击 `Import from GitHub`

Replit 会自动识别这是个 Node.js 项目。

**3. 设置 API Key（重要）**

- 在左侧工具栏点击 `🔒 Secrets` （或 Tools → Secrets）
- 添加一个新 Secret：
  - Key: `ANTHROPIC_API_KEY`
  - Value: 你的 Claude API key（从 https://console.anthropic.com/settings/keys 获取）
- 点击 `Add Secret`

> ⚠️ **千万不要**把 API key 写进代码里提交到 GitHub！Secrets 是安全的，永远不会被看到。

**4. 运行**

- 点击顶部绿色的 `▶ Run` 按钮
- Replit 会自动开始运行
- 首次运行会看到：
  ```
  ╔══════════════════════════════════════════╗
  ║   66的城市 · 后端服务已启动               ║
  ║   API Key: ✓ 已配置                       ║
  ╚══════════════════════════════════════════╝
  ```

**5. 访问**

- Replit 会给你一个 URL，类似 `https://66city.你的用户名.repl.co`
- 打开这个 URL，就能玩了！
- 把链接发给家里的手机/Pad，66 随时可以玩

**6. 保持在线（可选）**

- 免费 Replit 闲置一段时间会睡眠。首次访问会冷启动几秒。
- 如果想永远在线，可以升级到 Hacker 套餐，或者用 UptimeRobot 定时 ping 你的 URL。

---

## 🔑 三、Claude API Key

### 如何获取

1. 访问 https://console.anthropic.com/
2. 注册/登录
3. 左侧 `API Keys` → `Create Key`
4. 复制生成的 key（`sk-ant-...`）

### 费用

- 首次注册有免费额度，够玩很久
- 后续按用量计费，非常便宜：
  - Claude Sonnet 4.5 价格约 $3/百万 input tokens
  - 一次 AI 陪练/聊天大约几分钱
  - 66 一天玩一小时，估计 1-2 块钱人民币
- 限额设置：在 Anthropic 控制台可以设置每月花费上限，防超支

### 不配置 key 行吗？

可以！代码里做了降级：
- AI 陪练会显示"离线模式"，但提示功能正常
- AI 游戏"教认水果"照样能玩（本地模拟）
- 所有学习内容、99、城市建造都不受影响

---

## 🔧 四、本地开发

如果你想在本地电脑上运行测试：

```bash
# 安装 Node.js（如果没有）
# macOS: brew install node
# Windows: https://nodejs.org 下载安装

# 进入项目
cd 66city-v03

# 直接运行
node server.js

# 打开浏览器访问
# http://localhost:3000
```

要用 AI 陪练，创建 `.env` 文件（参考 `.env.example`）：

```bash
cp .env.example .env
# 编辑 .env，填入 ANTHROPIC_API_KEY
```

然后改 `server.js` 开头，添加：

```javascript
require('dotenv').config();  // 需要先 npm install dotenv
```

或者用 shell 环境变量：

```bash
ANTHROPIC_API_KEYANTHROPIC_API_KEYREPLACE_ME
```

---

## 🎨 五、自定义

### 修改家长密码
在应用里的 `家长中心 → 设置` 里可以改。默认是 `0417`（66 的生日）。

### 添加新题
编辑 `public/questions.js`，按照现有格式添加：

```javascript
{ q: '题目', opts: ['A','B','C','D'], a: 0,
  topic: '知识点',
  hints: ['第1层引导','第2层举例','第3层讲解'],
  tip: '答对后的小知识' },
```

### 调整 99 的属性
编辑 `public/app.js` 里的：
- `CAPY_DECAY_PER_HOUR`：饥饿/心情/体力每小时衰减速度
- `CAPY_SHOP`：商店里的食物、住所、玩具
- `CAPY_STAGES`：99 的成长阶段

---

## 📝 版本历史

### v0.3.0（当前）
- ✨ 加入 Claude AI 陪练（苏格拉底式引导）
- ✨ 新增卡皮巴拉 99 养成系统
- ✨ 新增 AI 启蒙游戏"教 AI 认水果"
- ✨ 新增 AI 自由聊天功能
- ✨ 新增错题本、专注时长控制
- ✨ 新增家长密码保护
- ✨ 支持 AI 动态生成题目
- ✨ 拆分为独立前后端架构

### v0.2.0
- ✨ 题库从 34 扩展到 196 题
- ✨ 三层提示系统
- ✨ 5 大学科（含 AI 启蒙）
- ✨ 每日任务、连续打卡、12 只收集宠物

### v0.1.0
- ✨ 基础城市建造 + 答题框架

---

## 🙏 致谢

- [Anthropic Claude](https://www.anthropic.com/) —— AI 陪练能力
- [Replit](https://replit.com/) —— 快速部署
- 📚 参考教学法：Khan Academy 精熟学习、Duolingo 心流、芬兰现象式学习、苏格拉底式引导

---

## 💬 反馈

66 喜欢吗？有什么想加的功能？告诉我~

让我们陪 66 一起快乐成长 🌱
