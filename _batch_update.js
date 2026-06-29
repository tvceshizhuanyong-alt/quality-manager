const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// Keywords and case question text for each day (41-60)
const DAY_DATA = {
  41: {
    q6_keywords: '管理评审,系统性评价,高层视角,决策,输出,跟踪,有效性',
    q6_text: '某公司管理评审流于形式，请分析有效管理评审的核心要素。',
    q6_answer: '管理评审的核心不是"开会"，而是用高层视角做系统性评价并形成决策。没有输出和跟踪，就不算真正有效的管理评审。',
    q7_keywords: '系统评价,资源配置,改进决策,管理评审,高层推动,决策',
    q7_text: '请说明管理评审如何驱动组织资源配置与改进。',
    q7_answer: '管理评审的重点是通过系统评价驱动资源配置和改进决策，不能只停留在汇报层面。'
  },
  42: {
    q6_keywords: '质量目标,量化,可测量,分解,跟踪,考核,指标',
    q6_text: '某企业质量目标仅为口号式表述，请分析其问题并提出改进建议。',
    q6_answer: '质量目标必须可量化、可跟踪、可分解，否则只能算口号，不能算管理目标。',
    q7_keywords: '质量目标,动态跟踪,纠偏,定期监控,持续改进,考核',
    q7_text: '如何确保质量目标在全年得到有效执行？',
    q7_answer: '质量目标管理的关键是动态跟踪和及时纠偏，不能只在年末总结。'
  },
  43: {
    q6_keywords: '质量成本,结构优化,预防投入,总成本,鉴定,故障成本,成本管控',
    q6_text: '某企业为降本直接取消部分检验工位，请分析该做法的利弊。',
    q6_answer: '质量成本管理不是简单"砍检验"，而是通过结构性优化，让总成本更低。很多时候加大预防投入反而更省钱。',
    q7_keywords: '质量成本,成本结构,合理配置,总成本最小化,预防,故障',
    q7_text: '如何理解"质量成本不是越省越好"？',
    q7_answer: '质量成本不是越省越好，关键在于合理配置成本结构，让总成本最小化。'
  },
  44: {
    q6_keywords: '供应商绩效,总成本,长期稳定,采购价格,综合损失,质量管理',
    q6_text: '某采购部门仅以价格评价供应商，请分析可能带来的风险。',
    q6_answer: '供应商绩效不是单看采购价格，而是看总成本和长期稳定性。若质量恶化，短期压价往往会带来更高的综合损失。',
    q7_keywords: '低价,总成本,供应商管理,稳定性,风险,综合评估',
    q7_text: '如何理解"低价不等于低总成本"？',
    q7_answer: '低价并不等于低总成本。供应商管理必须综合考虑稳定性和风险。'
  },
  45: {
    q6_keywords: '沟通,共同定义,责任分工,反馈机制,跨部门协作,问题定义',
    q6_text: '跨部门协作中沟通低效，请分析原因并提出改善方案。',
    q6_answer: '沟通深化的关键不在"说服别人"，而在于建立共同的问题定义、责任分工和反馈机制，让跨部门协作真正落地。',
    q7_keywords: '沟通,对象,语言,反馈,重述,书面确认,信息偏差',
    q7_text: '如何减少跨部门沟通中的信息偏差？',
    q7_answer: '沟通要考虑对象、语言和反馈，必要时通过重述和书面确认减少信息偏差。'
  },
  46: {
    q6_keywords: '激励,需求分析,差异化,物质激励,精神激励,个性化,积极性',
    q6_text: '某公司激励手段单一，员工积极性不高，请提出改进建议。',
    q6_answer: '激励应基于员工需求分析，采取差异化方案，物质与精神激励结合，关注个性化需求。',
    q7_keywords: '强化理论,及时强化,正强化,积极行为,重复,负强化,激励',
    q7_text: '请运用强化理论说明如何促进员工积极行为。',
    q7_answer: '强化理论强调及时强化，正强化尤其适合促进积极行为重复出现。'
  },
  47: {
    q6_keywords: '团队,共同目标,责任边界,角色分工,协作,信任,沟通',
    q6_text: '某项目团队成员各自为战，请分析原因并提出团队建设方案。',
    q6_answer: '团队建设需要明确共同目标、清晰角色分工和责任边界，建立信任和沟通机制。',
    q7_keywords: '团队协作,共同目标,责任边界,各自为战,协同,一致性',
    q7_text: '团队协作的前提条件是什么？',
    q7_answer: '团队协作的前提是共同目标和责任边界一致，否则很容易出现各自为战。'
  },
  48: {
    q6_keywords: '项目管理,范围管理,进度控制,风险管理,干系人,计划,变更',
    q6_text: '某项目频繁变更导致延期，请分析项目管理中的关键控制点。',
    q6_answer: '项目管理需要严格控制范围、进度和风险，做好干系人沟通和变更管理。',
    q7_keywords: '项目控制,范围受控,计划受控,变更受控,基准,偏差',
    q7_text: '项目控制的三个关键维度是什么？',
    q7_answer: '项目控制的关键是范围受控、计划受控和变更受控。'
  },
  49: {
    q6_keywords: '认证,认可,供应链,信任基础,审核,合规,质量保证',
    q6_text: '某企业在供应链管理中过度依赖认证证书，请分析其局限性。',
    q6_answer: '认证是供应链信任的基础，但不能替代对供应商实际绩效和持续改进能力的评估。',
    q7_keywords: '认证,供应链,基础信任,真实绩效,持续改进,合作决策',
    q7_text: '认证在供应链管理中的正确定位是什么？',
    q7_answer: '认证在供应链中提供基础信任，但最终合作决策仍需看真实绩效和持续改进能力。'
  },
  50: {
    q6_keywords: '组织环境,内部因素,外部因素,SWOT,战略方向,利益相关方',
    q6_text: '请分析组织内外部环境对质量管理体系的影响。',
    q6_answer: '组织环境包括内部因素（文化、结构、资源）和外部因素（市场、法规、技术），影响体系的战略方向。',
    q7_keywords: '组织环境,动态变化,重新评估,调整策划,持续监控,适应性',
    q7_text: '当组织环境发生重大变化时应如何处理？',
    q7_answer: '组织环境不是静态的，发生重大变化时必须重新评估并调整策划。'
  },
  51: {
    q6_keywords: '质量方针,宗旨,适应,战略目标,全员理解,沟通,框架',
    q6_text: '某企业质量方针与实际操作脱节，请分析原因并提出改进措施。',
    q6_answer: '质量方针应体现企业宗旨，适应战略目标，并确保全员理解和执行。',
    q7_keywords: '质量方针,转化,目标,制度,行为,引导作用,落地',
    q7_text: '质量方针如何才能真正发挥引导作用？',
    q7_answer: '质量方针必须转化为目标、制度和行为，才能真正发挥引导作用。'
  },
  52: {
    q6_keywords: '文件控制,版本管理,审批,发放,回收,有效性,受控',
    q6_text: '某车间同时存在多个版本的作业指导书，请分析文件控制的问题。',
    q6_answer: '文件控制需要严格的版本管理、审批流程和发放回收机制，确保现场使用有效版本。',
    q7_keywords: '文件控制,版本分散,信息失真,有效版本,现场管理,统一',
    q7_text: '文件控制的核心目标是什么？',
    q7_answer: '文件控制要防止版本分散和信息失真，确保现场使用同一有效版本。'
  },
  53: {
    q6_keywords: '过程方法,输入,输出,活动,资源,绩效指标,过程owner',
    q6_text: '请说明过程方法在质量管理中的实施步骤。',
    q6_answer: '过程方法需要识别过程、明确输入输出、分配资源、设定绩效指标并指定过程负责人。',
    q7_keywords: '过程方法,接口,相互作用,职责真空,信息断点,衔接',
    q7_text: '过程方法中最容易被忽视的管理要点是什么？',
    q7_answer: '过程方法的关键之一就是管理过程之间的接口与相互作用，减少职责真空和信息断点。'
  },
  54: {
    q6_keywords: '资源管理,人力资源,基础设施,工作环境,知识管理,能力培训',
    q6_text: '某企业资源投入不足导致质量问题频发，请分析资源管理的关键要素。',
    q6_answer: '资源管理涵盖人力资源、基础设施、工作环境、知识管理等，需要系统规划和持续投入。',
    q7_keywords: '资源管理,设备,人员,知识沉淀,传承,能力',
    q7_text: '资源管理的内涵除了设备和人还包括什么？',
    q7_answer: '资源管理不仅是设备和人，还包括知识沉淀与传承。'
  },
  55: {
    q6_keywords: '监视,测量,数据分析,趋势,异常,改进决策,绩效指标',
    q6_text: '某企业收集了大量质量数据但未有效利用，请分析问题并提出建议。',
    q6_answer: '监视和测量数据应通过分析发现趋势、识别异常，为改进决策提供依据。',
    q7_keywords: '监视测量,数据,趋势,异常,改进,报表,决策支持',
    q7_text: '监视和测量数据的核心价值是什么？',
    q7_answer: '监视和测量数据的核心价值在于发现趋势、识别异常并支持改进，而不是装饰报表。'
  },
  56: {
    q6_keywords: '不合格品,标识,隔离,评审,处置,返工,报废,让步接收',
    q6_text: '某车间发现不合格品后直接混入合格品中，请分析其违规之处。',
    q6_answer: '不合格品必须标识、隔离、评审和授权处置，不能与合格品混合。',
    q7_keywords: '不合格品,评审,授权程序,交期,控制要求,处置',
    q7_text: '赶交期时能否跳过不合格品评审程序？',
    q7_answer: '不合格品不能因赶交期而跳过评审和授权程序，必须按控制要求处置。'
  },
  57: {
    q6_keywords: '纠正措施,根因分析,原因调查,预防措施,再发防止,有效性验证',
    q6_text: '某企业反复出现同样的质量问题，请分析纠正措施实施中的问题。',
    q6_answer: '纠正措施必须进行根因分析，找到根本原因并采取措施防止再发生。',
    q7_keywords: '返工,根因治理,问题重复,纠正措施,根本原因,再发防止',
    q7_text: '只做返工不做根因分析会有什么后果？',
    q7_answer: '只做返工没有根因治理，就很容易出现问题重复发生。'
  },
  58: {
    q6_keywords: '管理者,技术能力,人际能力,概念能力,领导力,沟通协调',
    q6_text: '某技术骨干晋升管理者后不适应，请分析管理者需要的核心能力。',
    q6_answer: '管理者需要技术能力、人际能力和概念能力的综合，从管事转向管人管事。',
    q7_keywords: '管理者能力,技术导向,人际能力,概念能力,过渡,提升',
    q7_text: '管理者能力提升的方向是什么？',
    q7_answer: '管理者能力提升要从技术导向逐步过渡到人际与概念能力。'
  },
  59: {
    q6_keywords: '领导作用,方向,资源,支持,示范,愿景,激励员工',
    q6_text: '某部门领导将质量工作全部推给下属，请分析领导作用的正确发挥方式。',
    q6_answer: '领导作用应提供方向、资源和支持，而非简单地将工作推给下属。',
    q7_keywords: '领导作用,方向,资源,支持,推动,赋能,示范',
    q7_text: '领导作用的核心内涵是什么？',
    q7_answer: '领导作用不是把事情推给下属，而是提供方向、资源和支持。'
  },
  60: {
    q6_keywords: '企业文化,价值观,行为规范,制度,长期建设,全员参与,氛围',
    q6_text: '某企业希望快速建立质量文化，请分析文化建设的要点。',
    q6_answer: '企业文化建设需要价值观引导、制度保障和行为规范，是一个长期过程。',
    q7_keywords: '文化转变,价值导向,制度约束,行为示范,长期作用,持续',
    q7_text: '文化转变需要哪些要素共同作用？',
    q7_answer: '文化转变需要价值导向、制度约束和行为示范长期共同作用。'
  }
};

// The new submitQuiz function (matching Day 7 reference)
const NEW_SUBMIT_FN = `function submitQuiz(){
  try {
    let score=0,html='';
    questions.forEach((q,idx)=>{
      const box=document.querySelector('.question[data-id="'+q.id+'"]');
      if(!box) return;
      const correct=box.getAttribute('data-answer');
      
      if(q.type==='case'){
        // 案例题：关键词匹配判分
        const textarea=box.querySelector('.case-answer');
        const userAnswer=textarea?textarea.value.trim():'';
        const keywords=box.getAttribute('data-keywords')||'';
        const keywordList=keywords.split(',').filter(k=>k.trim());
        let matchCount=0;
        keywordList.forEach(kw=>{
          if(userAnswer.includes(kw.trim())) matchCount++;
        });
        const matchRate=keywordList.length>0?matchCount/keywordList.length:0;
        const passed=matchRate>=0.5;
        if(passed) score++;
        html+='<div class="result-card '+(passed?'result-correct':'result-wrong')+'">';
        html+='<div style="font-weight:600;margin-bottom:6px">'+(passed?'✅':'❌')+' 第'+(idx+1)+'题（案例）：'+q.text+'</div>';
        html+='<div style="margin-bottom:6px"><strong>你的答案：</strong><span style="color:#555">'+(userAnswer||'未作答')+'</span></div>';
        html+='<div style="margin-bottom:6px"><strong>关键词匹配：</strong><span style="color:'+(passed?'#16a34a':'#ef4444')+';font-weight:600">'+matchCount+'/'+keywordList.length+' ('+Math.round(matchRate*100)+'%)</span></div>';
        html+='<div style="margin-bottom:6px"><strong>参考答案：</strong><span style="color:#16a34a;font-weight:600">'+correct+'</span></div>';
        html+='<div style="margin-top:6px;color:#555;font-size:13px">'+(explanations[q.id]||'')+'</div></div>';
      } else {
        // 选择题：原有逻辑
        const checked=[...box.querySelectorAll('input:checked')].map(x=>x.value).join('');
        const ok=checked===correct;
        if(ok)score++;
        html+='<div class="result-card '+(ok?'result-correct':'result-wrong')+'">';
        html+='<div style="font-weight:600;margin-bottom:6px">'+(ok?'✅':'❌')+' 第'+(idx+1)+'题：'+q.text+'</div>';
        if(!ok)html+='<div>你的答案：<span style="color:#ef4444">'+(checked||'未作答')+'</span> | 正确答案：<span style="color:#16a34a;font-weight:600">'+correct+'</span></div>';
        else html+='<div>答案：<span style="color:#16a34a;font-weight:600">'+correct+'</span> ✅</div>';
        html+='<div style="margin-top:6px;color:#555;font-size:13px">'+(explanations[q.id]||'')+'</div></div>';
      }
    });
    var scoreBar=document.getElementById('scoreBar');
    var resultDetails=document.getElementById('resultDetails');
    var resultDiv=document.getElementById('result');
    var submitBtn=document.getElementById('submitBtn');
    var totalQuestions=questions.length;
    if(scoreBar) scoreBar.textContent='得分：'+score+' / '+totalQuestions+(score===totalQuestions?' 🎉 满分！':'');
    if(resultDetails) resultDetails.innerHTML=html;
    if(resultDiv){resultDiv.style.display='block';setTimeout(function(){resultDiv.scrollIntoView({behavior:'smooth'})},200);}
    if(submitBtn){submitBtn.textContent='已提交 ✓';submitBtn.disabled=true;submitBtn.style.opacity='0.5';submitBtn.style.cursor='not-allowed';}
    document.querySelectorAll('.question input').forEach(function(inp){inp.disabled=true;});
    document.querySelectorAll('.case-answer').forEach(function(ta){ta.disabled=true;});
  } catch(e) {
    alert('提交出错，请刷新页面重试：'+e.message);
  }
}`;

// Process each file
for (let day = 41; day <= 60; day++) {
  const files = fs.readdirSync(DIR).filter(f => f.startsWith(day + '-') && !f.includes('topic') && f.endsWith('.html'));
  if (files.length === 0) {
    console.log(`Day ${day}: No file found, skipping`);
    continue;
  }
  const filename = files[0];
  const filepath = path.join(DIR, filename);
  let content = fs.readFileSync(filepath, 'utf8');
  const data = DAY_DATA[day];
  
  // 1. Add data-keywords and data-answer to q6 (第7题)
  content = content.replace(
    /(<div class="question" data-id="q6") data-answer="CASE7"( data-type="case")/,
    `$1 data-answer="${data.q6_answer.replace(/"/g, '&quot;')}" data-keywords="${data.q6_keywords}"$2`
  );
  
  // 2. Add data-keywords and data-answer to q7 (第8题)
  content = content.replace(
    /(<div class="question" data-id="q7") data-answer="CASE8"( data-type="case")/,
    `$1 data-answer="${data.q7_answer.replace(/"/g, '&quot;')}" data-keywords="${data.q7_keywords}"$2`
  );
  
  // 3. Update question header for q6 (第7题)
  content = content.replace(
    /(<div class="question-header">第7题（案例）：)<span class="badge badge-case">案例<\/span>/,
    `$1${data.q6_text}<span class="badge badge-case">案例</span>`
  );
  
  // 4. Update question header for q7 (第8题)
  content = content.replace(
    /(<div class="question-header">第8题（案例）：)<span class="badge badge-case">案例<\/span>/,
    `$1${data.q7_text}<span class="badge badge-case">案例</span>`
  );
  
  // 5. Update questions array - q6 entry
  content = content.replace(
    /\{id:'q6',text:""\}/,
    `{id:'q6',text:"${data.q6_text}",type:'case'}`
  );
  
  // 6. Update questions array - q7 entry
  content = content.replace(
    /\{id:'q7',text:""\}/,
    `{id:'q7',text:"${data.q7_text}",type:'case'}`
  );
  
  // 7. Replace the entire submitQuiz function
  // Find the function and replace it
  const fnStart = content.indexOf('function submitQuiz(){');
  if (fnStart === -1) {
    console.log(`Day ${day}: Could not find submitQuiz function!`);
    continue;
  }
  
  // Find the matching closing brace
  let braceCount = 0;
  let fnEnd = -1;
  for (let i = fnStart; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        fnEnd = i + 1;
        break;
      }
    }
  }
  
  if (fnEnd === -1) {
    console.log(`Day ${day}: Could not find end of submitQuiz function!`);
    continue;
  }
  
  content = content.substring(0, fnStart) + NEW_SUBMIT_FN + content.substring(fnEnd);
  
  // 8. Also update the explanations for q6 and q7 to match the new answers
  // Replace q6 explanation
  const q6ExpRegex = new RegExp(`q6:"[^"]*"`);
  content = content.replace(q6ExpRegex, `q6:"${data.q6_answer.replace(/"/g, '\\"')}"`);
  
  // Replace q7 explanation
  const q7ExpRegex = new RegExp(`q7:"[^"]*"`);
  content = content.replace(q7ExpRegex, `q7:"${data.q7_answer.replace(/"/g, '\\"')}"`);
  
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Day ${day}: ✓ Updated ${filename}`);
}

console.log('\nAll files updated!');
