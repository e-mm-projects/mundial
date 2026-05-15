// --- TRÉNINKOVÉ HŘIŠTĚ ---
function renderTraining() {
    let html = '';
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };
    const mainContent = document.getElementById('main-content');

    // 1. Rozdělíme hráče do 3 přesných kategorií
    // Mají volné body = jdou do první sekce
    const trainablePlayers = playerData.players.filter(p => p.unspentPoints > 0);
    
    // Nemají body, mají hvězdy a ještě nedosáhli maxima = sbírají praxi
    // POZN: (p.stars > 0) zaručí, že sem nikdy nepropadne Kopyto ze starého savu
    const practicePlayers = playerData.players.filter(p => p.unspentPoints === 0 && p.level < p.maxLevel && p.stars > 0);
    
    // Nemají body a jsou na stropu NEBO nemají vůbec žádné hvězdy = veteráni a kopyta
    const maxedPlayers = playerData.players.filter(p => p.unspentPoints === 0 && (p.level >= p.maxLevel || p.stars === 0));

    // Pomocná funkce pro vykreslení karty v tréninku
    const createTrainingCard = (player) => {
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        const posConfig = POSITION_STATS[player.position];
        
        let xpPercentage = 100;
        if (player.maxLevel > 0 && player.level < player.maxLevel) {
            const requiredXp = player.level * 100;
            xpPercentage = Math.floor((player.xp / requiredXp) * 100);
        }

        const xpBarHtml = player.stars > 0 
            ? `<div class="xp-bar-container"><div class="xp-bar-fill ${player.level >= player.maxLevel ? 'maxed' : ''}" style="width: ${xpPercentage}%;"></div></div>` 
            : `<div style="text-align: center; font-size: 0.8rem; color: #ef4444; margin: 8px 0; font-weight: bold;">[Bez talentu]</div>`;

        const renderStatRow = (statKey, label) => {
            const val = player.stats[statKey];
            const isMaxed = val >= player.statCap;
            const canUpgrade = player.unspentPoints > 0 && !isMaxed;
            
            const btnHtml = canUpgrade 
                ? `<button onclick="trainPlayerStat('${player.id}', '${statKey}')" class="btn-small-add">+</button>` 
                : '';
            
            const maxHtml = isMaxed ? `<span style="color: #ef4444; font-size: 0.75rem; margin-left: 5px; font-weight: bold;">(MAX)</span>` : '';

            return `
                <div class="stat-row">
                    <span>${label}: <strong>${val}</strong> <span style="font-size:0.75rem; color:#6b7280;">/ ${player.statCap}</span>${maxHtml}</span>
                    ${btnHtml}
                </div>
            `;
        };

        return `
            <div class="player-card ${posConfig.colorClass}" style="cursor: default; border-width: 2px;">
                <div class="player-name">${player.name}</div>
                <div class="player-position-row">${posConfig.label}</div>
                
                <div class="player-info-line">
                    <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | ${getPlayerLevelText(player)} ${starsHtml}
                </div>

                <div class="player-nationality">Národnost: ${player.nationality}</div>
                
                ${xpBarHtml}
                
                <div style="text-align: center; font-size: 0.85rem; margin-bottom: 12px; color: #4b5563;">
                    Volné body: <strong style="color: ${player.unspentPoints > 0 ? '#10b981' : '#6b7280'}; font-size: 1.1rem;">${player.unspentPoints}</strong>
                </div>

                <div style="text-align: left; font-size: 0.9rem;">
                    ${posConfig.stats.map(s => renderStatRow(s, statLabels[s])).join('')}
                </div>
            </div>
        `;
    };

    // Vložení kompletní struktury obrazovky
    mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('training')">Nápověda</button>
        <div style="text-align: center;">
            <h2 class="section-title">Tréninkové hřiště</h2>
            
            <div class="info-box success">
                <p class="info-text-base">
                    Zde můžeš vylepšovat statistiky svých hráčů za body získané v zápasech.<br>
                    Každý hráč má svůj strop (Max) podle svého Ranku.
                </p>
            </div>
        </div>
        
        <h3 style="color: #fdf5e6; background: rgba(16, 185, 129, 0.8); padding: 5px 15px; border-radius: 5px; display: inline-block;">Hráči připravení k tréninku</h3>
        
        <div class="player-list" style="margin-bottom: 30px;">
            ${trainablePlayers.length > 0 
                ? trainablePlayers.map(p => createTrainingCard(p)).join('') 
                : '<p style="color: #4b5563; font-style: italic; background: #fdf5e6; padding: 10px; border-radius: 5px; width: 100%; text-align: center;">Nikdo aktuálně nemá volné tréninkové body.</p>'}
        </div>

        <details class="collapsible-box blue" open>
            <summary class="collapsible-header">
                Hráči, kteří sbírají zápasovou praxi (Rozbalit) ▾
            </summary>
            <div class="player-list" style="margin-top: 20px; opacity: 0.95;">
                ${practicePlayers.length > 0 
                    ? practicePlayers.map(p => createTrainingCard(p)).join('') 
                    : '<p style="color: #4b5563; font-style: italic; background: #fdf5e6; padding: 10px; border-radius: 5px; width: 100%; text-align: center;">Všichni aktivní hráči čekají na trénink.</p>'}
            </div>
        </details>

        ${maxedPlayers.length > 0 ? `
        <details class="collapsible-box">
            <summary class="collapsible-header">
                Hráči na maximální úrovni (Rozbalit) ▾
            </summary>
            <div class="player-list" style="opacity: 0.8; margin-top: 20px;">
                ${maxedPlayers.map(p => createTrainingCard(p)).join('')}
            </div>
        </details>
        ` : ''}
    `;
}

// --- KANCELÁŘ (ÚKOLY) --- //
window.renderOffice = function() {
    const mainContent = document.getElementById('main-content');

    // Výpočet procent pro bary
    const xpPercent = Math.min(100, (playerData.xp / getRequiredXp()) * 100);
    const energyPercent = playerData.energy;
    
    const currentMultiplier = 1 + ((playerData.level - 1) * 0.05);
    const bonusPercentage = Math.round((currentMultiplier - 1) * 100); 
    
    const trainerInfoHtml = `
    <div class="info-panel" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
        <div style="flex: 1; min-width: 150px;">
            <h3 style="margin: 0 0 5px 0; color: #fcd34d;">Úroveň manažera: ${playerData.level}</h3>
            <p class="info-text-base" style="color: #d1d5db; margin: 0;">Vyšší úroveň přináší prestiž a lepší vyjednávací pozici se sponzory.</p>
        </div>
        <div class="office-stats-box" style="flex-shrink: 0; min-width: 110px; text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid #f59e0b; border-radius: 8px;">
            <div style="font-size: 0.75rem; color: #fcd34d; text-transform: uppercase; margin-bottom: 5px; white-space: nowrap;">Zisk z úkolů</div>
            <div style="font-size: 1.4rem; font-weight: bold; color: #10b981;">+${bonusPercentage} %</div>
        </div>
    </div>
    `;

    // Zde je tvůj kód pro bary (přidán text-align: left a drobný margin dolů)
    const officeHtml = `
        <div class="office-stat-container" style="max-width: 550px; margin: 10px auto 25px auto; text-align: left;">
            <div class="office-bar-label">
                <span>Zkušenosti trenéra</span>
                <span>${Math.floor(playerData.xp)} / ${getRequiredXp()}</span>
            </div>
            <div class="office-progress-bg">
                <div class="office-progress-fill fill-xp" style="width: ${xpPercent}%"></div>
            </div>

            <div class="office-bar-label">
                <span>Tvoje energie</span>
                <span>${energyPercent} </span>
            </div>
            <div class="office-progress-bg" style="margin-bottom: 0;">
                <div class="office-progress-fill fill-energy" style="width: ${energyPercent}%"></div>
            </div>
        </div>
    `;

    if (playerData.activeTask !== null) {
        const flavorTexts = {
            'Jednání se sponzory': 'Přesvědčuješ ředitele místního uzenářství, že obří logo klobásy na dresech je přesně to, co jejich značka potřebuje. Zatím se tváří nedůvěřivě a nabízí ti k úplatku jen tlačenku...',
            'Taktický rozbor videa': 'Snažíš se hráčům na videu vysvětlit, proč by v obraně neměli nahrávat přímo útočníkům soupeře. Většina týmu už po pěti minutách usnula...'
        };
        const currentFlavorText = flavorTexts[playerData.activeTask.title] || 'Pracuješ na úkolu, pot z tebe leje...';

        mainContent.innerHTML = `
            <div class="text-center">
                <h2 class="section-title">Kancelář manažera</h2>
                ${trainerInfoHtml}
                ${officeHtml} </div>
            <div class="active-task-card">
                <h3 class="active-task-title">Probíhá: ${playerData.activeTask.title}</h3>
                <p class="active-task-flavor">"${currentFlavorText}"</p>
                <div class="huge-timer danger" id="task-timer">
                    Počítám...
                </div>
                ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" onclick="skipTask()">[TEST] Přeskočit čas</button>` : ''}
            </div>`;
        return;
    }

    if (!playerData.officeTasks || playerData.officeTasks.length === 0) {
        generateTasks();
    }

    mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('office')">Nápověda</button>
        <div class="text-center">
            <h2 class="section-title">Kancelář manažera</h2>
            ${trainerInfoHtml}
            ${officeHtml} </div>
        <div class="office-container">
            ${playerData.officeTasks.map((task, index) => `
                <div class="task-card">
                    <h3>${task.title}</h3>
                    <div style="margin: 10px 0; font-size: 1.1rem;">
                        <span style="font-weight: bold; color: #166534;">+${task.reward} ${task.type === 'money' ? '💰' : '⭐'}</span>
                    </div>
                    <div style="color: #d84315; margin-bottom: 10px;">
                        Cena: ⚡ ${task.energy} (${task.energy} min)
                    </div>
                    <button class="btn-task" onclick="startTask(${index})">Začít úkol</button>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPvE() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.pve) playerData.pve = { dungeonIndex: 0, stageIndex: 0, nextMatchTime: 0 };

    // 1. KONTROLA NEPŘEČTENÝCH ZPRÁV (Spoiler lock)
    const hasUnreadPvE = playerData.mail.some(m => m.isPvE && !m.read);
    
    if (hasUnreadPvE) {
        mainContent.innerHTML = `
            <div class="text-center">
                <h2 class="section-title">Fotbalové podzemí</h2>
                <div class="notification-banner large" onclick="document.querySelector('[data-target=\\'mail\\']').click()">
                    <h3 style="margin-top:0; font-size: 1.8rem;">📺 Záznam bitvy je připraven!</h3>
                    <p class="pve-unread-banner-text">Zápas už se odehrál, ale výsledek je tajný. Běž do pošty, pusť si záznam a zjisti, jestli jsi postoupil na dalšího bosse!</p>
                    <button class="btn-task" style="background: #166534; border-color: #14532d; font-size: 1.2rem; margin-top: 15px; padding: 10px 30px;">Přejít do Pošty</button>
                </div>
            </div>
        `;
        return;
    }

    // --- TLAČÍTKO RESETU PRO TESTOVÁNÍ ---
    let testResetHtml = '';
    if (window.IS_TEST_MODE) {
        testResetHtml = `
            <button class="btn-task btn-test" style="position: absolute; top: 10px; right: 10px; z-index: 100;" 
                onclick="resetDungeonTest()">
                🔄 [TEST] Reset Podzemí
            </button>
        `;
    }

    const dIndex = playerData.pve.dungeonIndex;
    const sIndex = playerData.pve.stageIndex;

    // 2. KONTROLA DOKONČENÍ VŠECH DUNGEONŮ
    if (dIndex >= PVE_DUNGEONS.length) {
        mainContent.innerHTML = `
            <div class="text-center" style="padding-top: 20px;">
                <h2 class="section-title">Fotbalové podzemí</h2>
                <div class="info-box warning" style="margin-bottom: 20px;">
                    <h3 class="text-highlight-gold">🏆 Všechna podzemí pokořena! 🏆</h3>
                    <p>Jsi absolutní mistr okresu. Počkej na další aktualizaci s novými bossy!</p>
                </div>
                
                ${window.IS_TEST_MODE ? `
                <button class="btn-task btn-test" style="font-size: 1.2rem; padding: 15px 30px; background: #991b1b; color: white;" onclick="resetDungeonTest()">
                    🔄 [TEST] Resetovat Podzemí na začátek
                </button>
                ` : ''}
                
            </div>
        `;
        return;
    }

    const dungeon = PVE_DUNGEONS[dIndex];
    const stage = dungeon.stages[sIndex];
    const hasSpace = playerData.players.length < 18;
    const now = Date.now();
    const nextTime = playerData.pve.nextMatchTime || 0;
    const isOnCooldown = now < nextTime;

    // 3. GENEROVÁNÍ OBSAHU
    let warningHtml = hasSpace ? '' : `<div class="pve-warning-box">Nemáš místo na střídačce! Běž do Šatny a někoho prodej.</div>`;

    let actionSection = '';
    if (isOnCooldown) {
        actionSection = `
            <div class="pve-cooldown-box">
                <p class="pve-cooldown-label">Hráči odpočívají po těžkém utkání. Další pokus bude možný za:</p>
                <div class="huge-timer" style="margin-top: 0;">
                    ⏳ <span id="pve-timer">Počítám...</span>
                </div>
            </div>
            ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" onclick="skipPvETime()">[TEST] Přeskočit čekání</button>` : ''}
            <button class="btn-pve-challenge" disabled>Odpočinek...</button>
        `;
    } else {
        actionSection = `
        <button class="btn-pve-challenge" ${hasSpace ? `onclick="startPvEMatch(${dIndex}, ${sIndex})"` : 'disabled'}>
            ⚔️ Vyzvat soupeře (Zdarma)
        </button>
        `;
    }

    // Příprava na budoucí obrázek na pozadí z dat configu (pokud tam vlastnost "bgImage" přidáš)
    const bgImageStyle = stage.bgImage ? `style="background-image: url('images/pve/${stage.bgImage}');"` : '';

    // --- GENEROVÁNÍ KRESLENÉ MAPY POSTUPU ---
    const totalDungeons = PVE_DUNGEONS.length;
    // Výpočet pro červenou fixu na čáře
    const progressPercent = (dIndex / (totalDungeons - 1)) * 100;

    const timelineNodesHtml = PVE_DUNGEONS.map((d, idx) => {
        let nodeClass = 'locked';
        let icon = idx + 1; // Čísla pro zamčené
        
        if (idx < dIndex) {
            nodeClass = 'completed';
            icon = '✓'; 
        } else if (idx === dIndex) {
            nodeClass = 'current';
            icon = '⚽';
        }
        
        return `
            <div class="pve-node ${nodeClass}">
                ${icon}
                <span class="tooltip-text">${d.name}</span>
            </div>
        `;
    }).join('');

    const timelineHtml = `
        <div class="pve-timeline-wrapper">
            <div class="pve-timeline-line"></div>
            <div class="pve-timeline-progress" style="width: ${progressPercent}%;"></div>
            <div class="pve-timeline-nodes">
                ${timelineNodesHtml}
            </div>
        </div>
    `;

    mainContent.innerHTML = `
        <div style="position: relative;">
            ${testResetHtml} 
            <button class="help-btn-corner" onclick="showHelp('pve')">Nápověda</button>
            <div class="text-center">
                <h2 class="section-title">${dungeon.name}</h2>
                <p class="pve-dungeon-description">"${dungeon.desc}"</p>
            </div>

            ${timelineHtml}

            <div class="pve-stage-card ${stage.isBoss ? 'is-boss' : ''}">
                
                <!-- POZADÍ A PŘECHOD -->
                <div class="pve-card-bg" ${bgImageStyle}></div>
                <div class="pve-card-overlay"></div>

                <!-- SAMOTNÝ OBSAH (nad pozadím) -->
                <div class="pve-card-content">
                    <div class="pve-card-header" style="justify-content: center; margin-bottom: 15px;">
                        <span class="pve-badge ${stage.isBoss ? 'boss' : 'normal'}" style="font-size: 1rem; padding: 6px 15px;">
                            Soupeř ${sIndex + 1} / ${dungeon.stages.length}
                        </span>
                    </div>
                    
                    <!-- Zmenšili jsme margin-bottom u nadpisu na 15px -->
                    <h3 class="pve-opponent-title" style="text-align: center; font-size: 1.8rem; color: ${stage.isBoss ? '#fca5a5' : '#fcd34d'}; margin-bottom: 15px;">
                        ${stage.isBoss ? '☠️ ' : ''}${stage.name}
                    </h3>

                    <!-- NOVĚ PŘIDANÝ VTIPNÝ POPISEK -->
                    <div class="pve-stage-desc">
                        "${stage.desc}"
                    </div>
                    
                    <!-- NOVĚ PŘIDANÉ STATISTIKY SOUPEŘE -->
                    <div class="pve-inline-stats">
                        <div class="pve-stat-item">
                            <span class="pve-stat-label">⚔️ Útok</span>
                            <span class="pve-stat-val">${stage.botPower.att}</span>
                        </div>
                        <div class="pve-stat-item">
                            <span class="pve-stat-label">🧭 Záloha</span>
                            <span class="pve-stat-val">${stage.botPower.mid}</span>
                        </div>
                        <div class="pve-stat-item">
                            <span class="pve-stat-label">🛡️ Obrana</span>
                            <span class="pve-stat-val">${stage.botPower.def}</span>
                        </div>
                        <div class="pve-stat-item">
                            <span class="pve-stat-label">🧤 Brankář</span>
                            <span class="pve-stat-val">${stage.botPower.gk}</span>
                        </div>
                    </div>

                    <!-- VYSVĚTLUJÍCÍ TEXT -->
                    <div style="text-align: center; font-size: 0.8rem; color: #9ca3af; margin-top: -10px; margin-bottom: 20px; font-style: italic;">
                        * Uvedené hodnoty představují průměrnou sílu hráčů soupeře.
                    </div>

                    <div class="pve-reward-box">
                        <h4 class="pve-reward-header" style="text-align: center; margin-bottom: 10px;">🎁 Odměna za vítězství</h4>
                        <ul class="scout-odds-list" style="color: #e5e7eb; padding: 0; text-align: center; list-style: none;">
                            <li style="margin-bottom: 5px;"><strong>+${stage.reward.xp} XP</strong> pro všechny hráče na hřišti</li>
                            <li><strong>Zisk hráče:</strong> Rank [${stage.reward.rank}] (${stage.reward.minStars} až ${stage.reward.maxStars} ⭐)</li>
                        </ul>
                    </div>

                    ${warningHtml}
                    ${actionSection}
                </div>
            </div>
        </div>
    `;

    if (isOnCooldown) updateTimerUI('pve-timer', nextTime);
}

// ---  ŠATNA  ---
function renderLockerRoom() {
    const mainContent = document.getElementById('main-content');
    const currentScroll = window.scrollY;
    const reserveBox = document.querySelector('.reserve-content');
    const wasReserveOpen = reserveBox ? reserveBox.classList.contains('active') : false;
    const layout = FORMATIONS_LAYOUT[playerData.formation];

    const formationHints = {
        '4-4-2': 'Zlatá střední cesta. Výborně si poradí s týmy, které hrají ustrašeného zanďoura.',
        '4-3-3': 'Všechno dopředu! Těžká noční můra pro týmy hrající opatrný vyvážený fotbal.',
        '5-4-1': 'Zaparkovat autobus před bránu je nejlepší proti týmům, které hrají bezhlavý útočný fotbal!'
    };
    const currentHint = formationHints[playerData.formation];

    const sellBtnClass = isSellMode ? 'btn-sell-active' : 'btn-sell-inactive';
    const sellBtnText = isSellMode ? '❌ Zrušit prodej' : '💰 Režim prodeje';

    mainContent.innerHTML = `
        <div class="text-center">
            <button class="help-btn-corner" onclick="showHelp('locker-room')">Nápověda</button>
            <h2 class="section-title">Šatna a Sestava</h2>
            <div class="info-box">
                <div style="margin-bottom: 15px;">
                    <label for="formation-select" class="formation-label">Taktická formace:</label>
                    <select id="formation-select" class="formation-select" onchange="changeFormation(this.value)">
                        <option value="4-4-2" ${playerData.formation === '4-4-2' ? 'selected' : ''}>4-4-2 (Vyvážená)</option>
                        <option value="4-3-3" ${playerData.formation === '4-3-3' ? 'selected' : ''}>4-3-3 (Útočná)</option>
                        <option value="5-4-1" ${playerData.formation === '5-4-1' ? 'selected' : ''}>5-4-1 (Obranná)</option>
                    </select>
                </div>
                <p class="formation-hint">💡 "${currentHint}"</p>
                <p class="text-muted" style="margin: 0;">Klikni na hráče a prohoď ho s jiným. Rozestavení se automaticky uloží.</p>
            </div>
        </div>

        <div class="pitch-section">
            <h3 class="pitch-role-title">Útočníci</h3>
            <div class="player-list">${renderPlayerGroup(layout.att[0], layout.att[1], 'att')}</div>
        </div>
        <div class="pitch-section">
            <h3 class="pitch-role-title">Záložníci</h3>
            <div class="player-list">${renderPlayerGroup(layout.mid[0], layout.mid[1], 'mid')}</div>
        </div>
        <div class="pitch-section">
            <h3 class="pitch-role-title">Obránci</h3>
            <div class="player-list">${renderPlayerGroup(layout.def[0], layout.def[1], 'def')}</div>
        </div>
        <div class="pitch-section">
            <h3 class="pitch-role-title">Brankář</h3>
            <div class="player-list">${renderPlayerGroup(layout.gk[0], layout.gk[1], 'gk')}</div>
        </div>
        
        <div class="pitch-section bench-section">
            <div class="bench-header">
                <h3 class="bench-title">Střídačka (Kapacita: ${playerData.players.length - 11}/7)</h3>
                <button onclick="toggleSellMode()" class="btn-sell-mode ${sellBtnClass}">
                    ${sellBtnText}
                </button>
            </div>
            ${isSellMode ? '<p class="sell-warning-text">Klikni na hráče, kterého chceš vyhodit z klubu.</p>' : ''}
            <div class="player-list">${renderPlayerGroup(11, 18, 'bench')}</div>
        </div>

        <div class="reserve-accordion">
            <div class="reserve-header" onclick="document.querySelector('.reserve-content').classList.toggle('active')">
                <span>📦 REZERVA TÝMU (Hráči mimo aktivní kádr)</span>
                <span>▼</span>
            </div>
            <div class="reserve-content ${wasReserveOpen ? 'active' : ''}" style="display: ${wasReserveOpen ? 'block' : 'none'}; padding: 15px; background: rgba(0,0,0,0.5);">
                <div class="reserve-filters">
                    <button class="filter-btn active" onclick="filterReserve('all')">Vše</button>
                    ${PLAYER_RANKS.map(r => `<button class="filter-btn" onclick="filterReserve('${r.name}')">${r.name}</button>`).join('')}
                </div>
                <div id="reserve-player-list" class="player-list" style="margin-top:15px;">
                    ${renderReservePlayers('all')}
                </div>
            </div>
        </div>
    `;
    setTimeout(() => window.scrollTo(0, currentScroll), 0);
}

function renderScouting() {
    const mainContent = document.getElementById('main-content');
    
    // Inicializace dat pro jistotu
    if (!playerData.scoutedPlayers) playerData.scoutedPlayers = [];
    if (!playerData.lastScoutRefresh) playerData.lastScoutRefresh = 0;
    if (!playerData.unlockedScouts) playerData.unlockedScouts = [];
    if (!playerData.sideScoutedPlayers) playerData.sideScoutedPlayers = {};
    
    const now = Date.now();
    const scoutInterval = getScoutInterval(); 
    
    if (playerData.scoutedPlayers.length === 0 || now - playerData.lastScoutRefresh > scoutInterval) {
        generateScoutedPlayers();
    }

    let nextRefresh = playerData.lastScoutRefresh + scoutInterval;
    const currentDiv = playerData.division || 10;
    const scoutLevel = (playerData.buildings && playerData.buildings.scout) ? playerData.buildings.scout : 1;
    
    // Výpočet aktuální šance na 5 hvězd (Základ 2% + 0.5% za každý level)
    const fiveStarChance = (2 + ((scoutLevel - 1) * 0.5)).toFixed(1);

    // Dynamický text pro šance na ranky podle aktuální divize
    let rankOddsHtml = "";
    if (currentDiv === 10) rankOddsHtml = "<li>Kopyto: 100 %</li>";
    else if (currentDiv === 9) rankOddsHtml = "<li>Slibný amatér: 30 %</li><li>Kopyto: 70 %</li>";
    else if (currentDiv === 8) rankOddsHtml = "<li>Srdcař: 20 %</li><li>Slibný amatér: 50 %</li><li>Kopyto: 30 %</li>";
    else if (currentDiv === 7) rankOddsHtml = "<li>Ligový borec: 20 %</li><li>Srdcař: 40 %</li><li>Slibný amatér: 40 %</li>";
    else if (currentDiv === 6) rankOddsHtml = "<li>Ligový borec: 50 %</li><li>Srdcař: 30 %</li><li>Slibný amatér: 20 %</li>";
    else if (currentDiv === 5) rankOddsHtml = "<li>Reprezentant: 15 %</li><li>Ligový borec: 60 %</li><li>Srdcař: 25 %</li>";
    else if (currentDiv === 4) rankOddsHtml = "<li>Reprezentant: 40 %</li><li>Ligový borec: 40 %</li><li>Srdcař: 20 %</li>";
    else if (currentDiv === 3) rankOddsHtml = "<li>Legenda: 10 %</li><li>Reprezentant: 50 %</li><li>Ligový borec: 40 %</li>";
    else if (currentDiv === 2) rankOddsHtml = "<li>Legenda: 20 %</li><li>Reprezentant: 60 %</li><li>Ligový borec: 20 %</li>";
    else if (currentDiv === 1) rankOddsHtml = "<li>Legenda: 25 %</li><li>Reprezentant: 75 %</li>";

    // Převodník popisků statů
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };

    // VYKRESLENÍ HRÁČŮ OD HLAVNÍHO SKAUTA
    const playersHtml = playerData.scoutedPlayers.map((player, index) => {
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        const posConfig = POSITION_STATS[player.position];
        const price = getPlayerPrice(player);
        const canAfford = playerData.money >= price;
        const totalStats = posConfig.stats.reduce((sum, s) => sum + player.stats[s], 0);

        return `
            <div class="player-card ${posConfig.colorClass}">
                <div class="player-name">${player.name}</div>
                <div class="player-position-row">${posConfig.label}</div>
                
                <div class="player-info-line">
                    <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | ${getPlayerLevelText(player)} ${starsHtml}
                </div>

                <div class="player-nationality">Národnost: ${player.nationality}</div>
                
                <div class="price-tag buy">Cena: ${price} 💰</div>

                <div class="player-stats">
                    ${posConfig.stats.map(s => `
                        <div class="stat-item highlighted">
                            ${statLabels[s]}: <span>${player.stats[s]}</span>
                        </div>
                    `).join('')}
                    
                    <div class="stat-total">
                        <span>Celková síla:</span> 
                        <span style="font-weight: bold;">${totalStats}</span>
                    </div> 

                </div>
                <button class="btn-upgrade" style="width: 100%; margin-top: 10px;" onclick="buyPlayer(${index}, ${price})" ${!canAfford ? 'disabled' : ''}>Koupit</button>
            </div>
        `;
    }).join('');

    // --- VYKRESLENÍ VEDLEJŠÍCH SKAUTŮ ---
    let sideScoutsHtml = '<hr style="margin: 40px 0; border-color: #374151;">';
    
    // Vycentrovaný nadpis a odpočet
    sideScoutsHtml += `
        <button class="help-btn-corner" onclick="showHelp('scouting')">Nápověda</button>
        <div style="text-align: center; margin-bottom: 25px;">
            <h2 class="section-title" style="display: inline-block;">Vedlejší skauti (Lokální hledání)</h2>
            <div style="margin-top: 10px; font-weight: bold; color: #fcd34d; text-shadow: 1px 1px 2px black;">
                Další skautování proběhne za: <span id="side-scout-timer" class="scout-timer-text">Počítám...</span>
            </div>
            <p style="color: #f3f4f6; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); margin-top: 10px; font-size: 0.95rem; max-width: 800px; margin-left: auto; margin-right: auto;">
                Najmi si specialisty na konkrétní nižší soutěže. Zůstanou s tebou navždy a každých 24 hodin ti přivedou přesně 3 nové hráče svého ranku. Ideální pro doplňování minilig!
            </p>
        </div>
    `;

    const sideRanks = [0, 1, 2, 3]; // Indexy pro Kopyto, Amatér, Srdcař, Borec
    const maxAllowedSideRank = window.getMaxAllowedSideScoutRank();

    sideRanks.forEach(rankIdx => {
        const rankObj = PLAYER_RANKS[rankIdx];
        const isUnlocked = playerData.unlockedScouts.includes(rankIdx);
        const isAllowedToBuy = rankIdx <= maxAllowedSideRank;

        if (isUnlocked) {
            // SKAUT JE ODEMČENÝ -> ZOBRAZÍME JEHO HRÁČE
            const sPlayers = playerData.sideScoutedPlayers[rankIdx] || [];
            let sPlayersCards = sPlayers.map((player, pIndex) => {
                const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
                const posConfig = POSITION_STATS[player.position];
                const price = getPlayerPrice(player);
                const canAfford = playerData.money >= price;
                const totalStats = posConfig.stats.reduce((sum, s) => sum + player.stats[s], 0);

                return `
                    <div class="player-card ${posConfig.colorClass}" style="transform: scale(0.95);">
                        <div class="player-name">${player.name}</div>
                        <div class="player-position-row">${posConfig.label}</div>
                        <div class="player-info-line">
                            <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | ${getPlayerLevelText(player)} ${starsHtml}
                        </div>
                        <div class="player-nationality">Nár: ${player.nationality}</div>
                        <div class="price-tag buy">Cena: ${price} 💰</div>
                        <div class="player-stats">
                            ${posConfig.stats.map(s => `
                                <div class="stat-item highlighted">
                                    ${statLabels[s]}: <span>${player.stats[s]}</span>
                                </div>
                            `).join('')}
                            
                            <div class="stat-total">
                                <span>Celková síla:</span> 
                                <span style="font-weight: bold;">${totalStats}</span>
                            </div> 
                        </div>
                        <button class="btn-upgrade" style="width: 100%; margin-top: 10px; background: #4f46e5;" onclick="buySideScoutedPlayer(${rankIdx}, ${pIndex}, ${price})" ${!canAfford ? 'disabled' : ''}>Koupit</button>
                    </div>
                `;
            }).join('');

            sideScoutsHtml += `
                <div style="margin-bottom: 30px; background: rgba(17, 24, 39, 0.7); padding: 15px; border-radius: 8px; border: 1px solid #4b5563;">
                    <h3 style="color: #fcd34d; margin: 0 0 15px 0; text-shadow: 1px 1px 2px black;"> Skaut na rank: ${rankObj.name}</h3>
                    ${sPlayers.length > 0 ? `<div class="player-list">${sPlayersCards}</div>` : '<p style="color:#e5e7eb; text-align: center; font-style: italic;">Skaut obchází hospody, počkej na další refresh.</p>'}
                </div>
            `;
        } else {
            // SKAUT JE ZAMČENÝ -> ZOBRAZÍME TLAČÍTKO K NÁKUPU (NEBO ZÁMEK)
            const scoutPrice = 1500; // 1 mince
            const canAffordScout = playerData.money >= scoutPrice;

            let actionHtml = '';
            if (isAllowedToBuy) {
                actionHtml = `<button class="btn-upgrade" style="background: #059669; padding: 8px 15px; font-weight: bold;" onclick="unlockSideScout(${rankIdx})" ${!canAffordScout ? 'disabled' : ''}>Najmout trvale (${scoutPrice} 💰)</button>`;
            } else {
                actionHtml = `<button class="btn-upgrade" disabled style="background: #374151; color: #9ca3af; cursor: not-allowed; padding: 8px 15px; border: 1px solid #4b5563;">Odemkne se ve vyšší divizi</button>`;
            }

            sideScoutsHtml += `
                <div style="margin-bottom: 15px; background: rgba(31, 41, 55, 0.75); padding: 15px; border-radius: 8px; border: 1px dashed #6b7280; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3 style="color: #f3f4f6; margin: 0 0 5px 0; text-shadow: 1px 1px 2px black;">🔒 Expert na rank: ${rankObj.name}</h3>
                        <div style="font-size: 0.9rem; color: #d1d5db; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Přivede 3 hráče tohoto ranku vždy při obměně nabídky.</div>
                    </div>
                    <div>
                        ${actionHtml}
                    </div>
                </div>
            `;
        }
    });

    // SLOŽENÍ CELÉHO OKNA
    mainContent.innerHTML = `
        <div class="text-center">
            <h2 class="section-title">Kancelář hlavního skauta</h2>
            
            <div class="info-box scout-info-box">
                <p class="info-text-base" style="font-style: italic;">
                    "Skautování nových hráčů bude trvat ještě <span id="scout-timer" class="scout-timer-text">Počítám...</span><br>
                    Zatím si musíte vybrat z toho, co jsem objevil, šéfe."
                </p>
                
                <details class="scout-details-box">
                    <summary class="scout-details-summary">
                        📊 Zobrazit pravděpodobnosti skautingu (Rozbalit) ▾
                    </summary>
                    <div class="scout-odds-container">
                        <div class="scout-odds-col">
                            <div class="scout-odds-title">Dostupné ranky (${currentDiv}. Divize):</div>
                            <ul class="scout-odds-list">
                                ${rankOddsHtml}
                            </ul>
                        </div>
                        <div class="scout-odds-col">
                            <div class="scout-odds-title">Šance na talent (Hvězdy):</div>
                            <ul class="scout-odds-list">
                                <li>5 ⭐: ${fiveStarChance} %</li>
                                <li>4 ⭐: 8.0 %</li>
                                <li>3 ⭐: 15.0 %</li>
                                <li>2 ⭐: 20.0 %</li>
                                <li>1 ⭐: 40.0 %</li>
                                <li>0 ⭐: Zbytek</li>
                            </ul>
                        </div>
                    </div>
                    <div class="scout-note">
                        * Vylepšováním budovy Kanceláře skauta (aktuálně Lvl. ${scoutLevel}) se ti postupně zvyšuje šance na objevení 5hvězdičkových talentů. Postupem do vyšších lig se zase odemykají lepší ranky.
                    </div>
                </details>

                ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" style="margin-top: 15px; padding: 5px 10px;" onclick="forceScoutRefresh()">[TEST] Vygenerovat hned</button>` : ''}
            </div>
        </div>
        
        <div class="player-list">
            ${playersHtml}
        </div>

        ${sideScoutsHtml}
    `;

    // Aktualizujeme oba odpočty najednou
    updateTimerUI('scout-timer', nextRefresh);
    updateTimerUI('side-scout-timer', nextRefresh);
}

function renderMatches() {
 const mainContent = document.getElementById('main-content');

 const myTeam = playerData.league.find(t => t.isPlayer);
 const matchesLeft = 36 - myTeam.z; // 36 je celkový počet zápasů

 const myTeamIndex = playerData.league.findIndex(t => t.isPlayer);
 if (myTeamIndex !== -1 && playerData.managerName) {
     playerData.league[myTeamIndex].name = `FC ${playerData.managerName}`;
 }

 // --- Zjistíme divizi pro dynamický nadpis ---
 const currentDiv = playerData.division || 10;
 const divName = currentDiv === 10 ? "Amatérská Liga (10. Divize)" : currentDiv === 1 ? "První Liga (Elita)" : `${currentDiv}. Divize`;

 const sortedLeague = [...playerData.league].sort((a, b) => {
     if (b.points !== a.points) return b.points - a.points;
     return (b.gf - b.ga) - (a.gf - a.ga); 
 });
 
 const botsOnly = playerData.league.filter(t => !t.isPlayer);
 const matchesPlayed = playerData.league[myTeamIndex].z;
 const opponent = botsOnly[matchesPlayed % botsOnly.length];

 const prepareBtnHtml = playerData.isPrepared 
    ? `<button class="btn-task" style="width: 100%; background-color: #4b5563; border-color: #374151; padding: 15px; font-size: 1.1rem; cursor: not-allowed;" disabled>Tým je plně připraven! ✓</button>`
    : `<button class="btn-task" style="width: 100%; background-color: #166534; border-color: #14532d; padding: 15px; font-size: 1.1rem;" onclick="prepareForMatch()">Připravit se na zápas (+10% Síly)</button>`;

    // KONTROLA BANNERU
    const hasUnreadMatch = playerData.mail.some(m => !m.read && !m.isPvE && m.result && m.result.includes(':'));
    const unreadBanner = hasUnreadMatch ? `
        <div class="notification-banner" onclick="document.querySelector('[data-target=\\'mail\\']').click()">
            📺 Máš v poště nezkouknutý záznam zápasu! Klikni sem a běž se podívat.
        </div>
    ` : '';

    // Aplikace nových tříd do HTML šablony
    mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('match')">Nápověda</button>
        <div class="text-center" style="margin-bottom: 20px;">
            <h2 class="section-title">${divName}</h2>
            <br>
            <p style="color: #fcd34d; font-weight: bold; margin: 25px 0;">
                ⏳ Do konce sezóny zbývá: ${matchesLeft} zápasů
            </p>
        </div>
        
        ${unreadBanner}

        <div class="next-match-card">
            <h3 class="next-match-title">Nadcházející zápas</h3>
            <p class="vs-text-container">
                <span class="team-home-text">${playerData.league[myTeamIndex].name}</span> 
                <span class="vs-badge">VS</span> 
                <span class="team-away-text">${opponent.name}</span>
            </p>
            <div class="huge-timer">
                <span id="match-timer">Počítám...</span>
            </div>
            
            <div class="match-buttons-row">
                ${window.IS_TEST_MODE ? `<button class="btn-task btn-test btn-play-now" onclick="skipMatchTime()">[TEST] Odehrát hned</button>` : ''}
                ${window.IS_TEST_MODE ? `<button class="btn-task btn-test btn-sim-season" onclick="testSimulateFullSeason()">⏩ [TEST] Simulovat sezónu</button>` : ''}
            </div>

            <p class="prepare-text">Aktivuj přípravu, dokud je čas. Zvýšíš tím šanci na výhru a zkušenosti hráčů.</p>
            ${prepareBtnHtml}
        </div>

        <div class="league-table-wrapper">
            <table class="league-table" style="border: none; box-shadow: none;">
                <thead>
                    <tr>
                        <th style="width: 50px;">#</th>
                        <th style="text-align: left;">Tým</th>
                        <th title="Zápasy">Z</th>
                        <th title="Skóre">Skóre</th>
                        <th title="Výhry">V</th>
                        <th title="Remízy">R</th>
                        <th title="Prohry">P</th>
                        <th title="Body">B</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedLeague.map((team, index) => {
                        // Logika pro dynamickou barvu pozice v tabulce (Postup / Sestup)
                        let posClass = '';
                        if (index + 1 <= 2) posClass = 'table-pos-up';
                        else if (index + 1 >= 9) posClass = 'table-pos-down';

                        return `
                        <tr class="${team.isPlayer ? 'player-team-row' : ''}">
                            <td style="font-weight: bold;" class="${posClass}">${index + 1}.</td>
                            <td style="text-align: left;">
                                ${team.isPlayer ? 
                                    `<strong>${team.name}</strong>` : 
                                    `<span onclick="viewBotTeam('${team.name}')" style="cursor: pointer; color: #2563eb; text-decoration: underline; font-weight: bold;" title="Klikni pro zobrazení taktiky soupeře">📋 ${team.name}</span>`
                                }
                            </td>
                            <td>${team.z}</td>
                            <td style="font-size: 0.9rem; color: #8d6e63;">${team.gf}:${team.ga}</td>
                            <td>${team.v}</td>
                            <td>${team.r}</td>
                            <td>${team.p}</td>
                            <td style="font-weight: bold; font-size: 1.1rem;">${team.points}</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    updateTimerUI('match-timer', playerData.nextMatchTime);
}

// --- POŠTA (Řádkový styl s vycentrovanými prvky) ---
window.renderMail = function() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.mail || playerData.mail.length === 0) {
        mainContent.innerHTML = `
            <button class="help-btn-corner" onclick="showHelp('mail')">Nápověda</button>
            <div class="text-center">
                <h2 class="section-title">Doručená pošta</h2>
            </div>
            <div class="mail-container" style="text-align: center; color: #fdf5e6; padding: 40px;">
                Schránka je zatím prázdná, trenére.
            </div>`;
        return;
    }

    // Spočítáme jen NEpřečtené zápasové reporty
    const unreadMatches = playerData.mail.filter(m => !m.read && !m.type && m.result).length;

    // Menší, vycentrované tlačítko vložené do kontejneru pošty
    const playAllHtml = unreadMatches > 0 
        ? `<div class="mail-top-actions">
               <button class="btn-play-all-small" onclick="playAllMail()">▶ Přehrát vše (${unreadMatches})</button>
           </div>` 
        : ``;

    const mailHtml = playerData.mail.map((m, index) => {
        const isUnread = !m.read;
        const unreadClass = isUnread ? 'unread' : '';

        // --- 1. ŽÁDOST O PŘIPOJENÍ DO MINILIGY ---
        if (m.type === "ml_invite") {
            return `
            <div class="mail-row ${unreadClass}" style="border-left-color: #f59e0b;">
                <div class="mail-info">
                    <div class="mail-title">${m.subject}</div>
                    <div class="mail-date">${m.date}</div>
                    <div class="mail-text">${m.text}</div>
                </div>
                <div class="mail-action" style="flex-direction: column; justify-content: center; min-width: 100px; gap: 5px;">
                    <button class="btn-mail-text accept" style="width: 100%;" onclick="acceptMLInvite('${m.id}', '${m.applicantUid}', '${m.applicantName}', '${m.leagueName}', '${m.leagueRank}')">✅ Přijmout</button>
                    <button class="btn-mail-text reject" style="width: 100%;" onclick="rejectMLInvite('${m.id}', '${m.applicantUid}', '${m.leagueName}')">❌ Zamítnout</button>
                </div>
            </div>
            `;
        }

        // --- 2. KLASICKÁ TEXTOVÁ ZPRÁVA (S IKONKOU KOŠE) ---
        if (m.text && !m.result) {
            return `
            <div class="mail-row ${unreadClass}" style="border-left-color: #3b82f6;">
                <div class="mail-info">
                    <div class="mail-title">${m.subject}</div>
                    <div class="mail-date">${m.date}</div>
                    <div class="mail-text">${m.text}</div>
                </div>
                <div class="mail-action">
                    <button class="btn-icon delete" title="Smazat zprávu" onclick="playerData.mail.splice(${index}, 1); saveGame(); renderMail();">
                        🗑️
                    </button>
                </div>
            </div>
            `;
        }

        // --- 3. VIDEO ZÁZNAM ZÁPASU (S Kulatým Tlačítkem) ---
        const scoreDisplay = m.read ? m.result : '? : ?';
        let scoreColor = '#4e342e'; 
        let borderInline = ''; // Pro nepřečtené zprávy necháme HTML čisté, postará se o to CSS třída .unread

        // Nastavíme barvu levé čáry JENOM u přečtených zápasů (podle výsledku)
        if (m.read && m.result && m.result.includes(':')) {
            const [myGoals, botGoals] = m.result.split(':').map(Number);
            let borderColor = '#9ca3af'; // Výchozí šedá
            
            if (myGoals > botGoals) {
                scoreColor = '#166534'; // Zelený text
                borderColor = '#10b981'; // Zelená čára
            } else if (myGoals < botGoals) {
                scoreColor = '#b91c1c'; // Červený text
                borderColor = '#ef4444'; // Červená čára
            } else {
                scoreColor = '#4b5563'; // Šedý text
                borderColor = '#6b7280'; // Šedá čára
            }
            borderInline = `style="border-left-color: ${borderColor};"`;
        } else if (m.read) {
            borderInline = `style="border-left-color: #9ca3af;"`; // Pojistka pro přečtené bez skóre
        }

        const iconClass = isUnread ? 'play' : 'replay';
        const iconSymbol = isUnread ? '▶' : '↻'; 

        return `
        <div class="mail-row ${unreadClass}" ${borderInline}>
            <div class="mail-info">
                <div class="mail-title">${m.subject}</div>
                <div class="mail-date">${m.date}</div>
            </div>
            
            <div class="mail-score-box" style="color: ${scoreColor};">
                ${scoreDisplay}
            </div>
            
            <div class="mail-action">
                <button class="btn-icon ${iconClass}" title="${isUnread ? 'Přehrát zápas' : 'Znovu přehrát'}" onclick="openMatchReport(${index})">
                    ${iconSymbol}
                </button>
            </div>
        </div>
        `;
    }).join('');

    mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('mail')">Nápověda</button>
        <div class="text-center">
            <h2 class="section-title">Doručená pošta</h2>
        </div>
        <div class="mail-container">
            ${playAllHtml}
            ${mailHtml}
        </div>
    `;
};

// --- CHYTRÉ HROMADNÉ PŘEHRÁNÍ VÝSLEDKŮ ---
window.playAllMail = function() {
    if (!playerData.mail) return;
    
    let changed = false;
    playerData.mail.forEach(m => {
        if (!m.read && !m.type && m.result) {
            m.read = true;
            changed = true;
        }
    });
    
    if (changed) {
        saveGame();
        renderMail(); 
    }
};

// Pomocná funkce pro vykreslení JEDNÉ řádky akce v záznamu
function renderReplayAction(action) {
    const replayWindow = document.getElementById('replay-window');
    const scoreBoard = document.getElementById('match-score-board');
    const visualBall = document.getElementById('visual-ball');
    if (!replayWindow) return;

    scoreBoard.innerText = action.score;
    visualBall.style.left = `${action.zone}%`;

    let textColor = "#e5e7eb";
    let icon = "⏱️";
    let bgColor = "transparent";
    
    if (action.type === 'goal') { bgColor = "rgba(252, 211, 77, 0.1)"; textColor = "#fcd34d"; icon = "🔥"; }
    else if (action.type === 'bad-goal') { bgColor = "rgba(239, 68, 68, 0.1)"; textColor = "#fca5a5"; icon = "❌"; }
    else if (action.type === 'chance') { textColor = "#60a5fa"; icon = "👀"; }
    else if (action.type === 'danger') { textColor = "#f87171"; icon = "⚠️"; }

    const commentHtml = `
        <div style="display: flex; margin-bottom: 12px; background: ${bgColor}; padding: 8px; border-radius: 5px; border-left: 3px solid ${textColor};">
            <div style="min-width: 45px; font-weight: bold; color: ${textColor};">${action.min}'</div>
            <div style="margin-right: 10px;">${icon}</div>
            <div style="flex: 1; color: ${textColor};">${action.text}</div>
        </div>
    `;
    
    // POUŽITÍ afterbegin PRO VLOŽENÍ NAHORU!
    replayWindow.insertAdjacentHTML('afterbegin', commentHtml);
}

// --- FUNKCE PRO ZRYCHLENÍ ZÁZNAMU ---
// Globální proměnné pro záznam
window.currentReplayIndex = 0;
window.isReplayFast = false; // Nová proměnná, která si pamatuje, jestli máme zrychleno

window.toggleReplaySpeed = function() {
    // 1. Přepneme stav (zapnuto/vypnuto)
    window.isReplayFast = !window.isReplayFast;
    
    // 2. Zastavíme aktuální interval
    clearInterval(window.matchReplayInterval);

    // 3. Nastavíme novou rychlost (1000ms = zrychleno, 2500ms = standardní)
    const speed = window.isReplayFast ? 1000 : 2500;

    window.matchReplayInterval = setInterval(() => {
        const replayWindow = document.getElementById('replay-window');
        if (!replayWindow) {
            clearInterval(window.matchReplayInterval);
            return;
        }

        const msg = window.currentMatchMsg;
        if (window.currentReplayIndex < msg.content.length) {
            renderReplayAction(msg.content[window.currentReplayIndex]);
            window.currentReplayIndex++;
        } else {
            finishMatchReplay();
        }
    }, speed);

    // 4. Decentní úprava vzhledu tlačítka
    const btn = document.getElementById('btn-speed-up');
    if (btn) {
        if (window.isReplayFast) {
            btn.innerHTML = "⏪ Zpomalit (1x)";
            btn.style.color = "#10b981"; // Text zezelená
            btn.style.borderColor = "#10b981"; // Rámeček zezelená
        } else {
            btn.innerHTML = "⏩ Zrychlit (1.5x)";
            btn.style.color = "#9ca3af"; // Zpět na šedou
            btn.style.borderColor = "#4b5563"; // Zpět na šedou
        }
    }
};

// --- KLUBOVÝ FANSHOP ---
window.renderShop = function() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.position = 'relative';

    mainContent.innerHTML = `
        <div style="position: relative; z-index: 10; text-align: center; margin-bottom: 15px; pointer-events: none;">
            <button class="help-btn-corner" onclick="showHelp('shop')" style="pointer-events: auto;">Nápověda</button>
            <h2 class="section-title" style="text-shadow: 2px 2px 5px rgba(0,0,0,0.8);">Klubový Fanshop</h2>
            <p class="stadium-subtitle" style="text-shadow: 1px 1px 3px black; font-weight: bold; color: #fdf5e6;">Klikni na pult nebo regál pro správu předmětů.</p>
        </div>
        
        <div class="interactive-stadium-container">
            
            <div class="stadium-click-zone" 
                 onclick="openInventoryMenu()" 
                 style="top: 15%; left: 5%; width: 40%; height: 70%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">Tvoje zakoupené předměty</strong>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Týmový trezor</div>
                </div>
            </div>

            <div class="stadium-click-zone" 
                 onclick="openShopMenu()" 
                 style="top: 10%; left: 65%; width: 35%; height: 80%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">Denní nabídka předmětů</strong>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Nové zboží za:</div>
                    <div class="zone-timer" id="zone-timer-shop" style="color: #10b981;">Počítám...</div>
                </div>
            </div>
            
        </div>
    `;
};

// Vyskakovací okno s předměty (Fanshop)
window.openShopMenu = function() {
    const oldModal = document.getElementById('shop-modal');
    if (oldModal) oldModal.remove();

    let itemsHtml = '';

    if (!playerData.dailyShopItems || playerData.dailyShopItems.length === 0) {
        itemsHtml = `
            <div class="info-box" style="margin: 30px auto; max-width: 500px; text-align: center; width: 100%;">
                <p style="font-style: italic; font-size: 1.1rem;">"Dneska už máme vyprodáno, trenére. Stavte se zítra."</p>
                ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" style="margin-top: 15px;" onclick="refreshDailyShop(true); openShopMenu();"> 
                    📦 [TEST] Obnovit nabídku ihned 
                </button>` : ''}
            </div>
        `;
    } else {
        itemsHtml = playerData.dailyShopItems.map((item, index) => {
            const canAfford = playerData.money >= item.currentPrice;

            const roleLabels = { att: '⚔️ Útočníky', mid: '🧭 Záložníky', def: '🛡️ Obránce', gk: '🧤 Brankáře' };
            const roleText = roleLabels[item.role] || 'Neznámé';

            return `
                <div class="shop-item-card">
                    <div>
                        <div class="shop-item-title">${item.name}</div>
                        
                        <div style="font-size: 0.8rem; color: #60a5fa; margin-bottom: 5px; font-weight: bold; text-transform: uppercase;">
                            Pro: ${roleText}
                        </div>
                        
                        <div class="shop-img-container">
                            <!-- AUTOMATICKÉ NAČÍTÁNÍ OBRÁZKU PODLE ID -->
                            <img src="images/items/${item.id}.png" alt="${item.name}" onerror="this.onerror=null; this.src='images/items/triko.png';">
                            <span class="shop-item-tooltip">${item.desc}</span>
                        </div>
                    </div>
                    
                    <div>
                        <div class="shop-item-duration" style="margin-bottom: 10px;">
                            ⏳ Vydrží: <strong>${item.duration} zápasů</strong>
                        </div>
                        
                        <button class="btn-upgrade" style="width: 100%; padding: 12px 5px; font-size: 0.95rem; display: flex; justify-content: center; align-items: center; gap: 6px;" onclick="buyItem(${index})" ${!canAfford ? 'disabled' : ''}>
                            <span>${canAfford ? 'Koupit za' : 'Nedostatek:'}</span>
                            <strong style="color: #fcd34d; font-size: 1.1rem;">${item.currentPrice} 💰</strong>
                        </button>
                        
                        ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" style="width: 100%; padding: 5px; font-size: 0.75rem; margin-top: 5px;" onclick="buyItem(${index}, true)">
                            [TEST] Koupit ZDARMA
                        </button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    const modalHtml = `
        <div id="shop-modal" class="ml-selector-overlay" onclick="this.remove()">
            <div class="ml-selector-box" style="max-width: 750px; width: 95%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4b5563; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #fcd34d; margin: 0;">Denní nabídka předmětů</h2>
                    <button class="btn-task" style="padding: 8px 15px; background: #991b1b; font-weight: bold;" onclick="document.getElementById('shop-modal').remove()">Zavřít</button>
                </div>
                
                <div class="stadium-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                    ${itemsHtml}
                </div>
                
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// --- NOVÉ OKNO TREZORU ---
window.openInventoryMenu = function() {
    const oldModal = document.getElementById('inventory-modal');
    if (oldModal) oldModal.remove();

    if (!playerData.inventory) {
        playerData.inventory = { att: [], mid: [], def: [], gk: [] };
    }

    const renderCompactSlot = (role, label, limit) => {
        const items = playerData.inventory[role] || [];
        let slotsHtml = '';
        
        for (let i = 0; i < limit; i++) {
            const item = items[i];
            if (item) {
                slotsHtml += `
                    <div class="shop-item-card compact">
                        <div class="shop-item-title">${item.name}</div>
                        
                        <div class="shop-img-container">
                            <!-- AUTOMATICKÉ NAČÍTÁNÍ OBRÁZKU PODLE ID -->
                            <img src="images/items/${item.id}.png" alt="${item.name}" onerror="this.onerror=null; this.src='images/items/triko.png';">
                            <span class="shop-item-tooltip">${item.desc}</span>
                        </div>

                        <div class="shop-item-duration">⏳ Zbývá: ${item.duration} záp.</div>
                        <button class="btn-task" style="width: 100%; padding: 4px; font-size: 0.7rem; background: #7f1d1d; border: 1px solid #450a0a; color: #fca5a5;" onclick="discardItem('${role}', ${item.instanceId})">Vyhodit</button>
                    </div>
                `;
            } else {
                slotsHtml += `
                    <div class="inventory-slot-empty compact">
                        <div>Volný slot</div>
                    </div>
                `;
            }
        }
        return `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #374151;">
                <h4 style="color: #fcd34d; margin: 0 0 10px 0; font-size: 1rem; text-transform: uppercase;">${label}</h4>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">${slotsHtml}</div>
            </div>
        `;
    };

    const modalHtml = `
        <div id="inventory-modal" class="ml-selector-overlay" onclick="this.remove()">
            <div class="ml-selector-box" style="max-width: 650px; width: 95%; max-height: 85vh; overflow-y: auto; background: #1f2937;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4b5563; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #fcd34d; margin: 0;">Týmový trezor</h2>
                    <button class="btn-task" style="padding: 8px 15px; background: #991b1b;" onclick="document.getElementById('inventory-modal').remove()">Zavřít</button>
                </div>
                
                <div style="text-align: left;">
                    ${renderCompactSlot('att', '⚔️ Útočné bonusy', 2)}
                    ${renderCompactSlot('mid', '🧭 Záložní bonusy', 2)}
                    ${renderCompactSlot('def', '🛡️ Obranné bonusy', 2)}
                    ${renderCompactSlot('gk', '🧤 Brankářské vybavení', 1)}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// --- DETAIL ZÁPASU (Záznam utkání) ---
window.openMatchReport = function(index) {
    const msg = playerData.mail[index];
    if (!msg) { renderMail(); return; } 
    msg.read = true; 
    saveGame();
    window.currentMatchMsg = msg; 
    
    // Vynulujeme počítadlo pro nově otevřený zápas a resetujeme rychlost
    window.currentReplayIndex = 0;
    window.isReplayFast = false; 

    const mainContent = document.getElementById('main-content');
    const homeTeam = msg.rewards?.homeTeam || "Domácí";
    const awayTeam = msg.rewards?.awayTeam || "Hosté";
    
    const myR = msg.rewards?.myRating;
    const botR = msg.rewards?.botRating;

    // Pomocná funkce pro panel
    const createRatingPanel = (teamName, rating, isHome) => `
        <div class="rating-panel ${isHome ? 'home' : 'away'}" style="flex-shrink: 0;">
            <h4 class="rating-panel-title">${teamName}</h4>
            <div class="rating-row"><span>⚔️ Útok:</span> <strong>${rating.att}</strong></div>
            <div class="rating-row"><span>🧭 Záloha:</span> <strong>${rating.mid}</strong></div>
            <div class="rating-row"><span>🛡️ Obrana:</span> <strong>${rating.def}</strong></div>
            <div class="rating-row last"><span>🧤 Brankář:</span> <strong>${rating.gk}</strong></div>
        </div>
    `;

    mainContent.innerHTML = `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 5px;">
            
            <div class="match-report-header" style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-bottom: 10px; width: 90%; max-width: 1200px;">
                <div style="text-align: left;">
                    <button onclick="renderMail()" style="padding: 10px 20px; background: #4e342e; color: white; border: 2px solid #3e2723; border-radius: 5px; cursor: pointer; font-weight: bold; font-family: inherit;">⬅ Zpět</button>
                </div>
                <div style="text-align: center;">
                    <h2 class="section-title" style="margin: 0 !important; color: white;">ZÁZNAM UTKÁNÍ</h2>
                </div>
                <div></div> </div>
            
            <div class="match-report-board" style="width: 90%; max-width: 1200px; margin-bottom: 5px;">
                <div class="score-container">
                    <div class="team-name-home">${homeTeam}</div>
                    <div id="match-score-board" class="match-score">0:0</div>
                    <div class="team-name-away">${awayTeam}</div>
                </div>
                
                <div class="pitch-1d">
                    <div class="pitch-watermark wm-box-l">VÁPNO</div>
                    <div class="pitch-watermark wm-def-l">OBRANA</div>
                    <div class="pitch-watermark wm-mid">ZÁLOHA</div>
                    <div class="pitch-watermark wm-def-r">OBRANA</div>
                    <div class="pitch-watermark wm-box-r">VÁPNO</div>
                    <div class="pitch-line-solid pitch-box-large-l"></div>
                    <div class="pitch-line-solid pitch-box-small-l"></div>
                    <div class="pitch-line-dashed" style="left: 35%;"></div>
                    <div class="pitch-center-line"></div>
                    <div class="pitch-line-solid pitch-center-circle"></div>
                    <div class="pitch-line-dashed" style="left: 65%;"></div>
                    <div class="pitch-line-solid pitch-box-large-r"></div>
                    <div class="pitch-line-solid pitch-box-small-r"></div>
                    <div id="visual-ball" class="pitch-ball">⚽</div>
                </div>
                <div class="pitch-labels">
                    <span>Tvůj brankář</span>
                    <span>Střed hřiště</span>
                    <span>Brankář soupeře</span>
                </div>
            </div>

            <div style="width: 100%; display: flex; justify-content: center; gap: 15px; margin-bottom: 5px;">
                <button id="btn-speed-up" class="btn-speed-control" onclick="toggleReplaySpeed()" style="white-space: nowrap; padding: 6px 15px; font-size: 0.9rem;">
                    ⏩ Zrychlit (1.5x)
                </button>
                <button id="skip-replay-btn" class="btn-speed-control" onclick="finishMatchReplay()" style="white-space: nowrap; padding: 6px 15px; font-size: 0.9rem;">
                    ⏭️ Přeskočit záznam
                </button>
            </div>

            <div class="match-report-layout" style="display: flex; justify-content: center; align-items: flex-start; gap: 30px; width: 95%; max-width: 1400px; flex-wrap: wrap;">
                ${myR ? createRatingPanel(homeTeam, myR, true) : '<div style="width: 220px; border: 1px dashed #444; color: #666; display: flex; align-items: center; justify-content: center; border-radius: 10px;">Data nedostupná</div>'}
                
                <div id="replay-window" class="replay-window-container" style="flex: 2 1 auto; width: 100%; min-width: 280px; max-width: 800px; height: 350px; max-height: 50vh; box-sizing: border-box; background: #111827; padding: 15px; border: 4px solid #374151; border-radius: 10px; overflow-y: auto;">
                </div>
                
                ${botR ? createRatingPanel(awayTeam, botR, false) : '<div style="width: 220px; border: 1px dashed #444; color: #666; display: flex; align-items: center; justify-content: center; border-radius: 10px;">Data nedostupná</div>'}
            </div>
            
        </div>
    `;

    if (window.matchReplayInterval) clearInterval(window.matchReplayInterval);
    
    window.matchReplayInterval = setInterval(() => {
        const replayWindow = document.getElementById('replay-window');
        if (!replayWindow) { clearInterval(window.matchReplayInterval); return; }
        
        if (window.currentReplayIndex < msg.content.length) { 
            renderReplayAction(msg.content[window.currentReplayIndex]); 
            window.currentReplayIndex++; 
        } else { 
            finishMatchReplay(); 
        }
    }, 2500); 
}

// --- ZOBRAZENÍ DETAILU SOUPEŘE V LIZE ---
window.viewBotTeam = function(teamName) {
    const mainContent = document.getElementById('main-content');
    const botTeam = playerData.league.find(t => t.name === teamName);
    if (!botTeam || botTeam.isPlayer) return;

    const layout = FORMATIONS_LAYOUT[botTeam.formation];

    // Místo přepisování playerData.players vytvoříme dočasnou funkci jen pro toto zobrazení
    const renderBotGroup = (startIndex, endIndex, players) => {
        let html = '';
        const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };

        for (let i = startIndex; i < endIndex; i++) {
            const player = players[i];
            if (!player) continue;
            const posConfig = POSITION_STATS[player.position];
            
            html += `
                <div class="player-card ${posConfig.colorClass}">
                    <div class="player-name">${player.name}</div>
                    <div class="player-position-row">${posConfig.label}</div>
                    
                    <div class="player-info-line">
                        <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | Lvl.${player.level} ${'⭐'.repeat(player.stars)}
                    </div>
                    
                    <div class="player-stats">
                        ${posConfig.stats.map(s => `<div class="stat-item highlighted">${statLabels[s]}: <span>${player.stats[s]}</span></div>`).join('')}
                    </div>
                </div>`;
        }
        return html;
    };

    mainContent.innerHTML = `
        <div class="opponent-scout-header">
            <button class="btn-back-absolute" onclick="renderMatches()">⬅ Zpět na Zápasy</button>
            <h2 class="section-title">Skauting soupeře: ${botTeam.name}</h2>
        </div>
        <div class="pitch-section"><h3 class="pitch-role-title">Útočníci</h3><div class="player-list">${renderBotGroup(layout.att[0], layout.att[1], botTeam.players)}</div></div>
        <div class="pitch-section"><h3 class="pitch-role-title">Záložníci</h3><div class="player-list">${renderBotGroup(layout.mid[0], layout.mid[1], botTeam.players)}</div></div>
        <div class="pitch-section"><h3 class="pitch-role-title">Obránci</h3><div class="player-list">${renderBotGroup(layout.def[0], layout.def[1], botTeam.players)}</div></div>
        <div class="pitch-section"><h3 class="pitch-role-title">Brankář</h3><div class="player-list">${renderBotGroup(layout.gk[0], layout.gk[1], botTeam.players)}</div></div>
    `;
}

// --- ZOBRAZENÍ DETAILU SOUPEŘE V PODZEMÍ ---
window.viewPvEBot = function(dIndex, sIndex) {
    const stage = PVE_DUNGEONS[dIndex].stages[sIndex];
    const power = stage.botPower;
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="scouting-card">
            <h2 class="section-title" style="margin-top: 0; text-shadow: 2px 2px 4px black;">Skauting soupeře</h2>
            <h3 class="scouting-title">${stage.name}</h3>
            <p class="text-muted" style="margin-top: 0;">Odhadovaná síla řad soupeře</p>
            
            <p class="scouting-desc">${stage.desc}</p>
            
            <div class="scouting-grid">
                <div class="stat-box stat-atk">
                    <span class="stat-label">⚔️ Útočná síla</span>
                    <span class="stat-val">${power.att}</span>
                </div>
                <div class="stat-box stat-def">
                    <span class="stat-label">🛡️ Obranná síla</span>
                    <span class="stat-val">${power.def}</span>
                </div>
                <div class="stat-box stat-mid">
                    <span class="stat-label">🧭 Síla zálohy</span>
                    <span class="stat-val">${power.mid}</span>
                </div>
                <div class="stat-box stat-gk">
                    <span class="stat-label">🧤 Kvalita brankáře</span>
                    <span class="stat-val">${power.gk}</span>
                </div>
            </div>
            
            <div class="scouting-note" style="margin-top: 20px; border-bottom: none;">
                ℹ️ Čísla představují průměrnou úroveň každého hráče v dané řadě.
            </div>
            
            <button class="btn-task btn-full-width" style="margin-top: 10px; background-color: #4b5563; border-color: #374151;" onclick="renderPvE()">⬅ Návrat do podzemí</button>
        </div>
    `;
}

// Pomocná funkce pro výpočet fixních časů zápasů (08:00, 16:00, 00:00)
window.getGlobalNextMatchTime = function() {
    const now = new Date();
    const next = new Date(now);
    const hours = now.getHours();
    
    if (hours < 8) {
        next.setHours(8, 0, 0, 0);
    } else if (hours < 16) {
        next.setHours(16, 0, 0, 0);
    } else {
        next.setDate(next.getDate() + 1); // Posun na další den
        next.setHours(0, 0, 0, 0); // Půlnoc
    }
    return next.getTime();
};

window.currentReserveFilter = 'all';

window.filterReserve = function(rank) {
    window.currentReserveFilter = rank;
    // Přepnutí "active" třídy na tlačítkách
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === rank || (rank === 'all' && btn.textContent === 'Vše'));
    });
    document.getElementById('reserve-player-list').innerHTML = renderReservePlayers(rank);
}


// FUNKCE PRO REZERVU //
function renderReservePlayers(filter) {
    // --- POJISTKA PRO NOVÉ ÚČTY ---
    if (!playerData.reserve) playerData.reserve = [];
    const players = filter === 'all' 
        ? playerData.reserve 
        : playerData.reserve.filter(p => p.rank === filter);

    if (players.length === 0) return `<p class="text-muted" style="width:100%; text-align:center;">V této kategorii nemáš žádné hráče.</p>`;

    // Plné názvy statistik jako v hlavní hře
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };

    return players.map(player => {
        const posConfig = POSITION_STATS[player.position];
        const totalStats = posConfig.stats.reduce((sum, s) => sum + player.stats[s], 0);
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        
        return `
            <div class="player-card ${posConfig.colorClass}">
                <div class="player-name">${player.name}</div>
                <div class="player-position-row">${posConfig.label}</div>
                
                <div class="player-info-line">
                    <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | ${getPlayerLevelText(player)} ${starsHtml}
                </div>
                
                <div class="player-nationality">Národnost: ${player.nationality}</div>

                <button class="btn-reserve-action btn-to-bench" onclick="returnFromReserve('${player.id}')">Na střídačku</button>
                <button class="btn-reserve-action btn-to-ml" onclick="openMLSelector('${player.id}')">Do miniligy</button>

                <div class="player-stats" style="margin-top: 10px;">
                    ${posConfig.stats.map(s => `
                        <div class="stat-item highlighted">
                            ${statLabels[s]}: <span>${player.stats[s]}</span>
                        </div>
                    `).join('')}

                    <div class="stat-total">
                        <span>Celková síla:</span> 
                        <span style="font-weight: bold;">${totalStats}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- SYSTÉM NÁPOVĚDY ---
const HELP_TEXTS = {
    'office': `
        <h3>🏢 Kancelář</h3>
        <p>Tohle je tvůj hlavní manažerský stan. Zde můžeš využívat svou energii na plnění úkolů pro vedení klubu.</p>
        <ul>
            <li><strong>Jednání se sponzory:</strong> Přinese ti tolik potřebné finance do klubové kasy.</li>
            <li><strong>Taktický rozbor:</strong> Získáš zkušenosti (XP) pro sebe jako trenéra. Zvyšováním své úrovně (Levelu) se ti zlepšují i odměny za tyto úkoly!</li>
        </ul>
        <p class="help-tip">Tip: Energie se automaticky doplňuje reálným časem. Nezapomeň ji tedy pravidelně spotřebovávat. Za hodinu se ti doplní přibližně 5 bodů energie.</p>
    `,
    'match': `
        <h3>⚽ Liga a zápasy</h3>
        <p>Tady vidíš rozlosování a tabulku své aktuální divize. Zápasy se hrají <strong>zcela automaticky</strong> v pevných časech (08:00, 16:00, 00:00).</p>
        <ul>
            <li>Nemusíš být u hry online! Pokud tu nejsi, tým zápas odehraje bez tvé přímé taktické přípravy.</li>
            <li>Po odehrání 32 zápasů sezóna končí. První dva týmy postupují o divizi výš, poslední sestupují.</li>
        </ul>
        <p class="help-tip">Tip: Tlačítko "Příprava na zápas" ti před hvizdem poskytne taktickou výhodu a přidá tvým hráčům 10% k jejich statistikám.</p>
    `,
    'locker-room': `
        <h3>👕 Šatna a Taktika</h3>
        <p>Zde skládáš svou základní sestavu (prvních 11 hráčů) a střídačku.</p>
        <ul>
            <li><strong>Přesun hráčů:</strong> Klikni na jednoho hráče a pak na druhého. Tím si vymění svá místa. Pamatuj ale, že každá pozice na hřišti vyžaduje správného specialistu (např. útočník nemůže do obrány). Pokud bys z jakéhokoli důvodu měl hráče na špatné pozici, nepočítá se vůbec do statistik pro zápas.</li>
            <li><strong>Rezerva:</strong> Hráče, které momentálně nevyužiješ, můžeš poslat do Rezervy, abys udělal místo na střídačce novým posilám. Rezerva má kapacitu 11 hráčů pro každý rank. Z rezervy pak můžeš své hráče posílat do Miniligy, kde můžeš hrát proti svým přátelům.</li>
            <li><strong>Klubový trezor:</strong> V obchodě si můžeš nakoupit různé předměty, které ti dočasně zlepšují tvůj tým. Jejich seznam najdeš ve svém trezoru. Každý předmět má vlastní výdrž a po jejich spotřebě zmizí.</li>
        </ul>
    `,
    'training': `
        <h3>🏋️ Tréninkové hřiště</h3>
        <p>Každý zápas (ať už v lize nebo podzemí) přináší tvým hráčům zkušenosti. Když jich nasbírají dost, postoupí na novou úroveň. To je jasné, ne?</p>
        <ul>
            <li>Za každý nový level dostane hráč <strong>2 tréninkové body</strong>.</li>
            <li>Zde v Tréninku můžeš tyto body manuálně rozdělit do jeho statistik (Útok, Rychlost, Síla atd.) pomocí tlačítek <code>[+]</code>.</li>
            <li>Každá hvězdička u hráče umožňuje získat 5 levelů.</li>
        </ul>
    `,
    'scouting': `
        <h3>🔎 Skauting hráčů</h3>
        <p>Místo, kde získáváš čerstvou krev do týmu.</p>
        <ul>
            <li><strong>Hlavní skaut:</strong> Každých 24 hodin přivede nové hráče. Čím vyšší divizi tvůj klub hraje, tím lepší fotbalisty (ranky) najde.</li>
            <li><strong>Vedlejší skauti:</strong> Můžeš si je jednorázově a natrvalo najmout. Vždy ti zaručeně přivedou 3 hráče jednoho specifického ranku. Skvělé pro hledání kopyt do nižších minilig!</li>
        </ul>
    `,
    'minileague': `
        <h3>🏆 Miniliga</h3>
        <p>Vytvoř si vlastní soutěž nebo se přidej k přátelům (max. 10 manažerů v jedné lize). Zápasy se generují stylem "každý s každým".</p>
        <ul>
            <li><strong>Oddělená šatna:</strong> Tým pro miniligu si stavíš v její vlastní záložce! Používáš základní výplňové hráče nebo si do ní stahuješ vlastní hvězdy ze své Rezervy z hlavní hry.</li>
            <li><strong>Výplňoví hráči:</strong> Prvotní automaticky vygenerovaná sestava hráčů nelze prodat, ani odeslat do šatny / rezervy týmu.</li>
        </ul>
    `,
    'stadium': `
        <h3>🏟️ Stadion a zázemí</h3>
        <p>Tvůj klub je tak silný, jak silné má zázemí. Vylepšuj budovy za herní peníze!</p>
        <ul>
            <li><strong>Kancelář skauta:</strong> Zvyšuje šanci, že skaut objeví 5-hvězdičkového supertalenta. Navíc zrychluje skautování</li>
            <li><strong>Tribuny a Fanshop:</strong> Zvyšují tvé finanční příjmy ze zápasů a generují pasivní zisk.</li>
            <li><strong>Tréninkové centrum:</strong> Hráči získávají více XP z každého odehraného zápasu.</li>
            <li><strong>Trávník:</strong> Hráči získávají % bonus ke své rychlosti při zápasech.</li>
        </ul>
    `,
    'shop': `
        <h3>🛒 Fanshop (Předměty)</h3>
        <p>Tady si můžeš koupit speciální taktické vybavení, které hráčům přidává dočasné bonusy k síle v zápasech.</p>
        <p>Pozor, tyto předměty mají <strong>omezenou výdrž</strong> a po několika odehraných zápasech se opotřebují a zničí!</p>
    `,
    'pve': `
        <h3>🏰 Fotbalové Podzemí (PvE)</h3>
        <p>Máš tým v plné síle, ale liga se hraje až večer? Vydej se do podzemí!</p>
        <p>Stojíš proti řadě speciálních robotických týmů. Za poražení každého soupeře získáš jako odměnu <strong>nového hráče zdarma</strong> a obrovskou porci XP. Další zápas v podzemí můžeš hrát vždy až po hodinovém odpočinku.</p>
    `,
    'hall-of-fame': `
        <h3>⭐ Síň Slávy</h3>
        <p>Tady je zapsána celá tvá historie – sbírka odznaků, statistik a nejdůležitějších milníků tvé manažerské kariéry. (Ve výstavbě)</p>
    `,
    'mail': `
        <h3>✉️ Pošta</h3>
        <p>Tvoje poštovní schránka. Chodí ti sem všechny <strong>záznamy ze zápasů</strong> (z ligy, miniligy i podzemí), shrnutí sezóny a schvalování pozvánek od přátel.</p>
    `
};

window.showHelp = function(sectionKey) {
    const oldModal = document.getElementById('help-modal');
    if (oldModal) oldModal.remove();

    const helpContent = HELP_TEXTS[sectionKey] || "<p>Nápověda pro tuto sekci se připravuje...</p>";

    const modalHtml = `
        <div id="help-modal" class="help-modal-backdrop">
            <div class="help-modal-content">
                <div>
                    ${helpContent}
                </div>
                <div style="text-align: center; margin-top: 25px;">
                    <button class="btn-upgrade" style="background: #4b5563; padding: 8px 25px;" onclick="document.getElementById('help-modal').remove()">Jasná věc, díky!</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// --- SÍŇ SLÁVY ---
window.renderHallOfFame = function() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.position = 'relative';

    if (!playerData.hallOfFame) playerData.hallOfFame = { league: [], pve: [] };

    // Používáme obrázek sin_slavy1.png (z dřívějšího kódu navigace)
    mainContent.innerHTML = `
        <div style="position: relative; z-index: 10; text-align: center; margin-bottom: 15px; pointer-events: none;">
            <button class="help-btn-corner" onclick="showHelp('hall-of-fame')" style="pointer-events: auto;">Nápověda</button>
            <h2 class="section-title" style="text-shadow: 2px 2px 5px rgba(0,0,0,0.8);">Síň Slávy</h2>
            <p class="stadium-subtitle" style="text-shadow: 1px 1px 3px black; font-weight: bold; color: #fdf5e6;">Historie tvých největších manažerských triumfů.</p>
        </div>
        
        <div class="interactive-stadium-container">
            
            <div class="stadium-click-zone" 
                 onclick="openHoFMenu('league')" 
                 style="top: 15%; left: 10%; width: 35%; height: 70%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">🏆 Zlaté poháry</strong>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Ligové tituly (${playerData.hallOfFame.league.length})</div>
                </div>
            </div>

            <div class="stadium-click-zone" 
                 onclick="openHoFMenu('pve')" 
                 style="top: 15%; left: 55%; width: 35%; height: 70%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">☠️ Trofeje bossů</strong>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Pokořená podzemí (${playerData.hallOfFame.pve.length})</div>
                </div>
            </div>
            
        </div>
    `;
};

window.openHoFMenu = function(type) {
    const oldModal = document.getElementById('hof-modal');
    if (oldModal) oldModal.remove();

    let itemsHtml = '';
    let titleText = '';
    let modalWidth = '600px'; // Výchozí šířka pro ligu

    if (type === 'league') {
        titleText = '🏆 Získané ligové tituly';
        const titles = playerData.hallOfFame.league || [];
        
        if (titles.length === 0) {
            itemsHtml = `<p class="text-muted" style="text-align:center; width:100%;">Zatím jsi nevyhrál žádnou divizi. Zabojuj na hřišti!</p>`;
        } else {
            itemsHtml = titles.map(t => {
                // Sestavení rosteru
                const posLabels = { gk: 'BR', def: 'OB', mid: 'ZÁ', att: 'ÚT' };
                const rosterHtml = t.roster.map(p => `
                    <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #4b5563; padding: 4px 0;">
                        <span style="color:#d1d5db;">${p.name} <span style="color:#9ca3af; font-size:0.75rem;">(${p.rank})</span></span>
                        <span style="color:#fcd34d; font-weight:bold; font-size:0.8rem;">${posLabels[p.position]}</span>
                    </div>
                `).join('');

                return `
                    <div class="inventory-card" style="background: rgba(0,0,0,0.3); border: 2px solid #f59e0b; padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #f59e0b; padding-bottom: 10px; margin-bottom: 10px;">
                            <h3 style="color: #fcd34d; margin: 0;">Mistr ${t.div}. Divize</h3>
                            <span style="color: #9ca3af; font-size: 0.85rem;">🗓️ ${t.date}</span>
                        </div>
                        <details style="cursor: pointer;">
                            <summary style="color: #60a5fa; outline: none; font-weight: bold; margin-bottom: 5px;">Zobrazit vítěznou sestavu</summary>
                            <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; font-size: 0.9rem; margin-top: 10px;">
                                ${rosterHtml}
                            </div>
                        </details>
                    </div>
                `;
            }).join('');
        }
    } else {
        // --- NOVÁ SEKCE PRO PVE TROFEJE ---
        titleText = '☠️ Trofeje z Fotbalového podzemí';
        modalWidth = '800px'; // Zvětšíme okno, aby se trofeje hezky poskládaly vedle sebe
        
        // PVE_DUNGEONS je naše nové pole 10 pohárů z configu
        const pveTrophiesHtml = PVE_DUNGEONS.map((dungeon, index) => {
            // Kontrola, jestli už hráč postoupil za tento index
            const isUnlocked = playerData.pve.dungeonIndex > index;
            
            const statusText = isUnlocked ? '🏆 Získáno' : '🔒';
            const lockedClass = isUnlocked ? '' : 'locked';
            const lockIcon = isUnlocked ? '' : '<div class="trophy-lock-icon">🔒</div>';
            
            // Hra se pokusí načíst např. kopyta.png. Pokud soubor neexistuje, použije tvůj trophy.jpg!
            return `
                <div class="trophy-plaque ${lockedClass}">
                    <div class="trophy-img-container">
                        <img src="images/trophies/${dungeon.id}.png" alt="${dungeon.name}" class="trophy-img" onerror="this.onerror=null; this.src='images/trophies/trophy.jpg';">
                        ${lockIcon}
                    </div>
                    <div class="trophy-title">${dungeon.name}</div>
                    <div class="trophy-status">${statusText}</div>
                </div>
            `;
        }).join('');

        itemsHtml = `
            <div class="trophy-cabinet">
                ${pveTrophiesHtml}
            </div>
        `;
    }

    const modalHtml = `
        <div id="hof-modal" class="ml-selector-overlay" onclick="this.remove()">
            <div class="ml-selector-box" style="max-width: ${modalWidth}; width: 95%; max-height: 85vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4b5563; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #fcd34d; margin: 0;">${titleText}</h2>
                    <button class="btn-task" style="padding: 8px 15px; background: #991b1b;" onclick="document.getElementById('hof-modal').remove()">Zavřít</button>
                </div>
                <div style="${type === 'league' ? 'display: flex; flex-direction: column; gap: 15px; text-align: left;' : ''}">
                    ${itemsHtml}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};