#!/usr/bin/env python3
"""Batch update Day 21-40 HTML files: add data-keywords and case scoring logic."""

import re
import os

# Define case question data for each day
# Format: { filename: { q6: {answer, keywords, question_text}, q7: {answer, keywords, question_text} } }
CASE_DATA = {
    "21-过程管理.html": {
        "q6": {
            "answer": "过程方法不是按部门割裂管理，而是把相关活动作为一条流程链来整体优化，关注跨部门接口和过程相互作用。",
            "keywords": "流程链,整体优化,过程方法,割裂,跨部门,系统优化,相互作用,接口",
            "text": "请说明过程方法与传统的部门管理有何不同。"
        },
        "q7": {
            "answer": "过程管理强调对过程及其相互作用的系统识别和控制，尤其要重视跨部门接口管理。",
            "keywords": "系统识别,过程控制,相互作用,跨部门,接口管理,过程管理,系统控制",
            "text": "过程管理中为什么要重视跨部门接口？"
        }
    },
    "22-ISO 9000族标准.html": {
        "q6": {
            "answer": "ISO 9001强调质量目标与战略方向一致，并通过策划、资源配置和绩效评价确保目标落地。",
            "keywords": "质量目标,战略方向,策划,资源,绩效评价,落地,一致性",
            "text": "ISO 9001如何确保质量目标与战略方向一致？"
        },
        "q7": {
            "answer": "体系失效常见通病是执行不到位、写做不一致，文件规定与实际操作脱节。",
            "keywords": "执行不到位,写做不一致,体系失效,通病,脱节,文件规定,实际操作",
            "text": "体系失效的常见通病是什么？请举例说明。"
        }
    },
    "23-质量管理体系建立.html": {
        "q6": {
            "answer": "写做不一致是过程方法理解和应用上的典型问题，也是体系有效运行的大忌，文件规定与实际操作必须一致。",
            "keywords": "写做不一致,过程方法,体系运行,大忌,文件规定,实际操作,一致性",
            "text": "体系文件建立后最常见的执行问题是什么？"
        },
        "q7": {
            "answer": "认证机构选择要兼顾合法性、客户要求、专业能力和成本四个方面。",
            "keywords": "合法性,客户要求,专业能力,成本,认证机构,选择,兼顾",
            "text": "选择认证机构应考虑哪些因素？"
        }
    },
    "24-质量管理体系运行.html": {
        "q6": {
            "answer": "体系运行的关键不是有文件，而是文件真正落地执行，确保写做一致。",
            "keywords": "文件落地,执行,写做一致,体系运行,落地,真正执行",
            "text": "体系运行的关键是什么？"
        },
        "q7": {
            "answer": "没有测量就无法控制，也无法评价有效性，测量是体系运行的基础。",
            "keywords": "测量,控制,评价,有效性,体系运行,基础",
            "text": "为什么说没有测量就没有控制？"
        }
    },
    "25-质量管理体系改进.html": {
        "q6": {
            "answer": "持续改进要基于数据和方法，而不是单纯凭经验处理问题，要用科学方法驱动改进。",
            "keywords": "数据,方法,经验,持续改进,科学方法,驱动,改进",
            "text": "持续改进应基于什么？"
        },
        "q7": {
            "answer": "创新应在战略约束下进行，并配套风险管理，不能脱离战略方向盲目创新。",
            "keywords": "战略约束,风险管理,创新,战略方向,配套,盲目",
            "text": "创新与风险管理的关系是什么？"
        }
    },
    "26-人力资源.html": {
        "q6": {
            "answer": "培训有局限性，不能替代系统改进，需要结合流程优化和制度完善。",
            "keywords": "培训,局限性,系统改进,替代,流程优化,制度完善",
            "text": "培训能否替代系统改进？为什么？"
        },
        "q7": {
            "answer": "培训必须从需求出发，先做需求分析再安排培训，不能先上课再说。",
            "keywords": "需求,培训,需求分析,出发,上课,计划",
            "text": "培训应从什么出发？"
        }
    },
    "27-沟通.html": {
        "q6": {
            "answer": "部门行话不一致是典型的语义障碍，不同部门对同一术语理解不同导致沟通失败。",
            "keywords": "语义障碍,行话,沟通障碍,部门,术语,理解,沟通失败",
            "text": "部门间行话不一致属于什么沟通障碍？"
        },
        "q7": {
            "answer": "积极倾听强调专注理解对方的意思，而不是急着评价或准备反驳。",
            "keywords": "理解,积极倾听,评价,专注,反驳,沟通",
            "text": "积极倾听的核心是什么？"
        }
    },
    "28-激励.html": {
        "q6": {
            "answer": "管理重点应放在积极强化上，惩罚效果往往只是暂时的，正向激励才能持久改变行为。",
            "keywords": "积极强化,惩罚,暂时,激励,正向,持久,行为",
            "text": "管理重点应放在积极强化还是惩罚上？为什么？"
        },
        "q7": {
            "answer": "激励要因人而异，不能只靠单一奖惩方式，要根据员工需求层次和个性差异选择激励手段。",
            "keywords": "因人而异,奖惩,激励,单一,需求层次,个性差异,手段",
            "text": "激励方式应如何选择？"
        }
    },
    "29-团队管理.html": {
        "q6": {
            "answer": "团队管理既要管任务，也要管关系，任务维度关注目标达成，关系维度关注团队氛围和协作。",
            "keywords": "任务,关系,团队管理,目标达成,氛围,协作,双维度",
            "text": "团队管理需要管什么？"
        },
        "q7": {
            "answer": "团队运行需要规则、结构和合适的领导来保障，缺一不可。",
            "keywords": "规则,结构,领导,团队运行,保障,缺一不可",
            "text": "团队运行需要什么保障？"
        }
    },
    "30-项目管理.html": {
        "q6": {
            "answer": "项目延期常因范围不清和责任不明，应先把工作分解结构做好再推进执行。",
            "keywords": "范围不清,责任不明,工作分解,项目延期,WBS,分解结构",
            "text": "项目延期的常见原因是什么？如何解决？"
        },
        "q7": {
            "answer": "项目管理不是只盯进度，而是要对范围、成本、质量等多个职能领域同步控制。",
            "keywords": "进度,职能,同步控制,项目管理,范围,成本,质量",
            "text": "项目管理需要控制哪些方面？"
        }
    },
    "31-统计基础.html": {
        "q6": {
            "answer": "质量评价要同时看中心和波动，单看均值不能判断过程好坏，还要看标准差等离散指标。",
            "keywords": "中心,波动,质量评价,均值,标准差,离散,过程表现",
            "text": "质量评价要看哪些统计量？"
        },
        "q7": {
            "answer": "均值容易受极端值影响，中位数更能反映数据的典型位置，对异常值不敏感。",
            "keywords": "均值,极端值,中位数,典型位置,异常值,敏感",
            "text": "均值和中位数有什么区别？各自适用什么场景？"
        }
    },
    "32-控制图.html": {
        "q6": {
            "answer": "控制图的意义在于报警，不能等到越界才处理，要关注趋势和异常信号。",
            "keywords": "报警,越界,控制图,趋势,异常信号,处理,监控",
            "text": "控制图的意义是什么？"
        },
        "q7": {
            "answer": "控制图的首要前提是数据类型匹配，计量型数据用计量控制图，计数型数据用计数控制图。",
            "keywords": "数据类型,匹配,控制图,前提,计量型,计数型",
            "text": "使用控制图的首要前提是什么？"
        }
    },
    "33-抽样检验.html": {
        "q6": {
            "answer": "抽样检验特别适合批量大和破坏性检验场景，但不能忽视风险管理，关键项目仍需重点管控。",
            "keywords": "批量,破坏性,抽样检验,风险管理,关键项目,管控,效率",
            "text": "抽样检验适合什么场景？需要注意什么？"
        },
        "q7": {
            "answer": "免检建立在管理体系健全、过程能力稳定、质量问题可控的基础上，不是随便就能免检。",
            "keywords": "管理体系,过程能力,质量问题,免检,健全,稳定,可控",
            "text": "免检建立在什么基础上？"
        }
    },
    "34-测量系统分析(MSA).html": {
        "q6": {
            "answer": "测量系统不稳定会导致数据失真，必须先把量得准不准的问题解决，再谈过程改进。",
            "keywords": "数据失真,测量系统,量具,MSA,校准,过程改进",
            "text": "测量系统不稳定会导致什么后果？"
        },
        "q7": {
            "answer": "MSA的核心是判断测量系统是否适用，而不只是看量具外观是否正常，要评估偏倚、重复性、再现性等指标。",
            "keywords": "测量系统,适用,量具,MSA,偏倚,重复性,再现性",
            "text": "MSA的核心是什么？"
        }
    },
    "35-柏拉图.html": {
        "q6": {
            "answer": "柏拉图的目标是把有限资源用在最关键的问题上，通过排序识别关键少数。",
            "keywords": "有限资源,关键问题,柏拉图,聚焦,排序,关键少数",
            "text": "柏拉图的目标是什么？"
        },
        "q7": {
            "answer": "柏拉图后的关键动作是聚焦并行动，集中资源解决前几类主要问题，然后重新做柏拉图验证效果。",
            "keywords": "聚焦,行动,柏拉图,资源,验证,改善",
            "text": "柏拉图分析后的关键动作是什么？"
        }
    },
    "36-鱼骨图.html": {
        "q6": {
            "answer": "鱼骨图适合先发散再收敛，先广泛列出可能原因，再结合证据筛选关键原因。",
            "keywords": "发散,收敛,鱼骨图,原因分析,筛选,证据",
            "text": "鱼骨图的使用策略是什么？"
        },
        "q7": {
            "answer": "鱼骨图的价值在于结构化思考，避免拍脑袋下结论，帮助团队系统性地梳理原因。",
            "keywords": "结构化思考,避免,拍脑袋,鱼骨图,系统性,原因",
            "text": "鱼骨图的价值是什么？"
        }
    },
    "37-5Why分析.html": {
        "q6": {
            "answer": "5Why不是找一个看起来像原因的答案，而是持续追问并验证，直到找到真正可执行的根因。",
            "keywords": "追问,验证,根因,5Why,表面,可执行,持续",
            "text": "5Why分析的关键是什么？"
        },
        "q7": {
            "answer": "5Why的价值在于把问题从表面拖到可执行的根因层，避免治标不治本。",
            "keywords": "表面,根因,可执行,5Why,治标不治本,追问",
            "text": "5Why的价值是什么？"
        }
    },
    "38-QFD质量功能展开.html": {
        "q6": {
            "answer": "QFD的核心是把顾客语言转成工程语言，通过质量屋建立需求与技术特性的关系矩阵。",
            "keywords": "顾客语言,工程语言,转化,QFD,质量屋,关系矩阵",
            "text": "QFD的核心是什么？"
        },
        "q7": {
            "answer": "QFD的价值在于把想要什么变成怎么做，确保研发资源优先投入到最重要的顾客需求上。",
            "keywords": "想要什么,怎么做,QFD,研发,顾客需求,优先",
            "text": "QFD的价值是什么？"
        }
    },
    "39-FMEA深化.html": {
        "q6": {
            "answer": "FMEA的价值在于前瞻性风险管理，并与控制计划联动，提前识别和降低潜在风险。",
            "keywords": "前瞻性,风险管理,控制计划,FMEA,联动,潜在风险",
            "text": "FMEA的价值是什么？"
        },
        "q7": {
            "answer": "FMEA的核心是识别、评估、行动、更新的闭环流程，持续迭代而非一次性完成。",
            "keywords": "识别,评估,行动,更新,FMEA,闭环,迭代",
            "text": "FMEA的核心流程是什么？"
        }
    },
    "40-审核员能力.html": {
        "q6": {
            "answer": "审核员不仅要懂标准，还要会基于证据沟通，用事实和数据说话而非主观判断。",
            "keywords": "标准,证据,沟通,审核员,事实,数据,客观",
            "text": "审核员需要什么核心能力？"
        },
        "q7": {
            "answer": "审核结论必须建立在证据链上，而不是经验判断，要基于客观证据形成结论。",
            "keywords": "证据链,经验判断,审核结论,客观证据,结论",
            "text": "审核结论应建立在什么基础上？"
        }
    }
}

# The new JavaScript submitQuiz function that handles case-type questions
NEW_JS_FUNC = r'''// 改进的提交函数
function submitQuiz(){
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
        const passed=matchRate>=0.5; // 至少匹配50%关键词
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
    // 计算总分（选择题+案例题）
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
}'''

BASE_DIR = "/home/node/.openclaw/workspace-quality-manager-handbook/quiz-pages"

def update_file(filename, case_info):
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Update q6 case question div - add data-keywords and data-answer
    # Pattern: <div class="question" data-id="q6" data-answer="A" data-type="case">
    content = re.sub(
        r'<div class="question" data-id="q6" data-answer="A" data-type="case">',
        f'<div class="question" data-id="q6" data-answer="{case_info["q6"]["answer"]}" data-keywords="{case_info["q6"]["keywords"]}" data-type="case">',
        content
    )
    
    # 2. Update q7 case question div
    content = re.sub(
        r'<div class="question" data-id="q7" data-answer="A" data-type="case">',
        f'<div class="question" data-id="q7" data-answer="{case_info["q7"]["answer"]}" data-keywords="{case_info["q7"]["keywords"]}" data-type="case">',
        content
    )
    
    # 3. Update q6 question header text
    content = re.sub(
        r'(<div class="question-header">第7题：)<span class="badge badge-case">案例</span>',
        f'\\1{case_info["q6"]["text"]}<span class="badge badge-case">案例</span>',
        content
    )
    
    # 4. Update q7 question header text
    content = re.sub(
        r'(<div class="question-header">第8题：)<span class="badge badge-case">案例</span>',
        f'\\1{case_info["q7"]["text"]}<span class="badge badge-case">案例</span>',
        content
    )
    
    # 5. Update the questions array to include type:'case' for q6 and q7
    # Replace the q6 entry in questions array
    content = re.sub(
        r"\{id:'q6',text:'案例题'\}",
        f"{{id:'q6',text:'{case_info['q6']['text']}',type:'case'}}",
        content
    )
    content = re.sub(
        r"\{id:'q7',text:'案例题'\}",
        f"{{id:'q7',text:'{case_info['q7']['text']}',type:'case'}}",
        content
    )
    
    # 6. Replace the submitQuiz function with the new one that handles case-type
    # Find the old submitQuiz function and replace it
    old_func_pattern = r'// 改进的提交函数\nfunction submitQuiz\(\)\{.*?\n\}'
    content = re.sub(old_func_pattern, lambda m: NEW_JS_FUNC, content, flags=re.DOTALL)
    
    # 7. Also update explanations for q6 and q7 to match the reference answers
    # Update q6 explanation
    content = re.sub(
        r'(q6:")([^"]*?)(",)',
        lambda m: 'q6:"' + case_info["q6"]["answer"].replace('\\', '\\\\') + '",',
        content
    )
    # Update q7 explanation
    content = re.sub(
        r'(q7:")([^"]*?)(")',
        lambda m: 'q7:"' + case_info["q7"]["answer"].replace('\\', '\\\\') + '"',
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Updated: {filename}")
        return True
    else:
        print(f"⚠️  No changes: {filename}")
        return False

# Process all files
updated = 0
for filename, case_info in CASE_DATA.items():
    if update_file(filename, case_info):
        updated += 1

print(f"\n📊 Total updated: {updated}/{len(CASE_DATA)} files")
