// --- TRÉNINKOVÉ HŘIŠTĚ ---
function renderTraining() {
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
        
        let xpPercentage = 100;
        if (player.maxLevel > 0 && player.level < player.maxLevel) {
            const requiredXp = player.level * 100;
            xpPercentage = Math.floor((player.xp / requiredXp) * 100);
        }

        // Pokud hráč nemá hvězdy, schováme XP bar a ukážeme červený text
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
            <div class="player-card" style="cursor: default; border-color: ${player.unspentPoints > 0 ? '#10b981' : '#a1887f'};">
                <div class="player-name">${player.name}</div>
                <div style="font-size: 0.85rem; color: #4b5563; text-align: center; margin-bottom: 2px;">[${player.rank}] ${getPlayerLevelText(player)}</div>
                <div class="player-stars">${starsHtml}</div>
                
                ${xpBarHtml}
                
                <div style="text-align: center; font-size: 0.85rem; margin-bottom: 12px; color: #4b5563;">
                    Volné body: <strong style="color: ${player.unspentPoints > 0 ? '#10b981' : '#6b7280'}; font-size: 1.1rem;">${player.unspentPoints}</strong>
                </div>

                <div style="text-align: left; font-size: 0.9rem;">
                    ${renderStatRow('atk', 'Útok')}
                    ${renderStatRow('def', 'Obrana')}
                    ${renderStatRow('spd', 'Rychlost')}
                    ${renderStatRow('str', 'Síla')}
                    ${renderStatRow('eng', 'Výdrž')}
                    ${renderStatRow('tek', 'Technika')}
                    ${renderStatRow('gk', 'Brankář')}
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
            <div class="player-list">${renderPlayerGroup(11, 16, 'bench')}</div>
        </div>
    `;

    // --- PŘIDÁME TÝMOVÝ TREZOR NA KONEC ŠATNY ---
    const renderInventorySlot = (role, label, limit) => {
        const items = playerData.inventory[role];
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
}

function renderPlayerGroup(startIndex, endIndex, role) {
    let html = '';
    const checkHighlight = (statName, currentRole) => {
        if (currentRole === 'att' && ['atk', 'spd', 'tek', 'eng'].includes(statName)) return 'highlighted';
        if (currentRole === 'mid' && ['atk', 'def', 'spd', 'tek', 'eng'].includes(statName)) return 'highlighted';
        if (currentRole === 'def' && ['def', 'str', 'spd', 'eng'].includes(statName)) return 'highlighted';
        if (currentRole === 'gk'  && ['gk', 'tek', 'def', 'spd'].includes(statName)) return 'highlighted';
        return ''; 
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
        const isSellTarget = (isSellMode && i >= 11) ? 'border-color: #ef4444; background-color: #fee2e2;' : '';
        const isSelected = selectedPlayerIndex === i ? 'selected' : '';
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        
        let baseValue = player.statCap * 10; 
        const sellPrice = Math.floor(getPlayerPrice(player) / 2);
        
        html += `
            <div class="player-card ${isSelected}" style="${isSellTarget}" onclick="handlePlayerClick(${i})">
                <div class="player-name">${player.name}</div>
                <div style="font-size: 0.85rem; color: #4b5563; text-align: center;">[${player.rank}] ${getPlayerLevelText(player)}</div>
                <div class="player-stars">${starsHtml}</div>
                
                <div class="price-tag sell">Prodat za: ${sellPrice} 💰</div>

                <div class="player-stats">
                    <div class="stat-item ${checkHighlight('atk', role)}">Útok: <span>${player.stats.atk}</span></div>
                    <div class="stat-item ${checkHighlight('def', role)}">Obrana: <span>${player.stats.def}</span></div>
                    <div class="stat-item ${checkHighlight('spd', role)}">Rychlost: <span>${player.stats.spd}</span></div>
                    <div class="stat-item ${checkHighlight('str', role)}">Síla: <span>${player.stats.str}</span></div>
                    <div class="stat-item ${checkHighlight('eng', role)}">Výdrž: <span>${player.stats.eng}</span></div>
                    <div class="stat-item ${checkHighlight('tek', role)}">Technika: <span>${player.stats.tek}</span></div>
                    <div class="stat-item ${checkHighlight('gk', role)}">Brankář: <span>${player.stats.gk}</span></div>
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
        const price = getPlayerPrice(player);
        const canAfford = playerData.money >= price;
        
        return `
            <div class="player-card">
                <div class="player-name">${player.name}</div>
                <div style="font-size: 0.85rem; color: #4b5563; text-align: center;">[${player.rank}] ${getPlayerLevelText(player)}</div>
                <div class="player-stars">${starsHtml}</div>
                
                <div class="price-tag buy">Cena: ${price} 💰</div>

                <div class="player-stats">
                    <div class="stat-item">Útok: <span>${player.stats.atk}</span></div>
                    <div class="stat-item">Obrana: <span>${player.stats.def}</span></div>
                    <div class="stat-item">Rychlost: <span>${player.stats.spd}</span></div>
                    <div class="stat-item">Síla: <span>${player.stats.str}</span></div>
                    <div class="stat-item">Výdrž: <span>${player.stats.eng}</span></div>
                    <div class="stat-item">Technika: <span>${player.stats.tek}</span></div>
                    <div class="stat-item">Brankář: <span>${player.stats.gk}</span></div>
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
function renderMail() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.mail || playerData.mail.length === 0) {
        mainContent.innerHTML = `
            <div style="text-align: center;">
                <h2 class="section-title">Pošta</h2>
                <p style="color: white; margin-top: 20px;">Schránka je zatím prázdná, trenére.</p>
            </div>`;
        return;
    }

    mainContent.innerHTML = `
        <div style="text-align: center;">
            <h2 class="section-title">Doručená pošta</h2>
        </div>
        <div class="mail-container">
            ${playerData.mail.map((m, index) => {
                const scoreDisplay = m.read ? m.result : '❓ : ❓';
                const scoreText = m.read ? `Konečné skóre: ${scoreDisplay}` : `Skóre je tajné (Pusť si záznam!)`;
                const btnText = m.read ? 'Znovu přehrát' : '▶ Přehrát zápas';
                const unreadClass = m.read ? '' : 'unread';

                // --- VÝPOČET BAREV (Změněno pouze toto) ---
                let borderColor = '#9a9f05'; // Výchozí pro nepřečtené (Oranžová)
                let scoreColor = '#9a9f05';  // Výchozí pro nepřečtené (Oranžová)

                if (m.read) {
                    if (m.result && m.result.includes(':')) {
                        const [myGoals, botGoals] = m.result.split(':').map(Number);
                        if (myGoals > botGoals) {
                            borderColor = '#10b981'; // Zelená výhra
                            scoreColor = '#166534';
                        } else if (myGoals < botGoals) {
                            borderColor = '#ef4444'; // Červená prohra
                            scoreColor = '#b91c1c';
                        } else {
                            borderColor = '#6b7280'; // Šedá remíza
                            scoreColor = '#4b5563';
                        }
                    }
                }

                return `
                <div class="mail-message ${unreadClass}" style="border-left-color: ${borderColor};">
                    <div>
                        <strong style="font-size: 1.1rem;">${m.subject}</strong> 
                        <span style="font-size: 0.8rem; color: #8d6e63;">(${m.date})</span>
                        <br><span style="color: ${scoreColor}; font-weight: bold;">${scoreText}</span>
                    </div>
                    <button class="btn-task" onclick="openMatchReport(${index})" 
                        style="padding: 5px 15px; background-color: ${m.read ? '#4b5563' : '#166534'}; border-color: ${m.read ? '#374151' : '#14532d'};">
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

    // Dočasně podstrčíme hráče bota do playerData.players, aby fungovala funkce renderPlayerGroup
    const originalPlayers = playerData.players;
    playerData.players = botTeam.players;

    // Využíváme náš config!
    const layout = FORMATIONS_LAYOUT[botTeam.formation];

    mainContent.innerHTML = `
        <div class="opponent-scout-header">
            <button class="btn-back-absolute" onclick="renderMatches()">⬅ Zpět na Zápasy</button>
            <h2 class="section-title">Skauting soupeře: ${botTeam.name}</h2>
            <div class="opponent-hint-box">
                <h3 class="opponent-hint-title">Odhalená formace: ${botTeam.formation}</h3>
                <p class="opponent-hint-text">Přizpůsob svou formaci v Šatně, abys získal taktickou výhodu +10 %!</p>
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
    `;

    // Vrátíme zpět tvé skutečné hráče
    playerData.players = originalPlayers;
}

// --- ZOBRAZENÍ DETAILU SOUPEŘE V PODZEMÍ ---
window.viewPvEBot = function(dIndex, sIndex) {
    const stage = PVE_DUNGEONS[dIndex].stages[sIndex];
    const stats = stage.botStats;
    const mainContent = document.getElementById('main-content');
    
    // Tady CSS třídy už byly od tebe připravené, jen jsme vyčistili tlačítko Zpět
    mainContent.innerHTML = `
        <div class="scouting-card">
            <h2 class="section-title" style="margin-top: 0; text-shadow: 2px 2px 4px black;">Skauting soupeře</h2>
            <h3 class="scouting-title">${stage.name}</h3>
            <p class="text-muted" style="margin-top: 0;">Předpokládaná formace: <strong style="color: white;">4-4-2</strong></p>
            
            <p class="scouting-desc">${stage.desc}</p>
            
            <div class="scouting-note">
                ℹ️ <strong>Upozornění trenéra:</strong> Níže uvedené hodnoty představují průměrné statistiky <strong>každého jednotlivého hráče</strong> v týmu soupeře. Nehraješ proti jednomu hráči, ale proti jedenácti borcům s těmito parametry.
            </div>

            <div class="scouting-grid">
                <div class="stat-box stat-atk">
                    <span class="stat-label">⚔️ Útok</span>
                    <span class="stat-val">${stats.atk}</span>
                </div>
                <div class="stat-box stat-def">
                    <span class="stat-label">🛡️ Obrana</span>
                    <span class="stat-val">${stats.def}</span>
                </div>
                <div class="stat-box stat-spd">
                    <span class="stat-label">🏃 Rychlost</span>
                    <span class="stat-val">${stats.spd}</span>
                </div>
                <div class="stat-box stat-str">
                    <span class="stat-label">💪 Síla</span>
                    <span class="stat-val">${stats.str}</span>
                </div>
                <div class="stat-box stat-eng">
                    <span class="stat-label">🔋 Výdrž</span>
                    <span class="stat-val">${stats.eng}</span>
                </div>
                <div class="stat-box stat-gk">
                    <span class="stat-label">🧤 Brankář</span>
                    <span class="stat-val">${stats.gk}</span>
                </div>
                <div class="stat-box stat-tek full-width">
                    <span class="stat-label">⚽ Technika</span>
                    <span class="stat-val">${stats.tek}</span>
                </div>
            </div>
            
            <button class="btn-task btn-full-width" style="margin-top: 25px; background-color: #4b5563; border-color: #374151;" onclick="renderPvE()">⬅ Návrat do podzemí</button>
        </div>
    `;
}