// --- TRÉNINKOVÉ HŘIŠTĚ ---
function renderTraining() {
    const mainContent = document.getElementById('main-content');

    // 1. Rozdělíme hráče do 3 přesných kategorií
    // Mají volné body = jdou do první sekce
    const trainablePlayers = playerData.players.filter(p => p.unspentPoints > 0);
    
    // Nemají body a zároveň ještě nedosáhli maxima = sbírají praxi
    const practicePlayers = playerData.players.filter(p => p.unspentPoints === 0 && p.level < p.maxLevel);
    
    // Nemají body a už jsou na svém levelovém stropu = veteráni
    const maxedPlayers = playerData.players.filter(p => p.unspentPoints === 0 && p.level >= p.maxLevel);

    // Pomocná funkce pro vykreslení karty v tréninku (zůstává beze změny)
    const createTrainingCard = (player) => {
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        
        let xpPercentage = 100;
        if (player.maxLevel > 0 && player.level < player.maxLevel) {
            const requiredXp = player.level * 100;
            xpPercentage = Math.floor((player.xp / requiredXp) * 100);
        }

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
                
            <div class="xp-bar-container">
                <div class="xp-bar-fill ${player.level >= player.maxLevel ? 'maxed' : ''}" style="width: ${xpPercentage}%;"></div>
            </div>
                
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
            <div style="background-color: rgba(0, 0, 0, 0.75); color: #fdf5e6; padding: 15px 30px; border-radius: 8px; border: 2px solid #10b981; max-width: 600px; margin: 0 auto 20px auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                <p style="margin: 0; font-size: 1rem;">
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

        <h3 style="color: #fdf5e6; background: rgba(59, 130, 246, 0.8); padding: 5px 15px; border-radius: 5px; display: inline-block;">Hráči, kteří sbírají zápasovou praxi</h3>
        <div class="player-list" style="margin-bottom: 30px; opacity: 0.95;">
            ${practicePlayers.length > 0 
                ? practicePlayers.map(p => createTrainingCard(p)).join('') 
                : '<p style="color: #4b5563; font-style: italic; background: #fdf5e6; padding: 10px; border-radius: 5px; width: 100%; text-align: center;">Všichni aktivní hráči čekají na trénink.</p>'}
        </div>

        ${maxedPlayers.length > 0 ? `
        <details style="margin-top: 40px; background: rgba(0,0,0,0.4); border: 2px solid #8d6e63; border-radius: 8px; padding: 10px;">
            <summary style="color: #fdf5e6; font-size: 1.2rem; font-weight: bold; cursor: pointer; padding: 10px; text-align: center; list-style: none;">
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
                <p style="margin: 0; font-size: 0.9rem; color: #d1d5db;">Vyšší úroveň přináší prestiž a lepší vyjednávací pozici se sponzory.</p>
            </div>
            <div style="text-align: right; background: rgba(245, 158, 11, 0.2); padding: 10px; border-radius: 8px; border: 1px solid #f59e0b;">
                <span style="display: block; font-size: 0.8rem; text-transform: uppercase; color: #fcd34d;">Zisk z úkolů</span>
                <span style="font-size: 1.5rem; font-weight: bold; color: #10b981;">+${bonusPercentage} %</span>
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
            <div style="text-align: center;">
                <h2 class="section-title">Kancelář manažera</h2>
                ${trainerInfoHtml}
            </div>
            <div style="background-color: #fdf5e6; border: 3px solid #8d6e63; border-radius: 10px; padding: 25px; max-width: 500px; margin: 30px auto; text-align: center; box-shadow: 5px 5px 15px rgba(0,0,0,0.5);">
                <h3 style="color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #a1887f; padding-bottom: 10px;">Probíhá: ${playerData.activeTask.title}</h3>
                <p style="font-style: italic; color: #5d4037; font-size: 1.1rem; margin: 20px 0; line-height: 1.5;">"${currentFlavorText}"</p>
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
        <div style="text-align: center;">
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
            <div class="active-task-view" style="margin-bottom: 30px;">
                <h2>Staví se: ${buildingsConfig[bId].name}</h2>
                <div class="timer" id="upgrade-timer">Počítám...</div>
                <button class="btn-task btn-test" onclick="skipUpgrade()">[TEST] Dokončit stavbu</button>
            </div>
            <hr>
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
            bonusText = `<div class="text-highlight-gold" style="margin-bottom: 10px; color: #b45309;">Aktuální bonus: -${timeRed} min čas, +${chanceInc}% šance na talenty.</div>`;
        } 
        else if (id === 'shop') {
            const moneyPerHour = 100 + (currentLevel - 1) * 50;
            const maxCap = 500 + (currentLevel - 1) * 500;
            const currentInSafe = Math.floor(playerData.shopSafe || 0);
            bonusText = `
                <div class="text-highlight-gold" style="color: #b45309;">Příjem: ${moneyPerHour} 💰/hod (Max: ${maxCap})</div>
                <div style="margin: 10px 0; padding: 10px; background: #f1f5f9; border-radius: 5px; border: 1px solid #cbd5e1; text-align: center;">
                    V pokladně: <strong style="color: #10b981; font-size: 1.1rem;">${currentInSafe} / ${maxCap} 💰</strong>
                    <button class="btn-task" style="padding: 8px 10px; font-size: 0.9rem; margin-top: 8px; width: 100%;" onclick="collectShopMoney()">Vybrat pokladnu</button>
                </div>`;
        }
        else if (id === 'tribune') {
            const bonus = currentLevel * 5;
            bonusText = `<div class="text-highlight-gold" style="margin-bottom: 10px; color: #b45309;">Aktuální bonus k příjmu: +${bonus}% 💰</div>`;
        }
        else if (id === 'training') {
            const bonus = currentLevel * 5;
            bonusText = `<div class="text-highlight-gold" style="margin-bottom: 10px; color: #b45309;">Aktuální bonus k XP hráčů: +${bonus}% 📈</div>`;
        }
        else if (id === 'pitch') {
            const bonus = currentLevel * 1;
            bonusText = `<div class="text-highlight-gold" style="margin-bottom: 10px; color: #b45309;">Aktuální bonus k rychlosti: +${bonus}% 🏃</div>`;
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

            // Vykreslíme zlatý boxík místo tlačítka
            upgradeSection = `
                <div class="building-stats" style="text-align: center; background: #fef3c7; border-color: #f59e0b;">
                    <strong style="color: #b45309;">🏆 DOSAŽENO MAXIMUM</strong>
                    <p style="font-size: 0.8rem; margin: 5px 0 0 0;">${maxText}</p>
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
        <p style="text-align: center; color: white; margin-bottom: 20px;">Vylepšuj zázemí klubu. V jednu chvíli můžeš stavět pouze jednu budovu.</p>
        ${activeBuildHTML}
        <div class="stadium-grid">
            ${buildingsHTML}
        </div>
    `;
}

function renderPvE() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.pve) playerData.pve = { dungeonIndex: 0, stageIndex: 0, nextMatchTime: 0 };

    // --- SPOILER LOCK: Kontrola, jestli v poště nečeká záznam z podzemí ---
    const hasUnreadPvE = playerData.mail.some(m => m.isPvE && !m.read);
    
    if (hasUnreadPvE) {
        mainContent.innerHTML = `
            <div style="text-align: center;">
                <h2 class="section-title">Fotbalové podzemí</h2>
                <div class="notification-banner large" onclick="document.querySelector('[data-target=\\'mail\\']').click()">
                    <h3 style="margin-top:0; font-size: 1.8rem;">📺 Záznam bitvy je připraven!</h3>
                    <p style="font-size: 1.1rem; line-height: 1.5; font-weight: normal;">Zápas už se odehrál, ale výsledek je tajný. Běž do pošty, pusť si záznam a zjisti, jestli jsi postoupil na dalšího bosse!</p>
                    <button class="btn-task" style="background: #166534; border-color: #14532d; font-size: 1.2rem; margin-top: 15px; padding: 10px 30px;">Přejít do Pošty</button>
                </div>
            </div>
        `;
        return;
    }

    const dIndex = playerData.pve.dungeonIndex;
    const sIndex = playerData.pve.stageIndex;

    if (dIndex >= PVE_DUNGEONS.length) {
        mainContent.innerHTML = `
            <div style="text-align: center;">
                <h2 class="section-title">Fotbalové podzemí</h2>
                <div style="background: rgba(0,0,0,0.8); color: #fcd34d; padding: 30px; border-radius: 10px; border: 2px solid #f59e0b;">
                    <h3>🏆 Všechna podzemí pokořena! 🏆</h3>
                    <p>Jsi absolutní mistr okresu. Počkej na další aktualizaci s novými bossy!</p>
                </div>
            </div>
        `;
        return;
    }

    const dungeon = PVE_DUNGEONS[dIndex];
    const stage = dungeon.stages[sIndex];

    const hasSpace = playerData.players.length < 16;
    
    // Časovače a Cooldown
    const now = Date.now();
    const nextTime = playerData.pve.nextMatchTime || 0;
    const isOnCooldown = now < nextTime;

    let warningHtml = '';
    if (!hasSpace) {
        warningHtml = `<div style="background: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-weight: bold; border: 1px solid #ef4444;">❌ Nemáš místo na střídačce! Běž do Šatny a někoho prodej.</div>`;
    }

    let actionSection = '';
    if (isOnCooldown) {
        actionSection = `
            <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="color: #9ca3af; margin: 0 0 10px 0;">Hráči odpočívají po těžkém utkání. Další pokus bude možný za:</p>
            <div class="huge-timer" style="margin-top: 0;">
                ⏳ <span id="pve-timer">Počítám...</span>
            </div>
            </div>
            <button class="btn-task btn-test" onclick="skipPvETime()">[TEST] Přeskočit čekání</button>
            <button class="btn-task" style="width: 100%; font-size: 1.2rem; padding: 15px; background-color: #4b5563; border-color: #374151;" disabled>Odpočinek...</button>
        `;
    } else {
        const canFight = hasSpace;
        actionSection = `
        <button class="btn-task btn-full-width" 
            style="background-color: ${canFight ? '#b91c1c' : '#4b5563'};" 
            ${canFight ? `onclick="startPvEMatch(${dIndex}, ${sIndex})"` : 'disabled'}>
            ⚔️ Vyzvat soupeře (Zdarma)
        </button>
        `;
    }

    mainContent.innerHTML = `
        <div style="text-align: center;">
            <h2 class="section-title">${dungeon.name}</h2>
            <p style="color: #fdf5e6; font-style: italic; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; max-width: 600px; margin: 0 auto 20px auto;">
                "${dungeon.desc}"
            </p>
        </div>

        <div style="max-width: 600px; margin: 0 auto; background: rgba(0,0,0,0.8); border-radius: 10px; padding: 25px; border: 3px solid ${stage.isBoss ? '#ef4444' : '#8d6e63'}; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <span style="background: ${stage.isBoss ? '#ef4444' : '#4b5563'}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem;">
                    Soupeř ${sIndex + 1} / ${dungeon.stages.length}
                </span>
                <button class="btn-task" style="padding: 5px 15px; background-color: #2563eb; border-color: #1d4ed8; font-size: 0.9rem;" onclick="viewPvEBot(${dIndex}, ${sIndex})">
                    📋 Zobrazit statistiky
                </button>
            </div>
            
            <h3 style="color: ${stage.isBoss ? '#fca5a5' : '#fcd34d'}; text-align: center; font-size: 1.8rem; margin: 0 0 10px 0;">
                ${stage.isBoss ? '☠️ ' : ''}${stage.name}
            </h3>
            
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #10b981; margin: 0 0 10px 0; text-align: center;">🎁 Odměna za vítězství</h4>
                <ul style="color: #e5e7eb; margin: 0; padding-left: 20px;">
                    <li><strong>+${stage.reward.xp} XP</strong> pro všechny hráče na hřišti</li>
                    <li><strong>Zisk hráče:</strong> Rank [${stage.reward.rank}] (${stage.reward.minStars} až ${stage.reward.maxStars} ⭐)</li>
                </ul>
            </div>

            ${warningHtml}
            ${actionSection}
        </div>
    `;

    if (isOnCooldown && typeof updateTimerUI === 'function') {
        updateTimerUI('pve-timer', nextTime);
    }
}

function renderLockerRoom() {
    const mainContent = document.getElementById('main-content');
    const formations = {
        '4-4-2': { gk: [0, 1], def: [1, 5], mid: [5, 9], att: [9, 11] },
        '4-3-3': { gk: [0, 1], def: [1, 5], mid: [5, 8], att: [8, 11] },
        '5-4-1': { gk: [0, 1], def: [1, 6], mid: [6, 10], att: [10, 11] }
    };
    const layout = formations[playerData.formation];

    const formationHints = {
        '4-4-2': 'Zlatá střední cesta. Výborně si poradí s týmy, které hrají ustrašeného zanďoura.',
        '4-3-3': 'Všechno dopředu! Těžká noční můra pro týmy hrající opatrný vyvážený fotbal.',
        '5-4-1': 'Zaparkovat autobus před bránu je nejlepší proti týmům, které hrají bezhlavý útočný fotbal!'
    };
    const currentHint = formationHints[playerData.formation];

    mainContent.innerHTML = `
        <div style="text-align: center;">
            <h2 class="section-title">Šatna a Sestava</h2>
            <div class="info-box">
                <div style="margin-bottom: 15px;">
                    <label for="formation-select" style="font-weight: bold; font-size: 1.1rem; margin-right: 10px;">Taktická formace:</label>
                    <select id="formation-select" onchange="changeFormation(this.value)" style="padding: 6px 10px; font-size: 1rem; border-radius: 5px; background-color: #fdf5e6; color: #4e342e; font-weight: bold; border: 2px solid #8d6e63; cursor: pointer;">
                        <option value="4-4-2" ${playerData.formation === '4-4-2' ? 'selected' : ''}>4-4-2 (Vyvážená)</option>
                        <option value="4-3-3" ${playerData.formation === '4-3-3' ? 'selected' : ''}>4-3-3 (Útočná)</option>
                        <option value="5-4-1" ${playerData.formation === '5-4-1' ? 'selected' : ''}>5-4-1 (Obranná)</option>
                    </select>
                </div>
                <p style="font-style: italic; color: #fcd34d; margin: 0 0 10px 0; font-size: 1.05rem;">💡 "${currentHint}"</p>
                <p style="margin: 0; font-size: 0.85rem; color: #9ca3af;">Klikni na hráče a prohoď ho s jiným. Rozestavení se automaticky uloží.</p>
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
        
        <div class="pitch-section" style="background-color: rgba(0,0,0,0.4); border-color: #5d4037; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8d6e63; padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #fdf5e6; background: none; border: none; padding: 0;">Střídačka (Kapacita: ${playerData.players.length - 11}/5)</h3>
                <button onclick="toggleSellMode()" style="padding: 8px 15px; font-weight: bold; cursor: pointer; border: none; border-radius: 5px; font-family: 'Kalam', cursive; font-size: 1rem; background-color: ${isSellMode ? '#ef4444' : '#f59e0b'}; color: white; box-shadow: 2px 2px 5px rgba(0,0,0,0.5); transition: 0.2s;">
                    ${isSellMode ? '❌ Zrušit prodej' : '💰 Režim prodeje'}
                </button>
            </div>
            ${isSellMode ? '<p style="text-align: center; margin-top: 0; color: #fca5a5; font-weight: bold; background-color: rgba(220, 38, 38, 0.2); padding: 5px; border-radius: 4px;">Klikni na hráče, kterého chceš vyhodit z klubu.</p>' : ''}
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
                    <div class="player-card" style="border-style: solid; border-color: #8d6e63; background: #fffbeb; width: 180px;">
                        <div style="font-weight: bold; color: #b45309; font-size: 0.9rem;">${item.name}</div>
                        <div style="font-size: 0.75rem; margin: 5px 0;">⏳ Zbývá: ${item.duration} záp.</div>
                        <button class="btn-task" style="background: #ef4444; border:none; padding: 3px 8px; font-size: 0.7rem;" onclick="discardItem('${role}', ${item.instanceId})">🗑️ Vyhodit</button>
                    </div>
                `;
            } else {
                slotsHtml += `
                    <div class="player-card empty-slot" style="width: 180px; min-height: 80px; border-style: dashed; opacity: 0.5;">
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
        <details style="margin-top: 30px; background: rgba(0,0,0,0.5); border: 2px solid #f59e0b; border-radius: 8px; padding: 15px;">
            <summary style="color: #fcd34d; font-size: 1.2rem; font-weight: bold; cursor: pointer; text-align: center; list-style: none; padding: 5px;">
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
        <div style="text-align: center;">
            <h2 class="section-title">Kancelář hlavního skauta</h2>
            <div class="info-box" style="max-width: 700px;">
                <p style="margin: 0; font-size: 1.1rem; font-style: italic;">
                    "Skautování nových hráčů bude trvat ještě <strong id="scout-timer" style="color: #f59e0b; font-family: monospace; font-size: 1.3rem;">Počítám...</strong><br>Zatím si musíte vybrat z toho, co jsem objevil, šéfe."
                </p>
                
                <details style="margin-top: 15px; text-align: left; background: rgba(0,0,0,0.4); border: 1px solid #8d6e63; border-radius: 5px; padding: 10px;">
                    <summary style="cursor: pointer; color: #fcd34d; font-weight: bold; list-style: none;">
                        📊 Zobrazit pravděpodobnosti skautingu (Rozbalit) ▾
                    </summary>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.9rem; color: #e5e7eb;">
                        <div style="flex: 1;">
                            <strong style="color: #60a5fa;">Dostupné ranky (${currentDiv}. Divize):</strong>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                ${rankOddsHtml}
                            </ul>
                        </div>
                        <div style="flex: 1;">
                            <strong style="color: #60a5fa;">Šance na talent (Hvězdy):</strong>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                <li>5 ⭐: ${fiveStarChance} %</li>
                                <li>4 ⭐: 8.0 %</li>
                                <li>3 ⭐: 15.0 %</li>
                                <li>2 ⭐: 20.0 %</li>
                                <li>1 ⭐: 40.0 %</li>
                                <li>0 ⭐: Zbytek</li>
                            </ul>
                        </div>
                    </div>
                    <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 10px; font-style: italic;">
                        * Vylepšováním budovy Kanceláře skauta (aktuálně Lvl. ${scoutLevel}) se ti postupně zvyšuje šance na objevení 5hvězdičkových talentů. Postupem do vyšších lig se zase odemykají lepší ranky.
                    </div>
                </details>

                <button class="btn-task btn-skip" style="margin-top: 15px; padding: 5px 10px;" onclick="forceScoutRefresh()">[TEST] Vygenerovat hned</button>
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

    mainContent.innerHTML = `
        <div style="text-align: center;">
            <h2 class="section-title">${divName}</h2>
        </div>
        
        ${unreadBanner}

        <div class="next-match-card">
            <h3 style="margin-top: 0; color: #fcd34d; letter-spacing: 1px; text-transform: uppercase;">Nadcházející zápas</h3>
            <p style="font-size: 1.3rem; margin: 15px 0;">
                <span style="color: #60a5fa;">${playerData.league[myTeamIndex].name}</span> 
                <span style="color: #9ca3af; font-size: 1rem; margin: 0 10px;">VS</span> 
                <span style="color: #ef4444;">${opponent.name}</span>
            </p>
        <div class="huge-timer">
            <span id="match-timer">Počítám...</span>
        </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;">
                <button class="btn-task btn-skip" style="flex: 1; padding: 10px; background-color: #ef4444; border-color: #b91c1c;" onclick="skipMatchTime()">[TEST] Odehrát hned</button>
                <button class="btn-task btn-skip" style="flex: 1; padding: 10px; background-color: #7c2d12; border-color: #450a0a;" onclick="testSimulateFullSeason()">⏩ [TEST] Simulovat sezónu</button>
            </div>

            <p style="font-size: 0.9rem; color: #9ca3af; margin-bottom: 15px;">Aktivuj přípravu, dokud je čas. Zvýšíš tím šanci na výhru a zkušenosti hráčů.</p>
            ${prepareBtnHtml}
        </div>

        <div style="border-radius: 8px; overflow: hidden; max-width: 800px; margin: 0 auto; border: 3px solid #8d6e63; box-shadow: 5px 5px 15px rgba(0,0,0,0.5);">
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
                    ${sortedLeague.map((team, index) => `
                        <tr class="${team.isPlayer ? 'player-team-row' : ''}">
                            <td style="font-weight: bold; color: ${index + 1 <= 2 ? '#166534' : index + 1 >= 9 ? '#dc2626' : 'inherit'};">${index + 1}.</td>
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
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    updateTimerUI('match-timer', playerData.nextMatchTime);
}

// --- POŠTA ---
function renderMail() {
    const mainContent = document.getElementById('main-content');
    
    if (playerData.mail.length === 0) {
        mainContent.innerHTML = `<h2 class="section-title">Pošta</h2><p style="text-align:center; color: white;">Schránka je zatím prázdná.</p>`;
        return;
    }

    mainContent.innerHTML = `
        <h2 class="section-title">Doručená pošta</h2>
        <div class="mail-container">
            ${playerData.mail.map((m, index) => {
                // Skrývání skóre pro nepřečtené zprávy
                const scoreDisplay = m.read ? m.result : '❓ : ❓';
                const scoreColor = m.read ? '#166534' : '#d84315';
                const scoreText = m.read ? `Konečné skóre: ${scoreDisplay}` : `Skóre je tajné (Pusť si záznam!)`;
                const btnText = m.read ? 'Znovu přehrát' : '▶ Přehrát zápas';
                
                // ZDE JE NOVINKA: Zjistíme, jestli máme přidat třídu pro nepřečtenou zprávu
                const unreadClass = m.read ? '' : 'unread';

                return `
                <div class="mail-message ${unreadClass}">
                    <div>
                        <strong style="font-size: 1.1rem;">${m.subject}</strong> <span style="font-size: 0.8rem; color: #8d6e63;">(${m.date})</span>
                        <br><span style="color: ${scoreColor}; font-weight: bold;">${scoreText}</span>
                    </div>
                    <button class="btn-task" onclick="openMatchReport(${index})" style="padding: 5px 15px; background-color: ${m.read ? '#4b5563' : '#166534'}; border-color: ${m.read ? '#374151' : '#14532d'};">${btnText}</button>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

// Pomocná funkce pro vykreslení JEDNÉ řádky akce
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

function renderShop() {
    const mainContent = document.getElementById('main-content');
    
    // Pokud je nabídka prázdná (např. při prvním spuštění nebo chybě), zobrazíme info
    if (!playerData.dailyShopItems || playerData.dailyShopItems.length === 0) {
        mainContent.innerHTML = `
            <div style="text-align: center;">
                <h2 class="section-title">Klubový Fanshop</h2>
                <div class="info-box" style="margin: 30px auto; max-width: 500px;">
                    <p style="font-style: italic;">"Dneska už máme vyprodáno, trenére. Skladníci zapomněli objednat zboží. Stavte se zítra, nebo zkuste zboží vyložit ručně."</p>
                    <button class="btn-task btn-skip" style="margin-top: 15px;" onclick="refreshDailyShop(true); renderShop();"> 
                        📦 [TEST] Obnovit nabídku zboží 
                    </button>
                </div>
            </div>`;
        return;
    }

    // Vygenerujeme kartičky pro předměty
    const itemsHtml = playerData.dailyShopItems.map((item, index) => {
        // Kontrola, zda si hráč může předmět dovolit
        const canAfford = playerData.money >= item.currentPrice;
        
        return `
            <div class="player-card" style="border-color: #f59e0b; min-height: 320px; display: flex; flex-direction: column; justify-content: space-between; background: #fffdfa;">
                <div>
                    <div class="player-name" style="color: #b45309; border-bottom: 1px solid #fed7aa; padding-bottom: 5px;">${item.name}</div>
                    <div style="font-size: 0.75rem; color: #9a3412; text-align: center; margin: 8px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        Kategorie: ${item.role === 'att' ? 'Útok' : item.role === 'mid' ? 'Záloha' : item.role === 'def' ? 'Obrana' : 'Brankář'}
                    </div>
                    <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.4; font-style: italic; padding: 0 10px; text-align: center;">
                        "${item.desc}"
                    </p>
                </div>
                
                <div style="background: #fef3c7; padding: 8px; border-radius: 5px; margin: 10px; font-size: 0.85rem; text-align: center; border: 1px solid #fde68a;">
                    ⏳ Vydrží: <strong>${item.duration} zápasů</strong>
                </div>

                <div style="padding: 10px;">
                    <div class="price-tag buy" style="margin-bottom: 10px; font-size: 1.1rem;">Cena: ${item.currentPrice} 💰</div>
                    <button class="btn-upgrade" style="width: 100%; padding: 10px;" 
                        onclick="buyItem(${index})" 
                        ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Koupit předmět' : 'Nedostatek peněz'}
                    </button>

                    <button class="btn-task btn-test" style="width: 100%; padding: 5px; font-size: 0.8rem;" onclick="buyItem(${index}, true)">
                        [TEST] Koupit ZDARMA
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Vložíme vše do hlavního kontejneru
    mainContent.innerHTML = `
        <div style="text-align: center;">
            <h2 class="section-title">Klubový Fanshop</h2>
            <p style="color: #fdf5e6; text-shadow: 1px 1px 2px black; margin-bottom: 25px;">
                Speciální vybavení a doplňky stravy. Pozor, každý předmět má omezenou trvanlivost!
            </p>
        </div>
        
        <div class="player-list" style="justify-content: center; gap: 25px;">
            ${itemsHtml}
        </div>

        <div style="text-align: center; margin-top: 40px; opacity: 0.6;">
            <button class="btn-task btn-skip" style="font-size: 0.8rem; padding: 5px 15px;" onclick="refreshDailyShop(true); renderShop();">
                [TEST] Nová denní nabídka
            </button>
        </div>
    `;
}

window.openMatchReport = function(index) {
    const msg = playerData.mail[index];
    msg.read = true; 
    saveGame();

    window.currentMatchMsg = msg; 

    const mainContent = document.getElementById('main-content');
    const homeTeam = msg.rewards?.homeTeam || "Domácí";
    const awayTeam = msg.rewards?.awayTeam || "Hosté";

    // --- VÝPOČET A VYKRESLENÍ HODNOCENÍ TÝMŮ ---
    const myR = msg.rewards?.myRating;
    const botR = msg.rewards?.botRating;

    // Krásně čistá šablona díky CSS třídám
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
        <div class="match-report-header">
            <button onclick="renderMail()" style="position: absolute; left: 0; padding: 10px 20px; background: #4e342e; color: white; border: none; border-radius: 5px; cursor: pointer;">⬅ Zpět</button>
            <h2 class="section-title" style="margin: 0;">Záznam utkání</h2>
            <button id="skip-replay-btn" onclick="finishMatchReplay()" style="position: absolute; right: 0; padding: 10px 20px; background: #d84315; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 2px 2px 5px rgba(0,0,0,0.3);">⏩ Přeskočit</button>
        </div>

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

        <div style="display: flex; justify-content: center; gap: 20px; align-items: stretch; margin-top: 20px;">
            ${myR ? createRatingPanel(homeTeam, myR, true) : '<div style="width: 220px;"></div>'}
            
            <div id="replay-window" class="replay-window-container" style="flex: 1; max-width: 800px; margin: 0;"></div>
            
            ${botR ? createRatingPanel(awayTeam, botR, false) : '<div style="width: 220px;"></div>'}
        </div>
    `;

    let step = 0;
    
    if (window.matchReplayInterval) clearInterval(window.matchReplayInterval);

    window.matchReplayInterval = setInterval(() => {
        const replayWindow = document.getElementById('replay-window');
        if (!replayWindow) { 
            clearInterval(window.matchReplayInterval);
            return;
        }

        if (step < msg.content.length) {
            renderReplayAction(msg.content[step]);
            step++;
        } else {
            finishMatchReplay(); 
        }
    }, 2500); 
}