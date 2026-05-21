// =======================================================================
// --------------- KANCELÁŘ MANAŽERA (ÚKOLY) --------------- 
// =======================================================================

// --- DYNAMICKÁ KALKULAČKA ODMĚN ZA ÚKOLY ---
window.calculateTaskReward = function(energyCost, rewardType) {
    const DAILY_ENERGY_POOL = 100; // Maximální základní energie na den

    // --- VÝPOČET PENĚZ ---
    if (rewardType === 'money') {
        const currentDiv = playerData.division || 10;
        
        // Cílový denní výdělek za celých 100 energie pro každou divizi
        const dailyMoneyTargetByDiv = {
            10: 450, 9: 1350, 8: 2700, 7: 4500, 6: 9000,
            5: 22000, 4: 45000, 3: 90000, 2: 150000, 1: 250000
        };

        const dailyTarget = dailyMoneyTargetByDiv[currentDiv] || 450;
        const moneyPerEnergy = dailyTarget / DAILY_ENERGY_POOL;
        
        let reward = Math.floor(moneyPerEnergy * energyCost);
        
        // ZMĚNA RNG: Kolísání ± 25 % (Násobič mezi 0.75 a 1.25)
        reward = Math.floor(reward * (0.75 + Math.random() * 0.5));
        
        return Math.max(1, reward);
    }

    // --- VÝPOČET ZKUŠENOSTÍ (XP) ---
    if (rewardType === 'xp') {
        const xpForCurrentLevel = window.getRequiredXp(); 
        
        // CÍL: 100 energie = 100 % celého levelu (v průměru)
        const targetDailyXp = xpForCurrentLevel * 1.0; 
        const xpPerEnergy = targetDailyXp / DAILY_ENERGY_POOL;
        
        let reward = Math.floor(xpPerEnergy * energyCost);
        
        //  RNG: Kolísání ± 25 % (Násobič mezi 0.75 a 1.25)
        reward = Math.floor(reward * (0.75 + Math.random() * 0.5));
        
        return Math.max(1, reward);
    }

    return 0;
};

// --- GENERÁTOR ÚKOLŮ ---
window.generateTasks = function() {
    playerData.officeTasks = [];
    
    // Názvy pro peněžní a XP úkoly
    const moneyTitles = ["Jednání se sponzory", "Prodej klubových suvenýrů", "Setkání s investory", "Natočení reklamy"];
    const xpTitles = ["Taktický rozbor videa", "Návštěva trenérského semináře", "Sledování moderních trendů", "Mentální koučink"];
    
    // --- 1. ÚKOL: VŽDY NA PENÍZE ---
    const energyCostMoney = Math.floor(Math.random() * 10) + 1; // 1 až 10 energie
    playerData.officeTasks.push({
        title: moneyTitles[Math.floor(Math.random() * moneyTitles.length)],
        type: 'money',
        energy: energyCostMoney,
        reward: window.calculateTaskReward(energyCostMoney, 'money')
    });

    // --- 2. ÚKOL: VŽDY NA ZKUŠENOSTI ---
    const energyCostXp = Math.floor(Math.random() * 10) + 1; // 1 až 10 energie
    playerData.officeTasks.push({
        title: xpTitles[Math.floor(Math.random() * xpTitles.length)],
        type: 'xp',
        energy: energyCostXp,
        reward: window.calculateTaskReward(energyCostXp, 'xp')
    });

    saveGame();
};

// --- VYKRESLENÍ KANCELÁŘE ---
window.renderOffice = function() {
    const mainContent = document.getElementById('main-content');

    const xpPercent = Math.min(100, (playerData.xp / window.getRequiredXp()) * 100);
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

    const officeHtml = `
        <div class="office-stat-container" style="max-width: 550px; margin: 10px auto 25px auto; text-align: left;">
            <div class="office-bar-label">
                <span>Zkušenosti trenéra</span>
                <span>${Math.floor(playerData.xp)} / ${window.getRequiredXp()}</span>
            </div>
            <div class="office-progress-bg">
                <div class="office-progress-fill fill-xp" style="width: ${xpPercent}%"></div>
            </div>

            <div class="office-bar-label">
                <span>Tvoje energie</span>
                <span>${energyPercent} ⚡</span>
            </div>
            <div class="office-progress-bg" style="margin-bottom: 0;">
                <div class="office-progress-fill fill-energy" style="width: ${energyPercent}%"></div>
            </div>
        </div>
    `;

    if (playerData.activeTask !== null) {
        const flavorTexts = {
            'Jednání se sponzory': 'Přesvědčuješ ředitele místního uzenářství, že obří logo klobásy na dresech je přesně to, co jejich značka potřebuje. Zatím se tváří nedůvěřivě a nabízí ti k úplatku jen tlačenku...',
            'Taktický rozbor videa': 'Snažíš se hráčům na videu vysvětlit, proč by v obraně neměli nahrávat přímo útočníkům soupeře. Většina týmu už po pěti minutách usnula...',
            'Prodej klubových suvenýrů': 'Stojíš u stánku a snažíš se fanouškům vnutit šály z loňské sezóny. Jde to ztuha.',
            'Setkání s investory': 'Ukazuješ grafy s budoucím ziskem. Nikdo ti nerozumí, ale vypadáš profesionálně.',
            'Natočení reklamy': 'Tvůj hvězdný útočník neumí říct dvě věty bez přeřeknutí. Natáčíte už dvacátou klapku.',
            'Návštěva trenérského semináře': 'Přednáška o hře bez míče. Zapisuješ si každé slovo, i když to vlastně nedává smysl.',
            'Sledování moderních trendů': 'Analyzuješ hru Manchesteru City na tabletu. Bohužel tvůj tým City nepřipomíná ani zdálky.',
            'Mentální koučink': 'Vysvětluješ hráčům, že míč je vlastně jen stav mysli. Koukají na tebe dost divně.'
        };
        const currentFlavorText = flavorTexts[playerData.activeTask.title] || 'Pracuješ na úkolu, pot z tebe leje...';

        mainContent.innerHTML = `
            <div class="text-center">
                <h2 class="section-title">Kancelář manažera</h2>
                ${trainerInfoHtml}
                ${officeHtml} 
            </div>
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
        window.generateTasks();
    }

    mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('office')">Nápověda</button>
        <div class="text-center">
            <h2 class="section-title">Kancelář manažera</h2>
            ${trainerInfoHtml}
            ${officeHtml} 
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
                    <button class="btn-task" onclick="window.startTask(${index})">Začít úkol</button>
                </div>
            `).join('')}
        </div>
    `;
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