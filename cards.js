/* =========================================
   🃏 KOMPONENTY PRO HRÁČSKÉ KARTY
========================================= */

window.renderPlayerGroup = function(startIndex, endIndex, role) {
    let html = '';

    for (let i = startIndex; i < endIndex; i++) {
        // Bezpečné načtení hráče (pokud index přesahuje délku pole, player bude null = Volné místo)
        const player = i < playerData.players.length ? playerData.players[i] : null;
        
        // Ochrana proměnných
        const isSelected = (typeof selectedPlayerIndex !== 'undefined' && selectedPlayerIndex === i) ? 'selected-card' : '';
        const sellModeActive = (typeof isSellMode !== 'undefined' && isSellMode);
        
        // Pokud je zapnutý prodej, zamezíme prohazování hráčů kliknutím na kartu (kliká se až na tlačítko dole)
        const onClickAction = sellModeActive ? '' : `handlePlayerClick(${i})`;

        // Vygenerování grafické karty z cards.js
        const cardHtml = window.createGraphicCardHtml(player, i, onClickAction, isSelected);

        let actionButtonsHtml = '';

        // Tlačítka přidáváme jen v případě, že na dané pozici skutečně stojí hráč (není to prázdný slot)
        if (player) {
            // TLAČÍTKA PRO REŽIM PRODEJE (pouze pro střídačku)
            if (sellModeActive && i >= 11) {
                const sellPrice = Math.floor(getPlayerPrice(player) / 2);
                actionButtonsHtml = `
                    <div style="background: rgba(0,0,0,0.8); border: 2px solid #ef4444; padding: 4px; border-radius: 6px; color: #fca5a5; font-weight: bold; width: 100%; text-align: center; box-sizing: border-box; max-width: 240px; margin-top: 6px; box-shadow: 0 3px 5px rgba(0,0,0,0.4);">
                        Prodat za: ${sellPrice} 💰
                    </div>
                    <button class="btn-upgrade" style="width: 100%; max-width: 240px; background: #b91c1c; font-weight: bold; margin-top: 6px; border: 1px solid #7f1d1d;" onclick="sellPlayer(${i})">
                        Prodat hráče
                    </button>
                `;
            } 
            // TLAČÍTKO "DO REZERVY" PRO STŘÍDAČKU (Zobrazí se jen když NENÍ aktivní prodej)
            else if (i >= 11 && !sellModeActive) {
                actionButtonsHtml = `
                    <button class="btn-reserve-action" style="width: 100%; max-width: 240px; margin-top: 6px; padding: 8px 4px; font-size: 0.85rem; font-weight: bold; border-radius: 6px; box-shadow: 0 3px 5px rgba(0,0,0,0.3); background-color: #3b82f6;" onclick="event.stopPropagation(); sendToReserve(${i})">
                        Do rezervy
                    </button>
                `;
            }
        }

        // Zabalení karty a případných tlačítek do společného vycentrovaného sloupce
        html += `
            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 15px;">
                ${cardHtml}
                ${actionButtonsHtml}
            </div>
        `;
    }
    
    return html;
};

function renderGraphicPlayerCard(player, index, leagueName = '') {
    if (!player) {
        return `<div class="graphic-card empty-slot" onclick="handleMLPlayerClick('${leagueName}', ${index})">
                    <div style="display:flex; justify-content:center; align-items:center; height:100%; color:gray;">Volné místo</div>
                </div>`;
    }

    const posConfig = POSITION_STATS[player.position];
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };
    const totalStats = posConfig.stats.reduce((sum, s) => sum + player.stats[s], 0);
    const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
    
    // Získáme správný obrázek pozadí
    const bgImage = getCardBackgroundImage(player.rank, player.position);

    // Vykreslíme přesně 4 staty do papírové tabulky
    let statsHtml = '';
    posConfig.stats.slice(0, 4).forEach(s => {
        statsHtml += `
            <div class="gc-stat-item">
                <span>${statLabels[s]}</span>
                <span class="gc-stat-val">${player.stats[s]}</span>
            </div>
        `;
    });

    return `
        <div class="graphic-card" style="background-image: url('${bgImage}');" onclick="handleMLPlayerClick('${leagueName}', ${index})">
            
            <div class="gc-level-badge">${player.level}</div>
            
            <div class="gc-header">
                <div class="gc-stars">${starsHtml}</div>
                <div class="gc-name">${player.name}</div>
                <div class="gc-position">${posConfig.label}</div>
            </div>

            <div class="gc-rank-plank">${player.rank}</div>

            <div class="gc-stats-grid">
                ${statsHtml}
            </div>

            <div class="gc-total-plank">CELKOVÁ SÍLA: ${totalStats}</div>
            
        </div>
    `;
}


// --- POMOCNÁ FUNKCE PRO VÝBĚR POZADÍ ---
window.getCardBackgroundImage = function(rank, position) {
    let material = 'drevo';
    if (rank === 'Srdcař' || rank === 'Ligový borec') material = 'bronz';
    if (rank === 'Reprezentant' || rank === 'Legenda') material = 'zlato';

    let posStr = 'utok';
    if (position === 'gk') posStr = 'brana';
    if (position === 'def') posStr = 'obrana';
    if (position === 'mid') posStr = 'zaloha';

    return `images/cards/${material}_${posStr}.png`;
};

// --- UNIVERZÁLNÍ GENERÁTOR GRAFICKÉ KARTY ---
window.createGraphicCardHtml = function(player, index, onClickAction, isSelectedClass = '', isTraining = false) {
    // Pokud na pozici nikdo není (prázdný slot)
    if (!player) {
        return `
            <div class="graphic-card empty-slot ${isSelectedClass}" onclick="${onClickAction}">
                <div>Volné místo</div>
            </div>`;
    }

    const posConfig = POSITION_STATS[player.position];
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };
    const totalStats = posConfig.stats.reduce((sum, s) => sum + player.stats[s], 0);
    
    // Generování přesně 5 hvězd (plné vs. prázdné)
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
        if (i < player.stars) {
            starsHtml += '<span class="star-filled">★</span>';
        } else {
            starsHtml += '<span class="star-empty">★</span>';
        }
    }
    
    const bgImage = window.getCardBackgroundImage(player.rank, player.position);

    // --- ZABARVENÍ LEVELU PŘI MAXIMU ---
    const isMaxLevel = player.maxLevel > 0 && player.level >= player.maxLevel;
    // Pokud je max level, přepíšeme bílou barvu na zlatou
    const levelColorStyle = isMaxLevel ? 'color: #f59e0b;' : '';

    let statsHtml = '';
    let bottomPlankHtml = '';
    let xpBarHtml = '';

    // --- STATISTIKY (Teď jsou už 100% stejné pro všechny režimy!) ---
    posConfig.stats.slice(0, 4).forEach(s => {
        const val = player.stats[s];
        const isMaxed = val >= player.statCap;
        const valColor = isMaxed ? '#036736' : '#1a0f0a';
        const displayVal = isMaxed ? `${val}` : val;

        statsHtml += `
            <div class="gc-stat-item">
                <span>${statLabels[s]}</span>
                <span class="gc-stat-val" style="color: ${valColor};">${displayVal}</span>
            </div>
        `;
    });

    // --- REŽIM TRÉNINKU (Lišta a prkno s volnými body) ---
    if (isTraining) {
        const unspentColor = player.unspentPoints > 0 ? '#10b981' : '#fdf5e6';
        bottomPlankHtml = `<div class="gc-total-plank" style="color: ${unspentColor};">VOLNÉ BODY: ${player.unspentPoints}</div>`;

        let xpPercentage = 100;
        if (!isMaxLevel && player.maxLevel > 0) {
            xpPercentage = Math.floor((player.xp / (player.level * 100)) * 100);
        }
        
        if (player.stars > 0) {
            xpBarHtml = `
            <div class="gc-xp-bar-wrapper" title="Zkušenosti: ${player.xp} / ${player.level * 100}">
                <div class="gc-xp-bar-fill ${isMaxLevel ? 'maxed' : ''}" style="width: ${xpPercentage}%;"></div>
            </div>`;
        }
    } 
    // --- NORMÁLNÍ REŽIM ---
    else {
        bottomPlankHtml = `<div class="gc-total-plank">CELKOVÁ SÍLA: ${totalStats}</div>`;
    }

    // --- FINÁLNÍ SLOŽENÍ KARTY ---
    return `
        <div class="graphic-card ${isSelectedClass}" style="background-image: url('${bgImage}');" onclick="${onClickAction}">
            <div class="gc-level-badge" style="${levelColorStyle}">${player.level}</div>
            <div class="gc-header">
                <div class="gc-stars">${starsHtml}</div>
                <div class="gc-name">${player.name}</div>
                <div class="gc-position">${posConfig.label}</div>
            </div>
            ${xpBarHtml}
            <div class="gc-rank-plank">${player.rank}</div>
            <div class="gc-stats-grid">
                ${statsHtml}
            </div>
            ${bottomPlankHtml}
        </div>
    `;
};