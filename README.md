# 算法同桌 / ALGORITHM DESKMATE

一套可直接打开浏览的静态网站：关于中学生如何使用 AI、如何判断它，以及一次发生在社区里的数字素养实践。入口是一段原创开屏动画，进入后是 27 个内容页 + 1 个 404 错误页。

## 1. 怎么打开

最简单的方式：双击根目录的 `index.html`，播放开屏动画，点击“点击进入”后直接进入主站；主站首页是 `home.html`。

如果浏览器对本地文件限制较多，建议在网站目录中启动一个本地服务器：

```powershell
cd "D:\dhs work\algorithm-deskmate"
python -m http.server 8080
```

然后访问 `http://127.0.0.1:8080/`（开屏动画）或 `http://127.0.0.1:8080/home.html`（直接进入主站）。

- 推荐浏览器：Chrome / Edge / Safari 最新版
- 推荐分辨率：1024 × 768 及以上
- 全站无外部依赖、无统计脚本、无 Cookie

## 2. 目录

```
algorithm-deskmate/
├─ index.html                 开屏动画（正式入口）
├─ intro.html                 开屏动画源文件（与 index.html 相同）
├─ home.html                  主站首页
├─ about.html  method.html   项目缘起 / 研究协议
├─ map.html  dashboard.html  使用星图 / 数据仪表盘
├─ personas.html  log.html   五种类型 / 30天日志
├─ voices.html               访谈索引
├─ interview-li.html         李同学：第二大脑
├─ interview-chen.html       陈同学：不使用的理由
├─ interview-zhou.html       周老师：备课边界
├─ interview-grandma.html    王奶奶：第一次对话
├─ roundtable.html           教师圆桌
├─ prompt.html               提问实验室
├─ hallucination.html        幻觉博物馆
├─ factcheck.html            核查挑战
├─ offline.html              无 AI 日
├─ rules.html                诚信红绿灯
├─ community.html            社区数字课堂
├─ charter.html              班级公约
├─ future.html               2035 教室
├─ proposal.html             给学校的提案
├─ toolkit.html              田野工具箱
├─ resources.html            开放资源
├─ quiz.html                 AI 学习者测试
├─ guestbook.html            留言与共创
├─ credits.html              版权与致谢
├─ 404.html                  错误页
├─ assets/
│  ├─ css/                   设计系统（signal.css = 开屏同款主题）
│  ├─ js/                    交互与搜索索引
│  ├─ img/                   图标、分享封面、工程图纸线稿
│  └─ downloads/             可下载模板 / 示范数据
└─ sitemap.txt
```

## 3. 重要说明：数据是演示样本

**问卷比例、访谈引语、30 天日志、社区前后测均为构造样本，不是真实调研结果。** 人物均为化名，部分情节为典型化处理。这样处理是为了让作品可以直接运行、展示完整交互，而不暴露任何真实个人信息。

用于正式提交前，建议：

1. 把 `credits.html` 与 `method.html` 中的“演示数据”说明改成你真实的研究说明；
2. 把第 3 节里的团体署名替换为你自己的署名；
3. 用真实数据替换 `dashboard.html` / `interactive.js` 中的 `DASH` 数据、`log` 数据，以及 `assets/downloads/survey-sample.csv`；
4. 重新取得访谈对象的知情同意，并检查是否有可识别信息；
5. 如果图片或声音全部为代码生成，可以保留 `credits.html` 中的说明。

## 4. 如何改署名

搜索并替换以下文本：

- `第七排观察组` → 你的姓名 / 小组名
- `某市 · 校园与南园社区` → 你的学校 / 社区（如果愿意公开）
- `2025—2026` / `2026.11.12` → 你的项目时间
- `高二（7）班` → 你的班级

主要出现在：

- `home.html` 页脚 / 首页 hero
- `index.html` 与 `intro.html` 开屏页
- `about.html`、`method.html`
- `credits.html`
- 各页面页脚

## 5. 主要交互

| 页面 | 交互 |
|---|---|
| `dashboard.html` | 按年级切换数据，图表与结论同步更新 |
| `map.html` | 点击使用星图节点，查看场景、数据与访谈引语 |
| `personas.html` | 切换五种 AI 学习者类型 |
| `log.html` | 点击 30 天日历中的任意一天，查看当天日志 |
| `prompt.html` | 三个提示词对照案例 + 提示词生成器 |
| `hallucination.html` | 展开三件“幻觉标本”的错误分析 |
| `factcheck.html` | 5 题核查情境挑战，即时反馈与计分 |
| `offline.html` | 拖动 24 小时时间轴，查看无 AI 日记录 |
| `rules.html` | 六个情境的红黄绿灯判断 |
| `charter.html` | 勾选公约、签名、生成可打印的签署凭证（localStorage） |
| `future.html` | 四个变量组合出 81 种 2035 教室场景，可随机生成 |
| `quiz.html` | 6 题 AI 学习者测试，生成结果卡片文案 |
| `guestbook.html` | 本地留言、心情筛选、生成明信片 PNG（localStorage） |
| 全站 | 深色 / 浅色主题、站内搜索（`/` 或 `Ctrl+K`）、阅读进度、键盘导航 |

所有留言、签署、测试与清单状态只保存在浏览器 `localStorage` 中，不会上传。

## 6. 无障碍与打印

- 语义化标题、跳转链接、可见焦点、ARIA 标签
- 尊重 `prefers-reduced-motion`
- 支持键盘操作（导航、搜索、测试、公约）
- `charter.html` 与 `proposal.html` 支持打印 / 保存 PDF
- 在 1024px 宽度下采用双栏 / 侧栏布局，移动端自动单栏

## 7. 技术

纯 HTML + CSS + 原生 JavaScript。无框架、无构建依赖、无后端、无外部字体。
设计中的图形、网格、抽象肖像均由 CSS / SVG / Canvas 生成。

## 8. 许可

原创文字、图形与代码采用 **CC BY-NC-SA 4.0** 许可：允许非商业性复制、改编与分享，需署名并以相同方式共享。

外部资源链接仅作阅读推荐，版权归原发布者所有。
## 开屏动画

正式入口：[index.html](index.html)  
源文件：[intro.html](intro.html)（与 `index.html` 相同）

- 直接打开即可自动播放（约 4 秒加载），结束后点击进入主站；也可以跳过。
- 动画风格参考了工业图纸、青色遮片、巨型字标与仪表盘加载，但所有图形、文案和代码均为原创，没有使用参考站素材或 Logo。
- 全站视觉已切换为开屏同款的“信号青 / 工程图纸”主题；主站仍保留深色 / 浅色切换，浅色模式使用冷色实验纸风格。
- 开屏不再经过中间落地页，点击“进入”或“跳过”都直达主站；转场是从右向左的整屏擦入，进入首页后遮片继续向左退出。
