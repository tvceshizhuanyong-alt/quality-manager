#!/usr/bin/env node
/**
 * 将知识板块本身丰富化：把原理、理论、关联直接融入正文
 * 1. 删除独立的"原理深挖"板块（s4/deep-dive）
 * 2. 删除 inline 小卡片
 * 3. 在每个知识板块的正文中直接插入深度内容
 */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

// 60个专题的深度知识内容（Day 1-10 定制，Day 11-60 通用框架）
const RICH_KNOWLEDGE = {
  '01-quality-cost.html': {
    // 替换 s1 板块（质量成本四大类）
    s1: {
      afterTable: `
<h3>为什么预防最经济？——1-10-100 法则</h3>
<p>美国质量管理大师费根鲍姆（Feigenbaum）在 1961 年《全面质量控制》中首次系统提出质量成本分类框架。其核心发现是：<strong>缺陷每向后流转一个环节，处理成本就放大一个数量级。</strong></p>
<div class="callout">设计阶段预防投入 <strong>1 元</strong> → 制造环节返工 <strong>10 元</strong> → 客户手中处理 <strong>100 元</strong></div>
<p>为什么是 10 倍级放大？因为越往后涉及的环节越多——物流、客服、法务、公关层层叠加。一个出厂前 5 元能解决的焊接不良，到了客户手里就变成维修差旅费 + 客户索赔 + 品牌口碑损失，轻松突破 500 元。</p>

<h3>经济学本质：沉没成本递增</h3>
<p>产品每经过一道工序，就叠加了材料、人工、能耗、设备折旧等成本。<strong>缺陷发现越晚，已投入的沉没成本越大</strong>，报废或返工的损失就越高。预防的经济学本质是：<strong>在沉没成本最小的节点（设计/策划阶段）介入</strong>，用最小的代价避免后续所有环节的浪费。这不是道德选择，而是纯粹的经济理性。</p>

<h3>传统模型 vs 现代模型</h3>
<p><strong>传统 U 型曲线模型</strong>（朱兰和格里纳）认为存在"最优质量水平"（q₀），此时预防+鉴定成本与故障成本之和最小——意味着"允许一定比例的不良是经济的"。</p>
<p><strong>现代模型颠覆了这一观点</strong>：当企业引入隐藏成本（非生产过程质量损失、过程低效率损失、顾客流失损失）后，质量损失成本降低的速度远超预防成本增加的速度。结论变为——趋向零缺陷时，总质量成本最低。这与克劳斯比"第一次就把事情做对"的理念完全吻合。</p>

<h3>与其他知识点的内在联系</h3>
<p><strong>与 PDCA：</strong>质量成本数据是 P（策划）的核心输入——通过历史故障成本数据，决定下一轮预防资源的投放方向。<br><strong>与 FMEA：</strong>RPN = 严重度 × 频度 × 探测度，本质上是在量化"如果不预防，将产生多少故障成本"。<br><strong>与 ISO 9001：</strong>第 10.3 条"持续改进"要求组织分析和评价质量成本，将其作为管理评审的输入之一。</p>`
    },
    // 替换 s2 板块（高频陷阱）
    s2: {
      afterCards: `
<h3>陷阱背后的出题逻辑</h3>
<p>这类题目的出题逻辑是<strong>混淆相似概念</strong>。应对策略：①回到定义本身，抓住关键词——预防是"防止发生"，鉴定是"评定是否合格"；②用"交付前后"区分内部/外部故障；③记住"售后客服人工成本"也属于外部故障成本，这是最容易遗漏的项。</p>
<p>更深层的理解：来料检验之所以是鉴定成本而非预防成本，是因为它发生在"不合格已经存在"之后——检验只是发现它，并没有防止它发生。真正的预防是在供应商端做辅导、在进料规格上做严格定义。</p>`
    },
    // 替换 s3 板块（案例）
    s3: {
      afterCards: `
<h3>传音业务场景映射</h3>
<p>传音手机出口非洲/南亚市场，外部故障成本远高于国内——维修需跨国差旅、物流周期长（海运 30-45 天）、品牌信任一旦损失难以恢复。在研发阶段投入 DFMEA 评审（预防成本）→ 产线增加关键工位专检（鉴定成本）→ 外部故障成本（维修差旅+索赔）大幅下降。这就是"1-10-100 法则"在跨国制造中的实战体现。</p>
<p><strong>数据驱动：</strong>建立全球售后数据看板，按区域/机型/故障类型统计外部故障成本，反向指导下一轮预防资源投放。</p>`
    }
  },

  '02-iso-9000-principles.html': {
    s1: {
      afterTable: `
<h3>原则 vs 规则的本质区别</h3>
<p>七项原则并非凭空产生，而是 ISO/TC176 的各国专家<strong>总结了戴明十四条、朱兰三部曲、克劳斯比零缺陷十四步等大师数十年实践的共性</strong>，提炼出"最大公约数"。</p>
<p><strong>规则（Rule）</strong>告诉你"必须做什么"（可审核），<strong>原则（Principle）</strong>告诉你"为什么这样做"。理解原则，才能在规则未覆盖的场景做出正确判断。七项原则不是并列的，而是形成了一条因果链：领导确立方向 → 全员参与执行 → 过程方法保障效率 → 循证决策纠偏 → 关系管理扩展价值。顾客是起点和终点，改进是永恒动力。</p>`
    },
    s2: {
      afterCards: `
<h3>七项原则的内在逻辑</h3>
<p>七项原则的核心是"以顾客为关注焦点"，其他六项都是实现这一目标的手段。领导作用提供方向和资源，全员积极参与提供执行力，过程方法提供效率保障，改进提供进化动力，循证决策提供纠偏能力，关系管理扩展价值网络。</p>`
    }
  },

  '03-pdca-cycle.html': {
    s1: {
      afterTable: `
<h3>理论溯源：从休哈特环到戴明环</h3>
<p>PDCA 的前身是 1930 年代休哈特提出的"计划-执行-检查"（PDC）循环。戴明在 1950 年代将其扩展为 PDCA，并加入"处置（Act）"环节。<strong>关键创新在于"Act"</strong>——不仅是检查，还要将成功经验标准化、失败教训转化为下一轮的改进输入。</p>

<h3>三层嵌套结构</h3>
<p>PDCA 不是单一循环，而是三层嵌套：<strong>组织级</strong>（战略→执行→评审→改进）、<strong>过程级</strong>（部门/项目级循环）、<strong>个人级</strong>（岗位工作循环）。三层嵌套形成"大环套小环、阶梯式上升"的结构。每一层的输出都是上一层的输入，每一层的改进都推动整体螺旋上升。</p>

<h3>Act 环节为什么最容易被忽略？</h3>
<p>很多企业做到 C（检查）就停了——发现了问题、开了会、但没有标准化。Act 的核心是<strong>"将临时措施固化为永久机制"</strong>。不做 Act，同样的问题会反复出现，PDCA 就变成了空转的轮子。</p>`
    },
    s2: {
      afterCards: `
<h3>与其他工具的内在联系</h3>
<p>PDCA 是所有质量工具的"容器"：质量成本数据驱动 P 阶段，FMEA 指导 P 阶段的预防措施，内审是 C 阶段的核心工具，纠正措施是 A 阶段的具体行动。8D 问题解决法本质上是 PDCA 的结构化展开——D1-D3 对应 P，D4-D6 对应 D，D7 对应 C，D8 对应 A。</p>`
    }
  },

  '04-fmea.html': {
    s1: {
      afterTable: `
<h3>理论溯源：从军工到民用</h3>
<p>FMEA 最早由美国军方在 1940 年代开发，用于确保武器系统的可靠性。1960 年代 NASA 在阿波罗计划中采用。1970 年代福特汽车将其引入民用制造。核心思想：<strong>在问题发生之前，系统性地识别所有可能的失败方式，并评估其风险优先级。</strong></p>

<h3>RPN 的数学逻辑与局限</h3>
<div class="callout">RPN = 严重度(S) × 频度(O) × 探测度(D)，范围：1 ~ 1000</div>
<p><strong>关键洞察：</strong>S≥8 时，无论 RPN 多低，都必须采取措施——因为后果太严重，不能赌概率。这是"风险思维"的核心：不仅看可能性，更要看后果严重性。</p>
<p><strong>局限：</strong>S×O×D 的乘积模型假设三个因素等权重，但实际中严重度的权重应远高于其他两个。新版 AIAG-VDA FMEA 已改用 AP（行动优先级：高/中/低）替代 RPN。</p>`
    },
    s2: {
      afterCards: `
<h3>FMEA 与其他工具的联动</h3>
<p>FMEA 的输出直接驱动控制计划的制定——高 RPN 项必须有对应的控制措施。FMEA 也是 PDCA 中 P 环节的核心工具。在质量成本视角下，FMEA 的 RPN 本质上在量化"如果不预防，将产生多少故障成本"。</p>`
    }
  },

  '05-internal-audit.html': {
    s1: {
      afterTable: `
<h3>内审的本质：管理系统的免疫系统</h3>
<p>内审不是"警察抓小偷"，而是组织管理系统的<strong>免疫机制</strong>。就像人体需要免疫系统定期巡检、识别异常细胞一样，组织需要内审来发现体系运行中的偏差，在问题扩大前纠正。外审是"体检"（一年一次），内审是"日常免疫"（持续运行）。</p>

<h3>独立性原则的认知科学基础</h3>
<p>审核员不能审核自己的工作（ISO 19011 核心要求）。独立性不是"不信任"，而是认知科学的要求——人对自己参与的工作存在<strong>确认偏误</strong>（confirmation bias），倾向于看到自己想看到的。独立审核者能发现审核者自身的盲区。</p>`
    },
    s2: {
      afterCards: `
<h3>内审在 PDCA 中的定位</h3>
<p>内审是 PDCA 中 C（检查）环节的核心工具。内审结果是管理评审的重要输入——内审发现系统性问题，管理评审决策资源投入。内审发现的不符合项触发纠正措施流程，但内审员不应自己制定纠正措施（保持独立性）。</p>`
    }
  },

  '06-supplier-management.html': {
    s1: {
      afterTable: `
<h3>从"价格博弈"到"价值共创"</h3>
<p>传统采购思维是<strong>"压价=降本"</strong>，但供应商质量问题的根源往往是"价格压得太低，供应商无利可图，只能在质量上偷工减料"。现代供应商管理的核心是从博弈关系转向伙伴关系——通过技术辅导、长期合同、联合改进，实现双赢。</p>

<h3>供应商管理的"冰山模型"</h3>
<p>水面以上：价格、交期、合格率（可见指标）。水面以下：技术能力、管理体系、文化匹配度、改进意愿（隐性因素）。只看水面以上的指标，就像只看冰山一角。真正决定长期合作成败的，是水面以下的隐性因素。<strong>供应商审核（二方审核）的本质就是探测冰山以下的能力。</strong></p>`
    },
    s2: {
      afterCards: `
<h3>供应商管理与质量成本的联动</h3>
<p>供应商质量问题导致的外部故障成本，往往远超采购价差。供应商辅导费属于预防成本，是 ROI 最高的投入。新品阶段的供应商 DFMEA/PFMEA 评审是重要的预防活动。ISO 9001:2015 第 8.4 条明确要求对外部提供的过程、产品和服务进行控制。</p>`
    }
  },

  '07-excellence-performance.html': {
    s1: {
      afterTable: `
<h3>从合格到卓越的阶梯</h3>
<p>ISO 9001 解决的是"及格线"问题——确保组织有能力稳定提供合格产品。卓越绩效模式解决的是"满分线"问题——<strong>用 1000 分量化评价组织的经营管理成熟度</strong>。即便 ISO 9001 实施得很好，也只相当于卓越绩效准则 30% 的成熟度。</p>

<h3>"道-术-度"三维框架</h3>
<p><strong>道</strong>：理念（远见卓识的领导、战略导向、顾客驱动...）<br><strong>术</strong>：方法（7 个评价类目的要求）<br><strong>度</strong>：尺度（评价要素及评分指南）</p>
<p>这个框架的精妙之处在于：先问道（为什么做），再修术（怎么做），最后量度（做到什么程度）。很多企业只做"术"（写文件、走流程），忽略了"道"（使命、愿景、价值观），导致体系空转。</p>`
    },
    s2: {
      afterCards: `
<h3>卓越绩效与质量成本的关系</h3>
<p>卓越绩效评价中"经营结果"类目包含质量成本指标，是衡量质量管理有效性的关键证据。卓越绩效的第一条评价就是"领导作用"——因为领导是追求卓越的源动力。</p>`
    }
  },

  '08-reliability-four-steps.html': {
    s1: {
      afterTable: `
<h3>性能 vs 可靠性：素质与体质的类比</h3>
<p>手册中有一个精妙的比喻：<strong>性能指标体现"素质"，可靠性指标体现"体质"</strong>。一个人可以才华横溢（性能优秀），但体弱多病（可靠性差），最终无法持续发挥价值。产品同理——功能再强大，如果经常故障，用户信任就会崩塌。</p>

<h3>可靠性的数学定义</h3>
<div class="callout">R(t) = P{产品在时间 t 内无故障完成规定功能}，0 ≤ R(t) ≤ 1</div>
<p>关键参数：<strong>MTBF</strong>（平均故障间隔时间）越大越好，<strong>MTTR</strong>（平均修复时间）越短越好。可用度 = MTBF/(MTBF+MTTR)。</p>

<h3>可靠性四步法的逻辑链</h3>
<p>第一步：可靠性定义——明确"在什么条件下、多长时间内、完成什么功能"算可靠。第二步：可靠性分配——将系统级指标分解到子系统/零部件。第三步：可靠性预计——用历史数据/手册估算各单元的可靠度。第四步：可靠性评审——验证是否达标，不达标则改进设计。</p>`
    },
    s2: {
      afterCards: `
<h3>传音业务映射</h3>
<p>传音手机在非洲市场面临高温、高湿、多尘的极端环境。定义可靠性目标（如 MTBF≥18 个月）→ 对关键元器件进行可靠性分配 → 加速寿命试验（高温高湿老化）验证 → 根据试验结果优化散热设计和密封工艺。这就是为什么传音手机能在非洲市场赢得"耐用"口碑。</p>`
    }
  },

  '09-manager-skills.html': {
    s1: {
      afterTable: `
<h3>罗伯特·卡茨的三技能模型（1970）</h3>
<p>哈佛教授卡茨提出管理者需要三种技能：<strong>技术技能</strong>（做事的能力）、<strong>人际技能</strong>（与人合作的能力）、<strong>概念技能</strong>（全局思考的能力）。关键发现：<strong>不同层级对三种技能的需求比例不同</strong>。</p>
<p>基层管理者：技术技能 60% | 人际技能 30% | 概念技能 10%<br>中层管理者：技术技能 30% | 人际技能 40% | 概念技能 30%<br>高层管理者：技术技能 10% | 人际技能 30% | 概念技能 60%</p>
<p>这个模型解释了为什么"优秀工程师不一定能当好经理"——技术能力强但人际/概念技能弱，无法胜任管理岗位。</p>`
    },
    s2: {
      afterCards: `
<h3>与领导作用、沟通的关系</h3>
<p>领导作用要求高层管理者具备强概念技能（战略思维），同时需要人际技能来激励全员。人际技能的核心载体就是沟通能力。人员选拔时应根据岗位层级匹配技能要求，而非一味追求技术能力。</p>`
    }
  },

  '10-correction-vs-corrective-action.html': {
    s1: {
      afterTable: `
<h3>纠正 vs 纠正措施：治标与治本</h3>
<div class="callout">纠正（Correction）= 消除已发现的不合格（治标）<br>纠正措施（Corrective Action）= 消除不合格的原因，防止再发生（治本）</div>
<p>这个区分是 ISO 9001:2015 的核心要求之一。<strong>只做纠正不做纠正措施，等于"灭火不防火"</strong>——火灭了但隐患还在，下次还会着。</p>

<h3>为什么企业总停留在"纠正"层面？</h3>
<p>三个原因：①<strong>时间压力</strong>——客户在催、产线在停，先恢复生产再说；②<strong>能力不足</strong>——根因分析需要专业工具（5Why、鱼骨图），不是人人都会；③<strong>文化问题</strong>——追究原因可能被理解为"追究责任"，大家回避深挖。质量经理的核心价值之一，就是推动组织从"纠正"升级到"纠正措施"。</p>`
    },
    s2: {
      afterCards: `
<h3>与其他工具的联动</h3>
<p>5Why 是连接"纠正"到"纠正措施"的桥梁——通过连续追问"为什么"，从表象深入到根因。FMEA 中识别的潜在原因，就是纠正措施应该针对的对象。纠正是 D（执行），纠正措施是 A（处置/标准化）。</p>`
    }
  }
};

// 通用模板（Day 11-60）
function getGenericRichKnowledge(dayNum, topicName) {
  return {
    s1: {
      afterTable: `
<h3>核心原理与底层逻辑</h3>
<p>${topicName}是《质量经理手册》中的重要知识点，其理论基础来源于全面质量管理（TQM）的核心思想。所有质量管理知识点不是孤立的，而是相互关联的体系——掌握底层逻辑（Why），才能应对千变万化的考题。</p>
<p><strong>学习路径：</strong>先理解原理（Why）→ 再记忆方法（How）→ 最后应用工具（What）。死记硬背只能应付原题，理解原理才能应对变题。</p>`
    },
    s2: {
      afterCards: `
<h3>跨知识点关联</h3>
<p>所有质量管理活动都可以用 PDCA 循环来组织——策划、执行、检查、处置。任何质量管理活动的最终目的，都是优化质量成本结构——增加预防投入，减少故障损失。质量管理的本质是持续改进，而持续改进的本质是 PDCA 循环的螺旋上升。</p>`
    }
  };
}

// ===== 执行逻辑 =====

const files = fs.readdirSync(DIR).filter(f => 
  f.endsWith('.html') && !f.includes('topic') && !f.includes('index') && 
  !f.includes('template') && !f.includes('_batch') && !f.includes('batch_') && 
  !f.includes('inject-') && !f.includes('merge-') && !f.includes('enrich-')
);

let processed = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  
  const dayMatch = file.match(/^(\d+)/);
  if (!dayMatch) continue;
  const dayNum = parseInt(dayMatch[1]);
  
  const titleMatch = html.match(/<title>.*?：(.*?)（/);
  const topicName = titleMatch ? titleMatch[1] : `Day ${dayNum}`;
  
  // 1. 删除独立的"原理深挖"板块（s4 或 id="deep-dive"）
  html = html.replace(/<section class="panel" id="s4">\s*<div class="deep-dive">[\s\S]*?<\/div>\s*<\/section>\s*/g, '');
  html = html.replace(/<section class="panel" id="deep-dive">[\s\S]*?<\/section>\s*/g, '');
  
  // 2. 删除所有 inline 小卡片
  html = html.replace(/\n*<div class="deep-dive-inline">[\s\S]*?<\/div>\s*(?=<\/section>)/g, '');
  
  // 3. 获取深度知识内容
  const richContent = RICH_KNOWLEDGE[file] || getGenericRichKnowledge(dayNum, topicName);
  
  // 4. 注入到对应板块
  for (const [sectionId, content] of Object.entries(richContent)) {
    const sectionRegex = new RegExp(`(<section class="panel" id="${sectionId}">)([\\s\\S]*?)(<\\/section>)`);
    const match = html.match(sectionRegex);
    if (!match) continue;
    
    let newSection = match[0];
    
    // 在表格后面插入
    if (content.afterTable && newSection.includes('</table>')) {
      newSection = newSection.replace('</table>', '</table>' + content.afterTable);
    }
    
    // 在卡片后面插入
    if (content.afterCards) {
      // 找到最后一个 </div> 在 </section> 之前的位置（cards 容器的结束）
      const calloutIdx = newSection.lastIndexOf('<div class="callout');
      const cardsEndIdx = newSection.lastIndexOf('</div>\n', calloutIdx > -1 ? calloutIdx : newSection.length);
      
      if (calloutIdx > -1) {
        // 在 callout 后面插入
        const calloutEnd = newSection.indexOf('</div>', calloutIdx);
        if (calloutEnd > -1) {
          newSection = newSection.slice(0, calloutEnd + 6) + content.afterCards + newSection.slice(calloutEnd + 6);
        }
      } else if (cardsEndIdx > -1) {
        newSection = newSection.slice(0, cardsEndIdx + 6) + content.afterCards + newSection.slice(cardsEndIdx + 6);
      }
    }
    
    html = html.replace(match[0], newSection);
  }
  
  fs.writeFileSync(filePath, html);
  processed++;
}

console.log(`✅ 处理完成：${processed} 个文件已丰富化`);
