let playerData = {};

// --- LOGIN A PROFIL ---
let tempSelectedAvatar = 'images/avatar1.jpg'; 

window.selectAvatar = function(src) {
    tempSelectedAvatar = src;
    document.querySelectorAll('.avatar-img').forEach(img => img.classList.remove('selected'));
    document.querySelector(`.avatar-img[src="${src}"]`).classList.add('selected');
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
        const currentDiv = playerData.division || 10;

        // Mnohem větší seznam jmen rozdělený na "Vesnické" a "Městské" pro pocit postupu
        const villageNames = ["Sokol Horní Lhota", "SK Prdelkovice", "FC Dřeváci", "Tatran Sedlčany", "Dynamo Vesnice", "AFK Bída", "Zoufalci United", "TJ Sokol Pěnčín", "Sokol Brozany", "FK Kolomaz", "SK Holomajzna", "Sokol Řeporyje"];
        const proNames = ["Baník Ostrava (B)", "Slavoj Žižkov", "FK Admira", "SK Slavia (B)", "Meteor Praha", "Slavoj Vyšehrad", "Sokol Hostivice", "FK Jablonec (B)", "SK Kladno", "FK Teplice (B)", "FC Graffin Vlašim", "1.FK Příbram", "FK Viktoria Žižkov"];
        
        // Pokud jsme v 10.-8. divizi, bereme vesnice, výše už profíky
        const pool = currentDiv >= 8 ? villageNames : proNames;
        const shuffledNames = pool.sort(() => 0.5 - Math.random());

        playerData.league = [];
        playerData.league.push({ name: myTeamName, z: 0, v: 0, r: 0, p: 0, gf: 0, ga: 0, points: 0, isPlayer: true });
        
        for(let i = 0; i < 9; i++) {
            // Předáme aktuální divizi, aby se vygenerovaly správné ranky!
            const teamData = generateBotTeam(currentDiv);
            
            playerData.league.push({ 
                name: shuffledNames[i % shuffledNames.length], 
                z: 0, v: 0, r: 0, p: 0, gf: 0, ga: 0, points: 0, isPlayer: false,
                formation: teamData.formation,
                players: teamData.players
            });
        }
        
        playerData.seasonEndTime = Date.now() + (14 * 24 * 60 * 60 * 1000); 
        playerData.nextMatchTime = getNextMatchSlot(); // Použijeme rovnou náš nový časovač
        playerData.isPrepared = false;
        
        saveGame();
    }

    if (!playerData.isLoggedIn) {
        document.getElementById('login-screen').style.display = 'flex';
        
        const avatarSection = document.getElementById('avatar-section');
        const mainBtn = document.getElementById('main-login-btn');
        const newClubBtn = document.getElementById('new-club-footer-btn');

        // Pokud uživatel už má jméno v datech, jde o návrat (Login)
        if (playerData.managerName) {
            document.getElementById('manager-name-input').value = playerData.managerName;
            avatarSection.style.display = 'none'; // Schováme avatara
            mainBtn.textContent = 'Vstoupit do klubu';
            newClubBtn.style.display = 'block'; // Nabídneme možnost nového klubu
        } else {
            // Jde o úplně nového hráče
            avatarSection.style.display = 'block';
            mainBtn.textContent = 'Vytvořit klub a pustit se do hry';
            newClubBtn.style.display = 'none'; // U nového hráče nedává smysl tlačítko "Nový klub"
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
        const energyGained = Math.floor(timePassed / 720000); 
        
        if (energyGained > 0) {
            playerData.energy = Math.min(100, playerData.energy + energyGained);
            playerData.lastEnergyUpdate += energyGained * 720000; 
            uiNeedsUpdate = true;
            saveGame(); 
        }
    } else {
        playerData.lastEnergyUpdate = now;
    }

    // --- GENEROVÁNÍ PENĚZ V OBCHODĚ ---
    if (playerData.buildings.shop > 0) {
        const now = Date.now();
        const timePassedMs = now - (playerData.lastShopUpdate || now);
        
        // Výpočet rychlosti: 100 peněz/hod základ + 50 za každý další level
        const moneyPerHour = 100 + (playerData.buildings.shop - 1) * 50;
        const moneyPerMs = moneyPerHour / (60 * 60 * 1000);
        
        // Výpočet kapacity: 500 základ + 500 za každý další level
        const maxCapacity = 500 + (playerData.buildings.shop - 1) * 500;
        
        const generated = timePassedMs * moneyPerMs;
        playerData.shopSafe = Math.min(maxCapacity, (playerData.shopSafe || 0) + generated);
        playerData.lastShopUpdate = now;
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


// vybírání peněz z budovy pro výběr peněz
window.collectShopMoney = function() {
    const amount = Math.floor(playerData.shopSafe || 0);
    if (amount > 0) {
        playerData.money += amount;
        playerData.shopSafe = 0;
        saveGame();
        updateTopBarUI();
        renderStadium(); // Překreslíme, aby se vynulovalo počítadlo
        alert(`Vybral jsi z obchodu ${amount} 💰!`);
    } else {
        alert("Pokladna je prázdná, počkej, až se něco prodá!");
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

function generateTasks() {
    const levelMultiplier = 1 + ((playerData.level - 1) * 0.05);
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

// Pomocná funkce pro výpočet ceny hráče
function getPlayerPrice(player) {
    // Pokud má hráč 0 hvězd, násobíme 0.5, jinak počtem hvězd (1 až 5)
    const starMult = player.stars === 0 ? 0.5 : player.stars;
    // Cena = Rank (statCap) * 10 * Hvězdy
    return Math.floor(player.statCap * 30 * starMult);
}

function generatePlayer(isStarter = false) {
    let stars = 0;
    
    if (isStarter) {
        stars = Math.random() > 0.15 ? 0 : 1;
    } else {
        // Zjistíme level budovy (pokud náhodou data ještě neexistují, je to 1)
        const scoutLevel = (playerData.buildings && playerData.buildings.scout) ? playerData.buildings.scout : 1;
        
        // Hod kostkou od 0.00 do 1.00. Každý level budovy přidá +0.005 štěstí!
        const roll = Math.random() + ((scoutLevel - 1) * 0.005); 
        
        if (roll >= 0.98) stars = 5;       // 2 % (plus bonusy)
        else if (roll >= 0.90) stars = 4;  // 8 %
        else if (roll >= 0.75) stars = 3;  // 15 %
        else if (roll >= 0.55) stars = 2;  // 20 %
        else if (roll >= 0.15) stars = 1;  // 40 %
        else stars = 0;                    // 15 %
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

    // Pokud náhodou u ranku chybí minStart/maxStart, dáme nějaký záchranný základ
    const minStart = selectedRank.minStart || 1;
    const maxStart = selectedRank.maxStart || 10;

    return {
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        
        rank: selectedRank.name,
        statCap: selectedRank.cap, // Tady zachováváme tvůj klíč cap z PLAYER_RANKS
        stars: stars,
        level: 1,           
        maxLevel: stars === 0 ? 5 : stars * 5, // Přidáno ošetření pro 0 hvězdiček
        xp: 0,
        unspentPoints: 0,
        
        stats: {
            atk: Math.min(selectedRank.cap, Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart),
            def: Math.min(selectedRank.cap, Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart),
            spd: Math.min(selectedRank.cap, Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart),
            str: Math.min(selectedRank.cap, Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart),
            eng: Math.min(selectedRank.cap, Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart),
            gk:  Math.min(selectedRank.cap, Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart),
            tek: Math.min(selectedRank.cap, Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart)
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

window.toggleSellMode = function() {
    isSellMode = !isSellMode;
    selectedPlayerIndex = null; 
    renderLockerRoom();
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
        
        const sellPrice = Math.floor(getPlayerPrice(playerToSell) / 2);
        
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

// Pomocná funkce pro výpočet dalšího fixního slotu (08:00, 16:00, 00:00)
function getNextMatchSlot() {
    const now = new Date();
    const currentHour = now.getHours();
    
    let nextMatch = new Date(now);
    nextMatch.setMinutes(0);
    nextMatch.setSeconds(0);
    nextMatch.setMilliseconds(0);

    if (currentHour < 8) {
        nextMatch.setHours(8);
    } else if (currentHour < 16) {
        nextMatch.setHours(16);
    } else {
        // Příští zápas je v 00:00 další den
        nextMatch.setHours(24);
    }
    
    return nextMatch.getTime();
}

window.processMatch = function() {
    const allTeams = [...playerData.league];
    const myTeam = allTeams.find(t => t.isPlayer);
    const bots = allTeams.filter(t => !t.isPlayer);

    const opponentIndex = myTeam.z % bots.length;
    const opponent = bots[opponentIndex];

    if (!opponent) return;

    // --- HISTORIE VZÁJEMNÝCH ZÁPASŮ (H2H) ---
    // Pokud tým ještě historii nemá, vytvoříme ji
    if (!opponent.h2h) opponent.h2h = { v: 0, r: 0, p: 0 };
    
    let h2hText = "";
    const totalH2H = opponent.h2h.v + opponent.h2h.r + opponent.h2h.p;

    // Zhodnocení naší dosavadní úspěšnosti v ročníku
    if (totalH2H === 0) {
        h2hText = `Tohle je naše první letošní setkání s týmem ${opponent.name}. Uvidíme, s čím na nás vyrukují!`;
    } else if (opponent.h2h.v > opponent.h2h.p) {
        h2hText = `Hráči si na soupeře věří. V této sezóně jsme s ním už úspěšně hráli (Letošní bilance: ${opponent.h2h.v} V, ${opponent.h2h.r} R, ${opponent.h2h.p} P).`;
    } else if (opponent.h2h.v < opponent.h2h.p) {
        h2hText = `Soupeř je letos naší noční můrou, máme mu co vracet! (Letošní bilance: ${opponent.h2h.v} V, ${opponent.h2h.r} R, ${opponent.h2h.p} P).`;
    } else {
        h2hText = `Letošní bilance s tímto soupeřem je naprosto vyrovnaná (${opponent.h2h.v} V, ${opponent.h2h.r} R, ${opponent.h2h.p} P). Bude to tvrdý boj!`;
    }
    // ------------------------------------------------

    const mySectors = calculateSectorStrength(playerData.players, playerData.formation, playerData.isPrepared);
    const botSectors = calculateSectorStrength(opponent.players, opponent.formation, false);
    const result = simulateMatch(mySectors, botSectors, playerData.formation, opponent.formation, playerData.players, opponent.players, opponent.name);

    // Vložíme hlášku komentátora hned na první místo do logu před výkop!
    result.log.unshift({ min: 0, text: `🎙️ KOMENTÁTOR: ${h2hText}`, score: "0:0", zone: 50, type: 'neutral' });

    // Zaktualizujeme H2H bilanci pro PŘÍŠTÍ zápas
    if (result.myGoals > result.botGoals) opponent.h2h.v++;
    else if (result.myGoals === result.botGoals) opponent.h2h.r++;
    else opponent.h2h.p++;

    updateTeamStats(myTeam, opponent, result.myGoals, result.botGoals);
    
    const remainingBots = bots.filter(b => b.name !== opponent.name);
    for (let i = 0; i < remainingBots.length; i += 2) {
        const teamA = remainingBots[i];
        const teamB = remainingBots[i+1];
        if (teamA && teamB) {
            updateTeamStats(teamA, teamB, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
        }
    }

    const baseReward = 50 + (result.myGoals * 10);
    const tribuneBonus = 1 + (playerData.buildings.tribune * 0.05); // 5% za každý level
    let rewardMoney = Math.floor(baseReward * tribuneBonus);
    let rewardXP = 20 + (result.myGoals > result.botGoals ? 30 : result.myGoals === result.botGoals ? 10 : 0);
    playerData.money += rewardMoney;
    playerData.xp += rewardXP;

    // Výpočet základních XP pro hráče podle výsledku
    let basePXp = result.myGoals > result.botGoals ? 50 : (result.myGoals === result.botGoals ? 30 : 15);
    
    // --- BONUS Z TRÉNINKOVÉHO CENTRA ---
    const trainingBonus = 1 + (playerData.buildings.training * 0.05); // 5 % za každý level
    let pXpGained = Math.floor(basePXp * trainingBonus);
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
    playerData.nextMatchTime = getNextMatchSlot();
    
    saveGame();
    checkLevelUp();
    updateTopBarUI();
    alert(`PÍÍÍSK! Zápas právě skončil. Záznam utkání dorazil do tvé pošty, běž se podívat, jak to dopadlo!`);
    
// --- KONTROLA KONCE SEZÓNY (Změněno na 36 zápasů) ---
    if (myTeam.z >= 36) {
        const finalLeague = [...playerData.league].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return (b.gf - b.ga) - (a.gf - a.ga); 
        });
        
        const myFinalRank = finalLeague.findIndex(t => t.isPlayer) + 1;
        const oldDiv = playerData.division || 10;
        let seasonReportText = "";
        
        if (myFinalRank <= 2 && oldDiv > 1) {
            playerData.division = oldDiv - 1;
            const promotionBonus = 5000 + ((10 - playerData.division) * 2000);
            playerData.money += promotionBonus;
            seasonReportText = `🏆 FANTAZIE! Tvůj tým skončil na krásném ${myFinalRank}. místě a slaví postup do ${playerData.division}. divize! \n\nVedení klubu je nadšeno a posílá postupový bonus ve výši ${promotionBonus} 💰!`;
        } else if (oldDiv === 1 && myFinalRank === 1) {
             const champBonus = 50000;
             playerData.money += champBonus;
             seasonReportText = `👑 JSI ABSOLUTNÍ MISTR! Ovládl jsi 1. divizi! \n\nZískáváš titul, slávu a odměnu ${champBonus} 💰. Obhájíš titul i v další sezóně?`;
        } else {
            const survivalBonus = 1000;
            playerData.money += survivalBonus;
            seasonReportText = `⚽ Konec sezóny. Skončil jsi na ${myFinalRank}. místě a setrváváš v ${oldDiv}. divizi.\n\nVedení děkuje za snahu a posílá prémii ${survivalBonus} 💰 pro posílení kádru do dalšího ročníku.`;
        }

        addMailMessage(
            `Konec Sezóny - Závěrečné zhodnocení`, 
            [{ min: '---', text: seasonReportText, score: "", zone: 50, type: 'neutral' }], 
            `Konečné umístění: ${myFinalRank}. místo`, 
            null
        );

        playerData.seasonLevel = (playerData.seasonLevel || 1) + 1;
        playerData.league = []; // Smažeme starou ligu
        saveGame();
        initGame(); // Vygeneruje se nová, čistá liga s novými H2H statistikami
        
        alert(`SEZÓNA SKONČILA! Skončil jsi na ${myFinalRank}. místě. Přečti si poštu pro detaily. Začíná nová sezóna!`);
    }
    
    if (document.querySelector('.nav-btn.active')?.getAttribute('data-target') === 'match') renderMatches();
}


// simulace celé sezony //
window.testSimulateFullSeason = function() {
    if (!confirm("Chceš okamžitě dosimulovat zbytek sezóny? Hra všem náhodně přidělí body a proběhne vyhodnocení.")) return;

    const myTeam = playerData.league.find(t => t.isPlayer);
    const bots = playerData.league.filter(t => !t.isPlayer);
    
    // ZMĚNA: Sezóna má nyní 36 zápasů!
    const remainingMatches = 36 - myTeam.z;

    for (let i = 0; i < remainingMatches; i++) {
        // 1. Simulace pro hráče
        const opponent = bots[Math.floor(Math.random() * bots.length)];
        const myG = Math.floor(Math.random() * 4);
        const botG = Math.floor(Math.random() * 3);
        updateTeamStats(myTeam, opponent, myG, botG);

        // 2. Simulace pro ostatní boty v lize
        for (let j = 0; j < bots.length; j += 2) {
            const t1 = bots[j];
            const t2 = bots[j+1];
            if (t1 && t2 && t1 !== opponent && t2 !== opponent) {
                updateTeamStats(t1, t2, Math.floor(Math.random() * 3), Math.floor(Math.random() * 3));
            }
        }
    }

    saveGame();
    // Zavoláme normální zápas, který si všimne, že už máme odehráno a spustí oslavy!
    processMatch(); 
}

// --- BOTI A LIGA --- ------------------------------
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