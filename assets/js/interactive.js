/* =========================================================
   ALGORITHM DESKMATE — page-specific interactions
   Dashboard · map · personas · log · prompt · games · future
   charter · toolkit · quiz · guestbook
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toast = (msg) => window.ADM && window.ADM.toast ? window.ADM.toast(msg) : null;
  const copyText = (text) => window.ADM && window.ADM.copyText ? window.ADM.copyText(text) : Promise.resolve(false);

  /* =========================================================
     DASHBOARD
     ========================================================= */
  const DASH = {
    all: {
      label: "全体样本", n: 312, weekly: 61, daily: 23, rules: 39, undisclosed: 47,
      freq: [61, 39, 24],
      purposes: [["资料搜索", 83], ["概念理解", 74], ["作业检查", 61], ["写作润色", 57], ["创意生成", 48], ["直接生成答案", 33], ["口语练习", 22]],
      trust: [4, 27, 51, 16, 2],
      insight: "全体样本中，<b>资料搜索（83%）</b>和<b>概念理解（74%）</b>是最常见的使用方式；但只有 <b>39%</b> 的同学会经常回到原始来源核对。使用率与核查率之间，存在一道明显的缝。"
    },
    g1: {
      label: "高一 / N=104", n: 104, weekly: 58, daily: 19, rules: 36, undisclosed: 44,
      freq: [58, 34, 19],
      purposes: [["资料搜索", 81], ["概念理解", 70], ["作业检查", 57], ["写作润色", 49], ["创意生成", 52], ["直接生成答案", 35], ["口语练习", 24]],
      trust: [5, 24, 52, 17, 2],
      insight: "高一组的<b>创意生成（52%）</b>高于全体平均，但<b>规则认知（36%）</b>最低。刚进入高中的学生更愿意尝试，也更容易在规则真空中摸索。"
    },
    g2: {
      label: "高二 / N=112", n: 112, weekly: 64, daily: 26, rules: 38, undisclosed: 50,
      freq: [64, 42, 26],
      purposes: [["资料搜索", 85], ["概念理解", 78], ["作业检查", 63], ["写作润色", 61], ["创意生成", 47], ["直接生成答案", 36], ["口语练习", 21]],
      trust: [3, 29, 51, 15, 2],
      insight: "高二组的使用深度最高：<b>64%</b> 每周使用，<b>50%</b> 有过未标注的 AI 参与。这未必意味着更不诚实，可能是任务变难、时间压力变大之后的策略选择。"
    },
    g3: {
      label: "高三 / N=96", n: 96, weekly: 62, daily: 25, rules: 44, undisclosed: 42,
      freq: [62, 41, 25],
      purposes: [["资料搜索", 82], ["概念理解", 72], ["作业检查", 65], ["写作润色", 58], ["创意生成", 41], ["直接生成答案", 30], ["口语练习", 19]],
      trust: [5, 28, 49, 16, 2],
      insight: "高三组的规则认知（44%）相对最高，直接生成答案（30%）相对最低。面对考试压力，学生反而更在意“怎么用才不算越界”，但核查率仍然只有四成左右。"
    }
  };

  function initDashboard() {
    const bars = $("#purpose-bars");
    if (!bars) return;
    const buttons = $$("[data-grade]");
    const statWeekly = $('[data-dash-stat="weekly"]');
    const statDaily = $('[data-dash-stat="daily"]');
    const statRules = $('[data-dash-stat="rules"]');
    const statUndisclosed = $('[data-dash-stat="undisclosed"]');
    const donut = $("#trust-donut");
    const legend = $("#trust-legend");
    const gauges = $("#freq-gauges");
    const insight = $("#dash-insight");
    const scopeLabel = $("#dash-scope-label");

    function render(key) {
      const d = DASH[key] || DASH.all;
      bars.innerHTML = d.purposes.map(([label, value]) => (
        `<div class="bar-row${value >= 80 ? " is-highlight" : ""}">
          <span class="bar-row__label">${label}</span>
          <span class="bar-track"><i class="bar-fill" style="width:${value}%"></i></span>
          <span class="bar-row__value">${value}%</span>
        </div>`
      )).join("");
      if (statWeekly) statWeekly.innerHTML = `${d.weekly}<small>%</small>`;
      if (statDaily) statDaily.innerHTML = `${d.daily}<small>%</small>`;
      if (statRules) statRules.innerHTML = `${d.rules}<small>%</small>`;
      if (statUndisclosed) statUndisclosed.innerHTML = `${d.undisclosed}<small>%</small>`;
      if (donut) {
        donut.style.setProperty("--p1", d.trust[0]);
        donut.style.setProperty("--p2", d.trust[1]);
        donut.style.setProperty("--p3", d.trust[2]);
        donut.style.setProperty("--p4", d.trust[3]);
        donut.style.setProperty("--p5", d.trust[4]);
        const center = $(".donut__center", donut);
        if (center) center.innerHTML = `<b>${d.trust[2]}%</b><span>半信半疑</span>`;
      }
      if (legend) {
        const labels = ["完全信任", "比较信任", "半信半疑", "不太信任", "完全不信"];
        legend.innerHTML = d.trust.map((value, i) => (
          `<div class="legend-row"><span><i></i>${labels[i]}</span><b>${value}%</b></div>`
        )).join("");
      }
      if (gauges) {
        const labels = ["每周使用", "经常核对来源", "使用后会标注"];
        gauges.innerHTML = d.freq.map((value, i) => (
          `<div class="gauge"><div class="gauge__ring" style="--v:${value}"><b>${value}<small>%</small></b></div><div class="gauge__label">${labels[i]}</div></div>`
        )).join("");
      }
      if (insight) insight.innerHTML = `<div class="insight-box__label">AUTO READING / ${d.label}</div><p>${d.insight}</p>`;
      if (scopeLabel) scopeLabel.textContent = d.label;
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        render(btn.getAttribute("data-grade"));
      });
    });
    render("all");
  }

  /* =========================================================
     USAGE MAP
     ========================================================= */
  const MAP = {
    search: {
      no: "NODE 01", title: "资料搜索", en: "SEARCH & RETRIEVE", pct: 83,
      desc: "把 AI 当作“可以追问的搜索框”。最常见的行为是查一个概念、找一个例子，或让 AI 把长材料压缩成三句话。",
      quote: "“搜索至少会给我一排链接，AI 直接给我一个答案。爽，但我会忘了它可能没来源。”",
      cite: "李同学 / 访谈 01", a: "39%", al: "会进一步核对原始来源", b: "2.4×", bl: "比手动搜索更快（自报）",
      link: "查看相关风险", href: "hallucination.html", group: "learn"
    },
    concept: {
      no: "NODE 02", title: "概念理解", en: "EXPLAIN THE WHY", pct: 74,
      desc: "要求 AI 换一种说法、提供类比或逐步解释。这是最接近“学习”的场景，也最容易产生“看懂了”的错觉。",
      quote: "“它讲得比老师还清楚。但关掉屏幕，我发现自己讲不出来。”",
      cite: "陈同学 / 访谈 02", a: "58%", al: "会用费曼技巧复述", b: "3.1×", bl: "比查书更快得到解释",
      link: "去提问实验室", href: "prompt.html", group: "learn"
    },
    homework: {
      no: "NODE 03", title: "作业检查", en: "CHECK & VERIFY", pct: 61,
      desc: "在完成作业后，让 AI 检查计算、语法或推理。关键区别在于：是检查你已经写下的内容，还是让它从零开始。",
      quote: "“我一般先写完再给它看，不然它会替我把整道题都做了。”",
      cite: "何老师 / 教师圆桌", a: "42%", al: "会核对 AI 修改的理由", b: "11 次", bl: "日志中发现 AI 错误",
      link: "查看核查清单", href: "toolkit.html", group: "learn"
    },
    writing: {
      no: "NODE 04", title: "写作润色", en: "REWRITE & POLISH", pct: 57,
      desc: "从改语法、调节奏，到生成整段文字。越靠近“表达自我”的任务，使用率不一定最高，但愧疚与争议最集中。",
      quote: "“它写得比我好，但我读的时候觉得：它比我更像我。”",
      cite: "陈同学 / 访谈 02", a: "24%", al: "会主动标注 AI 参与", b: "44%", bl: "使用过 AI 写作文",
      link: "阅读诚信边界", href: "rules.html", group: "make"
    },
    create: {
      no: "NODE 05", title: "创意生成", en: "IDEATE & REMIX", pct: 48,
      desc: "让它给标题、故事开头、海报文案、不同的解题视角。使用者的满意度往往较高，但“创意属于谁”也更难回答。",
      quote: "“我把它当合著者。它给怪点子，我负责判断哪个能留下。”",
      cite: "创作派 / 类型访谈", a: "52%", al: "会把 AI 想法再次改写", b: "2.8 / 5", bl: "自评原创感（1—5）",
      link: "参观 2035 教室", href: "future.html", group: "make"
    },
    oral: {
      no: "NODE 06", title: "口语练习", en: "SPEAK & REPEAT", pct: 22,
      desc: "和 AI 进行低压力对话、模拟面试、纠正发音。使用率最低，但使用者满意度最高，因为它提供了一种课堂里稀缺的“不尴尬的重复”。",
      quote: "“跟它说错十遍也没关系。它不会笑我，也不会打断我。”",
      cite: "高二学生 / 问卷开放题", a: "4.2 / 5", al: "使用者满意度", b: "22%", bl: "最近一个月使用过",
      link: "查看 30 天日志", href: "log.html", group: "life"
    }
  };

  function initMap() {
    const stage = $(".orbit-stage");
    if (!stage) return;
    const nodes = $$("[data-node]");
    const fields = {
      no: $(".map-inspect__top span:first-child"),
      title: $("#map-title"), en: $("#map-en"), pct: $("#map-pct"), desc: $("#map-desc"),
      quote: $("#map-quote"), cite: $("#map-cite"), a: $("#map-stat-a"), b: $("#map-stat-b"),
      link: $("#map-link"), al: $(".map-inspect__stats div:first-child span"),
      bl: $(".map-inspect__stats div:last-child span")
    };
    function select(key) {
      const d = MAP[key];
      if (!d) return;
      nodes.forEach((node) => {
        const active = node.getAttribute("data-node") === key;
        node.classList.toggle("is-active", active);
        node.setAttribute("aria-pressed", String(active));
      });
      if (fields.no) fields.no.textContent = `${d.no} / ACTIVE`;
      if (fields.title) fields.title.textContent = d.title;
      if (fields.en) fields.en.textContent = d.en;
      if (fields.pct) fields.pct.innerHTML = `${d.pct}<small>% / 使用率</small>`;
      if (fields.desc) fields.desc.textContent = d.desc;
      if (fields.quote) fields.quote.firstChild ? fields.quote.firstChild.textContent = d.quote : fields.quote.textContent = d.quote;
      if (fields.cite) fields.cite.textContent = d.cite;
      if (fields.a) fields.a.textContent = d.a;
      if (fields.b) fields.b.textContent = d.b;
      if (fields.al) fields.al.textContent = d.al;
      if (fields.bl) fields.bl.textContent = d.bl;
      if (fields.link) {
        fields.link.textContent = d.link;
        fields.link.setAttribute("href", d.href);
      }
    }
    nodes.forEach((node) => {
      node.addEventListener("click", () => select(node.getAttribute("data-node")));
    });
    $$("[data-map-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("[data-map-filter]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const filter = btn.getAttribute("data-map-filter");
        let firstVisible = null;
        nodes.forEach((node) => {
          const key = node.getAttribute("data-node");
          const show = filter === "all" || (MAP[key] && MAP[key].group === filter);
          node.hidden = !show;
          if (show && !firstVisible) firstVisible = node;
        });
        if (firstVisible) select(firstVisible.getAttribute("data-node"));
      });
    });
    select("search");
  }

  /* =========================================================
     PERSONAS
     ========================================================= */
  const PERSONAS = {
    operator: {
      code: "TYPE 01", name: "工具派", en: "THE OPERATOR / 效率优先", pct: 31, initial: "T", tone: "cyan",
      quote: "“会用的人，不是问得更少，而是知道下一步该问什么。”",
      desc: "把 AI 当作一组可以组合的工具：查词、拆题、做提纲、生成练习。最在意的是“有没有解决问题”，不太纠结工具本身。通常有稳定的使用流程，但核查往往取决于时间压力。",
      traits: [["效率", 88], ["核查", 62], ["依赖", 55], ["创造", 50], ["规则", 44]],
      saying: "“先让它跑一遍，错了我再改。”",
      risk: "把“完成”误认为“学会”。流程越顺，越不容易发现某个步骤已经被跳过。"
    },
    auditor: {
      code: "TYPE 02", name: "怀疑派", en: "THE AUDITOR / 先证明再相信", pct: 18, initial: "A", tone: "orange",
      quote: "“我不怕它错。我怕我不查。”",
      desc: "对 AI 的输出保持距离，习惯交叉核对。不是不用，而是用得谨慎。往往愿意花时间找原始来源，也更容易看见模型在哪些地方“过于确定”。",
      traits: [["效率", 55], ["核查", 92], ["依赖", 24], ["创造", 45], ["规则", 78]],
      saying: "“给我来源，不然我先当它不存在。”",
      risk: "过度警惕也可能错过有效帮助；如果所有时间都花在验证上，学习可能变成无休止的防守。"
    },
    passenger: {
      code: "TYPE 03", name: "依赖派", en: "THE PASSENGER / 先问它再说", pct: 22, initial: "P", tone: "violet",
      quote: "“它都这么说，应该没错吧？”",
      desc: "习惯先打开 AI，再开始思考。它像一个随时在线的同桌：温柔、迅速、从不嫌你问题多。便利是真实的，但使用者可能越来越难忍受“不知道”的空白。",
      traits: [["效率", 72], ["核查", 28], ["依赖", 90], ["创造", 36], ["规则", 25]],
      saying: "“没有它，我可能连开头都写不出来。”",
      risk: "把判断交给一个不会为结果负责的系统。最危险的不是它答错，而是你不再确认。"
    },
    remixer: {
      code: "TYPE 04", name: "创作派", en: "THE REMIXER / 把 AI 当合著者", pct: 17, initial: "R", tone: "signal",
      quote: "“它给怪点子，我负责判断哪个能留下。”",
      desc: "喜欢用 AI 扩展表达：让诗句变怪、让故事分叉、让设计多出几个方向。不把生成结果当终稿，而是当作素材与碰撞对象。通常有较强的编辑意识。",
      traits: [["效率", 65], ["核查", 50], ["依赖", 47], ["创造", 88], ["规则", 52]],
      saying: "“这一版太像机器了，我们再把它弄脏一点。”",
      risk: "创意生成很容易滑向“拼贴”：看起来新颖，却没有自己的经验与判断。"
    },
    diplomat: {
      code: "TYPE 05", name: "规则派", en: "THE DIPLOMAT / 边界清楚才安心", pct: 12, initial: "D", tone: "cyan",
      quote: "“先问清楚规则，再决定怎么用。”",
      desc: "关注边界、公平与责任。会主动询问老师的要求，也愿意在班级里讨论规则。不是最保守的人，但希望使用是透明的、可解释的。",
      traits: [["效率", 60], ["核查", 75], ["依赖", 38], ["创造", 58], ["规则", 94]],
      saying: "“可以讨论，但要先把它说出来。”",
      risk: "把规则当作免责声明；有了标注，并不意味着内容就一定经过了自己的思考。"
    }
  };

  function portraitMarkup(initial, tone, caption) {
    return `<div class="signal-portrait signal-portrait--${tone}" aria-hidden="true">
      <span class="sp-orbit"></span><div class="sp-bars"><i></i><i></i><i></i><i></i></div>
      <span class="sp-initial">${initial}</span>
      <span class="sp-caption"><span>${caption}</span><span>SYNTHETIC PORTRAIT</span></span>
    </div>`;
  }

  function initPersonas() {
    const stage = $("#persona-stage");
    if (!stage) return;
    const buttons = $$("[data-persona]");
    const fields = {
      portrait: $("#persona-portrait"), code: $("#persona-code"), name: $("#persona-name"),
      en: $("#persona-en"), pct: $("#persona-pct"), quote: $("#persona-quote"),
      desc: $("#persona-desc"), traits: $("#persona-traits"), saying: $("#persona-saying"),
      risk: $("#persona-risk")
    };
    function select(key) {
      const d = PERSONAS[key];
      if (!d) return;
      buttons.forEach((btn) => {
        const active = btn.getAttribute("data-persona") === key;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
      if (fields.portrait) fields.portrait.innerHTML = portraitMarkup(d.initial, d.tone, `PERSONA ${d.code.replace("TYPE ", "")} | ${d.name}`);
      if (fields.code) fields.code.textContent = d.code;
      if (fields.name) fields.name.textContent = d.name;
      if (fields.en) fields.en.textContent = d.en;
      if (fields.pct) fields.pct.textContent = `${d.pct}%`;
      if (fields.quote) fields.quote.textContent = d.quote;
      if (fields.desc) fields.desc.textContent = d.desc;
      if (fields.traits) fields.traits.innerHTML = d.traits.map(([label, value]) => (
        `<div class="persona-trait"><span>${label}</span><span class="pt-bar"><i style="width:${value}%"></i></span><span class="pt-val">${value}</span></div>`
      )).join("");
      if (fields.saying) fields.saying.textContent = d.saying;
      if (fields.risk) fields.risk.textContent = d.risk;
    }
    buttons.forEach((btn) => btn.addEventListener("click", () => select(btn.getAttribute("data-persona"))));
    select("operator");
  }

  /* =========================================================
     30 DAY LOG
     ========================================================= */
  const LOG = [
    { date: "10.08", wd: "周三", min: 26, task: "英语作文：让它先问我三个问题", note: "我没有让它直接写，而是要求它先问我三个问题，帮我找到真正想写的观点。第三个问题是：“你希望读者记住哪一个细节？”我写了食堂门口那棵银杏。那天的作文比平时短，却更像我的。", tags: ["英语", "作文", "已核查"], check: 1, caught: 0, way: "先问后写" },
    { date: "10.09", wd: "周四", min: 18, task: "物理：把一道电磁学题拆成三个小问题", note: "我让它不要给答案，只把题目拆成三个我能自己算的小问。第二问卡住了，但它没有来替我算，这反而让我第一次独立走完了整个推导。", tags: ["物理", "拆题", "未代写"], check: 1, caught: 0, way: "拆解问题" },
    { date: "10.10", wd: "周五", min: 0, task: "刻意没有打开 AI", note: "今天作业不多，我给自己放了一天假。没有发生什么大事，也没有变得更专注。只是在想打开它的时候，想起了日志里要写“为什么”。", tags: ["零使用", "观察"], check: 0, caught: 0, way: "零使用" },
    { date: "10.11", wd: "周六", min: 45, task: "数学：生成五道相似题", note: "它生成的第三题条件自相矛盾，两个条件不可能同时成立。我改写了题干之后才做。第一次意识到，出题比做题更容易暴露它是否真的理解。", tags: ["数学", "练习", "已核查", "发现错误"], check: 1, caught: 1, way: "生成练习" },
    { date: "10.12", wd: "周日", min: 12, task: "英语：查一个词的语感", note: "我问了三个近义词的区别，它给了很多例子。我没有核对，因为只是查词。但晚上回想，仍然不确定它举的例句是否地道。", tags: ["英语", "词语", "未核查"], check: 0, caught: 0, way: "查词" },
    { date: "10.13", wd: "周一", min: 0, task: "没有使用", note: "周一很满。我发现自己并不是“有时间才用”，而是“遇到摩擦才更想用”。今天没有摩擦，也就没有打开。", tags: ["零使用"], check: 0, caught: 0, way: "零使用" },
    { date: "10.14", wd: "周二", min: 22, task: "历史：让它扮演反方", note: "我让它反驳我的 essay 论点。它列出的第二条反驳引用了“1912 年的一项临时约法”，年份写错了一年。我查了教材，改了过来。", tags: ["历史", "论证", "发现错误"], check: 1, caught: 1, way: "角色扮演" },
    { date: "10.15", wd: "周三", min: 41, task: "写作：让它生成开头，删掉重写", note: "它给了三个开头，都很顺。我选了最不像它的一个，然后整段重写。最后留下的句子只有一半来自我原来的草稿，但我能解释每一句为什么在。", tags: ["写作", "草稿", "已核查", "发现错误"], check: 1, caught: 1, way: "生成初稿" },
    { date: "10.16", wd: "周四", min: 15, task: "生物：让它用三种类比解释主动运输", note: "第一个类比像快递，第二个像地铁闸机，第三个我忘了。它讲得越清楚，我越以为自己懂了。后来合上电脑，在纸上画了一遍，才真正记住。", tags: ["生物", "概念", "已核查"], check: 1, caught: 0, way: "概念解释" },
    { date: "10.17", wd: "周五", min: 0, task: "没有使用", note: "放学后和同学去操场走了两圈。聊到 AI，她说“你很像在做一个小题大做的课题”。我有点不服气，但这可能是真的。", tags: ["零使用", "对话"], check: 0, caught: 0, way: "零使用" },
    { date: "10.18", wd: "周六", min: 36, task: "化学：整理错题类型", note: "它把同一种错误拆成了五个不同的名字，看起来很专业，其实重复。我删掉了三个类型。AI 很擅长给现象命名，但不一定理解这些名字在学科里意味着什么。", tags: ["化学", "错题", "发现错误"], check: 1, caught: 1, way: "分类整理" },
    { date: "10.19", wd: "周日", min: 16, task: "英语口语：模拟面试", note: "它扮演面试官，追问了四次“为什么”。我卡住了三次。它没有笑我，也没有替我回答。结束后我把不会说的句子抄了下来——这比我平时背的模板更有用。", tags: ["英语", "口语", "已核查"], check: 1, caught: 0, way: "角色对话" },
    { date: "10.20", wd: "周一", min: 33, task: "研究：让它挑战我的提纲", note: "我给它看网站结构，让它指出“哪一页最像资料堆砌”。它说是人物页。我没有完全同意，但删掉了一个原本凑数的栏目。", tags: ["研究", "写作", "未代写"], check: 1, caught: 0, way: "结构讨论" },
    { date: "10.21", wd: "周二", min: 0, task: "没有使用", note: "不是刻意，是忘了。看来“习惯”并没有我想象的那么牢固。", tags: ["零使用"], check: 0, caught: 0, way: "零使用" },
    { date: "10.22", wd: "周三", min: 14, task: "物理：检查单位换算", note: "它把一个小数点挪错了一位，我恰好因为刚做过类似的题而发现。如果我更累一点，可能就直接抄了。", tags: ["物理", "检查", "发现错误"], check: 1, caught: 1, way: "结果检查" },
    { date: "10.23", wd: "周四", min: 25, task: "语文：让 AI 给三个标题", note: "三个都很工整，像教辅书。我最后用了一个很土的标题，但它是从我们班真实发生的事里长出来的。", tags: ["语文", "标题", "未采用"], check: 0, caught: 0, way: "灵感参考" },
    { date: "10.24", wd: "周五", min: 8, task: "搜索：查一个历史人物", note: "它给了一个很完整的生平，但年份和我记忆中的对不上。我打开百科核对，发现它把两个同名人物混在了一起。", tags: ["历史", "搜索", "发现错误"], check: 1, caught: 1, way: "快速检索" },
    { date: "10.25", wd: "周六", min: 21, task: "生物：用 AI 整理概念图", note: "它把两个概念的层级关系画反了。我照着教材重画了一遍。好看的结构，不一定正确的结构。这也是我第一次在一天里连续两次发现它的错误。", tags: ["生物", "概念图", "发现错误"], check: 1, caught: 1, way: "图形整理" },
    { date: "10.26", wd: "周日", min: 0, task: "没有使用", note: "手机没电了。不是自律，是偶然。但这一天让我意识到，有些“断连”不需要决心，只需要一块没电的电池。", tags: ["零使用"], check: 0, caught: 0, way: "零使用" },
    { date: "10.27", wd: "周一", min: 20, task: "数学：只给一个提示", note: "我要求它只提示一步，不要多。它照做了。那一步刚好是我卡住的地方，后面的推导我自己完成。这是这个月最舒服的一次使用。", tags: ["数学", "提示", "已核查"], check: 1, caught: 0, way: "最小提示" },
    { date: "10.28", wd: "周二", min: 38, task: "英语：生成对话场景", note: "它生成了一个过于完美的咖啡馆场景，所有句子都像教材。我把它改成了一个吵闹的食堂，加进了真实的口误，整段练习才活起来。", tags: ["英语", "情境", "已核查"], check: 1, caught: 0, way: "素材生成" },
    { date: "10.29", wd: "周三", min: 19, task: "历史：整理时间线", note: "它把一件事件的年份提前了两年。我在教材里找到了正确的时间。越来越觉得，核查不是“额外工作”，而是使用的一部分。", tags: ["历史", "时间线", "发现错误"], check: 1, caught: 1, way: "整理信息" },
    { date: "10.30", wd: "周四", min: 12, task: "准备“无 AI 日”的规则", note: "为了准备第二天的实验，我让 AI 帮我列了一份“不用 AI 的清单”。很讽刺，但这也是这一天唯一一次使用。清单里有一条很好：如果不知道该做什么，就先走到窗边看看。", tags: ["准备", "清单", "已核查"], check: 1, caught: 0, way: "准备清单" },
    { date: "10.31", wd: "周五", min: 0, task: "真的做到了 0 次", note: "想查天气，就走到窗边看地面。天气应用没有打开，AI 助手也没有。无 AI 日结束，我没有变得更高效，只是第一次注意到，自己在空白里会下意识地摸手机。", tags: ["无AI日", "零使用"], check: 0, caught: 0, way: "零使用" },
    { date: "11.01", wd: "周六", min: 0, task: "无 AI 日延长到第二天上午", note: "补记：昨晚的日志写得太自信。今天上午仍然没有打开生成式 AI，但我用搜索查了一个词。‘不用 AI’和‘不用搜索’是两件不同的事。", tags: ["零使用", "补记"], check: 0, caught: 0, way: "零使用" },
    { date: "11.02", wd: "周日", min: 17, task: "生物：用 AI 画概念图", note: "生成的图很漂亮，但把两个概念的层级关系画反了。我照着教材重画了一遍。好看的结构，不一定正确的结构。", tags: ["生物", "概念图", "发现错误"], check: 1, caught: 1, way: "图形生成" },
    { date: "11.03", wd: "周一", min: 30, task: "写作：让它指出一处证据不足", note: "它指出我引用的一条访谈“看不到具体时间和语境”。我回去翻录音，发现那句话确实是我从三段不同的话里拼起来的。这次不是它错，是我错。", tags: ["写作", "核查", "发现错误"], check: 1, caught: 1, way: "证据检查" },
    { date: "11.04", wd: "周二", min: 0, task: "没有使用", note: "看了一集纪录片。没有记笔记，也没有让它总结。只是看。", tags: ["零使用"], check: 0, caught: 0, way: "零使用" },
    { date: "11.05", wd: "周三", min: 14, task: "英语口语：纠正一个重音", note: "它指出我重音放错，但它自己给的重音也错了。我和老师确认后才发现。工具可以在一个错误上给出另一个错误，而这正是需要人的地方。", tags: ["英语", "口语", "发现错误"], check: 1, caught: 1, way: "发音练习" },
    { date: "11.06", wd: "周四", min: 14, task: "整理 30 天日志", note: "我让 AI 帮我统计使用分钟和场景。数字是对的，但有一天的日期被它记错。我用表格重新核对了一遍。连“总结自己”这件事，也不能完全外包。", tags: ["研究", "整理", "已核查"], check: 1, caught: 0, way: "数据整理" }
  ];

  function initLog() {
    const calendar = $("#log-calendar");
    if (!calendar) return;
    const detail = $("#log-detail");
    const blanks = 2;
    const cells = [];
    for (let i = 0; i < blanks; i++) cells.push('<span class="log-day is-empty" aria-hidden="true"></span>');
    LOG.forEach((entry, index) => {
      let level = 0;
      if (entry.min > 0) level = entry.min <= 15 ? 1 : (entry.min <= 25 ? 2 : 3);
      const label = `10 月 ${entry.date.replace("10.", "")} 日 ${entry.wd}，使用 ${entry.min} 分钟，${entry.task}`;
      cells.push(`<button class="log-day${index === 0 ? " is-active" : ""}" type="button" data-log-index="${index}" data-level="${level}" aria-label="${label}" aria-pressed="${index === 0}"><span class="log-day__num">${entry.date}</span><span class="log-day__bar"><i style="width:${Math.min(100, entry.min * 1.6)}%"></i></span></button>`);
    });
    calendar.innerHTML = cells.join("");
    const usedDays = LOG.filter((x) => x.min > 0).length;
    const total = LOG.reduce((sum, x) => sum + x.min, 0);
    const zero = LOG.filter((x) => x.min === 0).length;
    const caught = LOG.reduce((sum, x) => sum + x.caught, 0);
    if ($("#log-total-min")) $("#log-total-min").textContent = total;
    if ($("#log-used-days")) $("#log-used-days").textContent = usedDays;
    if ($("#log-caught")) $("#log-caught").textContent = caught;
    if ($("#log-zero")) $("#log-zero").textContent = zero;

    function renderDetail(index) {
      const d = LOG[index];
      if (!d || !detail) return;
      const tagClass = ["chip--cyan", "chip", "chip--signal", "chip--orange"];
      detail.innerHTML = `
        <div class="log-detail__date"><b>DAY ${String(index + 1).padStart(2, "0")}</b><span>2025.${d.date} / ${d.wd}</span></div>
        <div class="log-detail__tags">${d.tags.map((t, i) => `<span class="${tagClass[i % tagClass.length]}">${t}</span>`).join("")}</div>
        <div class="log-detail__task">${d.task}</div>
        <p class="log-detail__note">${d.note}</p>
        <div class="log-detail__stats"><div><b>${d.min} min</b><span>使用时长</span></div><div><b>${d.check}</b><span>核查动作</span></div><div><b>${d.way}</b><span>使用方式</span></div><div><b>${d.caught ? "发现 1 处" : "未发现"}</b><span>AI 错误</span></div></div>`;
      $$(".log-day[data-log-index]", calendar).forEach((btn) => {
        const active = Number(btn.getAttribute("data-log-index")) === index;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }
    calendar.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-log-index]");
      if (!btn) return;
      renderDetail(Number(btn.getAttribute("data-log-index")));
    });
    renderDetail(0);
  }

  /* =========================================================
     PROMPT LAB
     ========================================================= */
  const PROMPTS = {
    history: {
      weak: "帮我分析这道历史题为什么错。",
      weakNote: "问题：没有给材料、没有给答案，也没有说明“分析”要走到哪一步。",
      strong: "你是一位高中历史老师。下面是我对“辛亥革命”材料题的答案，请不要直接重写。先指出我答案中的一个史实错误和一个论证漏洞，然后每次只问我一个问题，引导我自己修改。最后用三行总结我的薄弱点。\n\n我的答案：\n[粘贴答案]\n\n材料：\n[粘贴材料]",
      strongNote: "变化：明确角色、提供上下文、限制输出方式、把最终修改权留给自己。",
      delta: [["WHAT CHANGED / 01", "从“帮我判断”变成“帮我看见自己的判断”。"], ["WHAT CHANGED / 02", "AI 从答案生产器变成了追问者。"], ["WHAT CHANGED / 03", "仍然需要你核对史实与材料边界。"]]
    },
    english: {
      weak: "帮我改一下这篇英语作文，让它更好。",
      weakNote: "问题：没有标准、没有目标读者，也没有说明哪些地方你不希望被改。",
      strong: "你是一位严格但友善的英语作文评审。请保持我的观点和语气，不要重写全文。按内容、结构、语言三栏标注问题，每栏最多两条；每条只给一个修改方向，不要替我写出替换句子。最后问我一个能让我继续修改的问题。\n\n作文：\n[粘贴]\n\n评分标准：\n[粘贴]",
      strongNote: "变化：给出评分标准、保护自己的语气、把“改写”限制为“指出方向”。",
      delta: [["WHAT CHANGED / 01", "它不再替你写一篇更好的作文。"], ["WHAT CHANGED / 02", "反馈变得可讨论：你能决定改不改。"], ["WHAT CHANGED / 03", "仍需自己判断哪条建议真的适用于这篇作文。"]]
    },
    rumor: {
      weak: "这条消息是真的吗？",
      weakNote: "问题：只给结论，没有拆解；AI 可能用“看起来合理”替代“可以核实”。",
      strong: "请帮助我核查下面这条消息，但不要直接判断真 / 假。先提取其中的事实主张、来源、数字和时间；然后列出每一项需要核查什么、应该去哪个原始渠道查；最后指出如果无法核实，最安全的下一步是什么。\n\n消息：\n[粘贴]",
      strongNote: "变化：要求拆分与路径，而不是一个自信的结论。",
      delta: [["WHAT CHANGED / 01", "从“给我真假”变成“给我核查路径”。"], ["WHAT CHANGED / 02", "它开始区分可核查与不可核查的内容。"], ["WHAT CHANGED / 03", "复杂的消息可能需要你亲自去查，而不是继续追问 AI。"]]
    }
  };

  function initPrompt() {
    const weak = $("#prompt-weak");
    if (!weak) return;
    const strong = $("#prompt-strong");
    const weakNote = $("#prompt-weak-note");
    const strongNote = $("#prompt-strong-note");
    const delta = $("#prompt-delta");
    $$("[data-prompt-case]").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("[data-prompt-case]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const d = PROMPTS[btn.getAttribute("data-prompt-case")];
        if (!d) return;
        weak.textContent = d.weak;
        strong.textContent = d.strong;
        weakNote.textContent = d.weakNote;
        strongNote.textContent = d.strongNote;
        delta.innerHTML = d.delta.map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join("");
      });
    });

    const role = $("#pb-role"), task = $("#pb-task"), limit = $("#pb-limit"), format = $("#pb-format"), output = $("#pb-output"), count = $("#pb-count");
    if (!role || !task || !limit || !format || !output) return;
    function generate() {
      const text = `你是一位${role.value}。请${task.value}。${limit.value}。${format.value}。\n\n我的问题 / 材料：\n[在这里补充]\n\n我目前的答案：\n[在这里粘贴]`;
      output.textContent = text;
      if (count) count.textContent = `${text.replace(/\s/g, "").length} 字`;
    }
    [role, task, limit, format].forEach((el) => el.addEventListener("change", generate));
    generate();
  }

  /* =========================================================
     FACT CHECK GAME
     ========================================================= */
  const FACTCHECK = [
    {
      kicker: "ROUND 01 / 政策文件",
      claim: "“根据教育部 2024 年《中小学人工智能使用管理办法》，中小学生每天使用 AI 不得超过 15 分钟。”",
      prompt: "你看到 AI 给出的这条回答。哪一个动作最合适？",
      options: ["可信，文件名和数字都很具体", "先核查文件是否存在，再判断内容", "可信，但建议缩短到 10 分钟"],
      correct: 1,
      explanation: "这个文件名称并不存在，“每天 15 分钟”也找不到官方来源。政策信息必须回到发布机构官网核对文件全名、文号与日期。"
    },
    {
      kicker: "ROUND 02 / 伪造论文",
      claim: "“《生成式人工智能与中学生批判性思维》发表于《教育技术研究》，DOI: 10.1234/ai.2023.0187，研究证明使用 AI 的学生批判性思维提高 42%。”",
      prompt: "面对一条“要素齐全”的文献引用，你会怎么做？",
      options: ["可信，有 DOI 和具体百分比", "先检索文献与 DOI，再判断因果表述", "可信，因为 42% 很具体"],
      correct: 1,
      explanation: "作者、期刊、DOI 都可以被生成。先检索文献是否真实存在，DOI 是否指向对应文章；即使存在，也要看研究设计能否支持“提高 42%”的因果结论。"
    },
    {
      kicker: "ROUND 03 / 冒充熟人",
      claim: "“班主任在班级群里发语音：资料费今天最后一天，先转到这个账户，别在群里回复。”",
      prompt: "这条消息让你觉得不对劲。下一步最合适的是？",
      options: ["立刻转账，声音听起来是班主任", "先挂断 / 暂停，用自己保存的号码向老师确认", "把验证码发给对方验证身份"],
      correct: 1,
      explanation: "声音和头像都可能被伪造。涉及转账时，不要用对方提供的联系方式验证；用你自己保存的号码回拨，或当面确认。验证码不能发给任何人。"
    },
    {
      kicker: "ROUND 04 / 检测工具",
      claim: "“某 AI 检测工具准确率高达 99%，可以直接据此认定学生作业由 AI 生成。”",
      prompt: "学校准备把它作为处分依据。你怎么看？",
      options: ["可以，99% 已经很准确", "仍需人工复核，检测工具会有误判", "检测阳性就一定是 AI 写的"],
      correct: 1,
      explanation: "AI 文本检测工具存在误判，尤其是非母语写作、模板化写作与经过人工修改的文本。它不能作为处罚的唯一证据；应结合过程材料与师生沟通。"
    },
    {
      kicker: "ROUND 05 / 隐私与署名",
      claim: "“我让 AI 生成了一篇文献综述，看起来很完整。明天就要交了，我打算把作者改成自己。”",
      prompt: "最合适的处理是？",
      options: ["标注 AI 参与，并逐条核查引用、观点与事实", "直接交，老师看不出来", "改几个词就算原创"],
      correct: 0,
      explanation: "文献综述的核心是检索、筛选与判断。如果使用了 AI，应说明范围并逐条核查。直接提交生成内容或“改几个词”，既无法保证准确性，也把作者责任转移给了一个不会负责的系统。"
    }
  ];

  function initFactcheck() {
    const shell = $("#factcheck-game");
    if (!shell) return;
    const progressLabel = $("#fc-progress-label");
    const progressBar = $("#fc-progress-bar");
    const scoreEl = $("#fc-score");
    let index = 0, score = 0, answered = false;

    function updateTop() {
      if (progressLabel) progressLabel.textContent = `ROUND ${String(index + 1).padStart(2, "0")} / 05`;
      if (progressBar) progressBar.style.width = `${((index + 1) / 5) * 100}%`;
      if (scoreEl) scoreEl.textContent = String(score).padStart(2, "0");
    }

    function renderQuestion() {
      const q = FACTCHECK[index];
      answered = false;
      updateTop();
      shell.innerHTML = `<div class="game-step">
        <div class="game-kicker">${q.kicker}</div>
        <p class="game-prompt">${q.prompt}</p>
        <h2 class="game-question">${q.claim}</h2>
        <div class="game-choices" role="group" aria-label="选择答案">
          ${q.options.map((opt, i) => `<button class="choice-btn" type="button" data-choice="${i}"><span><span class="key">${String.fromCharCode(65 + i)}</span> ${opt}</span><span>→</span></button>`).join("")}
        </div>
        <div class="game-feedback" id="factcheck-feedback" hidden></div>
        <div class="game-actions"><span class="game-score">核查不是怀疑一切，而是知道下一步去哪。</span><button class="btn btn--sm" type="button" id="fc-next" disabled>${index === 4 ? "查看结果" : "下一题"} <span class="arrow">→</span></button></div>
      </div>`;
      const feedback = $("#factcheck-feedback");
      const next = $("#fc-next");
      $$(".choice-btn", shell).forEach((btn) => {
        btn.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const choice = Number(btn.getAttribute("data-choice"));
          const correct = choice === q.correct;
          if (correct) score += 1;
          if (scoreEl) scoreEl.textContent = String(score).padStart(2, "0");
          $$(".choice-btn", shell).forEach((b) => {
            b.disabled = true;
            if (Number(b.getAttribute("data-choice")) === q.correct) b.classList.add("is-correct");
            if (b === btn && !correct) b.classList.add("is-wrong");
          });
          feedback.hidden = false;
          feedback.className = `game-feedback ${correct ? "is-correct" : "is-wrong"}`;
          feedback.innerHTML = `<b>${correct ? "判断正确。" : "再想一步。"}</b> ${q.explanation}`;
          if (next) next.disabled = false;
        });
      });
      if (next) {
        next.addEventListener("click", () => {
          if (!answered) return;
          if (index === FACTCHECK.length - 1) renderResult();
          else { index += 1; renderQuestion(); }
        });
      }
    }

    function renderResult() {
      if (progressLabel) progressLabel.textContent = "COMPLETE / 05";
      if (progressBar) progressBar.style.width = "100%";
      const titles = score >= 5 ? "核查员上线" : score >= 3 ? "已经会停一下" : score >= 1 ? "还需要多看一眼" : "这正是练习的开始";
      const text = score >= 5
        ? "你不仅知道“要核查”，还知道该往哪里走。下一次，试着把核查路径讲给身边的人听。"
        : score >= 3
          ? "你已经在大多数情况下停下来了。剩下的漏洞，往往藏在那些“看起来太正常”的信息里。"
          : "这很正常：我们从小被训练的是找答案，而不是验证答案。把上面的五条解释再看一遍，然后去逛一逛幻觉博物馆。";
      shell.innerHTML = `<div class="game-result">
        <div class="result-score"><div class="result-score__num">${score}<small>/ 5</small></div><p class="result-score__text">${text}</p></div>
        <h2 class="result-title">${titles}</h2>
        <p class="result-desc">核查不是一种天赋，而是一套可以练习的动作：找原始来源、拆开主张、识别情绪压力、在不可撤回的决定前找第二个人确认。</p>
        <div class="result-actions"><button class="btn btn--primary" type="button" id="fc-restart">再来一次 <span class="arrow">↻</span></button><a class="btn" href="hallucination.html">参观幻觉博物馆</a><a class="btn" href="toolkit.html">下载核查清单</a></div>
      </div>`;
      const restart = $("#fc-restart");
      if (restart) restart.addEventListener("click", () => { index = 0; score = 0; if (scoreEl) scoreEl.textContent = "00"; renderQuestion(); });
    }

    renderQuestion();
  }

  /* =========================================================
     OFFLINE DAY
     ========================================================= */
  const HOURS = {
    6: { time: "06:20 / 醒来", title: "第一件事不是找手机，而是找袜子。", text: "平时醒来会先看消息，再顺手问 AI 今天的天气。今天没有。我拉开窗帘，看见地面是湿的，自己判断今天大概要带伞。判断不一定准确，但它是我做的。", tags: ["起床", "自己判断"] },
    7: { time: "07:10 / 上学路上", title: "没有让它帮我规划今天的复习。", text: "我在脑子里过了一遍今天的安排：数学小测、英语听写、中午交研究日志。没有生成清单，也没有优先级排序。走到校门口时，我忘了两件事，但记住了最重要的一件。", tags: ["计划", "记忆"] },
    8: { time: "08:00 / 数学课", title: "老师提问时，我没有“提前知道答案”。", text: "以前我会在前一晚让 AI 把例题讲一遍，第二天上课时有一种“我已经会了”的熟悉感。今天没有预习捷径，我被叫起来时答得磕磕巴巴。但老师追问的那个“为什么”，我确实在课上想明白了。", tags: ["课堂", "卡住"] },
    9: { time: "09:40 / 课间", title: "同学在讨论一道题，我忍住没有打开手机。", text: "他们用 AI 查了三种解法，讨论得很快。我坐在旁边，花了几分钟才看懂第一种。那种落后感很真实。但当我终于指出其中一步的条件不成立时，他们停下来重新看了一遍。", tags: ["同伴", "慢一点"] },
    10: { time: "10:00 / 英语课", title: "查词只能用纸质词典。", text: "翻词典很慢，手指会停在错误的字母附近。但查到一个词时，我顺便看见了它旁边的词根和例句。这是搜索框不会给我的“多余信息”。", tags: ["纸笔", "意外发现"] },
    11: { time: "11:20 / 自习", title: "想开 AI 的冲动出现了四次。", text: "我在便签上画了四个正字。两次是写作文找不到词，一次是物理题卡住，一次是单纯无聊。前三次我都忍过去了，第四次我打开了音乐播放器，没有打开 AI。", tags: ["冲动", "记录"] },
    12: { time: "12:10 / 午饭", title: "和同学聊 AI，而不是用 AI。", text: "我问她：“如果一天不能用，你最难熬的是什么？”她说是“写东西的时候没有退路”。我说我也是。我们突然发现，我们依赖的可能不是答案，而是一种随时可以撤退的感觉。", tags: ["对话", "同学"] },
    13: { time: "13:00 / 午休", title: "睡不着，但没有让 AI 给我讲一个故事。", text: "我盯着天花板，想起小时候听收音机的下午。无聊变得很长，长到开始长出自己的东西。后来我写了三行诗，很难看，但没有一句是我从别处拿来的。", tags: ["无聊", "手写"] },
    14: { time: "14:00 / 图书馆", title: "卡在一篇英语阅读上，但没有拍照上传。", text: "我把不认识的词一个个圈出来，查词典，还是不懂整段的意思。二十分钟后，我去找了坐在对面的同学。她也不确定，于是我们一起读了第三遍——然后同时看懂了那个转折。这个瞬间在平时经常被“拍照问 AI”跳过。", tags: ["阅读", "合作"] },
    15: { time: "15:20 / 体育课", title: "跑步的时候，没有任何设备在记录我。", text: "手表没电，手机在教室。我不知道自己的配速，也不知道心率。只是跑，风很大，最后两圈很累。结束的时候，我第一次没有立刻去看数字。", tags: ["身体", "无数据"] },
    16: { time: "16:10 / 英语听写", title: "错了三个词，没有马上查正确答案。", text: "以前听写一结束就会让 AI 对答案。今天错了三个，我把它们留在本子上，准备明天问老师。错误多存在了一晚，反而记得更牢。", tags: ["错误", "留存"] },
    17: { time: "17:00 / 放学", title: "在路口等红灯时，没有打开任何输入框。", text: "我发现自己在无意识地摸口袋。不是有具体问题要问，只是习惯了在空隙里填一个“有用”的动作。今天那个空隙里只有车流声。", tags: ["习惯", "空白"] },
    18: { time: "18:20 / 回家", title: "妈妈问我一道手机操作题，我直接教她。", text: "她不会用一个新的挂号小程序。以前我会说“你截图发我，我问 AI”。今天我自己研究了两分钟，然后一步步教她。她学会之后特别高兴，说“你终于有点耐心了”。", tags: ["家人", "直接帮助"] },
    19: { time: "19:00 / 写作业", title: "作文写到第二段，停住了。", text: "没有让它给开头。我盯着空白的本子，写了一句很平庸的话，然后划掉。二十分钟后，第二段才慢慢长出来。它不够好，但它是从我的犹豫里长出来的。", tags: ["写作", "空白"] },
    20: { time: "20:30 / 物理", title: "一道题想了四十分钟，最后做错了。", text: "更准确地说，是前面都对，最后一步代入错了。如果问 AI，我可能五分钟就知道答案。但那四十分钟里，我试了三种方法，其中一种后来在另一道题上用到了。", tags: ["物理", "过程"] },
    21: { time: "21:10 / 休息", title: "看完了一篇很长的文章，没有让它总结。", text: "读到一半困了，我站起来走了走，回来继续。最后记住的只有三个点，但其中一个让我改变了原来的看法。总结也许会更完整，但不一定会更属于我。", tags: ["阅读", "注意力"] },
    22: { time: "22:20 / 睡前", title: "写下今天最想记住的一件事。", text: "不是“没有用 AI”，而是在图书馆和同学一起读懂那段文字的三分钟。我们同时“啊”了一声，然后笑了。那种共同的恍然大悟，任何一个人单独问 AI 都不会发生。", tags: ["记忆", "共同"] },
    23: { time: "23:00 / 关机", title: "实验结束，但我没有得出一个干净结论。", text: "我没有变得更高效，也没有变得更有智慧。只是发现：AI 并不只是一个工具，它还在改变我面对空白时的第一反应。明天我会打开它，但也许会先多等三分钟。", tags: ["结论", "未完成"] }
  };

  function initOffline() {
    const slider = $("#hour-slider");
    if (!slider) return;
    const clock = $("#hour-clock");
    const time = $("#hour-event-time");
    const title = $("#hour-event-title");
    const text = $("#hour-event-text");
    const tag = $("#hour-event-tag");
    function update(value) {
      const d = HOURS[Number(value)] || HOURS[14];
      if (clock) clock.textContent = String(value);
      if (time) time.textContent = d.time;
      if (title) title.textContent = d.title;
      if (text) text.textContent = d.text;
      if (tag) tag.innerHTML = d.tags.map((t, i) => `<span class="chip ${i === 0 ? "chip--cyan" : ""}">${t}</span>`).join("");
    }
    slider.addEventListener("input", () => update(slider.value));
    update(slider.value);
  }

  /* =========================================================
     INTEGRITY LIGHTS
     ========================================================= */
  const RULES = [
    { text: "语文老师布置了一篇议论文。你先自己读完材料，用 AI 生成三个不同角度的提纲，选了一个，然后不参考 AI 生成的具体句子，自己写完全文，也没有在文末说明。", correct: "yellow", explanation: "核心表达仍由你完成，但 AI 参与了立意构思。多数课堂会希望至少说明使用范围；如果老师明确禁止，则应按当次要求处理。" },
    { text: "你让 AI 把整篇作文重写，读了一遍觉得很好，稍微改了几个词，用自己的名字提交。", correct: "red", explanation: "最终文本的核心表达不是你的，却作为独立成果提交。这不是“用了工具”，而是把作者位置让了出去。" },
    { text: "你把一段英文材料发给 AI 翻译，然后逐句对照原文修改，保留自己的表达，并在作业末尾写明“使用 AI 辅助翻译”。", correct: "green", explanation: "工具用于辅助理解，修改与判断由你完成，并主动说明。通常可以，但仍需遵守任课教师对翻译工具的具体要求。" },
    { text: "为了咨询一道题，你把同学的真实姓名、病历和家庭情况一起发给了 AI。", correct: "red", explanation: "这涉及他人隐私，且与解题无关。AI 输入可能被记录或用于训练；不要把第三方的敏感信息交给工具。" },
    { text: "数学作业写完后，你用 AI 检查最终答案，只发现一处计算错误。你没有让它重做，而是自己重新推导，并保留了草稿。", correct: "green", explanation: "工具用于检查，最终修改与推导由你完成，且保留了过程。这是较低风险的使用；如果老师不允许任何 AI 检查，则按课堂规定。" },
    { text: "你用 AI 生成了一张班级活动海报，使用了免费模板，并在海报角落标注“AI 辅助生成，设计修改：XXX”。", correct: "green", explanation: "公开标注了 AI 参与，且进行了设计修改。需要注意版权与肖像权；如果使用了同学照片，仍需取得同意。" }
  ];

  function initRules() {
    const choices = $("#rules-choices");
    if (!choices) return;
    const num = $("#rules-num");
    const textEl = $("#rules-text");
    const reveal = $("#rules-reveal");
    const next = $("#rules-next");
    const count = $("#rules-count");
    const progress = $("#rules-progress");
    let index = 0, answered = false;
    const guide = $$("i", progress);

    function render() {
      const d = RULES[index];
      answered = false;
      if (num) num.textContent = `SITUATION / ${String(index + 1).padStart(2, "0")} · ${index === 0 ? "AI 参与构思" : index === 1 ? "AI 重写全文" : index === 2 ? "翻译与说明" : index === 3 ? "隐私风险" : index === 4 ? "检查最终答案" : "公开标注"}`;
      if (textEl) textEl.textContent = d.text;
      if (reveal) { reveal.classList.remove("is-open"); reveal.innerHTML = ""; }
      if (next) { next.disabled = true; next.innerHTML = index === 5 ? "完成判断" : "下一个情境 <span class=\"arrow\">→</span>"; }
      if (count) count.textContent = `判断 ${index} / 6`;
      guide.forEach((dot, i) => {
        dot.classList.remove("done", "current");
        if (i < index) dot.classList.add("done");
        if (i === index) dot.classList.add("current");
      });
      $$(".traffic-btn", choices).forEach((btn) => {
        btn.disabled = false;
        btn.classList.remove("is-correct", "is-wrong", "is-selected");
      });
    }

    choices.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-rule]");
      if (!btn || answered) return;
      answered = true;
      const d = RULES[index];
      const picked = btn.getAttribute("data-rule");
      $$(".traffic-btn", choices).forEach((b) => {
        b.disabled = true;
        if (b.getAttribute("data-rule") === d.correct) b.classList.add("is-correct");
        if (b === btn && picked !== d.correct) b.classList.add("is-wrong");
      });
      const labels = { green: "绿灯 / 可以", yellow: "黄灯 / 需要说明", red: "红灯 / 越界" };
      if (reveal) {
        reveal.classList.add("is-open");
        reveal.innerHTML = `<b>我们的判断：${labels[d.correct]}</b><br>${d.explanation}<br><span class="mono faint" style="display:block;margin-top:9px">这只是讨论框架，不是校规原文。请以任课教师与学校的具体要求为准。</span>`;
      }
      if (next) next.disabled = false;
      if (count) count.textContent = `判断 ${index + 1} / 6`;
    });

    if (next) {
      next.addEventListener("click", () => {
        if (index >= 5) {
          if (count) count.textContent = "完成 6 / 6";
          if (reveal) {
            reveal.classList.add("is-open");
            reveal.innerHTML = "<b>六个情境完成。</b><br>你可能发现，同一种行为在不同课堂里会有不同判断。这正是我们需要公开讨论规则、而不是各自猜测的原因。<br><br><a class='text-link' href='charter.html'>把讨论变成一份班级公约 →</a>";
          }
          next.disabled = true;
          next.textContent = "已全部完成";
          guide.forEach((dot) => { dot.classList.remove("current"); dot.classList.add("done"); });
          return;
        }
        index += 1;
        render();
      });
    }
    render();
  }

  /* =========================================================
     FUTURE SIMULATOR
     ========================================================= */
  const FUTURE = {
    ai: {
      "工具化": { short: "AI 成为随手可取的工具", kicker: "一间把工具放回工具箱的教室",
        text: "早晨的教室里，AI 没有被默认打开。学生只有在查资料、校对语言或需要第二个视角时才使用它。老师很难从一份作业里看出工具痕迹，因为真正决定学习质量的，仍然是任务怎么设计、学生是否投入。" },
      "嵌入式": { short: "每个学生都有一个 AI 学伴", kicker: "一间不太安静、也不太确定的教室",
        text: "每个人的学习界面都连着一位 AI 学伴。它记得你上周卡住的概念，也会在你停顿太久时给一个提示。便利是真实的，被持续记录也是真实的。老师的工作从“讲完内容”变成“判断哪一段卡住值得全班停下来”。" },
      "受限式": { short: "AI 被限制在监督场景", kicker: "一间把 AI 放在玻璃房里的教室",
        text: "AI 被放在一间单独的机房，进入需要登记，使用范围也被限定。课堂重新回到纸笔与面对面讨论。限制减少了误用，也让一些本来可以使用辅助工具的学生失去了支持，尤其是那些需要额外语言支持的人。" }
    },
    eval: {
      "分数排名": { short: "分数仍然是唯一的终点", text: "期末仍然以一张卷子为主。学生很快学会：AI 最值得用在“把答案变对”的地方，过程与修改记录很少被看见。规则强调诚信，却难以改变竞争的方向。" },
      "作品集": { short: "作品集成为主要证据", text: "期末不再只有一张卷子。学生提交作品集：草稿、失败版本、修改说明与最终作品一起被评价。AI 可以参与，但必须留下可解释的痕迹。新的问题是，作品集的准备本身也可能变成一场资源竞赛。" },
      "过程记录": { short: "过程记录进入评价", text: "评价开始记录过程：你在哪里卡住、如何修改、向谁求助、如何判断一条信息。系统可以协助整理，但最终判断仍由教师做出。学生获得更具体的反馈，也承担被持续观察的压力。" }
    },
    teacher: {
      "讲授者": { short: "教师重新站回讲台", text: "老师把更多时间用于讲授与统一进度，AI 负责课后练习与答疑。效率提高了，但那些需要临场判断、关系与信任的时刻，也更容易被交给系统。" },
      "教练": { short: "教师变成学习教练", text: "老师的角色更像教练：观察过程、提出追问、帮助学生在卡住时继续。讲授变少，个别对话变多。这对教师的时间和培训提出了更高要求。" },
      "学习设计师": { short: "教师成为学习设计师", text: "老师不再只是传递内容，而是设计任务、规则与评价方式，决定 AI 在课堂里可以做什么、不可以做什么。教师之间的协作变得更重要，因为单个老师很难独自完成整套设计。" }
    },
    privacy: {
      "严格本地": { short: "数据尽可能留在本地", text: "学习数据优先保存在校内或本地设备，模型调用受到严格限制。隐私风险降低，个性化能力也变弱；学校需要接受“系统不那么聪明”的代价。" },
      "平台集中": { short: "数据集中到平台", text: "学习记录集中在一体化平台里，个性化推荐更准确，管理也更方便。但一旦平台成为唯一入口，学生、家长与教师对数据的控制权就成为核心问题。" },
      "分层授权": { short: "隐私实行分层授权", text: "不同数据有不同权限：学习偏好可以用于个性化，敏感信息必须单独授权且可撤回。它试图在便利与保护之间取平衡，但真正困难的是：谁来解释、谁来监督这些权限。" }
    }
  };

  function initFuture() {
    const out = $("#future-output") || $(".future-output");
    if (!out) return;
    const state = { ai: "嵌入式", eval: "过程记录", teacher: "学习设计师", privacy: "分层授权" };
    const labels = { ai: "#sim-ai-label", eval: "#sim-eval-label", teacher: "#sim-teacher-label", privacy: "#sim-privacy-label" };
    const title = $("#future-title"), text = $("#future-text"), tags = $("#future-tags"), kicker = $("#future-kicker"), year = $("#future-year");
    let copy = $("#future-copy");
    if (!copy) {
      copy = document.createElement("span");
      copy.id = "future-copy";
      copy.hidden = true;
      document.body.appendChild(copy);
    }
    function render() {
      const ai = FUTURE.ai[state.ai], ev = FUTURE.eval[state.eval], te = FUTURE.teacher[state.teacher], pr = FUTURE.privacy[state.privacy];
      Object.entries(labels).forEach(([key, sel]) => { const el = $(sel); if (el) el.textContent = state[key]; });
      if (kicker) kicker.textContent = ai.kicker;
      if (title) title.textContent = `${ai.short}，${ev.short}。`;
      if (text) text.innerHTML = `<p>${ai.text}</p><p>${ev.text}</p><p>${te.text}${pr.text}</p>`;
      if (tags) tags.innerHTML = [state.ai, state.eval, state.teacher, state.privacy].map((v, i) => `<span class="chip ${i === 0 ? "chip--cyan" : i === 3 ? "chip--signal" : ""}">${v}</span>`).join("");
      const classroom = $(".future-classroom");
      if (classroom) {
        const cells = [
          state.ai === "嵌入式" ? "AI 学伴 / 个性化提示" : state.ai === "工具化" ? "工具箱 / 按需调用" : "机房 / 登记使用",
          "教师 / 现场判断",
          "同伴 / 共同卡住",
          state.eval === "过程记录" ? "过程档案 / 修改记录" : state.eval === "作品集" ? "作品集 / 多轮修订" : "试卷 / 最终分数",
          state.ai === "受限式" ? "监督员 / 使用边界" : "评估模型 / 预警",
          "学生 / 最终决定"
        ];
        classroom.innerHTML = cells.map((c, i) => `<div class="${i === 0 || i === 4 ? (state.ai === "受限式" ? "is-human" : "is-ai") : (i === 1 || i === 2 || i === 5 ? "is-human" : "")}">${c}</div>`).join("");
      }
      const summary = `2035 教室场景｜AI：${state.ai}；评价：${state.eval}；教师：${state.teacher}；隐私：${state.privacy}。\n\n${ai.text}\n\n${ev.text}\n\n${te.text}${pr.text}`;
      if (copy) copy.textContent = summary;
      const footer = $("#future-copy-text");
      if (footer) footer.textContent = `SCENARIO: ai=${state.ai} / eval=${state.eval} / teacher=${state.teacher} / privacy=${state.privacy}`;
    }
    $$("[data-sim-group]").forEach((group) => {
      const key = group.getAttribute("data-sim-group");
      $$("button", group).forEach((btn) => {
        btn.addEventListener("click", () => {
          state[key] = btn.getAttribute("data-value");
          $$("button", group).forEach((b) => b.classList.toggle("is-active", b === btn));
          render();
        });
      });
    });
    const randomBtn = $("#sim-random");
    if (randomBtn) {
      randomBtn.addEventListener("click", () => {
        Object.keys(state).forEach((key) => {
          const group = $(`[data-sim-group="${key}"]`);
          if (!group) return;
          const btns = $$("button", group);
          const pick = btns[Math.floor(Math.random() * btns.length)];
          if (pick) {
            state[key] = pick.getAttribute("data-value");
            btns.forEach((b) => b.classList.toggle("is-active", b === pick));
          }
        });
        render();
        toast("已生成新的 2035 场景");
      });
    }
    render();
  }

  /* =========================================================
     CHARTER
     ========================================================= */
  function initCharter() {
    const list = $(".charter-list");
    if (!list) return;
    const checks = $$("[data-charter-check]");
    const nameInput = $("#charter-name");
    const signBtn = $("#charter-sign");
    const cert = $("#certificate");
    const certName = $("#cert-name");
    const certCount = $("#cert-count");
    const certDate = $("#cert-date");
    const certId = $("#cert-id");
    const certSign = $("#cert-signature");
    const summary = $("#cert-summary");
    const stateKey = "adm-charter-v1";

    function countChecked() { return checks.filter((c) => c.checked).length; }
    function dateStr() {
      const d = new Date();
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    }
    function updateCount() {
      if (certCount) certCount.textContent = `${countChecked()} / 8`;
    }
    checks.forEach((c) => c.addEventListener("change", updateCount));

    function save() {
      try {
        localStorage.setItem(stateKey, JSON.stringify({
          name: nameInput.value.trim(),
          checked: checks.map((c) => c.checked),
          date: certDate.textContent,
          id: certId.textContent
        }));
      } catch (e) {}
    }

    function showCert(name) {
      if (!cert) return;
      if (certName) certName.textContent = name;
      if (certSign) certSign.textContent = name;
      if (certDate) certDate.textContent = dateStr();
      if (certId) certId.textContent = `AD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      updateCount();
      if (summary) summary.textContent = `算法同桌班级公约签署凭证。签署人：${name}。已同意 ${countChecked()} / 8 条。日期：${certDate ? certDate.textContent : ""}。`;
      cert.classList.add("is-visible");
      cert.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      save();
    }

    if (signBtn) {
      signBtn.addEventListener("click", () => {
        const name = nameInput ? nameInput.value.trim() : "";
        const n = countChecked();
        if (!name) { toast("请先写下你的名字"); if (nameInput) nameInput.focus(); return; }
        if (n === 0) { toast("请至少勾选一条你愿意试行的约定"); return; }
        showCert(name);
        toast("签署凭证已生成，仅保存在你的浏览器");
      });
    }

    const printBtn = $("#charter-print");
    if (printBtn) printBtn.addEventListener("click", () => window.print());
    const resetBtn = $("#charter-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        try { localStorage.removeItem(stateKey); } catch (e) {}
        checks.forEach((c) => { c.checked = false; });
        if (nameInput) nameInput.value = "";
        if (cert) cert.classList.remove("is-visible");
        updateCount();
        toast("已清除本机签署记录");
      });
    }

    try {
      const raw = localStorage.getItem(stateKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && Array.isArray(saved.checked)) {
          checks.forEach((c, i) => { c.checked = Boolean(saved.checked[i]); });
          if (nameInput) nameInput.value = saved.name || "";
          if (cert) cert.classList.add("is-visible");
          if (certName) certName.textContent = saved.name || "______";
          if (certSign) certSign.textContent = saved.name || "______";
          if (certDate) certDate.textContent = saved.date || dateStr();
          if (certId) certId.textContent = saved.id || "AD-000000";
          updateCount();
          if (summary) summary.textContent = `算法同桌班级公约签署凭证。签署人：${saved.name || "______"}。已同意 ${countChecked()} / 8 条。`;
        }
      }
    } catch (e) {}
    updateCount();
  }

  /* =========================================================
     TOOLKIT
     ========================================================= */
  function initToolkit() {
    const tabs = $$("[data-tool-tab]");
    if (tabs.length) {
      tabs.forEach((btn) => {
        btn.addEventListener("click", () => {
          tabs.forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          const id = `tool-${btn.getAttribute("data-tool-tab")}`;
          $$(".tool-panel").forEach((panel) => panel.classList.toggle("is-active", panel.id === id));
        });
      });
    }
    const checks = $$("[data-toolkit-check]");
    if (!checks.length) return;
    const progress = $("#toolkit-progress");
    const key = "adm-toolkit-checklist-v1";
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) {}
    checks.forEach((c, i) => { c.checked = Boolean(saved[i]); });
    function update() {
      const n = checks.filter((c) => c.checked).length;
      if (progress) progress.textContent = `${n} / ${checks.length}`;
      try { localStorage.setItem(key, JSON.stringify(checks.map((c) => c.checked))); } catch (e) {}
    }
    checks.forEach((c) => c.addEventListener("change", update));
    update();
  }

  /* =========================================================
     LEARNER QUIZ
     ========================================================= */
  const QUIZ_TYPES = {
    operator: { name: "工具派", en: "THE OPERATOR", tone: "cyan", initial: "T", label: "效率优先", desc: "你把 AI 当作一组可组合的工具，关心的是问题有没有被解决。你知道怎么让工具为自己工作，也通常有比较稳定的使用流程。需要留意的是：流程太顺的时候，容易把“完成”当成“学会”。", traits: [["效率", 88], ["核查", 62], ["依赖", 55], ["创造", 50], ["规则", 44]], share: "工具派：效率优先，知道下一步该问什么。" },
    auditor: { name: "怀疑派", en: "THE AUDITOR", tone: "orange", initial: "A", label: "先证明再相信", desc: "你对 AI 的输出保持距离，习惯交叉核对。你不是拒绝技术，而是不愿把判断交出去。需要留意的是：如果所有时间都花在验证上，学习也可能变成无休止的防守。", traits: [["效率", 55], ["核查", 92], ["依赖", 24], ["创造", 45], ["规则", 78]], share: "怀疑派：先证明，再相信；核查是一种习惯。" },
    passenger: { name: "依赖派", en: "THE PASSENGER", tone: "violet", initial: "P", label: "先问它再说", desc: "你习惯先打开 AI，再开始思考。它像一个随时在线的同桌：迅速、温和、从不嫌你问题多。便利是真实的，但你也可能越来越难忍受“不知道”的空白。", traits: [["效率", 72], ["核查", 28], ["依赖", 90], ["创造", 36], ["规则", 25]], share: "依赖派：先问它再说；便利背后藏着判断的让渡。" },
    remixer: { name: "创作派", en: "THE REMIXER", tone: "signal", initial: "R", label: "把 AI 当合著者", desc: "你喜欢用 AI 扩展表达：让诗句变怪、让故事分叉、让设计多出几个方向。你不把生成结果当终稿，而是当素材与碰撞对象。需要留意的是：新鲜感不等于属于自己的判断。", traits: [["效率", 65], ["核查", 50], ["依赖", 47], ["创造", 88], ["规则", 52]], share: "创作派：把 AI 当合著者，但最后署名的仍应是自己。" },
    diplomat: { name: "规则派", en: "THE DIPLOMAT", tone: "cyan", initial: "D", label: "边界清楚才安心", desc: "你关注边界、公平与责任，会主动询问规则，也愿意让讨论变得公开。你希望使用是透明的、可解释的。需要留意的是：标注不是免责声明，写了说明也不等于真的思考过。", traits: [["效率", 60], ["核查", 75], ["依赖", 38], ["创造", 58], ["规则", 94]], share: "规则派：边界清楚才安心；规则值得被共同讨论。" }
  };

  const QUIZ = [
    {
      kicker: "SITUATION 01 / 一道不会的题",
      q: "面对一道完全不会的数学题，你最先做什么？",
      options: [
        { text: "先自己硬想一会儿，实在不行再说", type: "auditor" },
        { text: "把题发给 AI，要一个完整解法再倒推", type: "passenger" },
        { text: "让 AI 只给一个提示，然后自己继续", type: "operator" },
        { text: "换个角度，把它画成图或编成故事", type: "remixer" },
        { text: "先问老师或同学，弄清楚规则再决定", type: "diplomat" }
      ]
    },
    {
      kicker: "SITUATION 02 / 一条完美回答",
      q: "AI 的回答特别流畅，还列了参考文献，你通常会……",
      options: [
        { text: "先查文献是否真的存在，再决定信不信", type: "auditor" },
        { text: "直接复制进作业，稍微改几个词", type: "passenger" },
        { text: "把它整理成自己的流程卡，下次照着做", type: "operator" },
        { text: "用它当灵感，重新写一个完全不同的版本", type: "remixer" },
        { text: "看老师要求，必要时在作业里标注", type: "diplomat" }
      ]
    },
    {
      kicker: "SITUATION 03 / 写作文",
      q: "写作文时，你最希望 AI 扮演什么角色？",
      options: [
        { text: "什么都别写，只帮我查一个词", type: "auditor" },
        { text: "直接给我一篇可以交的", type: "passenger" },
        { text: "给我三个结构选项，我自己选", type: "operator" },
        { text: "和我互相续写，撞出奇怪句子", type: "remixer" },
        { text: "帮我确认有没有违反使用规则", type: "diplomat" }
      ]
    },
    {
      kicker: "SITUATION 04 / 它错了",
      q: "当你发现 AI 说错了一个事实，你会……",
      options: [
        { text: "记进自己的错误日志，观察它为什么会错", type: "auditor" },
        { text: "换个问法，直到它给出我想要的答案", type: "passenger" },
        { text: "修正后继续用，尽量不浪费时间", type: "operator" },
        { text: "把错误做成一个梗图或作品", type: "remixer" },
        { text: "提醒同学，建议班里建一个错误库", type: "diplomat" }
      ]
    },
    {
      kicker: "SITUATION 05 / 班级公约",
      q: "班级要制定 AI 使用公约，你最可能……",
      options: [
        { text: "要求写清楚什么叫“核查”", type: "auditor" },
        { text: "觉得无所谓，反正大家都在用", type: "passenger" },
        { text: "提议做一个好用的流程清单", type: "operator" },
        { text: "设计一张更有创意的海报", type: "remixer" },
        { text: "主动组织讨论，让不同意见都被听见", type: "diplomat" }
      ]
    },
    {
      kicker: "SITUATION 06 / 没有它的一天",
      q: "如果一天不能使用 AI，你会……",
      options: [
        { text: "正好，手写更踏实", type: "auditor" },
        { text: "很难受，可能会偷偷用一下", type: "passenger" },
        { text: "提前把任务安排好，减少影响", type: "operator" },
        { text: "把这天做成一个创作项目", type: "remixer" },
        { text: "观察大家怎么应对，组织一次讨论", type: "diplomat" }
      ]
    }
  ];

  function initQuiz() {
    const app = $("#quiz-app");
    if (!app) return;
    const start = $("#quiz-start"), startBtn = $("#quiz-start-btn");
    const question = $("#quiz-question"), result = $("#quiz-result");
    const qtext = $("#quiz-qtext"), options = $("#quiz-options");
    const next = $("#quiz-next"), count = $("#quiz-count"), qbar = $("#quiz-qbar"), percent = $("#quiz-percent");
    const stepLabel = $("#quiz-step-label"), selection = $("#quiz-selection");
    const scores = { operator: 0, auditor: 0, passenger: 0, remixer: 0, diplomat: 0 };
    let index = 0, selected = null;
    const keys = Object.keys(QUIZ_TYPES);

    function renderQuestion() {
      const q = QUIZ[index];
      selected = null;
      if (count) count.textContent = `${String(index + 1).padStart(2, "0")} / 06`;
      if (qbar) qbar.style.width = `${((index) / 6) * 100}%`;
      if (percent) percent.textContent = `${Math.round((index / 6) * 100)}%`;
      if (qtext) qtext.textContent = q.q;
      const kicker = $("#quiz-kicker");
      if (kicker) kicker.textContent = q.kicker;
      if (selection) selection.textContent = "选择一个最接近你的反应";
      if (next) next.disabled = true;
      if (options) {
        options.innerHTML = q.options.map((opt, i) => `<button class="quiz-option" type="button" data-opt="${i}"><span class="letter">${String.fromCharCode(65 + i)}</span><span>${opt.text}</span></button>`).join("");
        $$(".quiz-option", options).forEach((btn) => {
          btn.addEventListener("click", () => {
            selected = Number(btn.getAttribute("data-opt"));
            $$(".quiz-option", options).forEach((b) => b.classList.toggle("is-selected", b === btn));
            if (next) next.disabled = false;
            if (selection) selection.textContent = "已选择，可以继续";
          });
        });
      }
    }

    function showResult() {
      if (question) question.hidden = true;
      if (result) result.hidden = false;
      if (qbar) qbar.style.width = "100%";
      if (percent) percent.textContent = "100%";
      if (stepLabel) stepLabel.textContent = "COMPLETE / 06";
      let best = keys[0];
      keys.forEach((key) => { if (scores[key] > scores[best]) best = key; });
      const d = QUIZ_TYPES[best];
      const label = $("#quiz-result-label");
      const name = $("#quiz-result-name");
      const en = $("#quiz-result-en");
      const desc = $("#quiz-result-desc");
      const portrait = $("#quiz-portrait");
      const traits = $("#quiz-result-traits");
      if (label) label.textContent = `POSITION 0${keys.indexOf(best) + 1} / ${Math.round((scores[best] / 6) * 100)}% OF YOUR ANSWERS`;
      if (name) name.textContent = d.name;
      if (en) en.textContent = d.en;
      if (desc) desc.textContent = d.desc;
      if (portrait) portrait.innerHTML = portraitMarkup(d.initial, d.tone, `RESULT | ${d.label}`);
      if (traits) traits.innerHTML = d.traits.map(([l, v]) => `<div class="persona-trait"><span>${l}</span><span class="pt-bar"><i style="width:${v}%"></i></span><span class="pt-val">${v}</span></div>`).join("");
      const share = $("#quiz-share-text");
      if (share) share.textContent = `我的结果：${d.name} · ${d.label}。${d.share}`;
      const copyBtn = $("#quiz-copy");
      if (copyBtn) copyBtn.addEventListener("click", () => copyText(`我在《算法同桌》的测试结果是「${d.name} / ${d.en}」：${d.label}。你也来试试：${window.location.href}`));
      const restart = $("#quiz-restart");
      if (restart) restart.addEventListener("click", () => resetQuiz());
      if (result) result.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }

    function resetQuiz() {
      index = 0;
      Object.keys(scores).forEach((key) => { scores[key] = 0; });
      if (start) start.hidden = false;
      if (question) question.hidden = true;
      if (result) result.hidden = true;
      if (stepLabel) stepLabel.textContent = "READY";
      if (qbar) qbar.style.width = "0%";
      if (percent) percent.textContent = "0%";
      if (count) count.textContent = "READY";
      window.scrollTo({ top: app.getBoundingClientRect().top + window.scrollY - 100, behavior: reduced ? "auto" : "smooth" });
    }

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        if (start) start.hidden = true;
        if (result) result.hidden = true;
        if (question) question.hidden = false;
        if (stepLabel) stepLabel.textContent = "QUESTION 01 / 06";
        index = 0;
        Object.keys(scores).forEach((key) => { scores[key] = 0; });
        renderQuestion();
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        if (selected === null) return;
        const type = QUIZ[index].options[selected].type;
        scores[type] += 1;
        if (index === QUIZ.length - 1) {
          showResult();
        } else {
          index += 1;
          if (stepLabel) stepLabel.textContent = `QUESTION ${String(index + 1).padStart(2, "0")} / 06`;
          renderQuestion();
        }
      });
    }
  }

  /* =========================================================
     GUESTBOOK
     ========================================================= */
  const SEED_MESSAGES = [
    { id: "seed-1", name: "小林", role: "同学", mood: "好奇", text: "AI 总能在三秒内回答，但我还是想保留那三秒的空白。", date: "2026.03.02" },
    { id: "seed-2", name: "一个语文老师", role: "老师", mood: "警惕", text: "请把修改留下来。那是学习真正发生的地方。", date: "2026.03.04" },
    { id: "seed-3", name: "王阿姨", role: "社区居民", mood: "困惑", text: "我只想知道，电话里到底是不是我孙女。", date: "2026.03.05" },
    { id: "seed-4", name: "阿远", role: "同学", mood: "信任", text: "它陪我练了两个月口语，我现在敢在全班面前发言了。", date: "2026.03.07" },
    { id: "seed-5", name: "路过的访客", role: "路过的访客", mood: "好奇", text: "第一次看见有人把 AI 的使用写得这么诚实。", date: "2026.03.09" },
    { id: "seed-6", name: "第七排", role: "同学", mood: "警惕", text: "不要把孤独交给一个不会累的系统。", date: "2026.03.10" }
  ];

  function initGuestbook() {
    const wall = $("#message-wall");
    if (!wall) return;
    const form = $("#guestbook-form");
    const nameInput = $("#gb-name"), roleInput = $("#gb-role"), messageInput = $("#gb-message");
    const countEl = $("#gb-count"), stateEl = $("#gb-message-state");
    const postcardBtn = $("#gb-postcard");
    const countLabel = $("#wall-count");
    const key = "adm-guestbook-v1";
    let own = [];
    let filter = "all";
    let activeMessage = null;

    try { own = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { own = []; }
    if (!Array.isArray(own)) own = [];
    own = own.filter((m) => m && m.text && m.name);

    function allMessages() {
      return [...own.slice().reverse(), ...SEED_MESSAGES];
    }
    function save() {
      try { localStorage.setItem(key, JSON.stringify(own)); } catch (e) {}
    }
    function makeCard(message) {
      const card = document.createElement("article");
      card.className = `message-card${message.id && !message.id.startsWith("seed") ? " message-card--new" : ""}`;
      const top = document.createElement("div"); top.className = "message-card__top";
      const who = document.createElement("div"); who.className = "message-card__who";
      const av = document.createElement("span"); av.className = "message-card__avatar"; av.textContent = (message.name || "匿").slice(0, 1);
      const nm = document.createElement("span"); nm.className = "message-card__name"; nm.textContent = message.name;
      who.append(av, nm);
      const mood = document.createElement("span"); mood.className = "message-card__mood"; mood.textContent = `# ${message.mood}`;
      top.append(who, mood);
      const text = document.createElement("p"); text.className = "message-card__text"; text.textContent = message.text;
      const foot = document.createElement("div"); foot.className = "message-card__foot";
      const meta = document.createElement("span"); meta.textContent = `${message.role} / ${message.date}`;
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "存为卡片";
      btn.addEventListener("click", () => drawPostcard(message));
      foot.append(meta, btn);
      card.append(top, text, foot);
      return card;
    }
    function render() {
      const messages = allMessages().filter((m) => filter === "all" || m.mood === filter);
      wall.innerHTML = "";
      if (!messages.length) {
        const empty = document.createElement("div"); empty.className = "wall-empty"; empty.textContent = "这个心情下还没有留言。换一个心情，或者写下第一句。";
        wall.appendChild(empty);
      } else {
        messages.forEach((m) => wall.appendChild(makeCard(m)));
      }
      if (countLabel) countLabel.textContent = `${String(allMessages().length).padStart(2, "0")} MESSAGES / LOCAL`;
    }

    function updateCount() {
      if (!countEl || !messageInput) return;
      countEl.textContent = `${messageInput.value.length} / 80`;
    }
    if (messageInput) messageInput.addEventListener("input", updateCount);

    let selectedMood = "好奇";
    $$("#gb-moods [data-mood]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedMood = btn.getAttribute("data-mood");
        $$("#gb-moods [data-mood]").forEach((b) => b.classList.toggle("is-active", b === btn));
      });
    });

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = messageInput.value.trim();
        const name = (nameInput.value.trim() || "匿名同学").slice(0, 16);
        if (!text) {
          if (stateEl) { stateEl.className = "form-message is-error"; stateEl.textContent = "写一句话再贴到墙上。"; }
          messageInput.focus();
          return;
        }
        const message = {
          id: `local-${Date.now()}`,
          name,
          role: roleInput.value,
          mood: selectedMood,
          text: text.slice(0, 80),
          date: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll("/", ".")
        };
        own.push(message);
        save();
        filter = "all";
        $$("[data-mood-filter] [data-mood]").forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-mood") === "all"));
        render();
        messageInput.value = "";
        updateCount();
        activeMessage = message;
        if (postcardBtn) postcardBtn.disabled = false;
        if (stateEl) { stateEl.className = "form-message"; stateEl.textContent = "已贴到墙上。它只保存在你的这台设备。"; }
        toast("留言已保存到本机");
      });
    }

    $$("[data-mood-filter] [data-mood]").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("[data-mood-filter] [data-mood]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        filter = btn.getAttribute("data-mood");
        render();
      });
    });

    if (postcardBtn) {
      postcardBtn.addEventListener("click", () => {
        if (activeMessage) drawPostcard(activeMessage);
        else if (allMessages().length) drawPostcard(allMessages()[0]);
      });
    }

    const clearBtn = $("#gb-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!own.length) { toast("本机还没有你写下的留言"); return; }
        if (!window.confirm("清除这台设备上你写下的全部留言？此操作不可恢复。")) return;
        own = [];
        save();
        render();
        activeMessage = allMessages()[0] || null;
        if (postcardBtn) postcardBtn.disabled = !activeMessage;
        toast("已清除本机留言");
      });
    }

    function drawPostcard(message) {
      const canvas = $("#postcard-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "#070a0f";
      ctx.fillRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = "rgba(237,244,239,0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // corner / signal
      ctx.strokeStyle = "#c9ff4d";
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.fillStyle = "#c9ff4d";
      ctx.fillRect(36, 36, 70, 4);
      ctx.fillRect(36, 36, 4, 70);
      ctx.fillRect(W - 106, H - 40, 70, 4);
      ctx.fillRect(W - 40, H - 106, 4, 70);
      ctx.strokeStyle = "rgba(98,227,213,.4)";
      ctx.beginPath(); ctx.arc(W - 160, 160, 72, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W - 160, 160, 108, 0, Math.PI * 2); ctx.stroke();
      // top meta
      ctx.font = "18px Consolas, monospace";
      ctx.fillStyle = "rgba(237,244,239,0.55)";
      ctx.fillText("ALGORITHM DESKMATE / MESSAGE CARD", 72, 92);
      ctx.fillStyle = "#62e3d5";
      ctx.fillText(`LOCAL ARCHIVE / ${message.mood.toUpperCase()}`, 72, 120);
      // quote
      ctx.fillStyle = "#edf4ef";
      const fontSize = message.text.length > 52 ? 34 : 42;
      ctx.font = `600 ${fontSize}px 'Microsoft YaHei', 'PingFang SC', sans-serif`;
      const chars = Array.from(message.text);
      const maxWidth = W - 280;
      const lines = [];
      let line = "";
      chars.forEach((ch) => {
        const test = line + ch;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = ch;
        } else line = test;
      });
      if (line) lines.push(line);
      const lineH = fontSize + 24;
      const shown = lines.slice(0, 4);
      let y = 300 - (shown.length - 1) * lineH * 0.45;
      shown.forEach((l) => { ctx.fillText(l, 100, y); y += lineH; });
      // quote mark
      ctx.fillStyle = "#c9ff4d";
      ctx.font = "120px Georgia, serif";
      ctx.fillText("“", 62, 242);
      // author
      ctx.fillStyle = "#edf4ef";
      ctx.font = "600 26px 'Microsoft YaHei', sans-serif";
      ctx.fillText(message.name, 100, H - 158);
      ctx.fillStyle = "rgba(237,244,239,0.55)";
      ctx.font = "18px Consolas, monospace";
      ctx.fillText(`${message.role} / ${message.date}`, 100, H - 124);
      ctx.fillStyle = "#c9ff4d";
      ctx.font = "16px Consolas, monospace";
      ctx.fillText("给 AI 同桌的一句话 —— 算法同桌 2026", W - 570, H - 72);
      // download
      const a = document.createElement("a");
      a.download = "algorithm-deskmate-message.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast("明信片已生成");
    }

    activeMessage = own.length ? own[own.length - 1] : null;
    if (postcardBtn) postcardBtn.disabled = !activeMessage;
    render();
    updateCount();
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    initDashboard();
    initMap();
    initPersonas();
    initLog();
    initPrompt();
    initFactcheck();
    initOffline();
    initRules();
    initFuture();
    initCharter();
    initToolkit();
    initQuiz();
    initGuestbook();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
