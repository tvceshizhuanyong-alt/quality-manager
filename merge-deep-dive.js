#!/usr/bin/env node
/**
 * 将「原理深挖」内容合并到现有知识点板块中，而非单独成项
 * 使用方式: node merge-deep-dive.js
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// 先移除之前单独的原理深挖板块
function removeDeepDiveSection(html) {
  // 移除 <section class="panel" id="deep-dive">...</section>
  const regex = /<section class="panel" id="deep-dive">[\s\S]*?<\/section>\s*/g;
  return html.replace(regex, '');
}

// 移除导航栏中的"原理深挖"链接
function removeDeepDiveNav(html) {
  return html.replace(/\n?<a href="#deep-dive">原理深挖<\/a>\n?/g, '');
}

// 为每个知识点板块追加原理深挖内容
function mergeIntoSections(html, dayNum, topicName) {
  // 找到所有 <section class="panel" id="sX"> 板块
  const sectionRegex = /<section class="panel" id="(s\d+)">([\s\S]*?)<\/section>/g;
  let match;
  const sections = [];
  
  while ((match = sectionRegex.exec(html)) !== null) {
    sections.push({
      id: match[1],
      content: match[2],
      fullMatch: match[0]
    });
  }
  
  if (sections.length === 0) return html;
  
  // 为每个section追加原理深挖内容
  let modifiedHtml = html;
  
  for (const section of sections) {
    const deepDiveContent = getSectionDeepDive(dayNum, topicName, section.id, section.content);
    if (deepDiveContent) {
      // 在section的</section>前插入
      const newSection = section.fullMatch.replace('</section>', `\n\n${deepDiveContent}\n</section>`);
      modifiedHtml = modifiedHtml.replace(section.fullMatch, newSection);
    }
  }
  
  return modifiedHtml;
}

// 根据section内容生成对应的原理深挖
function getSectionDeepDive(dayNum, topicName, sectionId, sectionContent) {
  // 判断section的主题
  const content = sectionContent.toLowerCase();
  
  // 如果是定义/分类类（包含表格）
  if (content.includes('<table>') || content.includes('定义') || content.includes('分类')) {
    return getDefinitionDeepDive(dayNum, topicName);
  }
  
  // 如果是陷阱/易混淆点类
  if (content.includes('陷阱') || content.includes('混淆') || content.includes('易错')) {
    return getTrapDeepDive(dayNum, topicName);
  }
  
  // 如果是案例类
  if (content.includes('案例') || content.includes('应用')) {
    return getCaseDeepDive(dayNum, topicName);
  }
  
  // 默认不追加
  return null;
}

function getDefinitionDeepDive(dayNum, topicName) {
  const deepDives = {
    '01': `<div class="deep-dive-inline">\n<h4>📐 原理深挖：1-10-100 法则</h4>\n<p>美国质量管理大师费根鲍姆（Feigenbaum, 1961）发现：<strong>缺陷每向后流转一个环节，处理成本就放大一个数量级。</strong></p>\n<div class="dd-formula">设计阶段预防 1 元 → 制造环节返工 10 元 → 客户手中处理 100 元</div>\n<p>为什么是 10 倍级放大？因为越往后涉及的环节越多——物流、客服、法务、公关层层叠加。预防的经济学本质是：<strong>在沉没成本最小的节点介入</strong>。</p>\n</div>`,
    
    '02': `<div class="deep-dive-inline">\n<h4> 原理深挖：原则 vs 规则的本质区别</h4>\n<p>七项原则并非凭空产生，而是 ISO/TC176 的各国专家<strong>总结了戴明、朱兰、克劳斯比等大师数十年实践的共性</strong>，提炼出"最大公约数"。</p>\n<p><strong>规则（Rule）</strong>告诉你"必须做什么"（可审核），<strong>原则（Principle）</strong>告诉你"为什么这样做"。理解原则，才能在规则未覆盖的场景做出正确判断。</p>\n<div class="dd-formula">领导确立方向 → 全员参与执行 → 过程方法保障效率<br>→ 循证决策纠偏 → 关系管理扩展价值<br>顾客是起点和终点，改进是永恒动力</div>\n</div>`,
    
    '03': `<div class="deep-dive-inline">\n<h4> 原理深挖：PDCA 的三层嵌套结构</h4>\n<p>PDCA 的前身是 1930 年代休哈特提出的"计划 - 执行 - 检查"（PDC）循环。戴明在 1950 年代加入"处置（Act）"环节。<strong>关键创新在于"Act"</strong>——不仅是检查，还要将成功经验标准化、失败教训转化为下一轮的改进输入。</p>\n<div class="dd-formula">第一层：组织级 PDCA（战略→执行→评审→改进）<br>第二层：过程级 PDCA（部门/项目级循环）<br>第三层：个人级 PDCA（岗位工作循环）</div>\n<p>三层嵌套形成<strong>"大环套小环、阶梯式上升"</strong>的结构。不做 Act，同样的问题会反复出现，PDCA 就变成了空转的轮子。</p>\n</div>`,
    
    '04': `<div class="deep-dive-inline">\n<h4>📐 原理深挖：RPN 的数学逻辑与局限</h4>\n<p>FMEA 最早由美国军方在 1940 年代开发，用于确保武器系统的可靠性。核心思想：<strong>在问题发生之前，系统性地识别所有可能的失败方式，并评估其风险优先级。</strong></p>\n<div class="dd-formula">RPN = 严重度 (S) × 频度 (O) × 探测度 (D)，范围：1 ~ 1000</div>\n<p><strong>关键洞察：</strong>S≥8 时，无论 RPN 多低，都必须采取措施——因为后果太严重，不能赌概率。这是"风险思维"的核心：不仅看可能性，更要看后果严重性。</p>\n</div>`,
    
    '05': `<div class="deep-dive-inline">\n<h4> 原理深挖：内审是管理系统的"免疫系统"</h4>\n<p>内审不是"警察抓小偷"，而是组织管理系统的<strong>免疫机制</strong>。就像人体需要免疫系统定期巡检、识别异常细胞一样，组织需要内审来发现体系运行中的偏差，在问题扩大前纠正。</p>\n<div class="dd-formula">外审是"体检"（一年一次），内审是"日常免疫"（持续运行）</div>\n<p>审核员不能审核自己的工作（ISO 19011 核心要求）——独立性不是"不信任"，而是认知科学的要求：人对自己参与的工作存在<strong>确认偏误</strong>，独立审核者能发现盲区。</p>\n</div>`,
    
    '06': `<div class="deep-dive-inline">\n<h4>📐 原理深挖：供应商管理的"冰山模型"</h4>\n<p>传统采购思维是<strong>"压价 = 降本"</strong>，但质量经理手册指出：供应商质量问题的根源往往是"价格压得太低，供应商无利可图，只能在质量上偷工减料"。</p>\n<div class="dd-formula">水面以上：价格、交期、合格率（可见指标）<br>水面以下：技术能力、管理体系、文化匹配度、改进意愿（隐性因素）</div>\n<p>只看水面以上的指标，就像只看冰山一角。真正决定长期合作成败的，是水面以下的隐性因素。<strong>供应商审核的本质就是探测冰山以下的能力。</strong></p>\n</div>`,
    
    '07': `<div class="deep-dive-inline">\n<h4>📐 原理深挖："道 - 术 - 度"三维框架</h4>\n<p>ISO 9001 解决的是"及格线"问题——确保组织有能力稳定提供合格产品。卓越绩效模式解决的是"满分线"问题——<strong>用 1000 分量化评价组织的经营管理成熟度</strong>。即便 ISO 9001 实施得很好，也只相当于卓越绩效准则 30% 的成熟度。</p>\n<div class="dd-formula">道：理念（远见卓识的领导、战略导向、顾客驱动...）<br>术：方法（7 个评价类目的要求）<br>度：尺度（评价要素及评分指南）</div>\n<p>很多企业只做"术"（写文件、走流程），忽略了"道"（使命、愿景、价值观），导致体系空转。</p>\n</div>`,
    
    '08': `<div class="deep-dive-inline">\n<h4>📐 原理深挖：性能 vs 可靠性——素质与体质的类比</h4>\n<p>手册中有一个精妙的比喻：<strong>性能指标体现"素质"，可靠性指标体现"体质"</strong>。一个人可以才华横溢（性能优秀），但体弱多病（可靠性差），最终无法持续发挥价值。产品同理——功能再强大，如果经常故障，用户信任就会崩塌。</p>\n<div class="dd-formula">R(t) = P{产品在时间 t 内无故障完成规定功能}<br>可靠度 R(t) 是一个概率值，0 ≤ R(t) ≤ 1</div>\n<p>关键参数：<strong>MTBF</strong>（平均故障间隔时间）越大越好，<strong>MTTR</strong>（平均修复时间）越短越好。可用度 = MTBF/(MTBF+MTTR)。</p>\n</div>`,
    
    '09': `<div class="deep-dive-inline">\n<h4> 原理深挖：罗伯特·卡茨的三技能模型（1970）</h4>\n<p>哈佛教授卡茨提出管理者需要三种技能：<strong>技术技能</strong>（做事的能力）、<strong>人际技能</strong>（与人合作的能力）、<strong>概念技能</strong>（全局思考的能力）。关键发现：<strong>不同层级对三种技能的需求比例不同</strong>。</p>\n<div class="dd-formula">基层管理者：技术技能 60% | 人际技能 30% | 概念技能 10%<br>中层管理者：技术技能 30% | 人际技能 40% | 概念技能 30%<br>高层管理者：技术技能 10% | 人际技能 30% | 概念技能 60%</div>\n<p>这个模型解释了为什么"优秀工程师不一定能当好经理"——技术能力强但人际/概念技能弱，无法胜任管理岗位。</p>\n</div>`,
    
    '10': `<div class="deep-dive-inline">\n<h4>📐 原理深挖：纠正 vs 纠正措施——治标与治本</h4>\n<div class="dd-formula">纠正（Correction）= 消除已发现的不合格（治标）<br>纠正措施（Corrective Action）= 消除不合格的原因，防止再发生（治本）</div>\n<p>这个区分是 ISO 9001:2015 的核心要求之一。<strong>只做纠正不做纠正措施，等于"灭火不防火"</strong>——火灭了但隐患还在，下次还会着。</p>\n<p>企业总停留在"纠正"层面的三个原因：①时间压力（先恢复生产再说）②能力不足（根因分析需要专业工具）③文化问题（追究原因可能被理解为"追究责任"）。质量经理的核心价值之一，就是推动组织从"纠正"升级到"纠正措施"。</p>\n</div>`
  };
  
  return deepDives[dayNum.toString().padStart(2, '0')] || null;
}

function getTrapDeepDive(dayNum, topicName) {
  // 陷阱类板块追加考试技巧
  return `<div class="deep-dive-inline">\n<h4>🎯 考试技巧：如何避开陷阱</h4>\n<p>这类题目的出题逻辑是<strong>混淆相似概念</strong>。应对策略：①回到定义本身，抓住关键词；②用"交付前后"区分内部/外部故障；③用"预防 vs 鉴定"的目的区分（预防是防止发生，鉴定是评定是否合格）。</p>\n</div>`;
}

function getCaseDeepDive(dayNum, topicName) {
  // 案例类板块追加传音业务映射
  return `<div class="deep-dive-inline">\n<h4>🌍 传音业务映射</h4>\n<div class="dd-example">\n<strong>场景：</strong>传音手机在非洲/南亚市场面临高温、高湿、多尘的极端环境，外部故障成本远高于国内——维修需跨国差旅、物流周期长、品牌信任一旦损失难以恢复。<br><br>\n<strong>应用：</strong>在研发阶段投入 DFMEA 评审（预防成本）→ 产线增加关键工位专检（鉴定成本）→ 外部故障成本（维修差旅 + 索赔）大幅下降。这就是"1-10-100 法则"在跨国制造中的实战体现。<br><br>\n<strong>数据驱动：</strong>建立全球售后数据看板，按区域/机型/故障类型统计外部故障成本，反向指导下一轮预防资源投放。\n</div>\n</div>`;
}

// 添加 inline 样式的 CSS
const INLINE_CSS = `
/* 原理深挖（inline 版本） */
.deep-dive-inline{border-left:3px solid var(--purple);background:linear-gradient(135deg,#faf5ff,#f5f3ff);border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0}\n.deep-dive-inline h4{font-size:15px;font-weight:700;color:var(--purple);margin:0 0 8px;display:flex;align-items:center;gap:6px}\n.deep-dive-inline p{margin:4px 0 8px;font-size:14px;color:#374151;line-height:1.75}\n.deep-dive-inline .dd-formula{background:#fff;border:1px solid #e9d5ff;border-radius:8px;padding:10px 14px;margin:8px 0;font-size:13px;color:#5b21b6;font-weight:600;text-align:center;line-height:1.7}\n.deep-dive-inline .dd-example{background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;margin:8px 0;font-size:13px;color:#92400e;line-height:1.7}\n.deep-dive-inline .dd-example strong{color:#b45309}\n`;

// Process each file
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && !f.includes('topic') && !f.includes('index') && !f.includes('template') && !f.includes('_batch') && !f.includes('batch_') && !f.includes('inject-') && !f.includes('merge-'));

let processed = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Extract day number from filename
  const dayMatch = file.match(/^(\d+)/);
  if (!dayMatch) continue;
  const dayNum = parseInt(dayMatch[1]);
  
  // Get topic name from title
  const titleMatch = html.match(/<title>.*?：(.*?)（/);
  const topicName = titleMatch ? titleMatch[1] : `Day ${dayNum}`;
  
  // 1. Remove old deep-dive section
  html = removeDeepDiveSection(html);
  
  // 2. Remove old deep-dive nav link
  html = removeDeepDiveNav(html);
  
  // 3. Add inline CSS if not present
  if (!html.includes('.deep-dive-inline{')) {
    html = html.replace('/* Footer */', INLINE_CSS + '\n/* Footer */');
  }
  
  // 4. Merge deep-dive into existing sections
  html = mergeIntoSections(html, dayNum, topicName);
  
  fs.writeFileSync(filePath, html);
  processed++;
}

console.log(`✅ 处理完成：${processed} 个文件已更新（原理深挖已合并到知识点板块中）`);
