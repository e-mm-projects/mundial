// --- KONFIGURACE HRY ---
const buildingsConfig = {
    scout: { name: "Kancelář skauta", baseCost: 100, baseTime: 60, costMult: 1.5, timeMult: 1.3, desc: "Zrychluje a zlevňuje skautování nových talentů." },
    shop: { name: "Obchod se suvenýry", baseCost: 150, baseTime: 120, costMult: 1.6, timeMult: 1.4, desc: "Pasivně generuje peníze do klubové pokladny." },
    tribune: { name: "Tribuny", baseCost: 200, baseTime: 180, costMult: 1.7, timeMult: 1.5, desc: "Zvyšuje kapacitu diváků a příjem ze zápasů." },
    pitch: { name: "Trávník", baseCost: 300, baseTime: 240, costMult: 1.8, timeMult: 1.6, desc: "Přidává procentuální bonus k rychlosti hráčů." },
    training: { name: "Tréninkové centrum", baseCost: 250, baseTime: 200, costMult: 1.6, timeMult: 1.5, desc: "Zlevňuje a zefektivňuje trénink fotbalistů." }
};

let playerData = {};

const defaultPlayerData = {
    level: 1,
    xp: 0,
    money: 0,
    energy: 100,
    buildings: { scout: 1, shop: 1, tribune: 1, pitch: 1, training: 1 },
    activeTask: null,
    activeUpgrade: null,
    formation: '4-4-2',
    players: [],
    scoutedPlayers: [],
    lastScoutRefresh: 0,
    officeTasks: [],     
    lastEnergyUpdate: 0,   
    league: null,
    nextMatchTime: 0,
    isPrepared: false,
    seasonEndTime: 0, 
    mail: []
};

// --- LOGIN A PROFIL ---
let tempSelectedAvatar = 'images/avatar1.jpg'; 

window.selectAvatar = function(src) {
    tempSelectedAvatar = src;
    document.querySelectorAll('.avatar-option').forEach(img => img.classList.remove('selected'));
    document.querySelector(`.avatar-option[src="${src}"]`).classList.add('selected');
}

window.registerManager = function() {
    const nameInput = document.getElementById('manager-name-input').value.trim();
    if (nameInput.length < 3) {
        alert("Manažere, tvé jméno musí mít alespoň 3 znaky!");
        return;
    }
    
    playerData.managerName = nameInput;
    
    if (!playerData.avatar) {
        playerData.avatar = tempSelectedAvatar;
    }

    playerData.isLoggedIn = true;
    saveGame();
    
    document.getElementById('login-screen').style.display = 'none';
    startGameUI();
}

// --- INICIALIZACE A HERNÍ SMYČKA ---
function initGame() {
    let savedData = localStorage.getItem('footballManagerData');
    if (savedData === null) {
        playerData = JSON.parse(JSON.stringify(defaultPlayerData));
    } else {
        playerData = JSON.parse(savedData);
        
        if(!playerData.buildings) playerData.buildings = defaultPlayerData.buildings;
        if(playerData.activeUpgrade === undefined) playerData.activeUpgrade = null;
        if (playerData.activeTask !== null && playerData.activeTask.endTime === undefined) {
            playerData.activeTask = null;
        }
        if(!playerData.scoutedPlayers) playerData.scoutedPlayers = [];
        if(!playerData.lastScoutRefresh) playerData.lastScoutRefresh = 0;
        if(!playerData.officeTasks) playerData.officeTasks = [];
        if(!playerData.lastEnergyUpdate) playerData.lastEnergyUpdate = Date.now();
        if(!playerData.mail) playerData.mail = [];
        if(!playerData.pve) playerData.pve = { dungeonIndex: 0, stageIndex: 0 }; 

        if(!playerData.presets) {
            const currentIds = playerData.players.map(p => p.id);
            playerData.presets = {
                '4-4-2': [...currentIds],
                '4-3-3': [...currentIds],
                '5-4-1': [...currentIds]
            };
        }
        
        if(playerData.isLoggedIn === undefined) {
            playerData.isLoggedIn = (playerData.managerName !== null);
        }
    }

    if (!playerData.formation) playerData.formation = '4-4-2';
    if (!playerData.players || playerData.players.length === 0) {
        playerData.players = [];
        for (let i = 0; i < 16; i++) {
            playerData.players.push(generatePlayer(true)); 
        }
        saveGame();
    }

    if (!playerData.league || playerData.league.length === 0) {
        const myTeamName = playerData.managerName ? `FC ${playerData.managerName}` : "Tvůj Tým";
        
        const botsConfig = [
            { name: "Sokol Horní Lhota", diff: 1.8 },
            { name: "SK Prdelkovice", diff: 1.6 },
            { name: "FC Dřeváci", diff: 1.5 },
            { name: "Baník Ostrava (C)", diff: 2.2 },
            { name: "Tatran Sedlčany", diff: 1.4 },
            { name: "Slavoj Žižkov", diff: 1.9 },
            { name: "Dynamo Vesnice", diff: 1.2 },
            { name: "AFK Bída", diff: 1.1 },
            { name: "Zoufalci United", diff: 1.0 }
        ];
        
        playerData.league = [];
        playerData.league.push({ name: myTeamName, z: 0, v: 0, r: 0, p: 0, gf: 0, ga: 0, points: 0, isPlayer: true });
        
        botsConfig.forEach(bot => {
            const teamData = generateBotTeam(bot.diff);
            playerData.league.push({ 
                name: bot.name, z: 0, v: 0, r: 0, p: 0, gf: 0, ga: 0, points: 0, isPlayer: false,
                formation: teamData.formation,
                players: teamData.players
            });
        });
        
        playerData.seasonEndTime = Date.now() + (14 * 24 * 60 * 60 * 1000); 
        playerData.nextMatchTime = Date.now() + (8 * 60 * 60 * 1000); 
        playerData.isPrepared = false;
        
        saveGame();
    }

    if (!playerData.isLoggedIn) {
        document.getElementById('login-screen').style.display = 'flex';
        
        const avatarSection = document.getElementById('avatar-section');
        if (playerData.avatar && avatarSection) {
            avatarSection.style.display = 'none';
        } else {
            selectAvatar('images/avatar1.jpg'); 
        }
    } else {
        startGameUI();
    }
}

function startGameUI() {
    checkLevelUp();
    updateTopBarUI();
    setupNavigation();

    const officeBtn = document.querySelector('[data-target="office"]');
    if (officeBtn) officeBtn.click();

    setInterval(gameLoop, 1000);
}

function saveGame() {
    localStorage.setItem('footballManagerData', JSON.stringify(playerData));
}

function gameLoop() {
    const now = Date.now();
    let uiNeedsUpdate = false;

    if (playerData.energy < 100) {
        const timePassed = now - playerData.lastEnergyUpdate;
        const energyGained = Math.floor(timePassed / 60000); 
        
        if (energyGained > 0) {
            playerData.energy = Math.min(100, playerData.energy + energyGained);
            playerData.lastEnergyUpdate += energyGained * 60000; 
            uiNeedsUpdate = true;
            saveGame(); 
        }
    } else {
        playerData.lastEnergyUpdate = now;
    }

    if (playerData.activeTask && playerData.activeTask.endTime) {
        if (now >= playerData.activeTask.endTime) {
            finishTask();
            uiNeedsUpdate = true;
        } else {
            updateTimerUI('task-timer', playerData.activeTask.endTime);
        }
    }

    if (playerData.activeUpgrade && playerData.activeUpgrade.endTime) {
        if (now >= playerData.activeUpgrade.endTime) {
            finishUpgrade();
            uiNeedsUpdate = true;
        } else {
            updateTimerUI('upgrade-timer', playerData.activeUpgrade.endTime);
        }
    }

    const nextScoutRefresh = playerData.lastScoutRefresh + getScoutInterval();
    if (now >= nextScoutRefresh) {
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn && activeBtn.getAttribute('data-target') === 'scouting') {
            renderScouting();
            uiNeedsUpdate = true;
        }
    } else {
        updateTimerUI('scout-timer', nextScoutRefresh);
    }

    if (playerData.league && playerData.league.length > 0) {
        updateTimerUI('match-timer', playerData.nextMatchTime);
        updateTimerUI('topbar-season-timer', playerData.seasonEndTime);

        if (now >= playerData.nextMatchTime) {
            processMatch();
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
    const d = Math.floor(seconds / 86400); 
    const h = Math.floor((seconds % 86400) / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');

    if (d > 0) return `${d}d ${h}:${m}:${s}`;
    if (h !== '00') return `${h}:${m}:${s}`;
    return `${m}:${s}`; 
}

// Pomocná funkce pro vypsání levelu hráče (včetně MAX odznaku)
function getPlayerLevelText(player) {
    const maxLvl = player.maxLevel || (player.stars * 5);
    if (player.level >= maxLvl) {
        return `Lvl.${player.level} <span class="max-level-badge">[MAX]</span>`;
    }
    return `Lvl.${player.level}`;
}


// --- LEVELOVACÍ SYSTÉM (TRENÉR) ---
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
    document.getElementById('manager-name-display').innerText = playerData.managerName || 'Neznámý';
    document.getElementById('topbar-avatar').src = playerData.avatar || 'images/avatar1.jpg';
    document.getElementById('ui-level').textContent = playerData.level;
    document.getElementById('ui-xp').textContent = Math.floor(playerData.xp);
    document.getElementById('ui-max-xp').textContent = getRequiredXp();
    document.getElementById('ui-money').textContent = Math.floor(playerData.money);
    document.getElementById('ui-energy').textContent = playerData.energy;
}

// --------------- TRÉNINKOVÉ HŘIŠTĚ --------------- //

function renderTraining() {
    const mainContent = document.getElementById('main-content');

    // Rozdělíme hráče na ty, co mohou trénovat, a na zbytek
    const trainablePlayers = playerData.players.filter(p => p.unspentPoints > 0);
    const maxedPlayers = playerData.players.filter(p => p.unspentPoints === 0);

    // Pomocná funkce pro vykreslení karty v tréninku
    const createTrainingCard = (player) => {
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        
        // Výpočet procent do dalšího levelu (pro XP lištu)
        let xpPercentage = 100;
        if (player.maxLevel > 0 && player.level < player.maxLevel) {
            const requiredXp = player.level * 100;
            xpPercentage = Math.floor((player.xp / requiredXp) * 100);
        }

        // Pomocná funkce pro jeden řádek statistiky
        const renderStatRow = (statKey, label) => {
            const val = player.stats[statKey];
            const isMaxed = val >= player.statCap;
            const canUpgrade = player.unspentPoints > 0 && !isMaxed;
            
            // Použití nové třídy btn-small-add
            const btnHtml = canUpgrade 
                ? `<button onclick="trainPlayerStat('${player.id}', '${statKey}')" class="btn-small-add">+</button>` 
                : '';
            
            const maxHtml = isMaxed ? `<span style="color: #ef4444; font-size: 0.75rem; margin-left: 5px; font-weight: bold;">(MAX)</span>` : '';

            // Použití nové třídy stat-row
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
            ${trainablePlayers.length > 0 ? trainablePlayers.map(p => createTrainingCard(p)).join('') : '<p style="color: #4b5563; font-style: italic; background: #fdf5e6; padding: 10px; border-radius: 5px;">Nikdo aktuálně nemá volné tréninkové body. Hrajte zápasy pro získání XP!</p>'}
        </div>

        <h3 style="color: #fdf5e6; background: rgba(75, 85, 99, 0.8); padding: 5px 15px; border-radius: 5px; display: inline-block;">Ostatní hráči</h3>
        <div class="player-list" style="opacity: 0.9;">
            ${maxedPlayers.map(p => createTrainingCard(p)).join('')}
        </div>
    `;
}

// Funkce, která se zavolá po kliknutí na tlačítko [+]
window.trainPlayerStat = function(playerId, statKey) {
    const player = playerData.players.find(p => p.id === playerId);
    if (!player) return;

    // Pojistka: Má body a nepřekročil strop?
    if (player.unspentPoints > 0 && player.stats[statKey] < player.statCap) {
        player.stats[statKey]++;
        player.unspentPoints--;
        saveGame();
        renderTraining(); // Hned překreslíme, aby zmizel bod a upravilo se číslo
    }
}

// --- NAVIGACE ---
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const mainContent = document.getElementById('main-content');

    const backgrounds = {
        'office': 'images/kancelar_pozadi.png',
        'training': 'images/treninkove_hriste1.png',     
        'match': 'images/treninkove_hriste1.png',          
        'shop': 'images/obchod1.png',          
        'scouting': 'images/skauting1.png',    
        'stadium': 'images/stadion1.png',      
        'locker-room': 'images/satna1.png',    
        'pve': 'images/podzemi1.png',          
        'hall-of-fame': 'images/sin_slavy1.png', 
        'mail': 'images/posta_pozadi.jpg',            
        'alliance': 'images/aliance1.png',     
        'default': 'images/vychozi_pergamen.jpg'     
    };

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const target = this.getAttribute('data-target');
            
            const bgImage = backgrounds[target] || backgrounds['default'];
            mainContent.style.backgroundImage = `url('${bgImage}')`;
            mainContent.style.backgroundSize = 'cover';
            mainContent.style.backgroundPosition = 'center';

            if (target === 'office') renderOffice();
            else if (target === 'match') renderMatches();
            else if (target === 'stadium') renderStadium();
            else if (target === 'locker-room') renderLockerRoom();
            else if (target === 'scouting') renderScouting();
            else if (target === 'mail') renderMail();
            else if (target === 'pve') renderPvE();
            else if (target === 'training') renderTraining();
            else {
                mainContent.innerHTML = `<div class="under-construction"><h2>🚧 ${this.getAttribute('data-name')} 🚧</h2></div>`;
            }
        });
    });
}

// --- KANCELÁŘ (ÚKOLY) ---
function renderOffice() {
    const mainContent = document.getElementById('main-content');
    
    const currentMultiplier = Math.pow(1.2, playerData.level - 1);
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

function generateTasks() {
    const levelMultiplier = Math.pow(1.2, playerData.level - 1);
    const energyMoney = Math.floor(Math.random() * 10) + 1;
    const energyXP = Math.floor(Math.random() * 10) + 1;

    const baseMoney = energyMoney * (Math.floor(Math.random() * 15) + 10);
    const baseXP = energyXP * (Math.floor(Math.random() * 5) + 5);

    playerData.officeTasks = [
        { title: 'Jednání se sponzory', type: 'money', energy: energyMoney, reward: Math.floor(baseMoney * levelMultiplier) },
        { title: 'Taktický rozbor videa', type: 'xp', energy: energyXP, reward: Math.floor(baseXP * levelMultiplier) }
    ];
    saveGame();
}

window.startTask = function(taskIndex) {
    const task = playerData.officeTasks[taskIndex]; 
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
    playerData.officeTasks = []; 
    saveGame();
    
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn && activeBtn.getAttribute('data-target') === 'office') {
        renderOffice();
    }
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
                <button class="btn-task btn-test" onclick="skipUpgrade()">[TEST] Dokončit stavbu</button>
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

// --- TESTOVACÍ FUNKCE A UTILITKY ---
window.resetEnergy = function() {
    playerData.energy = 100;
    saveGame();
    updateTopBarUI();
}

window.skipTask = function() {
    if (playerData.activeTask) {
        playerData.activeTask.endTime = Date.now(); 
        saveGame();
        gameLoop(); 
    }
}

window.startNewClub = function() {
    if(confirm("Tímto smažeš celou svou aktuální hru a začneš úplně od nuly. Jsi si jistý?")) {
        localStorage.removeItem('footballManagerData'); 
        location.reload(); 
    }
}

window.hardReset = function() {
    if (confirm("Opravdu chceš smazat všechna data? Tuto akci nelze vzít zpět!")) {
        localStorage.removeItem('footballManagerData'); 
        location.reload(); 
    }
}

window.logout = function() {
    if(confirm("Opravdu se chceš odhlásit?")) {
        playerData.isLoggedIn = false; 
        saveGame();
        location.reload(); 
    }
}

window.onload = initGame;


// --- TVORBA HRÁČŮ A RPG SYSTÉM ---
const firstNames = ['Jan', 'Petr', 'Tomáš', 'Lukáš', 'Jakub', 'Martin', 'Michal', 'Jiří', 'Ondřej', 'David', 'Karel', 'Pavel', 'Tonda', 'Pepa', 'Vašek', 'Dodo'];
const lastNames = ['Mišun', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec', 'Pokorný', 'Stanovský', 'Vlasák', 'Pavelka', 'Suchán', 'Pala', 'Vašina', 'Bakalík'];

const PLAYER_RANKS = [
    { name: 'Kopyto', cap: 15 },           
    { name: 'Slibný amatér', cap: 25 },    
    { name: 'Srdcař', cap: 45 },           
    { name: 'Ligový borec', cap: 65 },     
    { name: 'Reprezentant', cap: 85 },     
    { name: 'Legenda', cap: 99 }           
];

function generatePlayer(isStarter = false) {
    let stars = 0;
    
    if (isStarter) {
        stars = Math.random() > 0.15 ? 0 : 1;
    } else {
        const roll = Math.random(); 
        if (roll > 0.99) stars = 5;
        else if (roll > 0.90) stars = 4;
        else if (roll > 0.70) stars = 3;
        else if (roll > 0.40) stars = 2;
        else stars = 1;
    }

    const currentDiv = playerData.division || 10; 
    let availableRanks = [];

    if (currentDiv === 10) availableRanks = [0];
    else if (currentDiv >= 8) availableRanks = [0, 1];
    else if (currentDiv >= 6) availableRanks = [1, 2];
    else if (currentDiv >= 4) availableRanks = [1, 2, 3];
    else if (currentDiv >= 2) availableRanks = [2, 3, 4];
    else if (currentDiv === 1) availableRanks = [4, 5];
    else availableRanks = [0];

    const rankIndex = availableRanks[Math.floor(Math.random() * availableRanks.length)];
    const selectedRank = PLAYER_RANKS[rankIndex];

    return {
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        
        rank: selectedRank.name,
        statCap: selectedRank.cap,
        stars: stars,
        level: 1,           
        maxLevel: stars * 5, 
        xp: 0,
        unspentPoints: 0,
        
        stats: {
            atk: Math.min(selectedRank.cap, Math.floor(Math.random() * 10) + (rankIndex * 4) + 1),
            def: Math.min(selectedRank.cap, Math.floor(Math.random() * 10) + (rankIndex * 4) + 1),
            spd: Math.min(selectedRank.cap, Math.floor(Math.random() * 10) + (rankIndex * 4) + 1),
            str: Math.min(selectedRank.cap, Math.floor(Math.random() * 10) + (rankIndex * 4) + 1),
            eng: Math.min(selectedRank.cap, Math.floor(Math.random() * 10) + (rankIndex * 4) + 1),
            gk:  Math.min(selectedRank.cap, Math.floor(Math.random() * 10) + (rankIndex * 4) + 1),
            tek: Math.min(selectedRank.cap, Math.floor(Math.random() * 10) + (rankIndex * 4) + 1)
        }
    };
}

function addPlayerXp(player, xpAmount) {
    // Pojistka pro staré savy, kdyby hráč neměl nastavený maxLevel
    if (!player.maxLevel) player.maxLevel = player.stars * 5;
    
    // 1. KONTROLA STROPU: Pokud je hráč na max levelu, už se dál nezlepšuje
    if (player.level >= player.maxLevel) {
        player.xp = 0; // Pro jistotu vynulujeme XP bar
        return false;
    }

    player.xp += xpAmount;
    let levelUp = false;
    
    // Potřebné XP pro další úroveň (např. level * 100)
    let xpNeeded = player.level * 100; 

    // Smyčka pro případ, že získá hodně XP a skočí o více levelů naráz
    while (player.xp >= xpNeeded && player.level < player.maxLevel) {
        player.xp -= xpNeeded;
        player.level++;
        player.unspentPoints += 2; // PŘESNĚ 2 body za každý level!
        levelUp = true;
        xpNeeded = player.level * 100;
    }
    
    // 2. KONTROLA PO PŘIDÁNÍ: Pokud právě dosáhl stropu
    if (player.level >= player.maxLevel) {
        player.level = player.maxLevel;
        player.xp = 0; // Ukončíme postup v progress baru
    }

    return levelUp;
}

// --- KONFIGURACE FOTBALOVÉHO PODZEMÍ (PvE) ---
const PVE_DUNGEONS = [
    {
        id: 'kopyta',
        name: 'Pohár Zlámaných Kopyt',
        desc: 'Pralesní liga nejhrubšího zrna. Tady se nehraje na taktiku, tady se hraje na přežití.',
        stages: [
            {
                name: 'FC JZD (Traktoristi)',
                desc: 'Přijeli na zápas rovnou z pole. Mají obrovskou sílu, ale rychlost a techniku nechali v kabině.',
                botStats: { atk: 3, def: 3, spd: 1, str: 20, eng: 3, gk: 3, tek: 1 }, // Sníženo ze 30 na 20
                reward: { xp: 200, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Hospoda u Zrzavého Psa',
                desc: 'O poločase do sebe kopli dvě piva. Mají šílenou výdrž, ale z míče mají strach.',
                botStats: { atk: 2, def: 2, spd: 2, str: 2, eng: 25, gk: 2, tek: 1 }, // Sníženo na 15 výdrž
                reward: { xp: 300, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Sokol "Stará Garda"',
                desc: 'Věkový průměr 55 let. Moc toho nenaběhají, ale jejich obranný beton a zkušený brankář jsou legendární.',
                botStats: { atk: 1, def: 25, spd: 1, str: 4, eng: 2, gk: 10, tek: 4 },
                reward: { xp: 400, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Řezníci z Masokombinátu',
                desc: 'Hrají ostře a neberou si servítky. Z jejich útočníků jde strach.',
                botStats: { atk: 30, def: 4, spd: 5, str: 8, eng: 4, gk: 3, tek: 2 },
                reward: { xp: 500, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Výběr Okresního Přeboru (BOSS)',
                desc: 'To nejlepší (rozuměj nejhorší), co místní vesnice nabízí. Tým, který ti nedá nic zadarmo.',
                botStats: { atk: 9, def: 9, spd: 9, str: 9, eng: 9, gk: 9, tek: 9 },
                reward: { xp: 1000, rank: 'Slibný amatér', minStars: 1, maxStars: 1, isBoss: true }
            }
        ]
    }
];

// =======================================================================
// --------------- FOTBALOVÉ PODZEMÍ (PvE) --------------- 
// =======================================================================

// Testovací tlačítko pro přeskočení cooldownu
window.skipPvETime = function() {
    if (playerData.pve) {
        playerData.pve.nextMatchTime = 0;
        saveGame();
        renderPvE();
    }
}

// Zobrazení detailních statistik bota
window.viewPvEBot = function(dIndex, sIndex) {
    const stage = PVE_DUNGEONS[dIndex].stages[sIndex];
    const stats = stage.botStats;
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="scouting-card">
            <h2 class="section-title" style="margin-top: 0; text-shadow: 2px 2px 4px black;">Skauting soupeře</h2>
            <h3 class="scouting-title">${stage.name}</h3>
            <p style="color: #9ca3af; margin-top: 0;">Předpokládaná formace: <strong style="color: white;">4-4-2</strong></p>
            
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
            
            <button class="btn-task" style="margin-top: 25px; width: 100%; padding: 15px; background-color: #4b5563; border-color: #374151; font-size: 1.1rem; color: white;" onclick="renderPvE()">⬅ Návrat do podzemí</button>
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

// Generátor odměny v podobě hráče
function generateRewardPlayer(rankName, minStars, maxStars) {
    const stars = Math.floor(Math.random() * (maxStars - minStars + 1)) + minStars;
    const rankObj = PLAYER_RANKS.find(r => r.name === rankName);
    
    return {
        id: 'pve_' + Math.random().toString(36).substr(2, 9),
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        rank: rankObj.name,
        statCap: rankObj.cap,
        stars: stars,
        level: 1,           
        maxLevel: stars * 5, 
        xp: 0,
        unspentPoints: 0,
        stats: {
            atk: Math.floor(Math.random() * 5) + 1,
            def: Math.floor(Math.random() * 5) + 1,
            spd: Math.floor(Math.random() * 5) + 1,
            str: Math.floor(Math.random() * 5) + 1,
            eng: Math.floor(Math.random() * 5) + 1,
            gk:  Math.floor(Math.random() * 5) + 1,
            tek: Math.floor(Math.random() * 5) + 1
        }
    };
}

// Simulace podzemí
window.startPvEMatch = function(dIndex, sIndex) {
    const stage = PVE_DUNGEONS[dIndex].stages[sIndex];
    
    // Nastavíme cooldown na 1 hodinu (3600000 ms)
    playerData.pve.nextMatchTime = Date.now() + 3600000;

    const botPlayers = [];
    for (let i = 0; i < 11; i++) {
        botPlayers.push({
            name: `Hráč soupeře`,
            stats: { ...stage.botStats } 
        });
    }

    const botFormation = '4-4-2';
    const mySectors = calculateSectorStrength(playerData.players, playerData.formation, playerData.isPrepared);
    const botSectors = calculateSectorStrength(botPlayers, botFormation, false);
    
    const result = simulateMatch(mySectors, botSectors, playerData.formation, botFormation, playerData.players, botPlayers, stage.name);

    let isVictory = result.myGoals > result.botGoals;

    // ZMĚNA: Naprosto neutrální nadpis, žádné spoilery!
    let mailSubject = `⚔️ Záznam z podzemí: FC ${playerData.managerName} vs ${stage.name}`;

    if (isVictory) {
        let levelUps = [];
        playerData.players.slice(0, 11).forEach(p => {
            if (addPlayerXp(p, stage.reward.xp)) levelUps.push(p.name);
        });
        if (levelUps.length > 0) {
            result.log.push({ min: 'Konec', text: `🌟 ZLEPŠENÍ: Hráči ${levelUps.join(', ')} postoupili na novou úroveň!`, score: `${result.myGoals}:${result.botGoals}`, zone: 50, type: 'neutral' });
        }
        const newPlayer = generateRewardPlayer(stage.reward.rank, stage.reward.minStars, stage.reward.maxStars);
        playerData.players.push(newPlayer);
        
        result.log.push({ min: 'Konec', text: `🎁 ZÍSKAL JSI NOVÉHO HRÁČE! Podívej se do Šatny. Jmenuje se ${newPlayer.name}.`, score: `${result.myGoals}:${result.botGoals}`, zone: 50, type: 'goal' });

        playerData.pve.stageIndex++;
        if (playerData.pve.stageIndex >= PVE_DUNGEONS[dIndex].stages.length) {
            playerData.pve.stageIndex = 0;
            playerData.pve.dungeonIndex++; 
        }
    } else {
        result.log.push({ min: 'Konec', text: `Soupeř byl tentokrát příliš silný. Odpočiň si, uprav taktiku a zkus to za hodinu znovu!`, score: `${result.myGoals}:${result.botGoals}`, zone: 50, type: 'bad-goal' });
    }

    addMailMessage(
        mailSubject, 
        result.log, 
        `${result.myGoals}:${result.botGoals}`, 
        isVictory ? { money: 0, xp: 50, pXp: stage.reward.xp } : null
    );

    // Najdeme ten poslední přidaný mail a označíme ho jako PvE zprávu
    playerData.mail[0].isPvE = true;

    saveGame();
    
    // Ihned vykreslíme znovu Podzemí (ukáže se velký banner s odkazem do pošty)
    renderPvE();
}


// --- ŠATNA ---
let selectedPlayerIndex = null;
let isSellMode = false;

window.changeFormation = function(newFormation) {
    playerData.presets[playerData.formation] = playerData.players.map(p => p.id);
    playerData.formation = newFormation;
    
    const presetIds = playerData.presets[newFormation];
    playerData.players.sort((a, b) => {
        let indexA = presetIds.indexOf(a.id);
        let indexB = presetIds.indexOf(b.id);
        if (indexA === -1) indexA = 999; 
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
    });

    playerData.presets[newFormation] = playerData.players.map(p => p.id);
    saveGame();
    renderLockerRoom();
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
}

window.toggleSellMode = function() {
    isSellMode = !isSellMode;
    selectedPlayerIndex = null; 
    renderLockerRoom();
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
        const sellPrice = Math.floor((baseValue + (player.stars * 50)) / 2);
        
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

window.handlePlayerClick = function(index) {
    if (isSellMode) {
        const playerToSell = playerData.players[index];
        let activeFormations = [];
        for (const form in playerData.presets) {
            const presetIds = playerData.presets[form];
            const playerIndexInPreset = presetIds.indexOf(playerToSell.id);
            if (playerIndexInPreset !== -1 && playerIndexInPreset < 11) {
                activeFormations.push(form);
            }
        }

        if (activeFormations.length > 0) {
            alert(`Tohoto hráče nelze prodat! Nastupuje v základní sestavě pro formace: ${activeFormations.join(', ')}.`);
            return;
        }
        
        const sellPrice = Math.floor((playerToSell.statCap * 10 + (playerToSell.stars * 50)) / 2);
        
        if (confirm(`Opravdu chceš vyhodit hráče ${playerToSell.name} z klubu? Dostaneš za něj ${sellPrice} Peněz.`)) {
            playerData.money += sellPrice;
            playerData.players.splice(index, 1); 
            isSellMode = false; 
            
            saveGame();
            updateTopBarUI();
            renderLockerRoom();
        }
        return; 
    }

    if (selectedPlayerIndex === null) {
        selectedPlayerIndex = index;
    } else if (selectedPlayerIndex === index) {
        selectedPlayerIndex = null;
    } else {
        const temp = playerData.players[selectedPlayerIndex];
        playerData.players[selectedPlayerIndex] = playerData.players[index];
        playerData.players[index] = temp;
        selectedPlayerIndex = null;
        
        playerData.presets[playerData.formation] = playerData.players.map(p => p.id);
        saveGame();
    }
    renderLockerRoom();
}


// --- SKAUTING ---
function getScoutInterval() {
    const scoutLevel = (playerData.buildings && playerData.buildings.scout) ? playerData.buildings.scout : 1;
    const baseTime = 24 * 60 * 60 * 1000; 
    const reduction = (scoutLevel - 1) * 30 * 60 * 1000; 
    const minTime = 8 * 60 * 60 * 1000; 
    return Math.max(minTime, baseTime - reduction);
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

    const playersHtml = playerData.scoutedPlayers.map((player, index) => {
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        const price = player.statCap * 10 + (player.stars * 50);
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
                <div style="margin-top: 10px; font-size: 0.85rem; color: #a1887f;">
                    Úroveň kanceláře: ${playerData.buildings.scout} (Každý další level zrychlí skauty o 30 minut)
                </div>
                <button class="btn-task btn-skip" style="margin-top: 10px; padding: 5px 10px;" onclick="forceScoutRefresh()">[TEST] Vygenerovat hned</button>
            </div>
        </div>
        <div class="player-list">
            ${playersHtml}
        </div>
    `;

    updateTimerUI('scout-timer', nextRefresh);
}

function generateScoutedPlayers() {
    playerData.scoutedPlayers = [];
    const amount = 3 + Math.floor(playerData.buildings.scout / 2); 
    
    for (let i = 0; i < amount; i++) {
        playerData.scoutedPlayers.push(generatePlayer(false)); 
    }
    playerData.lastScoutRefresh = Date.now();
    saveGame();
}

window.buyPlayer = function(index, price) {
    if (playerData.players.length >= 16) {
        alert("Máš plnou střídačku (16/16)! Než koupíš dalšího hráče, musíš jít do Šatny a někoho prodat.");
        return;
    }

    const player = playerData.scoutedPlayers[index];
    if (playerData.money >= price) {
        playerData.money -= price; 
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

// --- ZÁPASY A ENGINE ---
window.prepareForMatch = function() {
    if (!playerData.isPrepared) {
        playerData.isPrepared = true;
        saveGame();
        renderMatches(); 
    }
}

window.skipMatchTime = function() {
    playerData.nextMatchTime = Date.now();
    saveGame();
}

function renderMatches() {
    const mainContent = document.getElementById('main-content');

    const myTeamIndex = playerData.league.findIndex(t => t.isPlayer);
    if (myTeamIndex !== -1 && playerData.managerName) {
        playerData.league[myTeamIndex].name = `FC ${playerData.managerName}`;
    }

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
    const hasUnreadMatch = playerData.mail.some(m => !m.read);
    const unreadBanner = hasUnreadMatch ? `
        <div class="notification-banner" onclick="document.querySelector('[data-target=\\'mail\\']').click()">
            📺 Máš v poště nezkouknutý záznam zápasu! Klikni sem a běž se podívat.
        </div>
    ` : '';

    mainContent.innerHTML = `
        <div style="text-align: center;">
            <h2 class="section-title">Amatérská Liga (10. Divize)</h2>
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
            <button class="btn-task btn-skip" style="margin-bottom: 15px; padding: 5px 15px; background-color: #ef4444; border-color: #b91c1c;" onclick="skipMatchTime()">[TEST] Odehrát hned</button>
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

function calculateSectorStrength(players, formation, isPrepared = false) {
    const sectors = { mid: 0, att: 0, def: 0, gk: 0 };
    const counts = { mid: 0, att: 0, def: 0, gk: 0 }; // Nové: počítadlo hráčů v sektoru
    
    const formations = {
        '4-4-2': { gk: [0, 1], def: [1, 5], mid: [5, 9], att: [9, 11] },
        '4-3-3': { gk: [0, 1], def: [1, 5], mid: [5, 8], att: [8, 11] },
        '5-4-1': { gk: [0, 1], def: [1, 6], mid: [6, 10], att: [10, 11] }
    };
    const layout = formations[formation];

    // 1. Sečteme hrubé statistiky a spočítáme hráče
    players.slice(0, 11).forEach((p, index) => {
        if (index >= layout.gk[0] && index < layout.gk[1]) {
            sectors.gk += (p.stats.gk * 1.2) + p.stats.tek + p.stats.def + p.stats.spd;
            counts.gk++;
        } else if (index >= layout.def[0] && index < layout.def[1]) {
            sectors.def += (p.stats.def * 1.2) + p.stats.str + p.stats.spd + p.stats.eng;
            counts.def++;
        } else if (index >= layout.mid[0] && index < layout.mid[1]) {
            sectors.mid += (p.stats.tek * 1.2) + p.stats.atk + p.stats.def + p.stats.spd + p.stats.eng;
            counts.mid++;
        } else if (index >= layout.att[0] && index < layout.att[1]) {
            sectors.att += (p.stats.atk * 1.2) + p.stats.spd + p.stats.tek + p.stats.eng;
            counts.att++;
        }
    });

    // 2. Přepočet na CHYTRÝ PRŮMĚR (Průměr * bonus za počet hráčů)
    for (let key in sectors) {
        if (counts[key] > 0) {
            let average = sectors[key] / counts[key];
            // Každý hráč v řadě přidává +15 % k celkovému výkonu řady
            sectors[key] = Math.floor(average * (1 + (counts[key] * 0.15)));
        }
    }

    // 3. Bonus za přípravu na zápas
    if (isPrepared) {
        for (let key in sectors) sectors[key] = Math.floor(sectors[key] * 1.1);
    }
    
    return sectors;
}

function simulateMatch(mySectors, botSectors, myFormation, botFormation, myPlayers, botPlayers, opponentName) {
    let myGoals = 0;
    let botGoals = 0;
    let matchLog = [];

    const formations = {
        '4-4-2': { gk: [0, 1], def: [1, 5], mid: [5, 9], att: [9, 11] },
        '4-3-3': { gk: [0, 1], def: [1, 5], mid: [5, 8], att: [8, 11] },
        '5-4-1': { gk: [0, 1], def: [1, 6], mid: [6, 10], att: [10, 11] }
    };

    const getRandomPlayer = (players, range) => players[Math.floor(Math.random() * (range[1] - range[0])) + range[0]];

    let myFinalSectors = { ...mySectors };
    let botFinalSectors = { ...botSectors };

    // Taktická výhoda na startu
    if ((myFormation === '5-4-1' && botFormation === '4-3-3') ||
        (myFormation === '4-3-3' && botFormation === '4-4-2') ||
        (myFormation === '4-4-2' && botFormation === '5-4-1')) {
        for (let key in myFinalSectors) myFinalSectors[key] *= 1.1;
        matchLog.push({ min: 0, text: `Šéf vybral skvělou taktiku! Naše formace ${myFormation} dává týmu výhodu proti soupeřově ${botFormation}.`, score: "0:0", zone: 50, type: 'neutral' });
    } else if (myFormation !== botFormation) {
        for (let key in botFinalSectors) botFinalSectors[key] *= 1.1;
        matchLog.push({ min: 0, text: `Soupeř nás takticky přečetl. Jejich formace ${botFormation} nám bude dělat problémy.`, score: "0:0", zone: 50, type: 'neutral' });
    }

    matchLog.push({ min: 0, text: `Rozhodčí píská do píšťalky a zápas právě začíná. Výkop ze středového kruhu!`, score: "0:0", zone: 50, type: 'neutral' });

    let gameState = 'center'; 

    for (let i = 1; i <= 22; i++) {
        let minute = Math.floor(i * 4 - Math.random() * 2);
        if (minute > 90) minute = 90; 

        if (i === 11) {
            matchLog.push({ min: 45, text: `Rozhodčí ukončil první půli a po přestávce zahajuje druhý poločas. Výkop ze středu hřiště.`, score: `${myGoals}:${botGoals}`, zone: 50, type: 'neutral' });
            gameState = 'center';
            continue; 
        }

        let myMidPower = myFinalSectors.mid * (0.5 + Math.random() * 0.5);
        let botMidPower = botFinalSectors.mid * (0.5 + Math.random() * 0.5);
        let myAttPower = myFinalSectors.att * (0.5 + Math.random() * 0.5);
        let botAttPower = botFinalSectors.att * (0.5 + Math.random() * 0.5);
        let myDefPower = myFinalSectors.def * (0.5 + Math.random() * 0.5);
        let botDefPower = botFinalSectors.def * (0.5 + Math.random() * 0.5);
        let myGkPower = myFinalSectors.gk * (0.5 + Math.random() * 0.5);
        let botGkPower = botFinalSectors.gk * (0.5 + Math.random() * 0.5);

        // 1. ZÓNA: STŘED HŘIŠTĚ
        if (gameState === 'center') {
            const pMyMid = getRandomPlayer(myPlayers, formations[myFormation].mid);
            const pBotMid = getRandomPlayer(botPlayers, formations[botFormation].mid);
            
            if (myMidPower > botMidPower) {
                if (Math.random() < 0.30) { // Zvýšeno na 30 %
                    gameState = 'away_def'; 
                    matchLog.push({ min: minute, text: `Fantastický přehled! ${pMyMid.name} poslal prudký pas středem pole přímo na naše útočníky!`, score: `${myGoals}:${botGoals}`, zone: 80, type: 'chance' });
                } else {
                    gameState = 'away_mid'; 
                    matchLog.push({ min: minute, text: `Naše záloha vyhrála souboj ve středu hřiště! ${pMyMid.name} kontroluje míč.`, score: `${myGoals}:${botGoals}`, zone: 65, type: 'mid' });
                }
            } else {
                if (Math.random() < 0.30) { // Zvýšeno na 30 %
                    gameState = 'home_def'; 
                    matchLog.push({ min: minute, text: `Soupeř hraje velmi přímočaře! ${pBotMid.name} našel průnikovou nahrávkou volného spoluhráče.`, score: `${myGoals}:${botGoals}`, zone: 20, type: 'danger' });
                } else {
                    gameState = 'home_mid'; 
                    matchLog.push({ min: minute, text: `Soupeř ovládl střed hřiště. ${pBotMid.name} rozjíždí postupný útok.`, score: `${myGoals}:${botGoals}`, zone: 35, type: 'mid' });
                }
            }
        } 
        // 2. ZÓNA: STŘED SOUPEŘOVA POLOVINA
        else if (gameState === 'away_mid') {
            const pMyMid = getRandomPlayer(myPlayers, formations[myFormation].mid);
            const pBotMid = getRandomPlayer(botPlayers, formations[botFormation].mid);
            if (myMidPower > botMidPower) { 
                if (Math.random() < 0.30) { 
                    gameState = 'away_box'; 
                    matchLog.push({ min: minute, text: `To byla nahrávka! ${pMyMid.name} vyslal kolmici za obranu a jdeme sami na bránu!`, score: `${myGoals}:${botGoals}`, zone: 85, type: 'chance' });
                } else {
                    gameState = 'away_def'; 
                    matchLog.push({ min: minute, text: `Tlačíme se dopředu. ${pMyMid.name} posílá míč před vápno soupeře.`, score: `${myGoals}:${botGoals}`, zone: 80, type: 'chance' });
                }
            } else {
                gameState = 'center'; 
                matchLog.push({ min: minute, text: `Ztráta míče. Soupeřův záložník ${pBotMid.name} vrací hru do středu.`, score: `${myGoals}:${botGoals}`, zone: 50, type: 'neutral' });
            }
        }
        // 3. ZÓNA: STŘED MOJE POLOVINA
        else if (gameState === 'home_mid') {
            const pMyMid = getRandomPlayer(myPlayers, formations[myFormation].mid);
            const pBotMid = getRandomPlayer(botPlayers, formations[botFormation].mid);
            if (myMidPower > botMidPower) { 
                gameState = 'center'; 
                matchLog.push({ min: minute, text: `Vybojovali jsme míč zpět! ${pMyMid.name} vrací klid do naší rozehrávky.`, score: `${myGoals}:${botGoals}`, zone: 50, type: 'neutral' });
            } else {
                if (Math.random() < 0.30) { 
                    gameState = 'home_box'; 
                    matchLog.push({ min: minute, text: `Nebezpečný pas! ${pBotMid.name} poslal míč mezi naše stopery a soupeř je v tutovce!`, score: `${myGoals}:${botGoals}`, zone: 15, type: 'danger' });
                } else {
                    gameState = 'home_def'; 
                    matchLog.push({ min: minute, text: `Soupeř se usazuje na naší polovině. ${pBotMid.name} hledá prostor k útoku.`, score: `${myGoals}:${botGoals}`, zone: 20, type: 'danger' });
                }
            }
        }
        // 4. ZÓNA: JEJICH OBRANA
        else if (gameState === 'away_def') {
            const pMyAtt = getRandomPlayer(myPlayers, formations[myFormation].att);
            const pBotDef = getRandomPlayer(botPlayers, formations[botFormation].def);
            if (myAttPower > botDefPower) { 
                gameState = 'away_box'; 
                matchLog.push({ min: minute, text: `Paráda! ${pMyAtt.name} obešel posledního obránce a proniká do vápna!`, score: `${myGoals}:${botGoals}`, zone: 90, type: 'chance' });
            } else {
                // NOVINKA: 35% šance na daleký odkop soupeře
                if (Math.random() < 0.35) {
                    gameState = 'home_mid';
                    matchLog.push({ min: minute, text: `Obrana soupeře odvrací hrozbu! ${pBotDef.name} poslal dlouhý odkop až na naši polovinu.`, score: `${myGoals}:${botGoals}`, zone: 35, type: 'neutral' });
                } else {
                    gameState = 'away_mid'; 
                    matchLog.push({ min: minute, text: `Obránce ${pBotDef.name} nám odebral míč a rozehrává na své záložníky.`, score: `${myGoals}:${botGoals}`, zone: 65, type: 'neutral' });
                }
            }
        }
        // 5. ZÓNA: MOJE OBRANA
        else if (gameState === 'home_def') {
            const pBotAtt = getRandomPlayer(botPlayers, formations[botFormation].att);
            const pMyDef = getRandomPlayer(myPlayers, formations[myFormation].def);
            if (botAttPower > myDefPower) { 
                gameState = 'home_box'; 
                matchLog.push({ min: minute, text: `Kritický moment! ${pBotAtt.name} se prodral přes naši obranu do vápna!`, score: `${myGoals}:${botGoals}`, zone: 10, type: 'danger' });
            } else {
                // NOVINKA: 35% šance na náš daleký odkop (Counter-attack)
                if (Math.random() < 0.35) {
                    gameState = 'away_mid';
                    matchLog.push({ min: minute, text: `Skvělý zákrok! ${pMyDef.name} čistě zastavil akci a okamžitě odkopává míč na polovinu soupeře!`, score: `${myGoals}:${botGoals}`, zone: 65, type: 'neutral' });
                } else {
                    gameState = 'home_mid'; 
                    matchLog.push({ min: minute, text: `Naše obrana v čele s ${pMyDef.name} útok zastavila a rozehrává do zálohy.`, score: `${myGoals}:${botGoals}`, zone: 35, type: 'neutral' });
                }
            }
        }
        // 6. ZÓNA: JEJICH VÁPNO
        else if (gameState === 'away_box') {
            const pMyAtt = getRandomPlayer(myPlayers, formations[myFormation].att);
            const pBotGk = getRandomPlayer(botPlayers, formations[botFormation].gk);
            if ((myAttPower * 1.15) > botGkPower) {
                myGoals++;
                gameState = 'center';
                matchLog.push({ min: minute, text: `GÓÓÓL! ${pMyAtt.name} poslal míč neomylně k tyči!`, score: `${myGoals}:${botGoals}`, zone: 95, type: 'goal' });
                matchLog.push({ min: minute, text: `Zápas pokračuje rozehrávkou ze středového kruhu.`, score: `${myGoals}:${botGoals}`, zone: 50, type: 'neutral' });
            } else {
                gameState = 'home_mid'; 
                matchLog.push({ min: minute, text: `Škoda! Brankář ${pBotGk.name} vytáhl skvělý zákrok a okamžitě vykopává do pole.`, score: `${myGoals}:${botGoals}`, zone: 35, type: 'chance' });
            }
        }
        // 7. ZÓNA: MOJE VÁPNO
        else if (gameState === 'home_box') {
            const pBotAtt = getRandomPlayer(botPlayers, formations[botFormation].att);
            const pMyGk = getRandomPlayer(myPlayers, formations[myFormation].gk);
            if ((botAttPower * 1.15) > myGkPower) {
                botGoals++;
                gameState = 'center'; 
                matchLog.push({ min: minute, text: `Gól pro ${opponentName}. ${pBotAtt.name} zakončil nekompromisně.`, score: `${myGoals}:${botGoals}`, zone: 5, type: 'bad-goal' });
                matchLog.push({ min: minute, text: `Musíme znovu rozehrát ze středu hřiště.`, score: `${myGoals}:${botGoals}`, zone: 50, type: 'neutral' });
            } else {
                gameState = 'away_mid'; 
                matchLog.push({ min: minute, text: `Neskutečný zákrok! Náš brankář ${pMyGk.name} drží tým a dalekým výkopem otáčí hru!`, score: `${myGoals}:${botGoals}`, zone: 65, type: 'danger' });
            }
        }
    }
    return { myGoals, botGoals, log: matchLog };
}

window.processMatch = function() {
    const allTeams = [...playerData.league];
    const myTeam = allTeams.find(t => t.isPlayer);
    const bots = allTeams.filter(t => !t.isPlayer);

    const opponentIndex = myTeam.z % bots.length;
    const opponent = bots[opponentIndex];

    if (!opponent) return;

    const mySectors = calculateSectorStrength(playerData.players, playerData.formation, playerData.isPrepared);
    const botSectors = calculateSectorStrength(opponent.players, opponent.formation, false);
    const result = simulateMatch(mySectors, botSectors, playerData.formation, opponent.formation, playerData.players, opponent.players, opponent.name);

    updateTeamStats(myTeam, opponent, result.myGoals, result.botGoals);
    
    const remainingBots = bots.filter(b => b.name !== opponent.name);
    for (let i = 0; i < remainingBots.length; i += 2) {
        const teamA = remainingBots[i];
        const teamB = remainingBots[i+1];
        if (teamA && teamB) {
            updateTeamStats(teamA, teamB, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
        }
    }

    let rewardMoney = 50 + (result.myGoals * 10);
    let rewardXP = 20 + (result.myGoals > result.botGoals ? 30 : result.myGoals === result.botGoals ? 10 : 0);
    playerData.money += rewardMoney;
    playerData.xp += rewardXP;

    let pXpGained = result.myGoals > result.botGoals ? 50 : (result.myGoals === result.botGoals ? 30 : 15);
    let levelUps = [];

    playerData.players.slice(0, 11).forEach(p => {
        if (addPlayerXp(p, pXpGained)) {
            levelUps.push(p.name);
        }
    });

    if (levelUps.length > 0) {
        result.log.push({ min: '90+', text: `🌟 ZLEPŠENÍ: Hráči ${levelUps.join(', ')} postoupili na novou úroveň!`, score: `${result.myGoals}:${result.botGoals}` });
    }

    addMailMessage(
        `Report: ${myTeam.name} vs ${opponent.name}`, 
        result.log, 
        `${result.myGoals}:${result.botGoals}`, 
        { money: rewardMoney, xp: rewardXP, pXp: pXpGained, homeTeam: myTeam.name, awayTeam: opponent.name }
    );

    playerData.isPrepared = false;
    playerData.nextMatchTime = Date.now() + (8 * 60 * 60 * 1000);
    
    saveGame();
    checkLevelUp();
    updateTopBarUI();
    alert(`PÍÍÍSK! Zápas právě skončil. Záznam utkání dorazil do tvé pošty, běž se podívat, jak to dopadlo!`);
    
    if (document.querySelector('.nav-btn.active')?.getAttribute('data-target') === 'match') renderMatches();
}

function updateTeamStats(t1, t2, g1, g2) {
    t1.z++; t2.z++;
    t1.gf += g1; t1.ga += g2;
    t2.gf += g2; t2.ga += g1;
    if (g1 > g2) { t1.v++; t1.points += 3; t2.p++; }
    else if (g1 === g2) { t1.r++; t1.points += 1; t2.r++; t2.points += 1; }
    else { t1.p++; t2.v++; t2.points += 3; }
}

// --- BOTI A LIGA ---
window.viewBotTeam = function(teamName) {
    const mainContent = document.getElementById('main-content');
    const botTeam = playerData.league.find(t => t.name === teamName);
    if (!botTeam || botTeam.isPlayer) return;

    const originalPlayers = playerData.players;
    playerData.players = botTeam.players;

    const formations = {
        '4-4-2': { gk: [0, 1], def: [1, 5], mid: [5, 9], att: [9, 11] },
        '4-3-3': { gk: [0, 1], def: [1, 5], mid: [5, 8], att: [8, 11] },
        '5-4-1': { gk: [0, 1], def: [1, 6], mid: [6, 10], att: [10, 11] }
    };
    const layout = formations[botTeam.formation];

    mainContent.innerHTML = `
        <div style="text-align: center; position: relative;">
            <button onclick="renderMatches()" style="position: absolute; left: 0; top: 0; padding: 10px 20px; background: #4e342e; color: white; border: none; border-radius: 5px; cursor: pointer;">⬅ Zpět na Zápasy</button>
            <h2 class="section-title">Skauting soupeře: ${botTeam.name}</h2>
            <div style="background-color: rgba(0, 0, 0, 0.85); color: #fdf5e6; padding: 15px; border-radius: 8px; border: 2px solid #ef4444; max-width: 500px; margin: 0 auto 20px auto;">
                <h3 style="margin: 0; color: #fca5a5;">Odhalená formace: ${botTeam.formation}</h3>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem;">Přizpůsob svou formaci v Šatně, abys získal taktickou výhodu +10 %!</p>
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

    playerData.players = originalPlayers;
}

function generateBotTeam(difficultyMultiplier) {
    const formations = ['4-4-2', '4-3-3', '5-4-1'];
    const botFormation = formations[Math.floor(Math.random() * formations.length)];
    const botPlayers = [];

    for (let i = 0; i < 11; i++) {
        const baseStat = Math.floor(4 * difficultyMultiplier); 
        
        botPlayers.push({
            id: 'bot_' + Math.random().toString(36).substr(2, 9),
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            rank: 'Bot',
            level: 1,
            statCap: 99,
            stars: Math.min(5, Math.max(1, Math.floor(difficultyMultiplier))),
            stats: {
                atk: baseStat + Math.floor(Math.random() * 4),
                def: baseStat + Math.floor(Math.random() * 4),
                spd: baseStat + Math.floor(Math.random() * 4),
                str: baseStat + Math.floor(Math.random() * 4),
                eng: baseStat + Math.floor(Math.random() * 4),
                gk: baseStat + Math.floor(Math.random() * 4),
                tek: baseStat + Math.floor(Math.random() * 4)
            }
        });
    }

    return { formation: botFormation, players: botPlayers };
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

window.openMatchReport = function(index) {
    const msg = playerData.mail[index];
    msg.read = true; 
    saveGame();

    window.currentMatchMsg = msg; 

    const mainContent = document.getElementById('main-content');
    const homeTeam = msg.rewards?.homeTeam || "Domácí";
    const awayTeam = msg.rewards?.awayTeam || "Hosté";

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

        <div id="replay-window" class="replay-window-container">
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

// Funkce pro okamžité dokončení záznamu
window.finishMatchReplay = function() {
    clearInterval(window.matchReplayInterval);
    const msg = window.currentMatchMsg;
    const replayWindow = document.getElementById('replay-window');
    const scoreBoard = document.getElementById('match-score-board');
    const skipBtn = document.getElementById('skip-replay-btn');
    const visualBall = document.getElementById('visual-ball');

    if (!replayWindow) return;

    // Vykreslíme vše, co zbývá, naráz
    replayWindow.innerHTML = ""; // Vyčistíme pro jistotu
    msg.content.forEach(action => {
        renderReplayAction(action);
    });

    // Nastavíme finální stav
    const lastAction = msg.content[msg.content.length - 1];
    scoreBoard.innerText = lastAction.score;
    visualBall.style.left = "50%";
    if (skipBtn) skipBtn.style.display = "none";

    // Přidáme závěrečné info a odměny
    replayWindow.innerHTML += `<div style="text-align: center; margin-top: 20px; padding: 10px; background: #374151; color: white; font-weight: bold; border-radius: 5px;">⚽ PÍSK! KONEC UTKÁNÍ ⚽</div>`;
    
    if (msg.rewards) {
        replayWindow.innerHTML += `
            <div style="background: rgba(0, 0, 0, 0.5); border: 2px dashed #fcd34d; padding: 15px; margin-top: 15px; text-align: center; border-radius: 5px;">
                <p style="margin: 0 0 10px 0; color: #fcd34d; font-weight: bold; font-size: 1.2rem;">Zisk ze zápasu</p>
                <div style="display: flex; justify-content: space-around; max-width: 400px; margin: 0 auto;">
                    <span style="color: #10b981; font-size: 1.1rem; font-weight: bold;">+${msg.rewards.money} 💰</span>
                    <span style="color: #60a5fa; font-size: 1.1rem; font-weight: bold;">+${msg.rewards.xp} ⭐ trenér</span>
                </div>
                <div style="margin-top: 10px; color: #a78bfa; font-size: 0.95rem;">Každý hráč získal: <strong>+${msg.rewards.pXp} XP 📈</strong></div>
            </div>
        `;
    }
    replayWindow.scrollTop = replayWindow.scrollHeight;
}

function addMailMessage(subject, log, result, rewards = null) {
    const newMessage = {
        id: Date.now(),
        subject: subject,
        content: log,
        result: result, 
        rewards: rewards, 
        date: new Date().toLocaleString('cs-CZ'), 
        read: false
    };

    playerData.mail.unshift(newMessage);
    if (playerData.mail.length > 10) {
        playerData.mail = playerData.mail.slice(0, 10);
    }
    saveGame();
    }