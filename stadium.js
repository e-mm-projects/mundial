/* =========================================
   🏟️ SPRÁVA STADIONU A BUDOV
========================================= */

window.renderStadium = function() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.position = 'relative';

    const isZoneUpgrading = (buildingsInZone) => {
        if (!playerData.activeUpgrade) return false;
        return buildingsInZone.includes(playerData.activeUpgrade.buildingId);
    };

    // --- VÝPOČET PRO FANSHOP BAR ---
    const shopConfig = buildingsConfig.shop;
    const shopLvl = playerData.buildings.shop || 1;
    // Nový výpočet kapacity z configu
    const maxCap = Math.floor(shopConfig.baseCap * Math.pow(shopConfig.capMult, shopLvl - 1));
    const currentAmount = Math.floor(playerData.shopSafe || 0);
    const shopPercent = Math.min(100, (currentAmount / maxCap) * 100);

    mainContent.innerHTML = `
        <div style="position: relative; z-index: 10; text-align: center; margin-bottom: 15px; pointer-events: none;">
            <button class="help-btn-corner" onclick="showHelp('stadium')" style="pointer-events: auto;">Nápověda</button>
            <h2 class="section-title" style="text-shadow: 2px 2px 5px rgba(0,0,0,0.8);">Areál klubu</h2>
            <p class="stadium-subtitle" style="text-shadow: 1px 1px 3px black; font-weight: bold; color: #fdf5e6;">Klikni na část stadionu pro správu budov.</p>
        </div>
        
        <div class="interactive-stadium-container">
            
            <div class="stadium-click-zone ${isZoneUpgrading(['tribune', 'shop']) ? 'building-upgrading' : ''}" 
                 onclick="openZoneMenu('left')" 
                 style="top: 15%; left: 0%; width: 45%; height: 70%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">Zázemí pro fanoušky</strong>
                    
                    <div class="zone-shop-mini-container">
                        <div class="zone-shop-label">Obchod se suvenýry</div>
                        <div class="zone-shop-bar-bg">
                            <div id="zone-shop-fill" class="zone-shop-bar-fill" style="width: ${shopPercent}%;"></div>
                        </div>
                        <div id="zone-shop-text" class="zone-shop-value">${currentAmount} / ${maxCap} 💰</div>
                    </div>

                    ${isZoneUpgrading(['tribune', 'shop']) ? '<div class="zone-timer" id="zone-timer-left">Staví se...</div>' : ''}
                </div>
            </div>

            <div class="stadium-click-zone ${isZoneUpgrading(['pitch', 'training']) ? 'building-upgrading' : ''}" 
                 onclick="openZoneMenu('center')" 
                 style="top: 55%; left: 35%; width: 35%; height: 45%;">
                <div class="zone-tag">
                    <strong>Hrací plocha a Trénink</strong>
                    ${isZoneUpgrading(['pitch', 'training']) ? '<div class="zone-timer" id="zone-timer-center">Staví se...</div>' : ''}
                </div>
            </div>

            <div class="stadium-click-zone ${isZoneUpgrading(['scout']) ? 'building-upgrading' : ''}" 
                 onclick="openZoneMenu('right')" 
                 style="top: 10%; left: 65%; width: 35%; height: 80%;">
                <div class="zone-tag">
                    <strong>Vedení klubu</strong>
                    ${isZoneUpgrading(['scout']) ? '<div class="zone-timer" id="zone-timer-right">Staví se...</div>' : ''}
                </div>
            </div>
            
        </div>
    `;
};

// Pomocná funkce, která vygeneruje HTML pro konkrétní kartičku budovy
function generateBuildingCard(id) {
    const config = buildingsConfig[id];
    const currentLevel = playerData.buildings[id] || 1;
    const nextCost = Math.floor(config.baseCost * Math.pow(config.costMult, currentLevel - 1));
    const nextTime = Math.floor(config.baseTime * Math.pow(config.timeMult, currentLevel - 1));

    const canAfford = playerData.money >= nextCost;
    const isBuildingSomething = playerData.activeUpgrade !== null;
    const isThisBuildingUpgrading = isBuildingSomething && playerData.activeUpgrade.buildingId === id;
    const disabledAttr = (!canAfford || isBuildingSomething) ? 'disabled' : '';

    // --- VÝPOČET BONUSŮ ---
    let bonusText = "";
    if (id === 'scout') {
        const timeRed = (currentLevel - 1) * 30;
        const chanceInc = ((currentLevel - 1) * 0.5).toFixed(1);
        bonusText = `<div class="building-bonus-text">Aktuální bonus: -${timeRed} min čas, +${chanceInc}% šance na talenty.</div>`;
    } else if (id === 'shop') {
        const shopConfig = buildingsConfig.shop;
        // Nový výpočet z configu pro vyskakovací okno
        const moneyPerHour = Math.floor(shopConfig.baseIncome * Math.pow(shopConfig.incomeMult, currentLevel - 1));
        const maxCap = Math.floor(shopConfig.baseCap * Math.pow(shopConfig.capMult, currentLevel - 1));
        const currentInSafe = Math.floor(playerData.shopSafe || 0);
        
        bonusText = `
            <div class="building-bonus-text">Příjem: ${moneyPerHour} 💰/hod (Max: ${maxCap})</div>
            <div class="shop-safe-box" style="margin-top: 10px;">
                V pokladně: <span class="shop-safe-amount">${currentInSafe} / ${maxCap} 💰</span>
                <button class="btn-task btn-collect-safe" onclick="collectShopMoney()">Vybrat pokladnu</button>
            </div>`;
    } else if (id === 'tribune') {
        bonusText = `<div class="building-bonus-text">Aktuální bonus k příjmu: +${currentLevel * 5}% 💰</div>`;
    } else if (id === 'training') {
        bonusText = `<div class="building-bonus-text">Aktuální bonus k XP hráčů: +${currentLevel * 5}% 📈</div>`;
    } else if (id === 'pitch') {
        bonusText = `<div class="building-bonus-text">Aktuální bonus k rychlosti: +${currentLevel * 1}% 🏃</div>`;
    }

    // --- LOGIKA TLAČÍTEK A STAVBY ---
    let upgradeSection = "";
    const isMaxLevel = (id === 'pitch' && currentLevel >= 10) || (id === 'scout' && currentLevel >= 32);

    if (isThisBuildingUpgrading) {
        upgradeSection = `
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; border: 1px dashed #fcd34d; text-align: center;">
                <h4 style="color:#fcd34d; margin:0 0 5px 0;">🚧 Probíhá stavba!</h4>
                <div class="huge-timer" id="modal-upgrade-timer" style="margin-top: 0; font-size: 1.2rem;">Počítám...</div>
                ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" onclick="skipUpgrade()">[TEST] Dokončit</button>` : ''}
            </div>
        `;
    } else if (isMaxLevel) {
        upgradeSection = `
            <div class="building-stats building-stats-maxed" style="text-align: center;">
                <span class="maxed-title">🏆 DOSAŽENO MAXIMUM</span>
            </div>`;
    } else {
        const warning = isBuildingSomething ? `<div style="color:#ef4444; font-size:0.8rem; margin-bottom:5px; text-align:center;">Už stavíš jinou budovu!</div>` : '';
        upgradeSection = `
            ${warning}
            <div class="building-stats">
                <div class="stat-cost">Cena: ${nextCost} 💰</div>
                <div class="stat-time">Čas: ${formatTime(nextTime)}</div>
            </div>
            <button class="btn-upgrade" style="width: 100%;" ${disabledAttr} onclick="startUpgrade('${id}', ${nextCost}, ${nextTime})">Vylepšit na Lvl. ${currentLevel + 1}</button>
        `;
    }

    return `
        <div class="building-card">
            <div class="building-header">
                <h3 style="margin: 0;">${config.name}</h3>
                <span class="building-level" style="font-size: 0.9rem;">Lvl. ${currentLevel}</span>
            </div>
            <div class="building-desc" style="margin-bottom: 15px;">${config.desc}</div>
            ${bonusText}
            ${upgradeSection}
        </div>
    `;
}

// Otevření okna se specifickou sekcí stadionu
window.openZoneMenu = function(zone) {
    const oldModal = document.getElementById('building-modal');
    if (oldModal) oldModal.remove();

    const zoneMap = {
        'left': { title: 'Zázemí pro fanoušky', buildings: ['tribune', 'shop'] },
        'center': { title: 'Hrací plocha a Tréninkové centrum', buildings: ['pitch', 'training'] },
        'right': { title: 'Vedení klubu a Skauting', buildings: ['scout'] }
    };

    const currentZone = zoneMap[zone];
    const cardsHtml = currentZone.buildings.map(id => generateBuildingCard(id)).join('');

    const modalHtml = `
        <div id="building-modal" class="ml-selector-overlay" onclick="this.remove()">
            <div class="ml-selector-box" style="max-width: 750px; width: 95%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4b5563; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #fcd34d; margin: 0;">${currentZone.title}</h2>
                    <button class="btn-task" style="padding: 8px 15px; background: #991b1b; font-weight: bold;" onclick="document.getElementById('building-modal').remove()">Zavřít</button>
                </div>
                
                <div class="stadium-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                    ${cardsHtml}
                </div>
                
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// Akční tlačítka pro stavbu
window.startUpgrade = function(buildingId, cost, timeInSeconds) {
    if (playerData.money < cost) return;

    playerData.money -= cost;
    playerData.activeUpgrade = {
        buildingId: buildingId,
        endTime: Date.now() + (timeInSeconds * 1000)
    };

    saveGame();
    updateTopBarUI();
    
    // Zjistíme, do které zóny budova patří, a rovnou do ní okno přenačteme
    let targetZone = 'center';
    if (['tribune', 'shop'].includes(buildingId)) targetZone = 'left';
    else if (['scout'].includes(buildingId)) targetZone = 'right';

    renderStadium(); 
    openZoneMenu(targetZone); 
};

window.finishUpgrade = function() {
    const bId = playerData.activeUpgrade.buildingId;
    playerData.buildings[bId]++;
    
    alert(`Stavba dokončena! Budova je nyní na úrovni ${playerData.buildings[bId]}.`);
    
    playerData.activeUpgrade = null;
    saveGame();

    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn && activeBtn.getAttribute('data-target') === 'stadium') {
        renderStadium();
        const modal = document.getElementById('building-modal');
        if (modal) modal.remove();
    }
};

window.skipUpgrade = function() {
    if(playerData.activeUpgrade) playerData.activeUpgrade.endTime = Date.now();
};

window.collectShopMoney = function() {
    const amount = Math.floor(playerData.shopSafe || 0);
    if (amount > 0) {
        playerData.money += amount;
        playerData.shopSafe = 0;
        saveGame();
        updateTopBarUI();
        alert(`Vybral jsi z obchodu ${amount} 💰!`);
        openZoneMenu('left'); // Znovu načte levou zónu (Tribuny/Obchod), aby se vynulovala vizuální pokladna
        renderStadium();      // Aktualizuje mapu, aby zmizelo oznámení
    } else {
        alert("Pokladna je prázdná, počkej, až se něco prodá!");
    }
};