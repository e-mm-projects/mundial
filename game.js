// --- KONFIGURACE HRY ---
const buildingsConfig = {
    scout: { name: "Kancelář skauta", baseCost: 100, baseTime: 60, costMult: 1.5, timeMult: 1.3, desc: "Zrychluje a zlevňuje skautování nových talentů." },
    shop: { name: "Obchod se suvenýry", baseCost: 150, baseTime: 120, costMult: 1.6, timeMult: 1.4, desc: "Pasivně generuje peníze do klubové pokladny." },
    tribune: { name: "Tribuny", baseCost: 200, baseTime: 180, costMult: 1.7, timeMult: 1.5, desc: "Zvyšuje kapacitu diváků a příjem ze zápasů." },
    pitch: { name: "Trávník", baseCost: 300, baseTime: 240, costMult: 1.8, timeMult: 1.6, desc: "Přidává procentuální bonus k rychlosti hráčů." },
    training: { name: "Tréninkové centrum", baseCost: 250, baseTime: 200, costMult: 1.6, timeMult: 1.5, desc: "Zlevňuje a zefektivňuje trénink fotbalistů." }
};

let playerData = {};
let currentTasks = [];

const defaultPlayerData = {
    level: 1,
    xp: 0,
    money: 0,
    energy: 100,
    buildings: { scout: 1, shop: 1, tribune: 1, pitch: 1, training: 1 },
    activeTask: null,
    activeUpgrade: null,
    formation: '4-4-2',
    players: []
};

// --- INICIALIZACE A HERNÍ SMYČKA ---
function initGame() {
    let savedData = localStorage.getItem('footballManagerData');
    if (savedData === null) {
        playerData = JSON.parse(JSON.stringify(defaultPlayerData));
    } else {
        playerData = JSON.parse(savedData);
        
        // Pojistky pro staré uložené pozice
        if(!playerData.buildings) playerData.buildings = defaultPlayerData.buildings;
        if(playerData.activeUpgrade === undefined) playerData.activeUpgrade = null;
        
        // Ošetření chyby se zaseknutým úkolem
        if (playerData.activeTask !== null && playerData.activeTask.endTime === undefined) {
            console.log("Mažu starý nekompatibilní úkol.");
            playerData.activeTask = null;
        }
    }

    // Generování prvního týmu, pokud je pole hráčů prázdné
    if (!playerData.formation) playerData.formation = '4-4-2';
    if (!playerData.players || playerData.players.length === 0) {
        playerData.players = [];
        for (let i = 0; i < 16; i++) {
            //  Posíláme 'true', což znamená, že jde o startovního hráče
            playerData.players.push(generatePlayer(true)); 
        }
        saveGame();
    }

    // Zkontrolujeme, zda hráč po načtení hry nemá dostatek XP na nový level
    checkLevelUp();

    updateTopBarUI();
    setupNavigation();

    // Vychytávka: Automaticky nasimulujeme kliknutí na Kancelář při startu hry
    const officeBtn = document.querySelector('[data-target="office"]');
    if (officeBtn) officeBtn.click();

    // Spuštění hlavní herní smyčky (tiká každou 1 vteřinu)
    setInterval(gameLoop, 1000);
}

function saveGame() {
    localStorage.setItem('footballManagerData', JSON.stringify(playerData));
}

function gameLoop() {
    const now = Date.now();
    let uiNeedsUpdate = false;

    // Vylepšená kontrola: Spustí se jen tehdy, pokud activeTask opravdu existuje 
    // a zároveň má v sobě uložený čas endTime.
    if (playerData.activeTask && playerData.activeTask.endTime) {
        if (now >= playerData.activeTask.endTime) {
            finishTask();
            uiNeedsUpdate = true;
        } else {
            updateTimerUI('task-timer', playerData.activeTask.endTime);
        }
    }

    // To samé pro budovy
    if (playerData.activeUpgrade && playerData.activeUpgrade.endTime) {
        if (now >= playerData.activeUpgrade.endTime) {
            finishUpgrade();
            uiNeedsUpdate = true;
        } else {
            updateTimerUI('upgrade-timer', playerData.activeUpgrade.endTime);
        }
    }

    if (uiNeedsUpdate) updateTopBarUI();
}

function updateTimerUI(elementId, endTime) {
    const el = document.getElementById(elementId);
    if (el) {
        const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        el.textContent = formatTime(remainingSeconds);
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// --- LEVELOVACÍ SYSTÉM ---
function getRequiredXp() {
    return Math.floor(100 * Math.pow(playerData.level, 1.5));
}

function checkLevelUp() {
    let leveledUp = false;
    while (playerData.xp >= getRequiredXp()) {
        playerData.xp -= getRequiredXp();
        playerData.level++;
        leveledUp = true;
    }
    if (leveledUp) {
        alert(`Gratulujeme! Trenér dosáhl úrovně ${playerData.level}!`);
    }
}

function updateTopBarUI() {
    document.getElementById('ui-level').textContent = playerData.level;
    document.getElementById('ui-xp').textContent = Math.floor(playerData.xp);
    document.getElementById('ui-max-xp').textContent = getRequiredXp();
    document.getElementById('ui-money').textContent = Math.floor(playerData.money);
    document.getElementById('ui-energy').textContent = playerData.energy;
}

// --- NAVIGACE ---
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const mainContent = document.getElementById('main-content');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const target = this.getAttribute('data-target');
            if (target === 'office') renderOffice();
            else if (target === 'stadium') renderStadium();
            else if (target === 'locker-room') renderLockerRoom();
            else if (target === 'scouting') renderScouting(); // <-- PŘIDÁNO: Tímto se odemkne Skauting!
            else {
                mainContent.innerHTML = `<div class="under-construction"><h2>🚧 ${this.getAttribute('data-name')} 🚧</h2></div>`;
            }
        });
    });
}

// --- KANCELÁŘ (ÚKOLY) ---
function renderOffice() {
    const mainContent = document.getElementById('main-content');
    if (playerData.activeTask !== null) {
        mainContent.innerHTML = `
            <div class="active-task-view">
                <h2>Probíhá: ${playerData.activeTask.title}</h2>
                <div class="timer" id="task-timer">Počítám...</div>
                <button class="btn-task btn-skip" onclick="skipTask()">[TEST] Přeskočit čas</button>
            </div>`;
        return;
    }

    if (currentTasks.length === 0) generateTasks();

    mainContent.innerHTML = `
        <h2>Kancelář manažera</h2>
        <div class="office-container">
            ${currentTasks.map((task, index) => `
                <div class="task-card">
                    <h3>${task.title}</h3>
                    <div class="task-reward">Odměna: +${task.reward} ${task.type === 'money' ? 'Peníze' : 'XP'}</div>
                    <div class="task-cost">Cena: -${task.energy} Energie (${task.energy} min)</div>
                    <button class="btn-task" onclick="startTask(${index})">Začít úkol</button>
                </div>
            `).join('')}
        </div>
    `;
}

function generateTasks() {
    const levelMultiplier = Math.pow(1.2, playerData.level - 1);
    const energyMoney = Math.floor(Math.random() * 10) + 1;
    const energyXP = Math.floor(Math.random() * 10) + 1;

    const baseMoney = energyMoney * (Math.floor(Math.random() * 15) + 10);
    const baseXP = energyXP * (Math.floor(Math.random() * 5) + 5);

    currentTasks = [
        { title: 'Jednání se sponzory', type: 'money', energy: energyMoney, reward: Math.floor(baseMoney * levelMultiplier) },
        { title: 'Taktický rozbor videa', type: 'xp', energy: energyXP, reward: Math.floor(baseXP * levelMultiplier) }
    ];
}

window.startTask = function(taskIndex) {
    const task = currentTasks[taskIndex];
    if (playerData.energy < task.energy) return alert("Nedostatek energie!");

    playerData.energy -= task.energy;
    playerData.activeTask = {
        title: task.title,
        type: task.type,
        reward: task.reward,
        endTime: Date.now() + (task.energy * 60 * 1000) 
    };
    
    saveGame();
    updateTopBarUI();
    renderOffice();
}

function finishTask() {
    const task = playerData.activeTask;
    if (task.type === 'money') playerData.money += task.reward;
    else if (task.type === 'xp') {
        playerData.xp += task.reward;
        checkLevelUp();
    }

    alert(`Úkol dokončen! +${task.reward} ${task.type === 'money' ? 'Peníze' : 'XP'}`);
    playerData.activeTask = null;
    currentTasks = [];
    saveGame();
    
    // Pouze pokud je hráč stále v záložce Kancelář, překreslíme ji
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn && activeBtn.getAttribute('data-target') === 'office') {
        renderOffice();
    }
}

window.skipTask = function() {
    if(playerData.activeTask) playerData.activeTask.endTime = Date.now();
}

// --- STADION (BUDOVY) ---
function renderStadium() {
    const mainContent = document.getElementById('main-content');
    let activeBuildHTML = '';
    
    if (playerData.activeUpgrade !== null) {
        const bId = playerData.activeUpgrade.buildingId;
        activeBuildHTML = `
            <div class="active-task-view" style="margin-bottom: 30px;">
                <h2>Staví se: ${buildingsConfig[bId].name}</h2>
                <div class="timer" id="upgrade-timer">Počítám...</div>
                <button class="btn-task btn-skip" onclick="skipUpgrade()">[TEST] Dokončit stavbu</button>
            </div>
            <hr>
        `;
    }

    const buildingsHTML = Object.keys(buildingsConfig).map(id => {
        const config = buildingsConfig[id];
        const currentLevel = playerData.buildings[id];
        const nextCost = Math.floor(config.baseCost * Math.pow(config.costMult, currentLevel - 1));
        const nextTime = Math.floor(config.baseTime * Math.pow(config.timeMult, currentLevel - 1));

        const canAfford = playerData.money >= nextCost;
        const isBuilding = playerData.activeUpgrade !== null;
        const disabledAttr = (!canAfford || isBuilding) ? 'disabled' : '';

        return `
            <div class="building-card">
                <div class="building-header">
                    <h3>${config.name}</h3>
                    <span class="building-level">Lvl. ${currentLevel}</span>
                </div>
                <div class="building-desc">${config.desc}</div>
                <div class="building-stats">
                    <div>Vylepšení na úroveň ${currentLevel + 1}:</div>
                    <div class="stat-cost">Cena: ${nextCost} Peněz</div>
                    <div class="stat-time">Čas: ${formatTime(nextTime)}</div>
                </div>
                <button class="btn-upgrade" ${disabledAttr} onclick="startUpgrade('${id}', ${nextCost}, ${nextTime})">Vylepšit</button>
            </div>
        `;
    }).join('');

    mainContent.innerHTML = `
        <h2>Správa Stadionu</h2>
        <p>Vylepšuj zázemí klubu. V jednu chvíli můžeš stavět pouze jednu budovu.</p>
        ${activeBuildHTML}
        <div class="stadium-grid">
            ${buildingsHTML}
        </div>
    `;
}

window.startUpgrade = function(buildingId, cost, timeInSeconds) {
    if (playerData.money < cost) return;

    playerData.money -= cost;
    playerData.activeUpgrade = {
        buildingId: buildingId,
        endTime: Date.now() + (timeInSeconds * 1000)
    };

    saveGame();
    updateTopBarUI();
    renderStadium();
}

function finishUpgrade() {
    const bId = playerData.activeUpgrade.buildingId;
    playerData.buildings[bId]++;
    
    alert(`Stavba dokončena! ${buildingsConfig[bId].name} je nyní na úrovni ${playerData.buildings[bId]}.`);
    
    playerData.activeUpgrade = null;
    saveGame();

    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn && activeBtn.getAttribute('data-target') === 'stadium') {
        renderStadium();
    }
}

window.skipUpgrade = function() {
    if(playerData.activeUpgrade) playerData.activeUpgrade.endTime = Date.now();
}

// --- TESTOVACÍ FUNKCE ---
window.resetEnergy = function() {
    playerData.energy = 100;
    saveGame();
    updateTopBarUI();
}

window.onload = initGame;

// Úplné smazání uložených dat a restartování stránky
window.hardReset = function() {
    if (confirm("Opravdu chceš smazat všechna data? Tuto akci nelze vzít zpět!")) {
        localStorage.removeItem('footballManagerData'); // Smaže náš konkrétní save
        location.reload(); // Obnoví stránku, čímž se vytvoří nový čistý profil
    }
}

// --- ŠATNA (Generování a Logika) ---
const firstNames = ['Jan', 'Petr', 'Tomáš', 'Lukáš', 'Jakub', 'Martin', 'Michal', 'Jiří', 'Ondřej', 'David', 'Karel', 'Pavel'];
const lastNames = ['Novák', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec', 'Pokorný'];

function generatePlayer(isStarter = false) {
    let starRating = 1; // Výchozí minimum pro Skauting
    let maxLvl = 5;

    if (isStarter) {
        // Startovní hráči: 85 % šance na 0 hvězd, 15 % šance na 1 hvězdu
        if (Math.random() > 0.15) {
            starRating = 0;
            maxLvl = 1; // 0 hvězd = žádné dodatečné úrovně
        } else {
            starRating = 1;
            maxLvl = 5;
        }
    } else {
        // Skauting: Zde už budou padat minimálně 1-hvězdičkoví a lepší
        const roll = Math.random(); 
        
        if (roll > 0.99) {
            starRating = 5; maxLvl = 50;
        } else if (roll > 0.90) { 
            starRating = 4; maxLvl = 30;
        } else if (roll > 0.70) { 
            starRating = 3; maxLvl = 20;
        } else if (roll > 0.40) { 
            starRating = 2; maxLvl = 10;
        } else {
            starRating = 1; maxLvl = 5; // Vše do 40 % je 1 hvězda
        }
    }

    // --- NOVÁ ČÁST PRO VÝPOČET STATISTIK A CENY ---

    let minStat = 1;
    let maxStat = 10;
    
    // Budova ovlivňuje jen skautované hráče, ne ty startovní
    if (!isStarter && playerData.buildings) {
        const scoutBonus = playerData.buildings.scout - 1;
        minStat += scoutBonus;
        maxStat += scoutBonus;
    }

    // Pomocná funkce pro vygenerování jedné statistiky
    const getStat = () => Math.floor(Math.random() * (maxStat - minStat + 1)) + minStat;

    // Nejdříve vygenerujeme statistiky a uložíme si je do proměnných
    const atk = getStat();
    const def = getStat();
    const spd = getStat();
    const str = getStat();
    const eng = getStat();
    const gk = getStat();
    const tek = getStat();

    // Sečteme všechny statistiky pro výpočet ceny
    const totalStats = atk + def + spd + str + eng + gk + tek;

    // Výpočet ceny: Základ z hvězd + 4 peníze za každý bod ve statistikách + náhodný výkyv
    let baseStarPrice = starRating === 0 ? 25 : 150 * Math.pow(3, starRating - 1);
    let statPrice = totalStats * 4; 
    let finalPrice = Math.floor((baseStarPrice + statPrice) * (0.9 + Math.random() * 0.2));

    return {
        id: Math.random().toString(36).substr(2, 9),
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        
        stars: starRating,
        level: 1,
        maxLevel: maxLvl,
        unspentPoints: 0, 
        price: finalPrice, // Tady přidáváme naši novou cenu k hráči
        
        stats: {
            atk: atk,
            def: def,
            spd: spd,
            str: str,
            eng: eng,
            gk: gk,
            tek: tek
        }
    };
}

let selectedPlayerIndex = null; // Uchovává index prvního kliknutého hráče pro výměnu
let isSellMode = false;

function renderLockerRoom() {
    const mainContent = document.getElementById('main-content');
    const formations = {
        '4-4-2': { gk: [0, 1], def: [1, 5], mid: [5, 9], att: [9, 11] },
        '4-3-3': { gk: [0, 1], def: [1, 5], mid: [5, 8], att: [8, 11] }
    };
    const layout = formations[playerData.formation];

    mainContent.innerHTML = `
        <h2>Šatna a Sestava</h2>
        <div class="locker-room-controls">
            <label for="formation-select">Taktická formace: </label>
            <select id="formation-select" onchange="changeFormation(this.value)">
                <option value="4-4-2" ${playerData.formation === '4-4-2' ? 'selected' : ''}>4-4-2 (Vyvážená)</option>
                <option value="4-3-3" ${playerData.formation === '4-3-3' ? 'selected' : ''}>4-3-3 (Útočná)</option>
            </select>
            <p>Klikni na hráče a prohoď ho s jiným na požadovanou pozici.</p>
        </div>

        <div class="pitch-section">
            <h3>Útočníci</h3>
            <div class="player-list">${renderPlayerGroup(layout.att[0], layout.att[1], 'att')}</div>
        </div>
        <div class="pitch-section">
            <h3>Záložníci</h3>
            <div class="player-list">${renderPlayerGroup(layout.mid[0], layout.mid[1], 'mid')}</div>
        </div>
        <div class="pitch-section">
            <h3>Obránci</h3>
            <div class="player-list">${renderPlayerGroup(layout.def[0], layout.def[1], 'def')}</div>
        </div>
        <div class="pitch-section">
            <h3>Brankář</h3>
            <div class="player-list">${renderPlayerGroup(layout.gk[0], layout.gk[1], 'gk')}</div>
        </div>
        
        <div class="pitch-section" style="background-color: rgba(0,0,0,0.1); border-color: #5d4037;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #5d4037; padding-bottom: 5px; margin-bottom: 15px;">
                <h3 style="margin: 0; border: none; padding: 0;">Střídačka (Kapacita: ${playerData.players.length - 11}/5)</h3>
                <button onclick="toggleSellMode()" style="padding: 5px 15px; font-weight: bold; cursor: pointer; border: none; border-radius: 5px; font-family: 'Kalam', cursive; font-size: 1rem; background-color: ${isSellMode ? '#ef4444' : '#f59e0b'}; color: white; box-shadow: 2px 2px 5px rgba(0,0,0,0.2);">
                    ${isSellMode ? '❌ Zrušit prodej' : '💰 Režim prodeje'}
                </button>
            </div>
            
            ${isSellMode ? '<p style="text-align: center; margin-top: 0; color: #dc2626; font-weight: bold;">Klikni na hráče, kterého chceš vyhodit z klubu.</p>' : ''}
            
            <div class="player-list">${renderPlayerGroup(11, 16, 'bench')}</div>
        </div>
    `;
}

// Přepínač režimu prodeje
window.toggleSellMode = function() {
    isSellMode = !isSellMode;
    selectedPlayerIndex = null; // Vyrušíme případný nakliknutý výběr
    renderLockerRoom();
}

function renderPlayerGroup(startIndex, endIndex, role) {
    let html = '';

    const checkHighlight = (statName, currentRole) => {
        if (currentRole === 'att' && ['atk', 'spd', 'tek', 'eng'].includes(statName)) return 'highlighted';
        if (currentRole === 'mid' && ['atk', 'def', 'spd', 'tek', 'eng'].includes(statName)) return 'highlighted';
        if (currentRole === 'def' && ['def', 'str', 'spd', 'eng'].includes(statName)) return 'highlighted';
        if (currentRole === 'gk'  && ['gk'].includes(statName)) return 'highlighted';
        return ''; 
    };

    for (let i = startIndex; i < endIndex; i++) {
        // Pokud projíždíme střídačku a už nám chybí hráči, vykreslíme prázdnou kartu
        if (i >= playerData.players.length) {
            html += `
                <div class="player-card" style="background-color: transparent; border: 2px dashed #a1887f; box-shadow: none; display: flex; align-items: center; justify-content: center; text-align: center; color: #8d6e63; cursor: default;">
                    <div style="font-weight: bold; font-size: 1.2rem;">Volné místo</div>
                </div>
            `;
            continue;
        }

        const player = playerData.players[i];
        
        // Pokud je zapnutý režim prodeje a jsme na střídačce, mírně hráče zčervenáme pro efekt
        const isSellTarget = (isSellMode && i >= 11) ? 'border-color: #ef4444; background-color: #fee2e2;' : '';
        const isSelected = selectedPlayerIndex === i ? 'selected' : '';
        
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span style="color: #94a3b8; font-size: 0.8rem;">Amatér</span>';
        
        // POJISTKA: Výpočet ceny pro zobrazení (pokud hráč nemá cenu, narychlo mu ji dopočítáme)
        const fallbackPrice = 50 + ((player.stats.atk + player.stats.def + player.stats.spd + player.stats.str + player.stats.eng + player.stats.gk + player.stats.tek) * 3);
        const fullPrice = player.price || fallbackPrice;
        //V Šatně rovnou zobrazíme poloviční (prodejní) cenu
        const sellPrice = Math.floor(fullPrice / 2);
        
        html += `
            <div class="player-card ${isSelected}" style="${isSellTarget}" onclick="handlePlayerClick(${i})">
                <div class="player-name">${player.name}</div>
                <div class="player-stars">${starsHtml}</div>
                
                <div style="text-align: center; font-size: 0.9rem; font-weight: bold; color: #b91c1c; background-color: #fef2f2; border-radius: 4px; margin: 5px 0; padding: 2px;">
                    Prodat za: ${sellPrice} 💰
                </div>

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

window.handlePlayerClick = function(index) {
    // Pokud máme zapnutý režim prodeje
    if (isSellMode) {
        if (index < 11) {
            alert("Základní sestavu nelze prodat! Pokud se ho chceš zbavit, přesuň ho nejprve na střídačku.");
            return;
        }
        
        const player = playerData.players[index];
        
        const fallbackPrice = 50 + ((player.stats.atk + player.stats.def + player.stats.spd + player.stats.str + player.stats.eng + player.stats.gk + player.stats.tek) * 3);
        const fullPrice = player.price || fallbackPrice;
        
        // OPRAVA: Prodejní částka je polovina
        const sellPrice = Math.floor(fullPrice / 2); 
        
        if (confirm(`Opravdu chceš vyhodit hráče ${player.name} z klubu? Dostaneš za něj ${sellPrice} Peněz.`)) {
            playerData.money += sellPrice;
            playerData.players.splice(index, 1); 
            
            isSellMode = false; 
            saveGame();
            updateTopBarUI();
            renderLockerRoom();
        }
        return; 
    }

    // Původní logika výměny
    if (selectedPlayerIndex === null) {
        selectedPlayerIndex = index;
    } else if (selectedPlayerIndex === index) {
        selectedPlayerIndex = null;
    } else {
        const temp = playerData.players[selectedPlayerIndex];
        playerData.players[selectedPlayerIndex] = playerData.players[index];
        playerData.players[index] = temp;
        
        selectedPlayerIndex = null;
        saveGame();
    }
    renderLockerRoom();
}

// --- SKAUTING ---
function renderScouting() {
    const mainContent = document.getElementById('main-content');
    
    // 🛡️ POJISTKA: Pokud data ve starém savu chybí, hra je teď sama bezpečně vytvoří
    if (!playerData.scoutedPlayers) playerData.scoutedPlayers = [];
    if (!playerData.lastScoutRefresh) playerData.lastScoutRefresh = 0;
    
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    // Pokud je nabídka prázdná, nebo uběhlo 24 hodin od posledního generování
    if (playerData.scoutedPlayers.length === 0 || now - playerData.lastScoutRefresh > oneDayInMs) {
        generateScoutedPlayers();
    }

    const playersHtml = playerData.scoutedPlayers.map((player, index) => {
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span style="color: #94a3b8; font-size: 0.8rem;">Amatér</span>';
        const canAfford = playerData.money >= player.price;
        
        return `
            <div class="player-card">
                <div class="player-name">${player.name}</div>
                <div class="player-stars">${starsHtml}</div>
                
                <div style="text-align: center; font-size: 0.9rem; font-weight: bold; color: #166534; background-color: #dcfce7; border-radius: 4px; margin: 5px 0; padding: 2px;">
                    Cena: ${player.price} 💰
                </div>

                <div class="player-stats">
                    <div class="stat-item">Útok: <span>${player.stats.atk}</span></div>
                    <div class="stat-item">Obrana: <span>${player.stats.def}</span></div>
                    <div class="stat-item">Rychlost: <span>${player.stats.spd}</span></div>
                    <div class="stat-item">Síla: <span>${player.stats.str}</span></div>
                    <div class="stat-item">Výdrž: <span>${player.stats.eng}</span></div>
                    <div class="stat-item">Technika: <span>${player.stats.tek}</span></div>
                    <div class="stat-item">Brankář: <span>${player.stats.gk}</span></div>
                </div>
                <button class="btn-upgrade" style="width: 100%; margin-top: 10px;" onclick="buyPlayer(${index})" ${!canAfford ? 'disabled' : ''}>Koupit</button>
            </div>
        `;
    }).join('');

    mainContent.innerHTML = `
        <h2>Skauting (Úroveň kanceláře: ${playerData.buildings.scout})</h2>
        <div class="locker-room-controls">
            <p>Každý den ti skauti přinesou novou nabídku. Vyšší úroveň kanceláře = vyšší základní statistiky hráčů.</p>
            <button class="btn-task btn-skip" onclick="forceScoutRefresh()">[TEST] Vygenerovat nový den</button>
        </div>
        <div class="player-list">
            ${playersHtml}
        </div>
    `;
}

function generateScoutedPlayers() {
    playerData.scoutedPlayers = [];
    // Počet nabízených hráčů: základ 3, +1 za každé 2 levely Kanceláře
    const amount = 3 + Math.floor(playerData.buildings.scout / 2); 
    
    for (let i = 0; i < amount; i++) {
        playerData.scoutedPlayers.push(generatePlayer(false)); // false = Není to startovní hráč!
    }
    playerData.lastScoutRefresh = Date.now();
    saveGame();
}

window.buyPlayer = function(index) {
    // NOVÁ POJISTKA: Má hráč v klubu místo?
    if (playerData.players.length >= 16) {
        alert("Máš plnou střídačku (16/16)! Než koupíš dalšího hráče, musíš jít do Šatny a někoho prodat.");
        return;
    }

    const player = playerData.scoutedPlayers[index];
    if (playerData.money >= player.price) {
        playerData.money -= player.price; 
        playerData.players.push(player);  
        playerData.scoutedPlayers.splice(index, 1); 
        
        saveGame();
        updateTopBarUI();
        renderScouting();
        alert(`Koupil jsi hráče ${player.name}! Najdeš ho na střídačce.`);
    } else {
        alert("Na tohoto hráče nemáš dostatek peněz!");
    }
}

window.forceScoutRefresh = function() {
    generateScoutedPlayers();
    renderScouting();
}