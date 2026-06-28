// 从题库生成 HTML 页面的脚本
const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, '..', 'notes', 'question-bank-450.md');
const bankContent = fs.readFileSync(bankPath, 'utf8');

// 解析单个 Day 的题目
function parseDay(dayNum) {
  // 找到该 Day 的内容块 - 使用字符串查找而不是正则
  const dayHeader = `# Day ${dayNum}`;
  const startIdx = bankContent.indexOf(dayHeader);
  if (startIdx === -1) return null;
  
  // 找到下一个 Day 的位置
  const nextDayMatch = bankContent.substring(startIdx + dayHeader.length).match(/\n# Day \d+[：:]/);
  const endIdx = nextDayMatch 
    ? startIdx + dayHeader.length + nextDayMatch.index
    : bankContent.length;
  
  const dayContent = bankContent.substring(startIdx, endIdx);
  
  // 提取标题
  const titleMatch = dayContent.match(/^# Day \d+[：:]([^\n]+)/m);
  if (!titleMatch) return null;
  const dayTitle = titleMatch[1].replace(/（[^）]*）/g, '').trim();
  
  // 提取所有选择题（含选项A/B/C/D格式）
  const questions = [];
  const qRegex = /### \d+-\d+\s*\n\*\*题目\*\*：([^\n]+)\n((?:- [A-D]\. [^\n]+\n?){4})\n\*\*答案\*\*：([A-D]{1,4})\n\*\*解析\*\*：([^\n]+)/g;
  let m;
  while ((m = qRegex.exec(dayContent)) !== null) {
    const optLines = m[2].trim().split('\n');
    const options = optLines.map(line => {
      const optMatch = line.match(/^- [A-D]\. (.+)$/);
      return optMatch ? optMatch[1].trim() : line.replace(/^- /, '').trim();
    });
    questions.push({
      text: m[1].trim(),
      options,
      answer: m[3],
      explanation: m[4].trim()
    });
  }
  
  // 提取案例题（非选择题形式）
  const caseRegex = /## 案例题[\s\S]*?### \d+-\d+\s*\n\*\*题目\*\*：([^\n]+)\n\n\*\*参考答案\*\*：([\s\S]*?)(?=^# |$)/m;
  const caseMatch = dayContent.match(caseRegex);
  let caseText = '';
  let caseAnswer = '';
  if (caseMatch) {
    caseText = caseMatch[1].trim();
    caseAnswer = caseMatch[2].trim().split('\n').slice(0, 3).join(' ').substring(0, 120);
  }
  
  return { title: dayTitle, questions, caseText, caseAnswer };
}

// 生成 HTML
function generateHTML(dayNum, data) {
  const topicNum = String(dayNum).padStart(2, '0');
  
  // 分类：单选、多选
  const singles = data.questions.filter(q => q.answer.length === 1);
  const multis = data.questions.filter(q => q.answer.length > 1);
  
  // 选取：3单选 + 1多选 + 1案例（用第4个单选改编）
  const selected = [];
  const s = singles.slice(0, 3);
  const ml = multis.slice(0, 1);
  
  s.forEach((q, i) => selected.push({ ...q, type: 'single', id: `q${i}` }));
  ml.forEach((q, i) => selected.push({ ...q, type: 'multi', id: `q${3 + i}` }));
  
  // 案例题：用第4个单选题，或如果没有则用多选第2个
  if (singles.length >= 4) {
    selected.push({ ...singles[3], type: 'single', id: 'q4', isCase: true });
  } else if (multis.length >= 2) {
    selected.push({ ...multis[1], type: 'multi', id: 'q4', isCase: true });
  } else if (data.caseText) {
    // 纯案例题（无选项），生成选项
    selected.push({
      text: data.caseText,
      options: ['立即增加检验频次', '加强售后维修团队', '组织跨部门分析根因并制定纠正措施', '降低产品售价弥补客户'],
      answer: 'C',
      explanation: data.caseAnswer || '面对问题，首先应组织跨部门分析根因，制定纠正措施。',
      type: 'single',
      id: 'q4',
      isCase: true
    });
  }
  
  // 确保至少5道题
  if (selected.length < 5 && singles.length > 4) {
    selected.push({ ...singles[4], type: 'single', id: `q${selected.length}`, isCase: true });
  }
  
  // 生成题目 HTML
  let questionsHTML = '';
  const explanations = {};
  const questionsArr = [];
  
  selected.forEach((q, idx) => {
    const qId = `q${idx}`;
    const inputType = q.type === 'single' ? 'radio' : 'checkbox';
    const badgeClass = q.type === 'single' ? 'badge-single' : 'badge-multi';
    const badgeText = q.type === 'single' ? '单选' : '多选';
    const caseLabel = q.isCase ? '（案例）' : '';
    
    questionsHTML += `\n<div class="question" data-id="${qId}" data-answer="${q.answer}" data-type="${q.type}">\n`;
    questionsHTML += `<div class="question-header">第${idx + 1}题${caseLabel}：${q.text}<span class="badge ${badgeClass}">${badgeText}</span></div>\n`;
    
    q.options.forEach((opt, optIdx) => {
      const val = String.fromCharCode(65 + optIdx);
      questionsHTML += `<label class="option-label"><input type="${inputType}" name="${qId}" value="${val}"><span>${val}. ${opt}</span></label>\n`;
    });
    
    questionsHTML += `</div>\n`;
    explanations[qId] = q.explanation;
    questionsArr.push({ id: qId, text: q.text });
  });
  
  // 关键词卡片
  const keywords = extractKeywords(data, selected);
  
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>质量经理手册 · 专题${topicNum}：${data.title}</title>
<style>
:root{--bg:#f0f4ff;--paper:#fff;--ink:#1a2332;--muted:#5a6a7e;--line:#dce3f0;--blue:#2563eb;--cyan:#0ea5e9;--green:#16a34a;--orange:#f59e0b;--red:#ef4444;--purple:#7c3aed;--pink:#d63384;--radius:10px;--max:1200px}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.7}
.topbar{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.topbar-inner{max-width:var(--max);margin:0 auto;padding:12px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:10px}
.brand-mark{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--blue),var(--cyan));display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700}
.brand-title{font-size:15px;font-weight:700;color:var(--ink)}
.brand-sub{font-size:12px;color:var(--muted);margin-left:6px}
.top-links{display:flex;gap:4px}
.top-links a{padding:6px 12px;border-radius:6px;color:var(--muted);font-size:13px;font-weight:500;transition:all .15s}
.top-links a:hover{background:#e8f0fe;color:var(--blue)}
.hero{max-width:var(--max);margin:0 auto;padding:48px 28px 32px}
.hero h1{margin:0;font-size:clamp(34px,5vw,56px);line-height:1.08;color:var(--ink);letter-spacing:-.5px}
.hero-lead{color:#475569;font-size:17px;margin-top:18px;max-width:640px;line-height:1.7}
.hero-board{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:0 8px 30px rgba(37,99,235,.06);padding:20px;margin-top:20px}
.keyword-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.keyword-card{background:#f8faff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;transition:transform .15s}
.keyword-card:hover{transform:translateY(-2px);border-color:#bfdbfe}
.keyword-card .kw{font-size:22px;font-weight:800;color:var(--blue);line-height:1}
.keyword-card .kw-sub{font-size:12px;font-weight:700;color:var(--ink);margin-top:6px}
.keyword-card .kw-desc{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4}
.main-layout{max-width:820px;margin:0 auto;padding:16px 28px 64px}
.panel{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);padding:28px 32px;margin-bottom:20px;box-shadow:0 4px 20px rgba(37,99,235,.04)}
.section-num{font-size:13px;font-weight:700;color:var(--blue);margin-bottom:6px}
h2{margin:0 0 14px;font-size:clamp(24px,3vw,32px);line-height:1.15;color:var(--ink)}
h3{margin:22px 0 10px;font-size:19px;color:var(--ink)}
p{margin:10px 0;color:#334155}
ul,ol{margin:10px 0 0;padding-left:20px;color:#334155}li+li{margin-top:4px}
.hl{display:inline-block;padding:1px 8px;border-radius:6px;background:#dbeafe;color:var(--blue);font-weight:700;font-size:.95em}
.hl.green{background:#dcfce7;color:var(--green)}
.hl.orange{background:#fef3c7;color:#b45309}
.hl.purple{background:#ede9fe;color:var(--purple)}
.hl.red{background:#fee2e2;color:var(--red)}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:14px}
.card{border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#fafbff}
.card h4{margin:0 0 6px;font-size:15px;color:var(--ink)}
.card p{margin:0;font-size:13px;color:#475569;line-height:1.5}
table{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px}
th{background:#f1f5f9;padding:10px 12px;text-align:left;border:1px solid var(--line);font-weight:700;font-size:13px;color:var(--muted)}
td{padding:10px 12px;border:1px solid var(--line);color:#334155}
.callout{margin:16px 0;padding:14px 16px;border-left:4px solid var(--blue);background:#eff6ff;border-radius:0 8px 8px 0;font-size:14px;color:#1e3a5f;font-weight:600;line-height:1.6}
.callout.warn{border-left-color:var(--orange);background:#fffbeb;color:#78350f}
.quiz-section{background:var(--paper);border-radius:var(--radius);padding:24px 28px;margin-bottom:16px;box-shadow:0 4px 20px rgba(37,99,235,.04)}
.quiz-section .quiz-title{font-size:13px;font-weight:700;color:var(--blue);margin-bottom:4px}
.quiz-section h2{font-size:18px;font-weight:700;color:var(--pink);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #fce7f3}
.question{background:#fafbff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:14px}
.question-header{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:10px}
.badge{display:inline-block;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;margin-left:6px;vertical-align:middle}
.badge-multi{background:#fce7f3;color:var(--pink)}
.badge-single{background:#dcfce7;color:var(--green)}
.option-label{display:flex;align-items:flex-start;padding:7px 0;cursor:pointer;font-size:14px;color:#334155}
.option-label input{margin-top:3px;margin-right:10px;accent-color:var(--blue);width:16px;height:16px;flex-shrink:0}
.submit-wrap{text-align:center;margin:20px 0}
.submit-btn{background:linear-gradient(135deg,var(--blue),#1d4ed8);color:#fff;border:none;border-radius:24px;padding:14px 56px;font-size:17px;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 12px rgba(37,99,235,.3);-webkit-tap-highlight-color:transparent;user-select:none;touch-action:manipulation}
.submit-btn:hover{opacity:.9;transform:translateY(-1px)}
.submit-btn:active{transform:translateY(0);opacity:.8}
.submit-btn:disabled{cursor:not-allowed;opacity:.5}
.result{display:none;margin-top:20px}
.score-bar{background:linear-gradient(135deg,var(--blue),var(--green));color:#fff;text-align:center;padding:16px;border-radius:10px;margin-bottom:16px;font-size:22px;font-weight:700}
.result-card{border-radius:10px;padding:16px;margin-bottom:12px;font-size:14px}
.result-correct{background:#dcfce7;border:1px solid #86efac}
.result-wrong{background:#fee2e2;border:1px solid #fca5a5}
.footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8}
.footer .sign{font-size:13px;color:#64748b;margin-top:6px}
@media(max-width:900px){.hero{grid-template-columns:1fr}.cards{grid-template-columns:1fr}.top-links{display:none}}
</style>
</head>
<body>

<header class="topbar">
<div class="topbar-inner">
<a class="brand" href="#top">
<div class="brand-mark">质</div>
<span><span class="brand-title">质量经理手册</span><span class="brand-sub">专题${topicNum}：${data.title}</span></span>
</a>
<nav class="top-links">
<a href="#s1">知识要点</a>
<a href="#s2">易错点</a>
<a href="#quiz">练习题</a>
</nav>
</div>
</header>

<section class="hero" id="top">
<div>
<h1>${data.title}</h1>
<p class="hero-lead">本专题涵盖${data.title}的核心知识点，是注册质量经理考试的重要内容。通过知识讲解和互动练习，帮你巩固掌握。</p>
<div class="hero-board">
<div class="keyword-grid">
${keywords.map(k => `<div class="keyword-card"><div class="kw" style="color:${k.color}">${k.keyword}</div><div class="kw-sub">${k.sub}</div><div class="kw-desc">${k.desc}</div></div>`).join('\n')}
</div>
</div>
</div>
</section>

<main class="main-layout">

<section class="panel" id="s1">
<div class="section-num">知识要点</div>
<h2>${data.title} · 核心知识</h2>
${generateKnowledge(data, selected)}
</section>

<section class="panel" id="s2">
<div class="section-num">易错点</div>
<h2>高频陷阱与易混淆点</h2>
${generatePitfalls(data, selected)}
</section>

<section class="panel quiz-section" id="quiz">
<div class="quiz-title">练习题</div>
<h2>互动练习题（${selected.length}道）</h2>
${questionsHTML}
<div class="submit-wrap"><button class="submit-btn" type="button" id="submitBtn">提交答案</button></div>
<div class="result" id="result"><div class="score-bar" id="scoreBar"></div><div id="resultDetails"></div></div>
</section>

</main>

<footer class="footer"><p>© 质量经理手册互动练习</p><div class="sign">⚡ 与你同行 AI 浪潮，打造智能工作新范式</div></footer>

<script>
var explanations=${JSON.stringify(explanations)};
var questions=${JSON.stringify(questionsArr)};

function submitQuiz(){
  try {
    let score=0,html='';
    questions.forEach((q,idx)=>{
      const box=document.querySelector('.question[data-id="'+q.id+'"]');
      if(!box) return;
      const correct=box.getAttribute('data-answer');
      const checked=[...box.querySelectorAll('input:checked')].map(x=>x.value).sort().join('');
      const correctSorted=correct.split('').sort().join('');
      const ok=checked===correctSorted;
      if(ok)score++;
      html+='<div class="result-card '+(ok?'result-correct':'result-wrong')+'">';
      html+='<div style="font-weight:600;margin-bottom:6px">'+(ok?'✅':'❌')+' 第'+(idx+1)+'题：'+q.text+'</div>';
      if(!ok)html+='<div>你的答案：<span style="color:#ef4444">'+(checked||'未作答')+'</span> | 正确答案：<span style="color:#16a34a;font-weight:600">'+correct+'</span></div>';
      else html+='<div>答案：<span style="color:#16a34a;font-weight:600">'+correct+'</span> ✅</div>';
      html+='<div style="margin-top:6px;color:#555;font-size:13px">'+(explanations[q.id]||'')+'</div></div>';
    });
    var scoreBar=document.getElementById('scoreBar');
    var resultDetails=document.getElementById('resultDetails');
    var resultDiv=document.getElementById('result');
    var submitBtn=document.getElementById('submitBtn');
    if(scoreBar) scoreBar.textContent='得分：'+score+' / '+questions.length+(score===questions.length?' 🎉 满分！':'');
    if(resultDetails) resultDetails.innerHTML=html;
    if(resultDiv){resultDiv.style.display='block';setTimeout(function(){resultDiv.scrollIntoView({behavior:'smooth'})},200);}
    if(submitBtn){submitBtn.textContent='已提交 ✓';submitBtn.disabled=true;submitBtn.style.opacity='0.5';submitBtn.style.cursor='not-allowed';}
    document.querySelectorAll('.question input').forEach(function(inp){inp.disabled=true;});
  } catch(e) {
    alert('提交出错，请刷新页面重试：'+e.message);
  }
}

(function(){
  function bindBtn(){
    var btn=document.getElementById('submitBtn');
    if(!btn) return;
    btn.addEventListener('click',function(e){e.preventDefault();if(!this.disabled)submitQuiz();},false);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',bindBtn);}
  else{bindBtn();}
})();
</script>
</body>
</html>`;
}

function extractKeywords(data, selected) {
  const colors = ['var(--green)', 'var(--blue)', 'var(--orange)', 'var(--red)'];
  const keywords = [];
  const seen = new Set();
  
  // 从解析中提取关键概念
  for (const q of selected) {
    if (keywords.length >= 4) break;
    const expl = q.explanation;
    // 提取书名号、引号中的内容
    const matches = expl.match(/[《""]([^》""]+)[》""]/g) || [];
    for (const m of matches) {
      const kw = m.replace(/[《》""]/g, '').trim();
      if (kw.length > 1 && kw.length < 12 && !seen.has(kw) && keywords.length < 4) {
        seen.add(kw);
        keywords.push({
          keyword: kw,
          sub: '核心概念',
          desc: q.text.substring(0, 25) + '...',
          color: colors[keywords.length % colors.length]
        });
      }
    }
  }
  
  // 补充：从题目中提取关键词
  if (keywords.length < 4) {
    for (const q of selected) {
      if (keywords.length >= 4) break;
      const terms = q.text.match(/[\u4e00-\u9fa5]{3,8}/g) || [];
      for (const t of terms) {
        if (!seen.has(t) && keywords.length < 4) {
          seen.add(t);
          keywords.push({
            keyword: t,
            sub: '考试要点',
            desc: '详见练习题解析',
            color: colors[keywords.length % colors.length]
          });
        }
      }
    }
  }
  
  while (keywords.length < 4) {
    keywords.push({
      keyword: '要点' + (keywords.length + 1),
      sub: '重要概念',
      desc: '详见练习题',
      color: colors[keywords.length % colors.length]
    });
  }
  
  return keywords;
}

function generateKnowledge(data, selected) {
  if (selected.length === 0) return '<p>请参考练习题内容。</p>';
  
  let html = '<div class="cards">';
  const icons = ['①', '②', '③', '④'];
  const shown = selected.slice(0, 4);
  shown.forEach((q, i) => {
    const title = q.text.length > 30 ? q.text.substring(0, 30) + '...' : q.text;
    const desc = q.explanation.length > 80 ? q.explanation.substring(0, 80) + '...' : q.explanation;
    html += `<div class="card"><h4>${icons[i]} ${title}</h4><p>${desc}</p></div>`;
  });
  html += '</div>';
  html += `<div class="callout">💡 重点掌握以上知识点的核心概念，考试中经常以选择题形式出现。</div>`;
  return html;
}

function generatePitfalls(data, selected) {
  if (selected.length < 2) return '<p>注意审题，仔细区分选项差异。</p>';
  
  let html = '<div class="cards">';
  const pitfalls = selected.slice(-2);
  const icons = ['⚠️', '💡'];
  pitfalls.forEach((q, i) => {
    const title = q.text.length > 25 ? q.text.substring(0, 25) + '...' : q.text;
    const desc = q.explanation.length > 70 ? q.explanation.substring(0, 70) + '...' : q.explanation;
    html += `<div class="card"><h4>${icons[i]} ${title}</h4><p>${desc}</p></div>`;
  });
  html += '</div>';
  html += `<div class="callout warn">⚠️ 考试注意：仔细审题，注意选项中的关键词差异！</div>`;
  return html;
}

// 主流程
const startDay = parseInt(process.argv[2]) || 16;
const endDay = parseInt(process.argv[3]) || 60;

let generated = 0;
let skipped = 0;

for (let day = startDay; day <= endDay; day++) {
  const data = parseDay(day);
  if (!data) {
    console.log(`⚠️ Day ${day}: 题库中无数据，跳过`);
    skipped++;
    continue;
  }
  
  if (data.questions.length === 0 && !data.caseText) {
    console.log(`⚠️ Day ${day}: 无题目数据，跳过`);
    skipped++;
    continue;
  }
  
  const topicNum = String(day).padStart(2, '0');
  const safeName = data.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  const filename = `${topicNum}-${safeName}.html`;
  const filepath = path.join(__dirname, filename);
  
  if (fs.existsSync(filepath)) {
    console.log(`⏭️ Day ${day}: ${filename} 已存在，跳过`);
    skipped++;
    continue;
  }
  
  const html = generateHTML(day, data);
  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`✅ Day ${day}: ${filename} (${data.questions.length}题)`);
  generated++;
}

console.log(`\n完成！生成 ${generated} 个页面，跳过 ${skipped} 个`);
