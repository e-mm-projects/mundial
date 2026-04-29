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

// --- KANCELÁŘ (ÚKOLY) ---
function renderOffice() {
    const mainContent = document.getElementById('main-content');
    
    const currentMultiplier = 1 + ((playerData.level - 1) * 0.05);
    const bonusPercentage = Math.round((currentMultiplier - 1) * 100); 
    
    const trainerInfoHtml = `
    <div class="info-panel">
            <div>
                <h3 style="margin: 0 0 5px 0; color: #fcd34d;">Úroveň manažera: ${playerData.level}</h3>
                <p class="info-text-base" style="color: #d1d5db;">Vyšší úroveň přináší prestiž a lepší vyjednávací pozici se sponzory.</p>
            </div>
            <div class="office-stats-box">
                <span class="office-stats-label">Zisk z úkolů</span>
                <span class="office-stats-val">+${bonusPercentage} %</span>
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
            </div>
            <div class="active-task-card">
                <h3 class="active-task-title">Probíhá: ${playerData.activeTask.title}</h3>
                <p class="active-task-flavor">"${currentFlavorText}"</p>
                <div class="huge-timer danger" id="task-timer">
                    Počítám...
                </div>
                <button class="btn-task btn-test" onclick="skipTask()">[TEST] Přeskočit čas</button>
            </div>`;
        return;
    }

    if (!playerData.officeTasks || playerData.officeTasks.length === 0) {
        generateTasks();
    }

    mainContent.innerHTML = `
        <div class="text-center">
            <h2 class="section-title">Kancelář manažera</h2>
            ${trainerInfoHtml}
        </div>
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

// --- STADION (BUDOVY) ---
function renderStadium() {
    const mainContent = document.getElementById('main-content');
    let activeBuildHTML = '';
    
    // Zobrazení aktuálně probíhající stavby
    if (playerData.activeUpgrade !== null) {
        const bId = playerData.activeUpgrade.buildingId;
        activeBuildHTML = `
            <div class="active-build-container">
                <h2>Staví se: ${buildingsConfig[bId].name}</h2>
                <div class="timer huge-timer" id="upgrade-timer">Počítám...</div>
                <button class="btn-task btn-test" onclick="skipUpgrade()">[TEST] Dokončit stavbu</button>
            </div>
            <hr style="border-color: #8d6e63; margin-bottom: 20px;">
        `;
    }

    // Generování všech kartiček budov
    const buildingsHTML = Object.keys(buildingsConfig).map(id => {
        const config = buildingsConfig[id];
        const currentLevel = playerData.buildings[id];
        const nextCost = Math.floor(config.baseCost * Math.pow(config.costMult, currentLevel - 1));
        const nextTime = Math.floor(config.baseTime * Math.pow(config.timeMult, currentLevel - 1));

        const canAfford = playerData.money >= nextCost;
        const isBuilding = playerData.activeUpgrade !== null;
        const disabledAttr = (!canAfford || isBuilding) ? 'disabled' : '';

        // --- VÝPOČET BONUSŮ PRO ZOBRAZENÍ ---
        let bonusText = "";
        
        if (id === 'scout') {
            const timeRed = (currentLevel - 1) * 30;
            const chanceInc = ((currentLevel - 1) * 0.5).toFixed(1);
            bonusText = `<div class="building-bonus-text">Aktuální bonus: -${timeRed} min čas, +${chanceInc}% šance na talenty.</div>`;
        } 
        else if (id === 'shop') {
            const moneyPerHour = 100 + (currentLevel - 1) * 50;
            const maxCap = 500 + (currentLevel - 1) * 500;
            const currentInSafe = Math.floor(playerData.shopSafe || 0);
            bonusText = `
                <div class="building-bonus-text">Příjem: ${moneyPerHour} 💰/hod (Max: ${maxCap})</div>
                <div class="shop-safe-box">
                    V pokladně: <span class="shop-safe-amount">${currentInSafe} / ${maxCap} 💰</span>
                    <button class="btn-task btn-collect-safe" onclick="collectShopMoney()">Vybrat pokladnu</button>
                </div>`;
        }
        else if (id === 'tribune') {
            const bonus = currentLevel * 5;
            bonusText = `<div class="building-bonus-text">Aktuální bonus k příjmu: +${bonus}% 💰</div>`;
        }
        else if (id === 'training') {
            const bonus = currentLevel * 5;
            bonusText = `<div class="building-bonus-text">Aktuální bonus k XP hráčů: +${bonus}% 📈</div>`;
        }
        else if (id === 'pitch') {
            const bonus = currentLevel * 1;
            bonusText = `<div class="building-bonus-text">Aktuální bonus k rychlosti: +${bonus}% 🏃</div>`;
        }

        // --- ŘEŠENÍ MAXIMÁLNÍHO LEVELU ---
        const isPitchMax = (id === 'pitch' && currentLevel >= 10);
        const isScoutMax = (id === 'scout' && currentLevel >= 32);
        const isMaxLevel = isPitchMax || isScoutMax; // Pokud je splněna alespoň jedna z podmínek
        
        let upgradeSection = "";
        
        if (isMaxLevel) {
            // Určíme si specifický text podle toho, o jakou budovu jde
            let maxText = "Budova je plně vylepšena.";
            if (id === 'pitch') maxText = "Trávník je v dokonalém stavu.";
            if (id === 'scout') maxText = "Skautská síť dosáhla svého vrcholu.";

            upgradeSection = `
                <div class="building-stats building-stats-maxed">
                    <span class="maxed-title">🏆 DOSAŽENO MAXIMUM</span>
                    <p class="maxed-desc">${maxText}</p>
                </div>`;
        } else {
            // Pro všechny ostatní případy vykreslíme klasickou cenu a tlačítko
            upgradeSection = `
                <div class="building-stats">
                    <div>Vylepšení na úroveň ${currentLevel + 1}:</div>
                    <div class="stat-cost">Cena: ${nextCost} Peněz</div>
                    <div class="stat-time">Čas: ${formatTime(nextTime)}</div>
                </div>
                <button class="btn-upgrade" ${disabledAttr} onclick="startUpgrade('${id}', ${nextCost}, ${nextTime})">Vylepšit</button>
            `;
        }

        // Vykreslení samotné kartičky budovy
        return `
            <div class="building-card">
                <div class="building-header">
                    <h3>${config.name}</h3>
                    <span class="building-level">Lvl. ${currentLevel}</span>
                </div>
                <div class="building-desc">${config.desc}</div>
                ${bonusText}
                ${upgradeSection}
            </div>
        `;
    }).join('');

    // Vložení do hlavní části obrazovky
    mainContent.innerHTML = `
        <div style="text-align: center;">
            <h2 class="section-title">Správa Stadionu</h2>
        </div>
        <p class="stadium-subtitle">Vylepšuj zázemí klubu. V jednu chvíli můžeš stavět pouze jednu budovu.</p>
        ${activeBuildHTML}
        <div class="stadium-grid">
            ${buildingsHTML}
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

    const dIndex = playerData.pve.dungeonIndex;
    const sIndex = playerData.pve.stageIndex;

    // 2. KONTROLA DOKONČENÍ VŠECH DUNGEONŮ
    if (dIndex >= PVE_DUNGEONS.length) {
        mainContent.innerHTML = `
            <div class="text-center">
                <h2 class="section-title">Fotbalové podzemí</h2>
                <div class="info-box warning">
                    <h3 class="text-highlight-gold">🏆 Všechna podzemí pokořena! 🏆</h3>
                    <p>Jsi absolutní mistr okresu. Počkej na další aktualizaci s novými bossy!</p>
                </div>
            </div>
        `;
        return;
    }

    const dungeon = PVE_DUNGEONS[dIndex];
    const stage = dungeon.stages[sIndex];
    const hasSpace = playerData.players.length < 16;
    const now = Date.now();
    const nextTime = playerData.pve.nextMatchTime || 0;
    const isOnCooldown = now < nextTime;

    // 3. GENEROVÁNÍ OBSAHU
    let warningHtml = hasSpace ? '' : `<div class="pve-warning-box">❌ Nemáš místo na střídačce! Běž do Šatny a někoho prodej.</div>`;

    let actionSection = '';
    if (isOnCooldown) {
        actionSection = `
            <div class="pve-cooldown-box">
                <p class="pve-cooldown-label">Hráči odpočívají po těžkém utkání. Další pokus bude možný za:</p>
                <div class="huge-timer" style="margin-top: 0;">
                    ⏳ <span id="pve-timer">Počítám...</span>
                </div>
            </div>
            <button class="btn-task btn-test" onclick="skipPvETime()">[TEST] Přeskočit čekání</button>
            <button class="btn-task btn-full-width" style="background-color: #4b5563; border-color: #374151;" disabled>Odpočinek...</button>
        `;
    } else {
        actionSection = `
        <button class="btn-task btn-full-width" 
            style="background-color: ${hasSpace ? '#b91c1c' : '#4b5563'};" 
            ${hasSpace ? `onclick="startPvEMatch(${dIndex}, ${sIndex})"` : 'disabled'}>
            ⚔️ Vyzvat soupeře (Zdarma)
        </button>
        `;
    }

    mainContent.innerHTML = `
        <div class="text-center">
            <h2 class="section-title">${dungeon.name}</h2>
            <p class="pve-dungeon-description">"${dungeon.desc}"</p>
        </div>

        <div class="pve-stage-card ${stage.isBoss ? 'is-boss' : ''}">
            <div class="pve-card-header">
                <span class="pve-badge ${stage.isBoss ? 'boss' : 'normal'}">
                    Soupeř ${sIndex + 1} / ${dungeon.stages.length}
                </span>
                <button class="btn-task" style="padding: 5px 15px; background-color: #2563eb; border-color: #1d4ed8; font-size: 0.9rem;" onclick="viewPvEBot(${dIndex}, ${sIndex})">
                    📋 Zobrazit statistiky
                </button>
            </div>
            
            <h3 class="pve-opponent-title" style="color: ${stage.isBoss ? '#fca5a5' : '#fcd34d'};">
                ${stage.isBoss ? '☠️ ' : ''}${stage.name}
            </h3>
            
            <div class="pve-reward-box">
                <h4 class="pve-reward-header">🎁 Odměna za vítězství</h4>
                <ul class="scout-odds-list" style="color: #e5e7eb;">
                    <li><strong>+${stage.reward.xp} XP</strong> pro všechny hráče na hřišti</li>
                    <li><strong>Zisk hráče:</strong> Rank [${stage.reward.rank}] (${stage.reward.minStars} až ${stage.reward.maxStars} ⭐)</li>
                </ul>
            </div>

            ${warningHtml}
            ${actionSection}
        </div>
    `;

    if (isOnCooldown) updateTimerUI('pve-timer', nextTime);
}

function renderLockerRoom() {
    const mainContent = document.getElementById('main-content');
    const layout = FORMATIONS_LAYOUT[playerData.formation];

    const formationHints = {
        '4-4-2': 'Zlatá střední cesta. Výborně si poradí s týmy, které hrají ustrašeného zanďoura.',
        '4-3-3': 'Všechno dopředu! Těžká noční můra pro týmy hrající opatrný vyvážený fotbal.',
        '5-4-1': 'Zaparkovat autobus před bránu je nejlepší proti týmům, které hrají bezhlavý útočný fotbal!'
    };
    const currentHint = formationHints[playerData.formation];

    // Logika pro barvu a text tlačítka "Prodej" - využije naše nové CSS třídy
    const sellBtnClass = isSellMode ? 'btn-sell-active' : 'btn-sell-inactive';
    const sellBtnText = isSellMode ? '❌ Zrušit prodej' : '💰 Režim prodeje';

    mainContent.innerHTML = `
        <div class="text-center">
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
                <h3 class="bench-title">Střídačka (Kapacita: ${playerData.players.length - 11}/5)</h3>
                <button onclick="toggleSellMode()" class="btn-sell-mode ${sellBtnClass}">
                    ${sellBtnText}
                </button>
            </div>
            ${isSellMode ? '<p class="sell-warning-text">Klikni na hráče, kterého chceš vyhodit z klubu.</p>' : ''}
            <div class="player-list">${renderPlayerGroup(11, 18, 'bench')}</div>
        </div>
    `;

    // --- PŘIDÁME TÝMOVÝ TREZOR NA KONEC ŠATNY ---
    const renderInventorySlot = (role, label, limit) => {
        // --- BEZPEČNOSTNÍ POJISTKA PRO NOVÉ ÚČTY ---
        // Pokud hráč nemá trezor (nebo v něm chybí konkrétní sekce), vytvoříme ho
        if (!playerData.inventory) {
            playerData.inventory = { att: [], mid: [], def: [], gk: [] };
        }
        
        // Vezmeme předměty, nebo pokud sekce neexistuje, použijeme prázdné pole
        const items = playerData.inventory[role] || [];
        // -------------------------------------------

        let slotsHtml = '';
        
        for (let i = 0; i < limit; i++) {
            const item = items[i];
            if (item) {
                slotsHtml += `
                    <div class="player-card inventory-card">
                        <div class="inventory-item-name">${item.name}</div>
                        <div class="inventory-item-duration">⏳ Zbývá: ${item.duration} záp.</div>
                        <button class="btn-task btn-discard" onclick="discardItem('${role}', ${item.instanceId})">🗑️ Vyhodit</button>
                    </div>
                `;
            } else {
                slotsHtml += `
                    <div class="player-card empty-slot inventory-slot-empty">
                        <div style="font-size: 0.7rem;">Volný slot</div>
                    </div>
                `;
            }
        }
        return `
            <div style="margin-bottom: 15px;">
                <h4 style="color: #fdf5e6; margin: 0 0 5px 0; font-size: 0.9rem;">${label} (${items.length}/${limit})</h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">${slotsHtml}</div>
            </div>
        `;
    };

    mainContent.innerHTML += `
        <details class="collapsible-box gold">
            <summary class="collapsible-header" style="color: #fcd34d;">
                📦 Týmový trezor (Bonusové předměty) ▾
            </summary>
            <div style="margin-top: 20px;">
                ${renderInventorySlot('att', 'Útočné bonusy', 2)}
                ${renderInventorySlot('mid', 'Záložní bonusy', 2)}
                ${renderInventorySlot('def', 'Obranné bonusy', 2)}
                ${renderInventorySlot('gk', 'Brankářské vybavení', 1)}
            </div>
        </details>
    `;

    const reserveHtml = `
        <div class="reserve-accordion">
            <div class="reserve-header" onclick="document.querySelector('.reserve-content').classList.toggle('active')">
                <span>📦 REZERVA TÝMU (Hráči mimo aktivní kádr)</span>
                <span>▼</span>
            </div>
            <div class="reserve-content" style="display:none; padding: 15px; background: rgba(0,0,0,0.5);">
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
    mainContent.innerHTML += reserveHtml;
}

function renderPlayerGroup(startIndex, endIndex, role) {
    let html = '';
    const statLabels = {
        atk: 'Útok', def: 'Obrana', spd: 'Rychlost', 
        str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář'
    };

    for (let i = startIndex; i < endIndex; i++) {
        if (i >= playerData.players.length) {
            html += `
                <div class="player-card empty-slot">
                    <div style="font-weight: bold; font-size: 1.2rem;">Volné místo</div>
                </div>
            `;
            continue;
        }

        const player = playerData.players[i];
        const posConfig = POSITION_STATS[player.position];
        const isSelected = selectedPlayerIndex === i ? 'selected' : '';
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        const sellPrice = Math.floor(getPlayerPrice(player) / 2);
        
        html += `
            <div class="player-card ${posConfig.colorClass} ${isSelected}" onclick="handlePlayerClick(${i})">
                <div class="player-name">${player.name}</div>
                
                <div class="player-position-row">${posConfig.label}</div>
                
                <div class="player-info-line">
                    <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | ${getPlayerLevelText(player)} ${starsHtml}
                </div>
                
                <div class="player-nationality">Národnost: ${player.nationality}</div>

                ${isSellMode ? `<div class="price-tag sell">Prodat za: ${sellPrice} 💰</div>` : ''}
                ${i >= 11 && !isSellMode ? `<button class="btn-reserve-action btn-to-reserve" onclick="event.stopPropagation(); sendToReserve(${i})">Odeslat do rezervy</button>` : ''}

                <div class="player-stats">
                    ${posConfig.stats.map(statKey => `
                        <div class="stat-item highlighted">
                            ${statLabels[statKey]}: <span>${player.stats[statKey]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    return html;
}

function renderScouting() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.scoutedPlayers) playerData.scoutedPlayers = [];
    if (!playerData.lastScoutRefresh) playerData.lastScoutRefresh = 0;
    
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

    const playersHtml = playerData.scoutedPlayers.map((player, index) => {
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        const posConfig = POSITION_STATS[player.position];
        const price = getPlayerPrice(player);
        const canAfford = playerData.money >= price;
        
        // Převodník popisků (pokud ho nemáš globálně, definuj ho i zde)
        const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };

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
                </div>
                <button class="btn-upgrade" style="width: 100%; margin-top: 10px;" onclick="buyPlayer(${index}, ${price})" ${!canAfford ? 'disabled' : ''}>Koupit</button>
            </div>
        `;
    }).join('');

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

                <button class="btn-task btn-test" style="margin-top: 15px; padding: 5px 10px;" onclick="forceScoutRefresh()">[TEST] Vygenerovat hned</button>
            </div>
        </div>
        <div class="player-list">
            ${playersHtml}
        </div>
    `;

    updateTimerUI('scout-timer', nextRefresh);
}

function renderMatches() {
 const mainContent = document.getElementById('main-content');

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
    const hasUnreadMatch = playerData.mail.some(m => !m.read && !m.isPvE);
    const unreadBanner = hasUnreadMatch ? `
        <div class="notification-banner" onclick="document.querySelector('[data-target=\\'mail\\']').click()">
            📺 Máš v poště nezkouknutý záznam zápasu! Klikni sem a běž se podívat.
        </div>
    ` : '';

    // Aplikace nových tříd do HTML šablony
    mainContent.innerHTML = `
        <div class="text-center" style="margin-bottom: 20px;">
            <h2 class="section-title">${divName}</h2>
            <br>
            <div class="season-timer-box">
                ⏳ DO KONCE SEZÓNY: <span id="topbar-season-timer" class="season-timer-text">--:--</span>
            </div>
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
                <button class="btn-task btn-test btn-play-now" onclick="skipMatchTime()">[TEST] Odehrát hned</button>
                <button class="btn-task btn-test btn-sim-season" onclick="testSimulateFullSeason()">⏩ [TEST] Simulovat sezónu</button>
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

// --- POŠTA (Seznam zpráv) ---
window.renderMail = function() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.mail || playerData.mail.length === 0) {
        mainContent.innerHTML = `
            <div class="text-center">
                <h2 class="section-title">Pošta</h2>
                <p class="mail-empty-text">Schránka je zatím prázdná, trenére.</p>
            </div>`;
        return;
    }

    mainContent.innerHTML = `
        <div class="text-center">
            <h2 class="section-title">Doručená pošta</h2>
        </div>
        <div class="mail-container">
            ${playerData.mail.map((m, index) => {
                const unreadClass = m.read ? '' : 'unread';

                // --- 1. ŽÁDOST O PŘIPOJENÍ DO MINILIGY ---
                if (m.type === "ml_invite") {
                    return `
                    <div class="mail-message ${unreadClass}" style="border-left-color: #f59e0b;">
                        <div>
                            <strong class="mail-msg-title">${m.subject}</strong> 
                            <span class="mail-msg-date">(${m.date})</span>
                            <br><span style="color: #d1d5db; display: block; margin-top: 5px;">${m.text}</span>
                        </div>
                        <div style="margin-top: 10px; display: flex; gap: 10px;">
                            <button class="btn-task" style="background: #10b981; padding: 5px 15px;" 
                                    onclick="acceptMLInvite('${m.id}', '${m.applicantUid}', '${m.applicantName}', '${m.leagueName}', '${m.leagueRank}')">
                                ✅ Přijmout
                            </button>
                            <button class="btn-task" style="background: #ef4444; padding: 5px 15px;" 
                                    onclick="rejectMLInvite('${m.id}', '${m.applicantUid}', '${m.leagueName}')">
                                ❌ Zamítnout
                            </button>
                        </div>
                    </div>
                    `;
                }

                // --- 2. KLASICKÁ TEXTOVÁ ZPRÁVA (výsledky miniligy, oznámení atd.) ---
                if (m.text && !m.result) {
                    return `
                    <div class="mail-message ${unreadClass}" style="border-left-color: #3b82f6;">
                        <div>
                            <strong class="mail-msg-title">${m.subject}</strong> 
                            <span class="mail-msg-date">(${m.date})</span>
                            <br><span style="color: #d1d5db; display: block; margin-top: 5px;">${m.text}</span>
                        </div>
                        <button class="btn-task" style="background: #4b5563; padding: 5px 15px; margin-top: 10px;" 
                                onclick="playerData.mail.splice(${index}, 1); saveGame(); renderMail();">
                            🗑️ Smazat zprávu
                        </button>
                    </div>
                    `;
                }

                // --- 3. VIDEO ZÁZNAM BĚŽNÉHO ZÁPASU (Původní logika) ---
                const scoreDisplay = m.read ? m.result : '❓ : ❓';
                const scoreText = m.read ? `Konečné skóre: ${scoreDisplay}` : `Skóre je tajné (Pusť si záznam!)`;
                const btnText = m.read ? 'Znovu přehrát' : '▶ Přehrát zápas';

                let borderColor = '#9a9f05'; 
                let scoreColor = '#9a9f05';  

                if (m.read && m.result && m.result.includes(':')) {
                    const [myGoals, botGoals] = m.result.split(':').map(Number);
                    if (myGoals > botGoals) {
                        borderColor = '#10b981'; scoreColor = '#166534';
                    } else if (myGoals < botGoals) {
                        borderColor = '#ef4444'; scoreColor = '#b91c1c';
                    } else {
                        borderColor = '#6b7280'; scoreColor = '#4b5563';
                    }
                }

                const btnClass = m.read ? 'btn-replay-read' : 'btn-replay-unread';

                return `
                <div class="mail-message ${unreadClass}" style="border-left-color: ${borderColor};">
                    <div>
                        <strong class="mail-msg-title">${m.subject}</strong> 
                        <span class="mail-msg-date">(${m.date})</span>
                        <br><span class="mail-msg-score-text" style="color: ${scoreColor};">${scoreText}</span>
                    </div>
                    <button class="btn-task ${btnClass}" onclick="openMatchReport(${index})">
                        ${btnText}
                    </button>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

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

    replayWindow.innerHTML += `
        <div style="display: flex; margin-bottom: 12px; background: ${bgColor}; padding: 8px; border-radius: 5px; border-left: 3px solid ${textColor};">
            <div style="min-width: 45px; font-weight: bold; color: ${textColor};">${action.min}'</div>
            <div style="margin-right: 10px;">${icon}</div>
            <div style="flex: 1; color: ${textColor};">${action.text}</div>
        </div>
    `;
    replayWindow.scrollTop = replayWindow.scrollHeight;
}

// --- KLUBOVÝ FANSHOP ---
function renderShop() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.dailyShopItems || playerData.dailyShopItems.length === 0) {
        mainContent.innerHTML = `
            <div style="text-align: center;">
                <h2 class="section-title">Klubový Fanshop</h2>
                <div class="info-box" style="margin: 30px auto; max-width: 500px;">
                    <p style="font-style: italic;">"Dneska už máme vyprodáno, trenére. Stavte se zítra."</p>
                    <button class="btn-task btn-skip" style="margin-top: 15px;" onclick="refreshDailyShop(true); renderShop();"> 
                        📦 [TEST] Obnovit nabídku 
                    </button>
                </div>
            </div>`;
        return;
    }

    const itemsHtml = playerData.dailyShopItems.map((item, index) => {
        const canAfford = playerData.money >= item.currentPrice;
        return `
            <div class="player-card" style="border-color: #f59e0b; min-height: 320px; display: flex; flex-direction: column; justify-content: space-between; background: #fffdfa;">
                <div>
                    <div class="player-name" style="color: #b45309; border-bottom: 1px solid #fed7aa; padding-bottom: 5px;">${item.name}</div>
                    <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.4; font-style: italic; padding: 10px; text-align: center;">
                        "${item.desc}"
                    </p>
                </div>
                <div style="background: #fef3c7; padding: 8px; border-radius: 5px; margin: 10px; font-size: 0.85rem; text-align: center; border: 1px solid #fde68a;">
                    ⏳ Vydrží: <strong>${item.duration} zápasů</strong>
                </div>
                <div style="padding: 10px;">
                    <div class="price-tag buy" style="margin-bottom: 10px; font-size: 1.1rem;">Cena: ${item.currentPrice} 💰</div>
                    <button class="btn-upgrade" style="width: 100%; padding: 10px;" onclick="buyItem(${index})" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Koupit předmět' : 'Nedostatek peněz'}
                    </button>
                    <button class="btn-task btn-test" style="width: 100%; padding: 5px; font-size: 0.8rem; margin-top: 5px;" onclick="buyItem(${index}, true)">
                        [TEST] Koupit ZDARMA
                    </button>
                </div>
            </div>
        `;
    }).join('');

    mainContent.innerHTML = `
        <div style="text-align: center;">
            <h2 class="section-title">Klubový Fanshop</h2>
        </div>
        <div class="player-list" style="justify-content: center; gap: 25px;">
            ${itemsHtml}
        </div>
    `;
}

// --- DETAIL ZÁPASU (Záznam utkání) ---
window.openMatchReport = function(index) {
    const msg = playerData.mail[index];
    msg.read = true; 
    saveGame();
    window.currentMatchMsg = msg; 

    const mainContent = document.getElementById('main-content');
    const homeTeam = msg.rewards?.homeTeam || "Domácí";
    const awayTeam = msg.rewards?.awayTeam || "Hosté";
    
    const myR = msg.rewards?.myRating;
    const botR = msg.rewards?.botRating;

    // Pomocná funkce pro panel
    const createRatingPanel = (teamName, rating, isHome) => `
        <div class="rating-panel ${isHome ? 'home' : 'away'}">
            <h4 class="rating-panel-title">${teamName}</h4>
            <div class="rating-row"><span>⚔️ Útok:</span> <strong>${rating.att}</strong></div>
            <div class="rating-row"><span>🧭 Záloha:</span> <strong>${rating.mid}</strong></div>
            <div class="rating-row"><span>🛡️ Obrana:</span> <strong>${rating.def}</strong></div>
            <div class="rating-row last"><span>🧤 Brankář:</span> <strong>${rating.gk}</strong></div>
        </div>
    `;

    mainContent.innerHTML = `
        <div class="match-report-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <button onclick="renderMail()" style="padding: 10px 20px; background: #4e342e; color: white; border: 2px solid #3e2723; border-radius: 5px; cursor: pointer; font-weight: bold; flex-shrink: 0; font-family: inherit;">⬅ Zpět</button>
            
            <div style="flex: 1; display: flex; justify-content: center; min-width: 250px;">
                <h2 class="section-title" style="margin: 0 !important;">Záznam utkání</h2>
            </div>
            
            <button id="skip-replay-btn" onclick="finishMatchReplay()" style="padding: 10px 20px; background: #d84315; color: white; border: 2px solid #9a3412; border-radius: 5px; cursor: pointer; font-weight: bold; flex-shrink: 0; font-family: inherit;">⏩ Přeskočit</button>
        </div>

        <div style="display: flex; flex-direction: column;">
            <div class="match-report-board">
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

            <div class="match-report-layout">
                ${myR ? createRatingPanel(homeTeam, myR, true) : '<div style="width: 220px; border: 1px dashed #444; color: #666; display: flex; align-items: center; justify-content: center; border-radius: 10px;">Data nedostupná</div>'}
                
                <div id="replay-window" class="replay-window-container" style="flex: 1; max-width: 800px; height: 350px; background: #111827; padding: 20px; border: 4px solid #374151; border-radius: 10px; overflow-y: auto;">
                    </div>
                
                ${botR ? createRatingPanel(awayTeam, botR, false) : '<div style="width: 220px; border: 1px dashed #444; color: #666; display: flex; align-items: center; justify-content: center; border-radius: 10px;">Data nedostupná</div>'}
            </div>
        </div>
    `;

    let step = 0;
    if (window.matchReplayInterval) clearInterval(window.matchReplayInterval);
    window.matchReplayInterval = setInterval(() => {
        const replayWindow = document.getElementById('replay-window');
        if (!replayWindow) { clearInterval(window.matchReplayInterval); return; }
        if (step < msg.content.length) { renderReplayAction(msg.content[step]); step++; } 
        else { finishMatchReplay(); }
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

// MINILIGA - ROZCESTNÍK //

window.renderMinileague = function() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="scouting-card minileague-container">
            <h2 class="section-title">Online Miniligy</h2>
            <p class="text-muted">Změř své síly s ostatními manažery z celého světa!</p>
            
            <div class="minileague-menu-wrapper">
                
                <div class="minileague-card">
                    <h3 class="minileague-card-title yellow">Založit novou miniligu</h3>
                    <p class="minileague-card-desc">Založ vlastní ligu a pozvi ostatní. Cena za založení je 1 💰.</p>
                    <div class="minileague-btn-group">
                        <button class="btn-task btn-create-league" onclick="createNewMinileague('Kopyto')">Vytvořit - Kopyto</button>
                        <button class="btn-task btn-create-league" onclick="alert('Zatím ve vývoji!')">Vytvořit - Amatér</button>
                        <button class="btn-task btn-create-league" onclick="alert('Zatím ve vývoji!')">Vytvořit - Srdcař</button>
                    </div>
                </div>

                <div class="minileague-card">
                    <h3 class="minileague-card-title blue">Připojit se do existující ligy</h3>
                    <p class="minileague-card-desc">Znáš přesný název miniligy svého kamaráda? Požádej o přijetí!</p>
                    <div class="minileague-btn-group">
                        <input type="text" id="join-league-input" class="minileague-input" placeholder="Zadej název miniligy...">
                        <button class="btn-task btn-join-league" onclick="joinMinileague()">Odeslat žádost</button>
                    </div>
                </div>

                <div class="minileague-card">
                    <h3 class="minileague-card-title purple">Moje miniligy</h3>
                    <p class="minileague-card-desc">Zde najdeš rozehrané ligy a můžeš si nastavit svou soupisku.</p>
                    <button class="btn-task btn-full-width btn-my-leagues" onclick="renderMyMinileaguesList()">Vstoupit do mých minilig</button>
                </div>

            </div>
        </div>
    `;
}

// MINILIGA - DETAILY //

window.renderMinileagueDetail = async function(leagueName, skipLoader = false) {
    const mainContent = document.getElementById('main-content');
    const currentScroll = window.scrollY; // Zapamatujeme si, kde uživatel je

    if (!skipLoader) {
        mainContent.innerHTML = `<div class="loader">Načítám data z ligy...</div>`;
    }

    try {
        const dbRef = window.dbRef(window.db);
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
        let league = snapshot.val();

        // --- SPOUŠTĚČ SIMULACE ---
        if (Date.now() >= league.nextMatchTime) {
            await window.runMLSimulation(leagueName, league);
            // Po simulaci si data načteme znovu, aby byla tabulka aktuální
            const newSnap = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
            league = newSnap.val();
        }
        const myTeam = league.teams[playerData.uid];
        const layout = FORMATIONS_LAYOUT['4-4-2'];
        // --- GENEROVÁNÍ NOVÉ TABULKY --- //
        let standingsHtml = Object.keys(league.standings)
            .sort((a,b) => {
                // Nejprve třídíme podle bodů
                if (league.standings[b].pts !== league.standings[a].pts) {
                    return league.standings[b].pts - league.standings[a].pts;
                }
                // Pokud je shoda bodů, rozhoduje rozdíl skóre
                const diffB = league.standings[b].gf - league.standings[b].ga;
                const diffA = league.standings[a].gf - league.standings[a].ga;
                return diffB - diffA;
            })
            .map((uid, i) => {
                const s = league.standings[uid];
                // Zvýrazníme řádek, pokud je to tvůj tým
                const isMyTeam = uid === playerData.uid ? 'class="my-team-row"' : '';
                
                return `
                <tr ${isMyTeam}>
                    <td style="color: #10b981; font-weight: bold;">${i+1}.</td>
                    <td style="text-align:left;"><span class="ml-team-name">${league.participants[uid]}</span></td>
                    <td>${s.p}</td>
                    <td style="color: #6b7280;">${s.gf}:${s.ga}</td>
                    <td>${s.w}</td>
                    <td>${s.d}</td>
                    <td>${s.l}</td>
                    <td style="font-weight:bold; font-size:1.1rem;">${s.pts}</td>
                </tr>`;
            }).join('');

        const renderMLRow = (start, end, title) => {
            let cards = "";
            for (let i = start; i < end; i++) cards += renderMLPlayerCard(myTeam.players[i], i, leagueName);
            return `<div class="ml-pitch-row"><span class="ml-row-title">${title}</span><div class="player-list">${cards}</div></div>`;
        };

        // STŘÍDAČKA - Pevně 5 míst (indexy 11 až 15)
        let benchCards = "";
        for (let i = 11; i < 16; i++) {
            benchCards += renderMLPlayerCard(myTeam.players[i], i, leagueName);
        }

        mainContent.innerHTML = `
            <div class="scouting-card minileague-container">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 class="section-title">🏆 ${league.name}</h2>
                    <button class="btn-task" onclick="renderMyMinileaguesList()" style="background:#4b5563;">Zavřít ligu</button>
                </div>
                
                <table class="minileague-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th style="text-align:left;">Manažer</th>
                            <th>Z</th>
                            <th>SKÓRE</th>
                            <th>V</th>
                            <th>R</th>
                            <th>P</th>
                            <th>B</th>
                        </tr>
                    </thead>
                    <tbody>${standingsHtml}</tbody>
                </table>
                <button class="btn-task" style="background:#6366f1; margin-bottom: 15px;" 
                    onclick="showMLHistory('${leagueName}')">📊 Výsledky poslední sezóny</button>

                <div class="minileague-locker-accordion">
                    <div class="locker-header" onclick="document.querySelector('.locker-content').classList.toggle('active')">
                        <span>👕 ŠATNA MINILIGY (Klikni pro sbalení/rozbalení)</span>
                        <span>▼</span>
                    </div>
                    <div class="locker-content active">
                        <div class="ml-pitch-area">
                            ${renderMLRow(layout.gk[0], layout.gk[1], "Brankář")}
                            ${renderMLRow(layout.def[0], layout.def[1], "Obránci")}
                            ${renderMLRow(layout.mid[0], layout.mid[1], "Záložníci")}
                            ${renderMLRow(layout.att[0], layout.att[1], "Útočníci")}
                        </div>
                        <div class="ml-bench-area">
                            <span class="ml-row-title">Střídačka (max 5 míst)</span>
                            <div class="player-list">${benchCards}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Vrátíme hráče tam, kam kliknul, bez trhnutí obrazovky
        if (skipLoader) {
            setTimeout(() => window.scrollTo(0, currentScroll), 0);
        }

    } catch (e) { 
        console.error("Chyba miniligy:", e);
        renderMinileague(); 
    }
}

// Funkce pro karty - je nyní 100% identická s hlavní šatnou
function renderMLPlayerCard(player, index, leagueName) {
    const isSelected = window.selectedMLIndex === index ? 'ml-selected' : '';
    
    if (!player) {
        return `<div class="player-card empty-slot ${isSelected}" onclick="handleMLPlayerClick('${leagueName}', ${index})">
                    <div class="empty-text">Volné místo</div>
                </div>`;
    }
    
    const posConfig = POSITION_STATS[player.position];
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };
    const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';

    // Tlačítko pro návrat do rezervy (pouze pro střídačku)
    const returnHtml = index >= 11 
        ? `<button class="btn-reserve-action btn-to-reserve" onclick="event.stopPropagation(); returnFromMLToReserve('${leagueName}', ${index})" style="margin-top:5px; background-color: #3b82f6;">Vrátit do rezervy</button>` 
        : '';

    return `
        <div class="player-card ${posConfig.colorClass} ${isSelected}" onclick="handleMLPlayerClick('${leagueName}', ${index})">
            <div class="player-name">${player.name}</div>
            <div class="player-position-row">${posConfig.label}</div>
            
            <div class="player-info-line">
                <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | ${getPlayerLevelText(player)} ${starsHtml}
            </div>
            
            <div class="player-nationality">Národnost: ${player.nationality}</div>

            ${returnHtml}

            <div class="player-stats" style="margin-top: 10px;">
                ${posConfig.stats.map(s => `
                    <div class="stat-item highlighted">
                        ${statLabels[s]}: <span>${player.stats[s]}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.renderMyMinileaguesList = async function() {
    const mainContent = document.getElementById('main-content');
    const myLeagues = playerData.myMinileagues || [];

    if (myLeagues.length === 0) {
        mainContent.innerHTML = `
            <div class="scouting-card minileague-container">
                <h2 class="section-title">Moje miniligy (0/3)</h2>
                <div style="margin-top:20px; text-align:center;">
                    <p class="text-muted">Zatím nejsi v žádné minilize.<br>Můžeš být maximálně ve 3 současně.</p>
                </div>
                <button class="btn-task btn-full-width" style="margin-top:20px; background:#4b5563;" onclick="renderMinileague()">Zpět na rozcestník</button>
            </div>`;
        return;
    }

    // Loader, protože teď taháme data z cloudu
    mainContent.innerHTML = `<div class="loader">Načítám tvé miniligy z cloudu...</div>`;

    let leaguesHtml = '';
    const dbRef = window.dbRef(window.db);

    for (const leagueData of myLeagues) {
        const leagueName = typeof leagueData === 'object' ? leagueData.name : leagueData;
        const leagueRank = typeof leagueData === 'object' ? `(${leagueData.rank})` : '';

        // Stažení detailů ligy pro výpočet času
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
        
        let timeText = "Status neznámý";
        if (snapshot.exists()) {
            const leagueInfo = snapshot.val();
            const timeLeft = leagueInfo.seasonEndTime - Date.now();
            
            if (timeLeft > 0) {
                const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const h = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                timeText = `⏳ Konec za: <strong>${d}d ${h}h ${m}m</strong>`;
            } else {
                timeText = `✅ Sezóna končí, probíhá vyhodnocení`;
            }
        }

        leaguesHtml += `
        <div style="background: rgba(0,0,0,0.3); border: 1px solid #4b5563; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <strong style="color: #fcd34d; font-size: 1.1rem;">🏆 ${leagueName}</strong> 
                <span style="color: #ccc; font-size: 0.9rem;">${leagueRank}</span>
                <div style="font-size: 0.85rem; color: #9ca3af; margin-top: 6px;">${timeText}</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-task" style="background:#2563eb; padding: 8px 15px;" onclick="renderMinileagueDetail('${leagueName}')">Vstoupit</button>
                <button class="btn-task" style="background:#991b1b; padding: 8px 15px;" onclick="leaveMinileague('${leagueName}')">Opustit</button>
            </div>
        </div>`;
    }

    mainContent.innerHTML = `
        <div class="scouting-card minileague-container">
            <h2 class="section-title">Moje miniligy (${myLeagues.length}/3)</h2>
            <div style="margin-top:20px;">${leaguesHtml}</div>
            <button class="btn-task btn-full-width" style="margin-top:20px; background:#4b5563;" onclick="renderMinileague()">Zpět na rozcestník</button>
        </div>
    `;
}

// Pomocná funkce pro vykreslení karet v minilize
function renderMinileaguePlayers(players) {
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };
    return players.map((player, i) => {
        const posConfig = POSITION_STATS[player.position];
        return `
            <div class="player-card ${posConfig.colorClass}" style="width:180px; font-size:0.8rem;">
                <div class="player-name">${player.name}</div>
                <div class="player-position-row">${posConfig.label}</div>
                <div class="player-info-line">${player.rank} | Lvl.${player.level}</div>
                <div class="player-stats">
                    ${posConfig.stats.map(s => `<div class="stat-item">${statLabels[s]}: ${player.stats[s]}</div>`).join('')}
                </div>
                ${i >= 11 ? `<button class="btn-small-add" style="background:red; width:100%; margin-top:5px;" onclick="alert('Funkce odstranění bude doplněna')">Odstranit</button>` : ''}
            </div>
        `;
    }).join('');
}

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
    const players = filter === 'all' 
        ? playerData.reserve 
        : playerData.reserve.filter(p => p.rank === filter);

    if (players.length === 0) return `<p class="text-muted" style="width:100%; text-align:center;">V této kategorii nemáš žádné hráče.</p>`;

    // Plné názvy statistik jako v hlavní hře
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };

    return players.map(player => {
        const posConfig = POSITION_STATS[player.position];
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
                </div>
            </div>
        `;
    }).join('');
}

window.openMLSelector = function(playerId) {
    const player = playerData.reserve.find(p => p.id === playerId);
    if (!player) return;

    // Filtrujeme ligy podle ranku
    const compatibleLeagues = (playerData.myMinileagues || []).filter(l => {
        if (typeof l === 'object') return l.rank === player.rank;
        return false;
    });

    if (compatibleLeagues.length === 0) {
        alert(`Nemáš žádnou aktivní miniligu pro rank: ${player.rank}`);
        return;
    }

    // Vytvoříme HTML pro overlay
    const overlay = document.createElement('div');
    overlay.className = 'ml-selector-overlay';
    overlay.id = 'ml-selector-modal';

    const listHtml = compatibleLeagues.map(l => `
        <div class="ml-select-item" onclick="executeMLTransfer('${playerId}', '${l.name}')">
            🏆 ${l.name}
        </div>
    `).join('');

    overlay.innerHTML = `
        <div class="ml-selector-box">
            <h3 style="color: #fcd34d; margin-top:0;">Odeslat do miniligy</h3>
            <p style="font-size: 0.85rem; color: #ccc;">
                Hráč <strong>${player.name}</strong> (${player.rank})<br>
                bude odeslán do vybrané ligy:
            </p>
            <div class="ml-selector-list">${listHtml}</div>
            <button class="btn-close-selector" onclick="document.getElementById('ml-selector-modal').remove()">Zavřít</button>
        </div>
    `;

    document.body.appendChild(overlay);
}

// FUNKCE KTERÁ UKÁŽE VÝSLEDKY POSLEDNÍ MINILIGY //
window.showMLHistory = async function(leagueName) {
    const dbRef = window.dbRef(window.db);
    const snap = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}/lastResults`));
    const results = snap.val();

    if (!results) {
        alert("Zatím nebyly odehrány žádné sezóny.");
        return;
    }

    const resText = results.map((r, i) => `${i+1}. ${r.name} - ${r.pts} bodů`).join('\n');
    alert(`🏆 POSLEDNÍ VÍTĚZOVÉ LIGY ${leagueName}:\n\n${resText}`);
};