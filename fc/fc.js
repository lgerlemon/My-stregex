// console.js
(function() {
    const dataSource = document.getElementById('data-source');
    const outputContainer = document.getElementById('output-container');
    try {
        if (!dataSource || !outputContainer) throw new Error("DOM not ready.");
        const STORAGE_KEY = 'fate_console_ui_state';
        const currentState = { theme: 'gufeng', collapsed: false, layout: 'diffusion' };
        const THEME = { 
            COLLAPSE_TEXT: "隐匿命轮", EXPAND_TEXT: "窥见天机", COLLAPSE_ICON: "❖", EXPAND_ICON: "◈",
            LAYOUT_FIXED_TEXT: "伸缩自如", LAYOUT_DIFFUSION_TEXT: "能屈能伸", LAYOUT_FIXED_ICON: "⇳", LAYOUT_DIFFUSION_ICON: "↕"
        };
        const THEME_TEXTS = {
                gufeng: { tab1: "山河册", tab2: "衣冠谱", worldStatus: "天下大势", collapsedCharTitle: "青衫风华", collapsedWorldTitle: "江山一探", journal: "案牍纪要", factions: "各方角力", inventory: "随行细软", nearby: "萍水相逢", bonded: "朱丝系命", logTitle: "青史遗痕:", labels: { alignment: "礼仁:", power: "功名:", abilities: "六艺:", titles: "风评:", effects: "迹遇:", equipment: "仪仗:", items: "什物:", currency: "金帛:", time: "流年:", location: "方位:", environment: "山水:", dynamics: "风声:", questMain: "天命:", questSide: "浮生:", npcPower: "功名:" } },
                xianxia: { tab1: "天机卷", tab2: "仙缘录", worldStatus: "大道气运", collapsedCharTitle: "云笈问道", collapsedWorldTitle: "天机一瞥", journal: "天道机缘", factions: "诸天势力", inventory: "袖里乾坤", nearby: "云游之士", bonded: "命定之人", logTitle: "天机衍变:", labels: { alignment: "道心:", power: "道境:", abilities: "神通:", titles: "道号:", effects: "道痕:", equipment: "法宝:", items: "灵物:", currency: "灵资:", time: "仙历:", location: "洞天:", environment: "灵氛:", dynamics: "玄讯:", questMain: "天缘:", questSide: "尘缘:", npcPower: "道行:" } },
                minsu: { tab1: "风物志", tab2: "异闻录", worldStatus: "四时八节", collapsedCharTitle: "烛龙之影", collapsedWorldTitle: "辰光一卜", journal: "乡野奇谭", factions: "三教九流", inventory: "百宝褡裢", nearby: "市井群像", bonded: "宿缘牵绊", logTitle: "口耳余韵:", labels: { alignment: "情理:", power: "命格:", abilities: "手艺:", titles: "浑号:", effects: "兆象:", equipment: "法器:", items: "杂物:", currency: "俗资:", time: "时辰:", location: "地头:", environment: "风水:", dynamics: "闲话:", questMain: "诡事:", questSide: "奇闻:", npcPower: "斤两:" } },
                wuxia: { tab1: "武林谱", tab2: "恩仇录", worldStatus: "江湖风云", collapsedCharTitle: "肝胆昆仑", collapsedWorldTitle: "风云一望", journal: "江湖悬赏", factions: "门派帮会", inventory: "英雄行囊", nearby: "江湖过客", bonded: "生死之交", logTitle: "江湖余波:", labels: { alignment: "道义:", power: "功力:", abilities: "武学:", titles: "绰号:", effects: "境况:", equipment: "兵甲:", items: "奇物:", currency: "盘缠:", time: "时日:", location: "所在:", environment: "景致:", dynamics: "风波:", questMain: "命途:", questSide: "萍踪:", npcPower: "功力:" } },
                xuanhuan: { tab1: "万象录", tab2: "神魂谱", worldStatus: "位面法则", collapsedCharTitle: "界旅心灯", collapsedWorldTitle: "位面一窥", journal: "命运之谕", factions: "神魔序列", inventory: "虚空之戒", nearby: "异界来客", bonded: "魂之共鸣", logTitle: "因果残响:", labels: { alignment: "宿命:", power: "位阶:", abilities: "权能:", titles: "尊名:", effects: "迹印:", equipment: "神器:", items: "圣物:", currency: "奇珍:", time: "纪元:", location: "界域:", environment: "万象:", dynamics: "星流:", questMain: "命轨:", questSide: "星尘:", npcPower: "位阶:" } }
        };
        const rawXmlString = '<root>' + dataSource.innerHTML.trim() + '</root>';
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rawXmlString, "text/xml");
        if (xmlDoc.querySelector("parsererror")) throw new Error("XML Parsing Error.");
        const getNode = (s, c = xmlDoc) => c.querySelector(s);
        const getNodes = (s, c = xmlDoc) => c.querySelectorAll(s);
        const getValue = (s, c = xmlDoc) => c.querySelector(s)?.textContent || ''; 
        
        const createProgressBar = (text, type) => {
            if (!text) return '';
            const match = text.match(/(\d+)\s*\/\s*(\d+)/); if (!match) return '';
            const [_, current, max] = match; const percentage = (max > 0) ? (parseFloat(current) / parseFloat(max)) * 100 : 0;
            return `<div class="progress-bar"><div class="progress-bar-fill ${type}" style="width: ${percentage}%;\"></div><span class="progress-bar-text">${type.toUpperCase()}: ${current}/${max}</span></div>`;
        };
        const createTags = (text) => text.split(/,|，/).map(t => t.trim()).filter(Boolean).map(tag => `<span class="tag">${tag}</span>`).join('');
        
        const charNode = xmlDoc.querySelector("character"), worldNode = xmlDoc.querySelector("world");
        
        let thoughtHtml = '';
        if(charNode) {
            const thoughtText = getValue("thought", charNode).trim();
            if (thoughtText) {
                thoughtHtml = `<div class="top-thought-display" title="${thoughtText}">${thoughtText}</div>`;
            }
        }
        
        let collapsedCharHtml = '', collapsedWorldHtml = '';
        if (charNode) {
            const name = getValue("name", charNode).trim(), statusText = getValue("status", charNode), alignmentValue = getValue("alignment", charNode).trim();
            let healthStatus = '状态未知';
            const openIdx = Math.max(statusText.lastIndexOf('('), statusText.lastIndexOf('（')), closeIdx = Math.max(statusText.lastIndexOf(')'), statusText.lastIndexOf('）'));
            if (openIdx > -1 && closeIdx > openIdx) healthStatus = statusText.slice(openIdx + 1, closeIdx);
            const nameStatusHtml = `<div style="font-size: 1.1em; font-weight: bold; margin-bottom: 8px;">${name} - ${healthStatus}</div>`;
            const alignmentHtml = alignmentValue ? `<div class="info-line"><span class="info-label" data-text-key="label.alignment"></span><span class="info-value">${alignmentValue}</span></div>` : '';
            collapsedCharHtml = `<div class="collapsed-block"><h3 class="collapsed-title" data-text-key="collapsedCharTitle"></h3>${nameStatusHtml}${alignmentHtml}<div class="progress-bar-group">${createProgressBar(statusText.match(/HP\s*[\d\/]+/)?.[0] || '', 'hp')}${createProgressBar(statusText.match(/MP\s*[\d\/]+/)?.[0] || '', 'mp')}${createProgressBar(statusText.match(/STA\s*[\d\/]+/)?.[0] || '', 'sta')}</div></div>`;
        }
        if (worldNode) {
            const createLine = (labelKey, value) => { const v = (value || '').trim(); return v ? `<div class="info-line"><span class="info-label" data-text-key="${labelKey}"></span><span class="info-value">${v}</span></div>` : ''; };
            collapsedWorldHtml = `<div class="collapsed-block"><h3 class="collapsed-title" data-text-key="collapsedWorldTitle"></h3>${createLine('label.time', getValue("time", worldNode))}${createLine('label.location', getValue("location", worldNode))}${createLine('label.environment', getValue("environment", worldNode))}${createLine('label.dynamics', getValue("dynamics", worldNode))}</div>`;
        }

        let fateScrollCol1 = '', fateScrollCol2 = '';
        if (charNode) {
            const nameNode = getNode("name", charNode);
            const name = nameNode.textContent.trim();
            const statusText = getValue("status", charNode);
            const playerAlias = (nameNode.getAttribute('alias') || '').trim();
            let healthStatus = '状态未知';
            const openIdx = Math.max(statusText.lastIndexOf('('), statusText.lastIndexOf('（')), closeIdx = Math.max(statusText.lastIndexOf(')'), statusText.lastIndexOf('）'));
            if (openIdx > -1 && closeIdx > openIdx) healthStatus = statusText.slice(openIdx + 1, closeIdx);

            const abilitiesText = getValue("abilities", charNode).trim();
            const abilitiesHtml = abilitiesText ? `<div class="info-line"><span class="info-label" data-text-key="label.abilities"></span><div class="tags-container">${createTags(abilitiesText)}</div></div>` : '';
            const titlesHtml = playerAlias ? `<div class="info-line"><span class="info-label" data-text-key="label.titles"></span><div class="tags-container">${createTags(playerAlias)}</div></div>` : '';
            const effectsText = getValue("effects", charNode).trim();
            const effectsHtml = effectsText ? `<div class="info-line"><span class="info-label" data-text-key="label.effects"></span><div class="tags-container">${createTags(effectsText)}</div></div>` : '';

            const charHtml = `<div class="section-box"><h2 class="section-title"><span class="char-name">${name}</span><span>-</span><span>${healthStatus}</span></h2><div class="progress-bar-group">${createProgressBar(statusText.match(/HP\s*[\d\/]+/)?.[0] || '', 'hp')}${createProgressBar(statusText.match(/MP\s*[\d\/]+/)?.[0] || '', 'mp')}${createProgressBar(statusText.match(/STA\s*[\d\/]+/)?.[0] || '', 'sta')}</div><div class="info-line"><span class="info-label" data-text-key="label.alignment"></span><span class="info-value">${getValue("alignment", charNode).trim()}</span></div><div class="info-line"><span class="info-label" data-text-key="label.power"></span><span class="info-value">${getValue("power", charNode).trim()}</span></div>${abilitiesHtml}${titlesHtml}${effectsHtml}</div>`;
            
            const invNode = xmlDoc.querySelector("inventory");
            let invHtml = '';
            if (invNode) {
                const equipmentText = getValue("equipment", invNode).trim();
                const itemsText = getValue("items", invNode).trim();
                const currencyText = getValue("currency", invNode).trim();
                const equipmentLine = equipmentText ? `<div class="info-line"><span class="info-label" data-text-key="label.equipment"></span><span class="info-value">${equipmentText}</span></div>` : '';
                const itemsLine = itemsText ? `<div class="info-line"><span class="info-label" data-text-key="label.items"></span><div class="tags-container">${createTags(itemsText)}</div></div>` : '';
                const currencyLine = currencyText ? `<div class="info-line"><span class="info-label" data-text-key="label.currency"></span><span class="info-value">${currencyText}</span></div>` : '';
                if (equipmentLine || itemsLine || currencyLine) {
                     invHtml = `<div class="section-box"><h2 class="section-title" data-text-key="inventory"></h2>${equipmentLine}${itemsLine}${currencyLine}</div>`;
                }
            }
            
            fateScrollCol1 = `<div class="grid-column">${charHtml}${invHtml}</div>`;
        }
         if (worldNode) {
            const worldHtml = `<div class="section-box"><h2 class="section-title" data-text-key="worldStatus"></h2><div class="info-line"><span class="info-label" data-text-key="label.time"></span><span class="info-value">${getValue("time", worldNode).trim()}</span></div><div class="info-line"><span class="info-label" data-text-key="label.location"></span><span class="info-value">${getValue("location", worldNode).trim()}</span></div><div class="info-line"><span class="info-label" data-text-key="label.environment"></span><span class="info-value">${getValue("environment", worldNode).trim()}</span></div><div class="info-line"><span class="info-label" data-text-key="label.dynamics"></span><span class="info-value">${getValue("dynamics", worldNode).trim()}</span></div></div>`;
            
            const questNodes = getNodes("journal > quest"); let journalHtml = '';
            if(questNodes.length > 0) { journalHtml = `<div class="section-box"><h2 class="section-title" data-text-key="journal"></h2><div class="quest-list">${Array.from(questNodes).map(q => { const type = q.getAttribute('type') || '支线'; const key = type === '主线' ? 'label.questMain' : 'label.questSide'; return `<div class="info-line quest-${type}"><span class="info-label" data-text-key="${key}"></span><span class="info-value">${q.textContent.trim()}</span></div>`; }).join('')}</div></div>`; }

            const factionNodes = getNodes("factions > faction"); let factionsHtml = '';
            if(factionNodes.length > 0) { factionsHtml = `<div class="section-box"><h2 class="section-title" data-text-key="factions"></h2>${Array.from(factionNodes).map(f => `<div class="info-line"><span class="info-label">${f.getAttribute('name')}:</span><span class="info-value">${f.textContent.trim()}</span></div>`).join('')}</div>`; }
            
            fateScrollCol2 = `<div class="grid-column">${worldHtml}${journalHtml}${factionsHtml}</div>`;
        }
        const fateScrollContent = `<div class="tab-panel-grid">${fateScrollCol1}${fateScrollCol2}</div>`;

        const createNpcCard = (node) => {
            const name = getValue("name", node).trim();
            const srValue = node.getAttribute('sr');
            const sdValue = node.getAttribute('sd');
            const statusText = getValue("status", node);
            const srClass = (srValue === '是') ? 'sr-active' : '';
            let healthStatus = '';
            if (statusText) {
                const openIdx = Math.max(statusText.lastIndexOf('('), statusText.lastIndexOf('（')), closeIdx = Math.max(statusText.lastIndexOf(')'), statusText.lastIndexOf('）'));
                if (openIdx > -1 && closeIdx > openIdx) { healthStatus = statusText.slice(openIdx + 1, closeIdx); }
            }
            const statusHtml = healthStatus ? `<span class="npc-status">(${healthStatus})</span>` : '';
            let statusBarsHtml = statusText ? `${createProgressBar(statusText.match(/HP\s*[\d\/]+/)?.[0] || '', 'hp')}${createProgressBar(statusText.match(/MP\s*[\d\/]+/)?.[0] || '', 'mp')}${createProgressBar(statusText.match(/STA\s*[\d\/]+/)?.[0] || '', 'sta')}` : '';
            let sdBarHtml = '';
            if (sdValue !== null) {
                const sd = parseInt(sdValue, 10), percentage = Math.max(0, Math.min(100, sd));
                let sdEmoji = '';
                if (sd <= 24) sdEmoji = '❄️'; else if (sd <= 49) sdEmoji = '🌙'; else if (sd <= 74) sdEmoji = '🔥'; else sdEmoji = '❤️';
                sdBarHtml = `<div class="progress-bar"><div class="progress-bar-fill sd" style="width: ${percentage}%;\"></div><span class="progress-bar-text">SD: ${sd}/100 ${sdEmoji}</span></div>`;
            }
            const allBarsHtml = (statusBarsHtml || sdBarHtml) ? `<div class="progress-bar-group">${statusBarsHtml}${sdBarHtml}</div>` : '';
            
            const equipmentText = getValue("equipment", node).trim();
            const abilitiesText = getValue("abilities", node).trim();
            const effectsText = getValue("effects", node).trim();
            
            const equipmentHtml = equipmentText ? `<div class="info-line"><span class="info-label" data-text-key="label.equipment"></span><span class="info-value">${equipmentText}</span></div>` : '';
            const abilitiesHtml = abilitiesText ? `<div class="info-line"><span class="info-label" data-text-key="label.abilities"></span><div class="tags-container">${createTags(abilitiesText)}</div></div>` : '';
            const effectsHtml = effectsText ? `<div class="info-line"><span class="info-label" data-text-key="label.effects"></span><div class="tags-container">${createTags(effectsText)}</div></div>` : '';

            const headerHtml = `<div class="npc-header"><div><span class="npc-name ${srClass}">${name}</span>${statusHtml}</div>${node.getAttribute('location') ? `<span class="npc-location">@ ${node.getAttribute('location')}</span>` : ''}</div>`;
            const frontPageHtml = `<div class="card-front">${headerHtml}<div class="info-line"><span class="info-value">${getValue("info", node).trim()}</span></div><div class="info-line"><span class="info-label" data-text-key="label.npcPower"></span><span class="info-value">${getValue("power", node).trim()}</span></div>${equipmentHtml}${abilitiesHtml}</div>`;
            const backPageHtml = `<div class="card-back">${headerHtml}${allBarsHtml}${effectsHtml}</div>`;
            return `<div class="npc-card ${node.closest('bonded_characters') ? 'bonded' : ''}">${frontPageHtml}${backPageHtml}</div>`;
        };
        const nearbyNodes = getNodes("nearby_npcs > npc"), bondedNodes = getNodes("bonded_characters > npc");
        let nearbyHtml = '', bondedHtml = '';
        if (nearbyNodes.length > 0) { nearbyHtml = `<div class="section-box"><h2 class="section-title" data-text-key="nearby"></h2><div class="npc-grid">${Array.from(nearbyNodes).map(createNpcCard).join('')}</div></div>`; }
        if (bondedNodes.length > 0) { bondedHtml = `<div class="section-box bonded-section"><h2 class="section-title" data-text-key="bonded"></h2><div class="npc-grid">${Array.from(bondedNodes).map(createNpcCard).join('')}</div></div>`; }
        const bondedColumn = bondedHtml ? `<div class="grid-column">${bondedHtml}</div>` : '';
        const nearbyColumn = nearbyHtml ? `<div class="grid-column">${nearbyHtml}</div>` : '';
        const annalsContent = `<div class="character-annals-grid">${bondedColumn}${nearbyColumn}</div>`;
        const logText = getValue("log");
        let logEntriesHtml = '';
        if (logText) {
            logEntriesHtml = logText.split(/\r?\n/).filter(line => line.trim() !== '').map(line => `<p class="log-entry">${line.trim()}</p>`).join('');
        }
        const logHtml = logEntriesHtml ? `<div class="log-container"><h3 class="log-title" data-text-key="logTitle"></h3><div class="log-box">${logEntriesHtml}</div></div>` : '';
        
        const finalHtml = `<div class="console-wrapper">${thoughtHtml}<div class="console-controls"><div class="theme-switcher"><div class="theme-stone" data-theme="gufeng" title="古风"></div><div class="theme-stone" data-theme="xianxia" title="仙侠"></div><div class="theme-stone" data-theme="minsu" title="民俗"></div><div class="theme-stone" data-theme="wuxia" title="武侠"></div><div class="theme-stone" data-theme="xuanhuan" title="玄幻"></div></div><div id="layout-toggle-btn" class="console-control-btn" title="${THEME.LAYOUT_DIFFUSION_TEXT}"><span class="icon-fixed">${THEME.LAYOUT_FIXED_ICON}</span><span class="icon-diffusion">${THEME.LAYOUT_DIFFUSION_ICON}</span></div><div id="console-toggle-btn" class="console-control-btn" title="${THEME.COLLAPSE_TEXT}"><span class="icon-collapse">${THEME.COLLAPSE_ICON}</span><span class="icon-expand">${THEME.EXPAND_ICON}</span></div></div><div class="collapsed-view">${collapsedCharHtml}${collapsedWorldHtml}</div><div class="expanded-view"><nav class="tab-nav"><button class="tab-btn active" data-tab="fate-scroll" data-text-key="tab1"></button><button class="tab-btn" data-tab="annals" data-text-key="tab2"></button></nav><div id="fate-scroll" class="tab-panel active">${fateScrollContent}</div><div id="annals" class="tab-panel">${annalsContent}</div></div>${logHtml}</div>`;
        outputContainer.innerHTML = finalHtml;

        const consoleWrapper = outputContainer.querySelector('.console-wrapper');
        const toggleBtn = document.getElementById('console-toggle-btn');
        const layoutBtn = document.getElementById('layout-toggle-btn');
        const tabButtons = consoleWrapper.querySelectorAll('.tab-btn');
        const themeStones = consoleWrapper.querySelectorAll('.theme-stone');
        const flippableCards = consoleWrapper.querySelectorAll('.npc-card');
        const themeClasses = ['theme-xianxia', 'theme-minsu', 'theme-wuxia', 'theme-xuanhuan'];
        const saveState = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState)); } catch (e) { console.error("写入记忆失败:", e); } };
        
        const updateUIText = (theme) => {
            const themeTexts = THEME_TEXTS[theme] || THEME_TEXTS.gufeng;
            const textMap = {};
            Object.keys(themeTexts).forEach(key => {
                if (key === 'labels') {
                    Object.keys(themeTexts.labels).forEach(labelKey => {
                        textMap[`label.${labelKey}`] = themeTexts.labels[labelKey];
                    });
                } else {
                    textMap[key] = themeTexts[key];
                }
            });

            const elementsToUpdate = consoleWrapper.querySelectorAll('[data-text-key]');
            elementsToUpdate.forEach(element => {
                const key = element.getAttribute('data-text-key');
                if (textMap[key]) {
                    element.textContent = textMap[key];
                }
            });
        };

        const loadState = () => { try { const savedStateJSON = localStorage.getItem(STORAGE_KEY); const savedState = savedStateJSON ? JSON.parse(savedStateJSON) : {}; const themeToLoad = savedState.theme || 'gufeng'; currentState.theme = themeToLoad; consoleWrapper.classList.remove(...themeClasses); if (themeToLoad !== 'gufeng') { consoleWrapper.classList.add(`theme-${themeToLoad}`); } themeStones.forEach(s => s.classList.toggle('active', s.dataset.theme === themeToLoad)); if (savedState.collapsed) { currentState.collapsed = true; consoleWrapper.classList.add('collapsed'); if (toggleBtn) { toggleBtn.setAttribute('title', THEME.EXPAND_TEXT); } } if (savedState.layout === 'fixed') { currentState.layout = 'fixed'; consoleWrapper.classList.add('fixed-layout'); if (layoutBtn) { layoutBtn.setAttribute('title', THEME.LAYOUT_FIXED_TEXT); } } updateUIText(themeToLoad); } catch (e) { console.error("读取记忆失败:", e); updateUIText('gufeng'); const defaultStone = consoleWrapper.querySelector('.theme-stone[data-theme=\"gufeng\"]'); if (defaultStone) defaultStone.classList.add('active'); } };
        
        if (toggleBtn) { toggleBtn.addEventListener('click', () => { currentState.collapsed = consoleWrapper.classList.toggle('collapsed'); toggleBtn.setAttribute('title', currentState.collapsed ? THEME.EXPAND_TEXT : THEME.COLLAPSE_TEXT); saveState(); }); }
        if (layoutBtn) { layoutBtn.addEventListener('click', () => { const isNowFixed = consoleWrapper.classList.toggle('fixed-layout'); currentState.layout = isNowFixed ? 'fixed' : 'diffusion'; layoutBtn.setAttribute('title', isNowFixed ? THEME.LAYOUT_FIXED_TEXT : THEME.LAYOUT_DIFFUSION_TEXT); saveState(); }); }
        tabButtons.forEach(button => { button.addEventListener('click', () => { tabButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); consoleWrapper.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === button.dataset.tab)); }); });
        themeStones.forEach(stone => { stone.addEventListener('click', (e) => { const selectedTheme = e.currentTarget.dataset.theme; currentState.theme = selectedTheme; themeStones.forEach(s => s.classList.remove('active')); e.currentTarget.classList.add('active'); consoleWrapper.classList.remove(...themeClasses); if(selectedTheme !== 'gufeng') { consoleWrapper.classList.add(`theme-${selectedTheme}`); } updateUIText(selectedTheme); saveState(); }); });
        flippableCards.forEach(card => { card.addEventListener('click', () => { card.classList.toggle('is-flipped'); }); });

        loadState();
    } catch (e) {
        console.error("命运终端渲染失败:", e);
        outputContainer.innerHTML = `<div style="border:2px solid red; padding:10px; color:red; background:#221111; font-family:monospace;"><strong>[命运终端渲染失败]</strong><br>${e.message.replace(/</g, '&lt;')}</div>`;
    }
})();
