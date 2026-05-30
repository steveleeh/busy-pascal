/* =====================================================================
   ⚙️ APP.JS - 贝叶斯“面积几何割裂”状态机控制器 (高保真单页路由 Hash Router 版)
   职责：管理 9 个教学步骤的状态，驱动左侧几何图形变形与右侧卡片内容更新
   新增特性：将原本跳跃太大的“步骤 6 泛化通用贝叶斯”高细粒度地拆分为：
             - 步骤 6：符号映射（从具体单词映射为概率论抽象字母 A1, A2, B）
             - 步骤 7：拆解分子（展示交集区域面积如何由先验乘似然计算得出）
             - 步骤 8：拆解分母（基于全概率公式拆解整体证据 P(B) 的面积和）
             - 步骤 9：合龙大厦（组装出通用多分类贝叶斯定理，大功告成）
   ===================================================================== */

// 1. 9 步骤教学数据库 (9-Step Educational Database)
const STEPS_DATA = [
    // 步骤 1：全集
    {
        title: "📄 步骤 1：定义初始样本全集 U",
        desc: `
            <p>首先，我们将整个<strong>初始样本全集 U</strong>想象成这个灰色的大矩形框。</p>
            <p>这个大矩形代表了我们收到的所有 <span class="highlight">10,000 封邮件</span>（总面积代表概率 100%，即 1.0）。</p>
            <p>此时，在没有观测任何邮件特征词前，我们对任何一封新邮件的内容和类型一无所知。</p>
        `,
        formula: "P(U) = 1.0",
        formulaNote: "全集 U 的面积为 1.0，代表所有邮件概率总和为 100%。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-1";
            
            // 初始重置隐藏
            dom.clueStrip.style.bottom = "0";
            dom.clueStrip.style.height = "0%";
            dom.clueStrip.style.opacity = "0";
            
            dom.interHam.style.left = "0%";
            dom.interHam.style.width = "50%";
            dom.interHam.style.height = "12.5%";
            dom.interHam.style.opacity = "0";
            
            dom.interSpam.style.left = "50%";
            dom.interSpam.style.width = "50%";
            dom.interSpam.style.height = "100%";
            dom.interSpam.style.opacity = "0";
        }
    },
    // 步骤 2：Ham vs Spam
    {
        title: "📊 步骤 2：划定两大邮件类别 (Spam vs Ham)",
        desc: `
            <p>根据历史邮件的分类统计，整个样本空间被垂直划分为两个部分：</p>
            <p>👈 左侧 <span class="highlight green">绿色区域</span> 代表<strong>正常邮件 (Ham)</strong>，占 50% 面积。</p>
            <p>👉 右侧 <span class="highlight red">红色区域</span> 代表<strong>垃圾邮件 (Spam)</strong>，占 50% 面积。</p>
            <p>此时，如果在没有任何先验特征的情况下，随机抽到一封信是垃圾邮件的先验概率为：<br><strong>P(Spam) = 0.5（也就是 50%）</strong>。</p>
        `,
        formula: "P(Spam) = 0.50 &nbsp;&nbsp;|&nbsp;&nbsp; P(Ham) = 0.50",
        formulaNote: "世界被垂直均匀切开，垃圾邮件与正常邮件各占一半江山。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-2";
            
            dom.clueStrip.style.opacity = "0";
            dom.clueStrip.style.height = "0%";
            
            dom.interHam.style.opacity = "0";
            dom.interSpam.style.opacity = "0";
        }
    },
    // 步骤 3：Winner 切刀
    {
        title: "🔍 步骤 3：观测到 'winner' 特征词",
        desc: `
            <p>现在，我们观测到一封新邮件里出现了高频商业营销词汇：<span class="highlight blue">"winner"</span>。</p>
            <p>单词 "winner" 横跨了正常邮件和垃圾邮件两个阵营：</p>
            <ul>
                <li>在正常邮件（绿区）中，只有 <span class="highlight green">10%</span> 的信包含 "winner"（左侧浅绿黄小交集，占全体的 5%）。</li>
                <li>在垃圾邮件（红区）中，有高达 <span class="highlight red">80%</span> 的信包含 "winner"（右侧粉红黄大交集，占全体的 40%）。</li>
            </ul>
            <p>我们用 <span class="highlight blue">独立蓝色霓虹外框</span> 标记出这部分包含了 "winner" 的非对称阶梯区域。</p>
        `,
        formula: "P(Winner | Ham) = 0.10 &nbsp;&nbsp;&nbsp;&nbsp; P(Winner | Spam) = 0.80",
        formulaNote: "在已知分类的前提下，包含 'winner' 词汇的条件概率（垃圾邮件中出现的比例高达 80%）。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-3";
            
            // clue-strip 在 Step 3 的定位：贴底，高度占全集 80%
            dom.clueStrip.style.bottom = "0";
            dom.clueStrip.style.top = "auto";
            dom.clueStrip.style.height = "80%";
            dom.clueStrip.style.opacity = "1";
            
            // inter-ham 占 clue-strip 高度的 12.5% (即 80% * 12.5% = 10% 全集高度)
            dom.interHam.style.left = "0%";
            dom.interHam.style.width = "50%";
            dom.interHam.style.height = "12.5%";
            dom.interHam.style.opacity = "1";
            
            // inter-spam 占 clue-strip 高度的 100% (即 80% * 100% = 80% 全集高度)
            dom.interSpam.style.left = "50%";
            dom.interSpam.style.width = "50%";
            dom.interSpam.style.height = "100%";
            dom.interSpam.style.opacity = "1";

            // 数学严谨性：联合概率标签
            const labelHam = dom.interHam.querySelector(".box-label");
            const labelSpam = dom.interSpam.querySelector(".box-label");
            labelHam.innerHTML = "P(w ∩ Ham) = 0.05<br><span style='font-size:0.6rem; font-weight:normal; opacity:0.85;'>(占 Ham 的 10%)</span>";
            labelSpam.innerHTML = "P(w ∩ Spam) = 0.40<br><span style='font-size:0.6rem; font-weight:normal; opacity:0.85;'>(占 Spam 的 80%)</span>";
        }
    },
    // 步骤 4：空间收缩
    {
        title: "📐 步骤 4：样本空间的收缩与筛选",
        desc: `
            <p>因为我们已经确切地看到了 "winner" 这个词，所有不包含 "winner" 的正常/垃圾邮件（灰色背景区域）全部失去了讨论的意义。</p>
            <p>我们的样本空间骤然收缩，<strong>筛选过滤只剩下包含 "winner" 的邮件子集！</strong></p>
            <p><strong>看左侧动画：</strong> 两个包含 "winner" 的子集块脱离原有的分类边界，平滑地合并、垂直拉伸撑满整个大方框，<strong>成为我们唯一的“新样本空间”！</strong></p>
            <p>此时，在新样本空间里，垃圾邮件的面积占据了绝大部分。</p>
        `,
        formula: "P(Winner) = P(w ∩ Ham) + P(w ∩ Spam) = 0.05 + 0.40 = 0.45 (即 45%)",
        formulaNote: "筛选出的 'winner' 邮件子集总面积代表 P(Winner)，占全体邮件的 45%。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-4";
            
            // clue-strip 放大至 100%
            dom.clueStrip.style.bottom = "0";
            dom.clueStrip.style.top = "0";
            dom.clueStrip.style.height = "100%";
            dom.clueStrip.style.opacity = "1";
            
            // 比例拉伸与合并
            dom.interHam.style.left = "0%";
            dom.interHam.style.width = "11.11%";
            dom.interHam.style.height = "100%";
            dom.interHam.style.opacity = "1";
            
            dom.interSpam.style.left = "11.11%";
            dom.interSpam.style.width = "88.89%";
            dom.interSpam.style.height = "100%";
            dom.interSpam.style.opacity = "1";

            // 空间初收缩：呈现联合概率大小，以维持严谨的推导逻辑
            const labelHam = dom.interHam.querySelector(".box-label");
            const labelSpam = dom.interSpam.querySelector(".box-label");
            labelHam.innerHTML = `
                <div style="text-align: center;">
                    <strong style="color: #047857; font-size: 0.72rem;">联合概率 P(w ∩ Ham)</strong><br>
                    = 0.05
                </div>
            `;
            labelSpam.innerHTML = `
                <div style="text-align: center;">
                    <strong style="color: #b91c1c; font-size: 0.72rem;">联合概率 P(w ∩ Spam)</strong><br>
                    = 0.40
                </div>
            `;
        }
    },
    // 步骤 5：后验概率计算
    {
        title: "📊 步骤 5：后验概率与贝叶斯公式结算",
        desc: `
            <p>在筛选出的 'winner' 邮件子集（总面积占原始全集的 45%）里，我们要计算：<strong>落在此子集里的垃圾邮件（高亮闪烁红黄区域），占整个子集面积的比例是多少？</strong></p>
            <p>直接代入面积数值计算：</p>
            <p class="highlight red" style="text-align: center; font-size: 1.1rem; margin: 0.5rem 0;">
                0.40 / 0.45 = 88.89%
            </p>
            <p><strong>贝叶斯的实际分类意义：</strong> 观测到 \"winner\" 特征词后，该邮件是垃圾邮件的后验概率，从最初先验概率的 <span class="highlight">50%</span> 暴增到了 <span class="highlight red">88.89%</span>！我们能够非常自信地将其识别、拦截为垃圾邮件！</p>
        `,
        formula: `
            P(Spam | Winner) = 
            <div class="fraction">
                <span class="num">P(Winner ∩ Spam)</span>
                <span class="den">P(Winner)</span>
            </div>
            = 
            <div class="fraction">
                <span class="num">0.40</span>
                <span class="den">0.45</span>
            </div>
            = 88.89%
        `,
        formulaNote: "贝叶斯终极公式：已知邮件包含 'winner' 的前提下，它是垃圾邮件的后验条件概率（垃圾邮件子集在 winner 子集中的面积占比）。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-5";
            
            dom.clueStrip.style.bottom = "0";
            dom.clueStrip.style.top = "0";
            dom.clueStrip.style.height = "100%";
            dom.clueStrip.style.opacity = "1";
            
            dom.interHam.style.left = "0%";
            dom.interHam.style.width = "11.11%";
            dom.interHam.style.height = "100%";
            dom.interHam.style.opacity = "1";
            
            dom.interSpam.style.left = "11.11%";
            dom.interSpam.style.width = "88.89%";
            dom.interSpam.style.height = "100%";
            dom.interSpam.style.opacity = "1";

            const labelHam = dom.interHam.querySelector(".box-label");
            const labelSpam = dom.interSpam.querySelector(".box-label");
            labelHam.innerHTML = `
                <div style="text-align: center; line-height: 1.3;">
                    <strong style="color: #047857; font-size: 0.72rem;">后验 P(Ham | Winner)</strong><br>
                    = <div class="fraction" style="font-size: 0.75em; vertical-align: middle;"><span class="num" style="color: #047857; border-color: #047857;">0.05</span><span class="den" style="color: #047857;">0.45</span></div> = 11.11%
                </div>
            `;
            labelSpam.innerHTML = `
                <div style="text-align: center; line-height: 1.3;">
                    <strong style="color: #b91c1c; font-size: 0.72rem;">后验 P(Spam | Winner)</strong><br>
                    = <div class="fraction" style="font-size: 0.75em; vertical-align: middle;"><span class="num" style="color: #b91c1c; border-color: #b91c1c;">0.40</span><span class="den" style="color: #b91c1c;">0.45</span></div> = 88.89%
                </div>
            `;
        }
    },
    // 步骤 6：从具体到抽象 —— 符号映射
    {
        title: "📄 步骤 6：从具体到抽象 —— 符号映射",
        desc: `
            <p>很好，我们已经解决了解答。现在我们把这个实战案例，一步步泛化为通用的数学公式。</p>
            <p><strong>第一步：我们将具体的词汇替换为抽象概率论事件符号</strong></p>
            <ul>
                <li>我们将想要推测的假说（如 Spam 垃圾邮件）设为事件 <strong>A₁</strong>（别分类 Ham 设为 <strong>A₂</strong>）。</li>
                <li>我们将观测到的线索（如特征词 w）设为证据事件 <strong>B</strong>。</li>
            </ul>
            <p>看左侧白板：色块内部的概率标签已经蜕变为抽象事件符号！之前的计算式自然变成了右侧的基础贝叶斯形式。</p>
        `,
        formula: `
            P(A<sub>1</sub> | B) = 
            <div class="fraction">
                <span class="num">P(B ∩ A<sub>1</sub>)</span>
                <span class="den">P(B)</span>
            </div>
        `,
        formulaNote: "在观测到证据 B 的前提下，目标假说 A1 成立的后验条件概率，等于 A1 与 B 交集的绝对面积除以 B 的总面积。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-6";
            
            dom.clueStrip.style.bottom = "0";
            dom.clueStrip.style.top = "0";
            dom.clueStrip.style.height = "100%";
            dom.clueStrip.style.opacity = "1";
            
            dom.interHam.style.left = "0%";
            dom.interHam.style.width = "11.11%";
            dom.interHam.style.height = "100%";
            dom.interHam.style.opacity = "1";
            
            dom.interSpam.style.left = "11.11%";
            dom.interSpam.style.width = "88.89%";
            dom.interSpam.style.height = "100%";
            dom.interSpam.style.opacity = "1";

            const labelHam = dom.interHam.querySelector(".box-label");
            const labelSpam = dom.interSpam.querySelector(".box-label");
            labelHam.innerHTML = `
                <div style="text-align: center; line-height: 1.3;">
                    <strong style="color: #047857; font-size: 0.72rem;">后验 P(A₂ | B)</strong><br>
                    = <div class="fraction" style="font-size: 0.75em; vertical-align: middle;"><span class="num" style="color: #047857; border-color: #047857;">0.05</span><span class="den" style="color: #047857;">0.45</span></div> = 11.11%
                </div>
            `;
            labelSpam.innerHTML = `
                <div style="text-align: center; line-height: 1.3;">
                    <strong style="color: #b91c1c; font-size: 0.72rem;">后验 P(A₁ | B)</strong><br>
                    = <div class="fraction" style="font-size: 0.75em; vertical-align: middle;"><span class="num" style="color: #b91c1c; border-color: #b91c1c;">0.40</span><span class="den" style="color: #b91c1c;">0.45</span></div> = 88.89%
                </div>
            `;
        }
    },
    // 步骤 7：拆解分子（乘法公式）
    {
        title: "📐 步骤 7：拆解分子 —— 先验与似然的乘积",
        desc: `
            <p><strong>第二步：我们要如何通过已知情报算分子 P(B ∩ A₁) 的面积？</strong></p>
            <p>在步骤 3 中，我们计算右侧红黄交集（40%）时，是用垃圾邮件的先验宽度（50%）乘以切中它的似然度高度（80%）：<br>
            <strong>P(w ∩ Spam) = P(w | Spam) &times; P(Spam)</strong>。</p>
            <p><strong>推广至通用符号：</strong><br>
            分子上的交集面积 <span class="highlight blue">P(B ∩ A₁)</span>，可以通过目标假说的<strong>先验概率 P(A₁)</strong> 与其<strong>似然度 P(B | A₁)</strong> 乘积算得：</p>
            <p class="highlight blue" style="text-align: center; font-family: monospace; font-size: 1.1rem; margin: 0.5rem 0;">
                P(B ∩ A₁) = P(B | A₁) &times; P(A₁)
            </p>
            <p>左侧白板中，代表分子部分的<strong>目标假说色块正在发出呼吸闪烁</strong>。</p>
        `,
        formula: `
            P(B ∩ A<sub>1</sub>) = P(B | A<sub>1</sub>) P(A<sub>1</sub>)
        `,
        formulaNote: "概率乘法公式：两事件同时发生的联合概率，等于它发生的先验概率乘以已知它发生前提下另一特征发生的条件概率。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-7";
            
            // 物理倒回到步骤 3 的几何形态 (Morph Back to Step 3 layout)
            dom.clueStrip.style.bottom = "0";
            dom.clueStrip.style.top = "auto";
            dom.clueStrip.style.height = "80%";
            dom.clueStrip.style.opacity = "1";
            
            dom.interHam.style.left = "0%";
            dom.interHam.style.width = "50%";
            dom.interHam.style.height = "12.5%";
            dom.interHam.style.opacity = "1";
            
            dom.interSpam.style.left = "50%";
            dom.interSpam.style.width = "50%";
            dom.interSpam.style.height = "100%";
            dom.interSpam.style.opacity = "1";

            // 测量尺规高精度定位 - 垃圾邮件 (Spam) 的先验与似然 (放置于盒子外部，避开内部标签重叠)
            if (dom.hRuler) {
                dom.hRuler.style.opacity = "1";
                dom.hRuler.style.left = "50%";
                dom.hRuler.style.width = "50%";
                dom.hRuler.style.bottom = "-25px";
                dom.hRuler.querySelector(".ruler-label").innerHTML = "先验 P(A₁) = 0.50 (宽)";
            }
            
            if (dom.vRuler) {
                dom.vRuler.style.opacity = "1";
                dom.vRuler.style.left = "102%";
                dom.vRuler.style.top = "20%"; // 从 top: 20% 到 bottom: 100% 刚好是 80% 高度
                dom.vRuler.style.height = "80%";
                dom.vRuler.querySelector(".ruler-label").innerHTML = "似然 P(B|A₁) = 0.80 (高)";
            }

            const labelHam = dom.interHam.querySelector(".box-label");
            const labelSpam = dom.interSpam.querySelector(".box-label");
            labelHam.innerHTML = ""; // 隐藏无关分支 label
            labelSpam.innerHTML = `
                <div style="text-align: center;">
                    <strong style="color: #ef4444; font-size: 0.72rem;">交集面积 P(B ∩ A₁)</strong><br>
                    = P(B | A₁) × P(A₁)<br>
                    = 0.80 × 0.50 = 0.40 (即 40%)
                </div>
            `;
        }
    },
    // 步骤 8：拆解分母（全概率公式）
    {
        title: "📐 步骤 8：拆解分母 —— 全概率公式求和",
        desc: `
            <p><strong>第三步：我们要如何通过已知情报算分母 P(B) 的总面积？</strong></p>
            <p>在步骤 4 中，我们算黄色切片总面积 45% 时，是左右两个子集块面积相加（5% + 40%）：即 <strong>P(w) = P(w ∩ Ham) + P(w ∩ Spam)</strong>。</p>
            <p>我们用上一步的“宽 &times; 高”乘法规则分别展开这两块面积：<br>
            <strong>P(w) = [P(w|Ham) &times; P(Ham)] + [P(w|Spam) &times; P(Spam)]</strong>。</p>
            <p><strong>推广至通用符号：</strong><br>
            证据发生的总概率 <span class="highlight green">P(B)</span>，就是所有可能类别下该特征发生面积的总和（全概率公式）。如果有 n 个类别 A_j，则写作：</p>
            <p class="highlight green" style="text-align: center; font-family: monospace; font-size: 1.1rem; margin: 0.5rem 0;">
                P(B) = &sum; P(B | A_j) P(A_j)
            </p>
            <p>左侧白板中，<strong>所有包含该特征的色块都在同步呼吸闪烁</strong>，代表它们共同组成了分母面积。</p>
        `,
        formula: `
            P(B) = P(B | A<sub>1</sub>)P(A<sub>1</sub>) + P(B | A<sub>2</sub>)P(A<sub>2</sub>)
        `,
        formulaNote: "全概率公式：通过将全空间划分后，将特征在各子分类下的联合概率相加，求得该特征在全宇宙中的全局总概率。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-8";
            
            // 物理倒回到步骤 3 的几何形态 (Morph Back to Step 3 layout)
            dom.clueStrip.style.bottom = "0";
            dom.clueStrip.style.top = "auto";
            dom.clueStrip.style.height = "80%";
            dom.clueStrip.style.opacity = "1";
            
            dom.interHam.style.left = "0%";
            dom.interHam.style.width = "50%";
            dom.interHam.style.height = "12.5%";
            dom.interHam.style.opacity = "1";
            
            dom.interSpam.style.left = "50%";
            dom.interSpam.style.width = "50%";
            dom.interSpam.style.height = "100%";
            dom.interSpam.style.opacity = "1";

            // 测量尺规高精度定位 - 正常邮件 (Ham) 的先验与似然 (放置于盒子外部，避开内部标签重叠)
            if (dom.hRuler) {
                dom.hRuler.style.opacity = "1";
                dom.hRuler.style.left = "0%";
                dom.hRuler.style.width = "50%";
                dom.hRuler.style.bottom = "-25px";
                dom.hRuler.querySelector(".ruler-label").innerHTML = "先验 P(A₂) = 0.50 (宽)";
            }
            
            if (dom.vRuler) {
                dom.vRuler.style.opacity = "1";
                dom.vRuler.style.left = "-35px";
                dom.vRuler.style.top = "90%"; // 从 top: 90% 到 bottom: 100% 刚好是 10% 高度
                dom.vRuler.style.height = "10%";
                dom.vRuler.querySelector(".ruler-label").innerHTML = "似然 P(B|A₂) = 0.10 (高)";
            }

            const labelHam = dom.interHam.querySelector(".box-label");
            const labelSpam = dom.interSpam.querySelector(".box-label");
            labelHam.innerHTML = `
                <div style="text-align: center;">
                    <strong style="color: #10b981; font-size: 0.72rem;">交集面积 P(B ∩ A₂)</strong><br>
                    = P(B | A₂) × P(A₂)<br>
                    = 0.10 × 0.50 = 0.05 (即 5%)
                </div>
            `;
            labelSpam.innerHTML = `
                <div style="text-align: center;">
                    <strong style="color: #ef4444; font-size: 0.72rem;">交集面积 P(B ∩ A₁)</strong><br>
                    = P(B | A₁) × P(A₁)<br>
                    = 0.80 × 0.50 = 0.40 (即 40%)
                </div>
            `;
        }
    },
    // 步骤 9：合龙大厦
    {
        title: "🏛️ 步骤 9：大功告成 —— 通用贝叶斯定理",
        desc: `
            <p><strong>最终合龙：</strong><br>
            现在，我们将步骤 7 拆解出来的<strong>分子式</strong>，和步骤 8 拆解出来的<strong>分母式</strong>，带回步骤 6 的基础分式中：</p>
            
            <p>我们就得到了概率大厦最顶端的冠冕 —— <strong>通用多分类贝叶斯定理（General Bayes' Theorem）！</strong></p>
            
            <p>这个公式看起来很长，但回过头看左侧的大矩形，它的底层几何本质依然朴素而纯真：</p>
            <p class="highlight blue" style="text-align: center; font-size: 1.05rem; margin: 0.5rem 0;">
                贝叶斯 = 目标交集块的面积 / 整个切片长条的面积
            </p>
            <p>恭喜你！你已经通过 9 个高度可视化的步骤，跨过了 AI 概率学里最坚硬的一块垫脚石！</p>
        `,
        formula: `
            P(A<sub>i</sub> | B) = 
            <div class="fraction">
                <span class="num">P(B | A<sub>i</sub>) P(A<sub>i</sub>)</span>
                <span class="den">&sum; P(B | A<sub>j</sub>) P(A<sub>j</sub>)</span>
            </div>
        `,
        formulaNote: "通用贝叶斯定理公式：分子是目标假说对应的联合概率面积，分母是所有可能假说下证据 B 发生的总面积和（即全概率公式分母）。",
        setup: (dom) => {
            dom.container.className = "geometry-container state-9";
            
            dom.clueStrip.style.bottom = "0";
            dom.clueStrip.style.top = "0";
            dom.clueStrip.style.height = "100%";
            dom.clueStrip.style.opacity = "1";
            
            dom.interHam.style.left = "0%";
            dom.interHam.style.width = "11.11%";
            dom.interHam.style.height = "100%";
            dom.interHam.style.opacity = "1";
            
            dom.interSpam.style.left = "11.11%";
            dom.interSpam.style.width = "88.89%";
            dom.interSpam.style.height = "100%";
            dom.interSpam.style.opacity = "1";

            const labelHam = dom.interHam.querySelector(".box-label");
            const labelSpam = dom.interSpam.querySelector(".box-label");
            labelHam.innerHTML = `
                <div style="text-align: center; line-height: 1.3;">
                    <strong style="color: #047857; font-size: 0.72rem;">后验 P(A₂ | B)</strong><br>
                    = <div class="fraction" style="font-size: 0.75em; vertical-align: middle;"><span class="num" style="color: #047857; border-color: #047857;">0.05</span><span class="den" style="color: #047857;">0.45</span></div> = 11.11%<br>
                    <span style="font-size: 0.55rem; font-weight: normal; opacity: 0.85;">(替补假说)</span>
                </div>
            `;
            labelSpam.innerHTML = `
                <div style="text-align: center; line-height: 1.3;">
                    <strong style="color: #b91c1c; font-size: 0.72rem;">后验 P(A₁ | B)</strong><br>
                    = <div class="fraction" style="font-size: 0.75em; vertical-align: middle;"><span class="num" style="color: #b91c1c; border-color: #b91c1c;">0.40</span><span class="den" style="color: #b91c1c;">0.45</span></div> = 88.89%<br>
                    <span style="font-size: 0.55rem; font-weight: normal; opacity: 0.85;">(目标假说)</span>
                </div>
            `;
        }
    }
];

// 2. 初始化 DOM 缓存
const DOM = {
    container: document.getElementById("geometry-container"),
    universe: document.getElementById("universe-rect"),
    ham: document.getElementById("ham-rect"),
    spam: document.getElementById("spam-rect"),
    splitLine: document.getElementById("split-line"),
    clueStrip: document.getElementById("clue-strip"),
    interHam: document.getElementById("inter-ham"),
    interSpam: document.getElementById("inter-spam"),
    
    // 🏛️ 尺规 DOM 缓存
    hRuler: document.getElementById("h-ruler"),
    vRuler: document.getElementById("v-ruler"),
    
    // 控制和文字
    stepCounter: document.getElementById("step-counter"),
    stepTitle: document.getElementById("step-title"),
    stepDesc: document.getElementById("step-desc"),
    formulaDisplay: document.getElementById("formula-display"),
    formulaNote: document.getElementById("formula-note"),
    
    // 按钮
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    dots: document.querySelectorAll("#step-dots .dot")
};

let currentStepIndex = 0; // 当前步骤 (0-indexed)

// =====================================================================
// 🌍 路由控制核心逻辑 (Router Core Mechanics)
// =====================================================================

/**
 * 从 URL Hash 中提取并解析当前步骤索引 (0-indexed)
 */
function getStepFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/^#step([1-9])$/);
    if (match) {
        return parseInt(match[1], 10) - 1;
    }
    return 0; // 默认第一步
}

/**
 * 状态渲染函数：执行 DOM 渲染与几何过渡
 */
function renderStep(index) {
    const step = STEPS_DATA[index];
    
    // 渲染页签与圆点激活态
    DOM.stepCounter.innerText = `步骤 ${index + 1} / ${STEPS_DATA.length}`;
    DOM.dots.forEach((dot, idx) => {
        if (idx === index) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });

    // 默认隐藏并重置物理测量尺规 (Default reset & hide pedagogical rulers)
    if (DOM.hRuler && DOM.vRuler) {
        DOM.hRuler.style.opacity = "0";
        DOM.vRuler.style.opacity = "0";
    }

    // 根据步骤动态切换大版分类标签的符号表达 (Bridge concrete terms and general math symbols dynamically)
    if (DOM.ham && DOM.spam) {
        const labelHam = DOM.ham.querySelector(".label-ham");
        const labelSpam = DOM.spam.querySelector(".label-spam");
        if (labelHam && labelSpam) {
            if (index < 5) {
                labelHam.innerHTML = "正常邮件 Ham<br>(P(Ham) = 0.50)";
                labelSpam.innerHTML = "垃圾邮件 Spam<br>(P(Spam) = 0.50)";
            } else {
                labelHam.innerHTML = "事件 A₂ (正常邮件)<br>P(A₂) = 0.50";
                labelSpam.innerHTML = "事件 A₁ (垃圾邮件)<br>P(A₁) = 0.50";
            }
        }
    }

    // 动态文字与公式映射
    DOM.stepTitle.innerHTML = step.title;
    DOM.stepDesc.innerHTML = step.desc;
    DOM.formulaDisplay.innerHTML = step.formula;
    DOM.formulaNote.innerHTML = step.formulaNote;

    // 执行物理几何形变动画
    step.setup(DOM);

    // 控制前退按钮禁用态
    DOM.btnPrev.disabled = (index === 0);
    if (index === STEPS_DATA.length - 1) {
        DOM.btnNext.innerHTML = '✨ 重新开始 <span class="arrow">↺</span>';
    } else {
        DOM.btnNext.innerHTML = '下一步 <span class="arrow">→</span>';
    }
}

// ---------------------------------------------------------------------
// 🚀 单向路由数据驱动模型：只更改 Hash，由 Hash 变化统一派发渲染
// ---------------------------------------------------------------------

// 监听 URL Hash 变化 (支持前进后退按钮及刷新)
window.addEventListener("hashchange", () => {
    const hashIndex = getStepFromHash();
    if (hashIndex !== currentStepIndex) {
        currentStepIndex = hashIndex;
        renderStep(currentStepIndex);
    }
});

// 前退按钮点击：直接更改 URL 路由
DOM.btnPrev.addEventListener("click", () => {
    if (currentStepIndex > 0) {
        window.location.hash = `step${currentStepIndex}`;
    }
});

// 下一步按钮点击：直接更改 URL 路由
DOM.btnNext.addEventListener("click", () => {
    if (currentStepIndex < STEPS_DATA.length - 1) {
        window.location.hash = `step${currentStepIndex + 2}`;
    } else {
        // 重新开始回归 #step1
        window.location.hash = "step1";
    }
});

// 🚀 体验升级：小圆点直接点击跳转路由
DOM.dots.forEach((dot, idx) => {
    dot.style.cursor = "pointer"; // 指针手势高亮提示
    dot.addEventListener("click", () => {
        window.location.hash = `step${idx + 1}`;
    });
});

// 键盘事件：触发更改 URL 路由
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " ") {
        DOM.btnNext.click();
    } else if (e.key === "ArrowLeft") {
        DOM.btnPrev.click();
    }
});

// =====================================================================
// 🎬 首次加载页面分发初始化
// =====================================================================
currentStepIndex = getStepFromHash();
renderStep(currentStepIndex);

// 若页面首次打开无 Hash 路由，主动赋予 #step1 以维持地址一致性
if (!window.location.hash) {
    window.history.replaceState(null, null, "#step1");
}
