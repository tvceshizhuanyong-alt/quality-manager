#!/usr/bin/env node
/**
 * 批量为60个专题HTML页面注入「原理深挖」板块
 * 使用方式: node inject-deep-dive.js
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// CSS to inject (only if not already present)
const DEEP_DIVE_CSS = `
/* 原理深挖 */
.deep-dive{border-left:4px solid var(--purple);background:linear-gradient(135deg,#faf5ff,#f5f3ff);border-radius:0 var(--radius) var(--radius) 0;padding:24px 28px;margin:16px 0}
.deep-dive-title{font-size:18px;font-weight:800;color:var(--purple);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.dd-block{margin-bottom:18px}
.dd-block:last-child{margin-bottom:0}
.dd-block h4{font-size:15px;font-weight:700;color:var(--ink);margin:0 0 6px;display:flex;align-items:center;gap:6px}
.dd-block h4 .dd-icon{font-size:16px}
.dd-block p{margin:4px 0 8px;font-size:14px;color:#374151;line-height:1.75}
.dd-formula{background:#fff;border:1px solid #e9d5ff;border-radius:8px;padding:12px 16px;margin:8px 0;font-size:14px;color:#5b21b6;font-weight:600;text-align:center;line-height:1.8}
.dd-link{background:#fff;border:1px solid #c4b5fd;border-radius:8px;padding:12px 16px;margin:8px 0;font-size:13px;color:#4c1d95;line-height:1.7}
.dd-link strong{color:var(--purple)}
.dd-example{background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:8px 0;font-size:13px;color:#92400e;line-height:1.7}
.dd-example strong{color:#b45309}
`;

const DEEP_DIVE_CSS_RESPONSIVE = `@media(max-width:900px){.deep-dive{padding:18px 16px}}`;

// Topic-specific deep dive content
const TOPICS = {
  '02-iso-9000-principles.html': {
    title: '原理深挖：七项原则为什么是"原则"而非"规则"？',
    blocks: [
      { icon: '📜', title: '历史溯源：从戴明十四点到ISO七项原则', content: '七项原则并非凭空产生。1950年代戴明提出"十四条管理准则"，朱兰提出"质量三部曲"，克劳斯比提出"零缺陷十四步"。ISO/TC176的各国专家<strong>总结了这些大师数十年实践的共性</strong>，提炼出七项"最大公约数"——它们不是规定动作，而是底层逻辑。' },
      { icon: '🧭', title: '原则 vs 规则的本质区别', content: '规则（Rule）告诉你"必须做什么"，原则（Principle）告诉你"为什么这样做"。ISO 9001的条款是"规则"（可审核），而七项原则是"规则背后的道理"。理解原则，才能在规则未覆盖的场景做出正确判断。' },
      { icon: '🔗', title: '七项原则的内在逻辑链', content: '<div class="dd-formula">领导确立方向 → 全员参与执行 → 过程方法保障效率<br>→ 循证决策纠偏 → 关系管理扩展价值<br><br>顾客是起点和终点，改进是永恒动力</div>七项原则不是并列的，而是形成了一条<strong>"领导驱动→系统运行→持续进化"</strong>的因果链。' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>传音在非洲多国运营，不同国家的法规、文化、供应链差异巨大。<br><br><strong>应用：</strong>"关系管理"原则要求我们不仅管理直接供应商，还要管理当地社区关系、政府关系。"以顾客为关注焦点"要求理解非洲用户的独特需求（深肤色拍照、多卡多待、大电池续航），而非简单套用国内标准。</div>' }
    ]
  },
  '03-pdca-cycle.html': {
    title: '原理深挖：PDCA为什么能驱动持续改进？',
    blocks: [
      { icon: '📜', title: '理论溯源：从休哈特环到戴明环', content: 'PDCA的前身是1930年代休哈特提出的"计划-执行-检查"（PDC）循环。戴明在1950年代将其扩展为PDCA，并加入"处置（Act）"环节。<strong>关键创新在于"Act"</strong>——不仅是检查，还要将成功经验标准化、失败教训转化为下一轮的改进输入。' },
      { icon: '🔄', title: 'PDCA的三层嵌套结构', content: '<div class="dd-formula">第一层：组织级PDCA（战略→执行→评审→改进）<br>第二层：过程级PDCA（部门/项目级循环）<br>第三层：个人级PDCA（岗位工作循环）</div>三层嵌套形成<strong>"大环套小环、阶梯式上升"</strong>的结构。每一层的输出都是上一层的输入，每一层的改进都推动整体螺旋上升。' },
      { icon: '⚡', title: 'Act环节为什么最容易被忽略？', content: '很多企业做到C（检查）就停了——发现了问题、开了会、但没有标准化。Act的核心是<strong>"将临时措施固化为永久机制"</strong>。不做Act，同样的问题会反复出现，PDCA就变成了空转的轮子。' },
      { icon: '🔗', title: '跨知识点关联', content: '<div class="dd-link"><strong>与质量成本的关系：</strong>PDCA的P阶段需要质量成本数据作为输入，决定预防资源的投放方向。<br><br><strong>与内审的关系：</strong>内部审核是PDCA中C环节的重要工具——通过审核发现体系运行的偏差，驱动Act环节的改进。<br><br><strong>与8D的关系：</strong>8D问题解决法本质上是PDCA的结构化展开——D1-D3对应P，D4-D6对应D，D7对应C，D8对应A。</div>' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>某机型在尼日利亚市场返修率偏高。<br><br><strong>PDCA应用：</strong>P-分析返修数据，定位高温高湿环境导致主板腐蚀；D-制定防潮涂层方案和包装改进；C-跟踪3个月返修率变化；A-将防潮标准纳入新品设计规范，推广到所有热带市场机型。</div>' }
    ]
  },
  '04-fmea.html': {
    title: '原理深挖：FMEA为什么能"防患于未然"？',
    blocks: [
      { icon: '📜', title: '理论溯源：从军工到民用', content: 'FMEA最早由美国军方在1940年代开发，用于确保武器系统的可靠性。1960年代NASA在阿波罗计划中采用。1970年代福特汽车将其引入民用制造。其核心思想：<strong>在问题发生之前，系统性地识别所有可能的失败方式，并评估其风险优先级。</strong>' },
      { icon: '🧮', title: 'RPN的数学逻辑与局限', content: '<div class="dd-formula">RPN = 严重度(S) × 频度(O) × 探测度(D)<br>范围：1 ~ 1000</div><p><strong>关键洞察：</strong>RPN不是简单的风险排序工具。S≥8时，无论RPN多低，都必须采取措施——因为后果太严重，不能赌概率。这是"风险思维"的核心：不仅看可能性，更要看后果严重性。</p><p><strong>局限：</strong>S×O×D的乘积模型假设三个因素等权重，但实际中严重度的权重应远高于其他两个。新版AIAG-VDA FMEA已改用AP（行动优先级：高/中/低）替代RPN。</p>' },
      { icon: '🔗', title: '跨知识点关联', content: '<div class="dd-link"><strong>与质量成本的关系：</strong>FMEA的RPN本质上在量化"如果不预防，将产生多少故障成本"。RPN越高，预期外部故障损失越大。<br><br><strong>与PDCA的关系：</strong>FMEA是PDCA中P环节的核心工具——通过识别潜在失效模式，指导预防措施的设计。<br><br><strong>与控制计划的关系：</strong>FMEA的输出直接驱动控制计划的制定——高RPN项必须有对应的控制措施。</div>' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>传音新机研发阶段，需要对折叠屏铰链进行DFMEA分析。<br><br><strong>应用：</strong>识别潜在失效模式（铰链松动、异响、断裂）→ 评估S/O/D → 针对高RPN项设计验证试验 → 将控制措施写入控制计划 → 量产前完成闭环。这就是"在沉没成本最小的节点介入"的具体实践。</div>' }
    ]
  },
  '05-internal-audit.html': {
    title: '原理深挖：内审为什么是"自我诊断"而非"找茬"？',
    blocks: [
      { icon: '📜', title: '内审的本质：管理系统的免疫系统', content: '内审不是"警察抓小偷"，而是组织管理系统的<strong>免疫机制</strong>。就像人体需要免疫系统定期巡检、识别异常细胞一样，组织需要内审来发现体系运行中的偏差，在问题扩大前纠正。外审是"体检"（一年一次），内审是"日常免疫"（持续运行）。' },
      { icon: '🎯', title: '审核的独立性原则', content: '<div class="dd-formula">审核员不能审核自己的工作<br>这是ISO 19011的核心要求</div><p>独立性不是"不信任"，而是认知科学的要求——人对自己参与的工作存在<strong>确认偏误</strong>（confirmation bias），倾向于看到自己想看到的。独立审核者能发现审核者自身的盲区。</p>' },
      { icon: '🔗', title: '跨知识点关联', content: '<div class="dd-link"><strong>与PDCA的关系：</strong>内审是PDCA中C（检查）环节的核心工具，通过审核发现偏差，驱动A（处置）环节的改进。<br><br><strong>与管理评审的关系：</strong>内审结果是管理评审的重要输入。内审发现系统性问题，管理评审决策资源投入。<br><br><strong>与纠正措施的关系：</strong>内审发现的不符合项触发纠正措施流程，但内审员不应自己制定纠正措施（保持独立性）。</div>' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>传音质量管理部需要对其实验室进行ISO 17025内审。<br><br><strong>应用：</strong>审核员由非本实验室的质量人员担任 → 按检查表逐项审核（设备校准、人员资质、方法验证等）→ 发现不符合项 → 实验室自行制定纠正措施 → 审核员验证纠正措施有效性 → 闭环。</div>' }
    ]
  },
  '06-supplier-management.html': {
    title: '原理深挖：供应商管理为什么是"共赢"而非"博弈"？',
    blocks: [
      { icon: '📜', title: '从"价格博弈"到"价值共创"的范式转移', content: '传统采购思维是<strong>"压价=降本"</strong>，但质量经理手册指出：供应商质量问题的根源往往是"价格压得太低，供应商无利可图，只能在质量上偷工减料"。现代供应商管理的核心是<strong>从博弈关系转向伙伴关系</strong>——通过技术辅导、长期合同、联合改进，实现双赢。' },
      { icon: '📊', title: '供应商管理的"冰山模型"', content: '<div class="dd-formula">水面以上：价格、交期、合格率（可见指标）<br>水面以下：技术能力、管理体系、文化匹配度、改进意愿（隐性因素）</div><p>只看水面以上的指标，就像只看冰山一角。真正决定长期合作成败的，是水面以下的隐性因素。<strong>供应商审核（二方审核）的本质就是探测冰山以下的能力。</strong></p>' },
      { icon: '🔗', title: '跨知识点关联', content: '<div class="dd-link"><strong>与质量成本的关系：</strong>供应商质量问题导致的外部故障成本，往往远超采购价差。供应商辅导费属于预防成本，是ROI最高的投入。<br><br><strong>与FMEA的关系：</strong>供应商DFMEA/PFMEA的评审是新品开发阶段的重要预防活动。<br><br><strong>与ISO 9001的关系：</strong>ISO 9001:2015第8.4条明确要求对外部提供的过程、产品和服务进行控制。</div>' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>传音在印度、非洲有多个本地化供应商，质量水平参差不齐。<br><br><strong>应用：</strong>建立供应商分级管理（A/B/C/D级）→ A级免检+联合改进，C级加严检验+定期辅导，D级限期整改或淘汰 → 每季度供应商绩效看板（合格率+交期+响应速度+改进配合度）→ 年度供应商大会表彰优秀、分享最佳实践。</div>' }
    ]
  },
  '07-excellence-performance.html': {
    title: '原理深挖：卓越绩效模式为什么超越ISO 9001？',
    blocks: [
      { icon: '📜', title: '从合格到卓越的阶梯', content: 'ISO 9001解决的是"及格线"问题——确保组织有能力稳定提供合格产品。卓越绩效模式解决的是"满分线"问题——<strong>用1000分量化评价组织的经营管理成熟度</strong>。即便ISO 9001实施得很好，也只相当于卓越绩效准则30%的成熟度。' },
      { icon: '🏗️', title: '"道-术-度"三维框架', content: '<div class="dd-formula">道：理念（远见卓识的领导、战略导向、顾客驱动...）<br>术：方法（7个评价类目的要求）<br>度：尺度（评价要素及评分指南）</div><p>这个框架的精妙之处在于：<strong>先问道（为什么做），再修术（怎么做），最后量度（做到什么程度）</strong>。很多企业只做"术"（写文件、走流程），忽略了"道"（使命、愿景、价值观），导致体系空转。</p>' },
      { icon: '🔗', title: '跨知识点关联', content: '<div class="dd-link"><strong>与ISO 9001的关系：</strong>ISO 9001是基础（合格线），卓越绩效是进阶（满分线）。两者不是替代关系，而是递进关系。<br><br><strong>与质量成本的关系：</strong>卓越绩效评价中"经营结果"类目包含质量成本指标，是衡量质量管理有效性的关键证据。<br><br><strong>与领导作用的关系：</strong>卓越绩效的第一条评价就是"领导作用"——因为领导是追求卓越的源动力。</div>' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>传音控股作为上市公司，需要向投资者展示管理成熟度。<br><br><strong>应用：</strong>用卓越绩效准则进行自我评价 → 识别"领导作用"强但"测量分析与知识管理"弱 → 针对性投入改进 → 申报全国质量奖 → 通过评审过程提升整体管理水平。</div>' }
    ]
  },
  '08-reliability-four-steps.html': {
    title: '原理深挖：可靠性为什么是产品的"体质"？',
    blocks: [
      { icon: '📜', title: '性能 vs 可靠性：素质与体质的类比', content: '手册中有一个精妙的比喻：<strong>性能指标体现"素质"，可靠性指标体现"体质"</strong>。一个人可以才华横溢（性能优秀），但体弱多病（可靠性差），最终无法持续发挥价值。产品同理——功能再强大，如果经常故障，用户信任就会崩塌。' },
      { icon: '📐', title: '可靠性的数学定义', content: '<div class="dd-formula">R(t) = P{产品在时间t内无故障完成规定功能}<br>可靠度R(t)是一个概率值，0 ≤ R(t) ≤ 1</div><p>关键参数：<strong>MTBF</strong>（平均故障间隔时间）越大越好，<strong>MTTR</strong>（平均修复时间）越短越好。可用度 = MTBF/(MTBF+MTTR)。</p>' },
      { icon: '🔗', title: '可靠性四步法的逻辑链', content: '<div class="dd-link"><strong>第一步：可靠性定义</strong>——明确"在什么条件下、多长时间内、完成什么功能"算可靠<br><strong>第二步：可靠性分配</strong>——将系统级指标分解到子系统/零部件<br><strong>第三步：可靠性预计</strong>——用历史数据/手册估算各单元的可靠度<br><strong>第四步：可靠性评审</strong>——验证是否达标，不达标则改进设计</div>' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>传音手机在非洲市场面临高温、高湿、多尘的极端环境。<br><br><strong>应用：</strong>定义可靠性目标（如MTBF≥18个月）→ 对关键元器件（电池、屏幕、主板）进行可靠性分配 → 加速寿命试验（高温高湿老化）验证 → 根据试验结果优化散热设计和密封工艺。这就是为什么传音手机能在非洲市场赢得"耐用"口碑。</div>' }
    ]
  },
  '09-manager-skills.html': {
    title: '原理深挖：管理者技能为什么是"三维度"而非"单一能力"？',
    blocks: [
      { icon: '📜', title: '罗伯特·卡茨的三技能模型（1970）', content: '哈佛教授卡茨提出管理者需要三种技能：<strong>技术技能</strong>（做事的能力）、<strong>人际技能</strong>（与人合作的能力）、<strong>概念技能</strong>（全局思考的能力）。关键发现：<strong>不同层级对三种技能的需求比例不同</strong>。' },
      { icon: '📊', title: '层级-技能矩阵', content: '<div class="dd-formula">基层管理者：技术技能 60% | 人际技能 30% | 概念技能 10%<br>中层管理者：技术技能 30% | 人际技能 40% | 概念技能 30%<br>高层管理者：技术技能 10% | 人际技能 30% | 概念技能 60%</div><p>这个模型解释了为什么"优秀工程师不一定能当好经理"——技术能力强但人际/概念技能弱，无法胜任管理岗位。</p>' },
      { icon: '🔗', title: '跨知识点关联', content: '<div class="dd-link"><strong>与领导作用的关系：</strong>领导作用要求高层管理者具备强概念技能（战略思维），同时需要人际技能来激励全员。<br><br><strong>与沟通的关系：</strong>人际技能的核心载体就是沟通能力。<br><br><strong>与人力资源的关系：</strong>人员选拔时应根据岗位层级匹配技能要求，而非一味追求技术能力。</div>' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>传音质量经理需要管理跨文化团队（中国+非洲+印度）。<br><br><strong>应用：</strong>技术技能——懂质量工具（SPC、FMEA等）；人际技能——跨文化沟通、冲突调解、团队激励；概念技能——理解质量战略如何支撑公司全球化目标。三者缺一不可。</div>' }
    ]
  },
  '10-correction-vs-corrective-action.html': {
    title: '原理深挖：纠正和纠正措施的区别为什么如此重要？',
    blocks: [
      { icon: '📜', title: 'ISO 9000的严格定义', content: '<div class="dd-formula">纠正（Correction）= 消除已发现的不合格（治标）<br>纠正措施（Corrective Action）= 消除不合格的原因，防止再发生（治本）</div><p>这个区分是ISO 9001:2015的核心要求之一。<strong>只做纠正不做纠正措施，等于"灭火不防火"</strong>——火灭了但隐患还在，下次还会着。</p>' },
      { icon: '🔥', title: '为什么企业总停留在"纠正"层面？', content: '三个原因：<br>1. <strong>时间压力</strong>：客户在催、产线在停，先恢复生产再说<br>2. <strong>能力不足</strong>：根因分析需要专业工具（5Why、鱼骨图），不是人人都会<br>3. <strong>文化问题</strong>：追究原因可能被理解为"追究责任"，大家回避深挖<br><br>质量经理的核心价值之一，就是推动组织从"纠正"升级到"纠正措施"。' },
      { icon: '🔗', title: '跨知识点关联', content: '<div class="dd-link"><strong>与5Why的关系：</strong>5Why是连接"纠正"到"纠正措施"的桥梁——通过连续追问"为什么"，从表象深入到根因。<br><br><strong>与FMEA的关系：</strong>FMEA中识别的潜在原因，就是纠正措施应该针对的对象。<br><br><strong>与PDCA的关系：</strong>纠正是D（执行），纠正措施是A（处置/标准化）。</div>' },
      { icon: '🌍', title: '传音业务映射', content: '<div class="dd-example"><strong>场景：</strong>客户投诉手机充电口松动。<br><br><strong>纠正（治标）：</strong>给客户换新机。<br><strong>纠正措施（治本）：</strong>分析发现充电口焊接温度偏低导致虚焊 → 调整回流焊温度曲线 → 增加推拉力测试频次 → 更新作业指导书 → 培训产线员工 → 验证3个月无复发。</div>' }
    ]
  }
};

// Generic deep-dive content for topics 11-60
function getGenericContent(dayNum, topicName) {
  return {
    title: `原理深挖：${topicName}的底层逻辑`,
    blocks: [
      { icon: '📜', title: '理论溯源', content: `${topicName}是《质量经理手册》中的重要知识点，其理论基础来源于全面质量管理（TQM）的核心思想。理解其背后的原理，有助于在考试中灵活运用，而非死记硬背。` },
      { icon: '🧠', title: '核心原理', content: `<div class="dd-formula">知识点不是孤立的，而是相互关联的体系<br>掌握底层逻辑 → 理解"为什么" → 才能应对千变万化的考题</div><p>学习质量管理的正确姿势：先理解原理（Why），再记忆方法（How），最后应用工具（What）。死记硬背只能应付原题，理解原理才能应对变题。</p>` },
      { icon: '🔗', title: '跨知识点关联', content: `<div class="dd-link"><strong>与PDCA的关系：</strong>所有质量管理活动都可以用PDCA循环来组织——策划、执行、检查、处置。<br><br><strong>与质量成本的关系：</strong>任何质量管理活动的最终目的，都是优化质量成本结构——增加预防投入，减少故障损失。<br><br><strong>与持续改进的关系：</strong>质量管理的本质是持续改进，而持续改进的本质是PDCA循环的螺旋上升。</div>` },
      { icon: '🌍', title: '实战映射', content: `<div class="dd-example"><strong>考试技巧：</strong>遇到${topicName}相关题目时，先回忆核心定义，再用"为什么"检验理解深度，最后联系实际场景验证。<br><br><strong>传音场景：</strong>将${topicName}与传音的实际质量管理场景关联——想想你在实验室测试、供应商管理、客户投诉处理中如何应用这个知识点。</div>` }
    ]
  };
}

// Process each file
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && !f.includes('topic') && !f.includes('index') && !f.includes('template') && !f.includes('_batch') && !f.includes('batch_'));

let processed = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has deep-dive
  if (html.includes('deep-dive-title')) {
    skipped++;
    continue;
  }
  
  // Extract day number from filename
  const dayMatch = file.match(/^(\d+)/);
  if (!dayMatch) continue;
  const dayNum = parseInt(dayMatch[1]);
  
  // Get topic name from title
  const titleMatch = html.match(/<title>.*?：(.*?)（/);
  const topicName = titleMatch ? titleMatch[1] : `Day ${dayNum}`;
  
  // Get content
  const content = TOPICS[file] || getGenericContent(dayNum, topicName);
  
  // 1. Inject CSS before footer
  if (!html.includes('.deep-dive{')) {
    html = html.replace(
      '/* Footer */',
      DEEP_DIVE_CSS + '\n/* Footer */'
    );
    // Add responsive CSS
    html = html.replace(
      '@media(max-width:900px){',
      DEEP_DIVE_CSS_RESPONSIVE + '\n@media(max-width:900px){'
    );
  }
  
  // 2. Build deep-dive HTML
  let ddHtml = `\n<section class="panel" id="deep-dive">\n<div class="deep-dive">\n<div class="deep-dive-title">📐 ${content.title}</div>\n`;
  
  for (const block of content.blocks) {
    ddHtml += `<div class="dd-block">\n<h4><span class="dd-icon">${block.icon}</span> ${block.title}</h4>\n<p>${block.content}</p>\n</div>\n`;
  }
  
  ddHtml += `</div>\n</section>\n`;
  
  // 3. Inject before quiz section
  html = html.replace(
    '<section class="panel quiz-section" id="quiz">',
    ddHtml + '\n<section class="panel quiz-section" id="quiz">'
  );
  
  // 4. Add nav link if topbar has nav
  if (html.includes('top-links') && html.includes('#quiz">练习题</a>')) {
    html = html.replace(
      '#quiz">练习题</a>',
      '#deep-dive">原理深挖</a>\n<a href="#quiz">练习题</a>'
    );
  }
  
  fs.writeFileSync(filePath, html);
  processed++;
}

console.log(`✅ 处理完成：${processed} 个文件已更新，${skipped} 个已跳过（已包含原理深挖）`);
