/* =========================================
   🃏 KOMPONENTY PRO HRÁČSKÉ KARTY
========================================= */

window.renderPlayerGroup = function(startIndex, endIndex, role) {
    let html = '';
    const statLabels = {
        atk: 'Útok', def: 'Obrana', spd: 'Rychlost', 
        str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář'
    };

    for (let i = startIndex; i < endIndex; i++) {
        if (i >= playerData.players.length) {
            html += `
                <div class="player-card empty-slot">
                    <div>Volné místo</div>
                </div>
            `;
            continue;
        }

        const player = playerData.players[i];
        const posConfig = POSITION_STATS[player.position];
        const totalStats = posConfig.stats.reduce((sum, s) => sum + player.stats[s], 0);
        
        // Ochrana pro případ, že tyto proměnné nejsou na dané stránce definované
        const isSelected = (typeof selectedPlayerIndex !== 'undefined' && selectedPlayerIndex === i) ? 'selected' : '';
        const sellModeActive = (typeof isSellMode !== 'undefined' && isSellMode);
        
        const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
        const sellPrice = Math.floor(getPlayerPrice(player) / 2);
        
        // Získání textu levelu z tvé hry (nebo fallback na player.level)
        const levelText = typeof getPlayerLevelText === 'function' ? getPlayerLevelText(player) : `Lvl. ${player.level || 1}`;
        
        html += `
            <div class="player-card ${posConfig.colorClass} ${isSelected}" onclick="handlePlayerClick(${i})">
                <div class="player-name">${player.name}</div>
                
                <div class="player-position-row">${posConfig.label}</div>
                
                <div class="player-info-line">
                    <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | ${levelText} ${starsHtml}
                </div>
                
                <div class="player-nationality">Národnost: ${player.nationality}</div>

                ${sellModeActive ? `<div class="price-tag sell">Prodat za: ${sellPrice} 💰</div>` : ''}
                ${i >= 11 && !sellModeActive ? `<button class="btn-reserve-action btn-to-reserve" onclick="event.stopPropagation(); sendToReserve(${i})">Do rezervy</button>` : ''}

                <div class="player-stats">
                    ${posConfig.stats.map(statKey => `
                        <div class="stat-item highlighted">
                            <span>${statLabels[statKey]}:</span> <span>${player.stats[statKey]}</span>
                        </div>
                    `).join('')}
                    
                    <div class="stat-total">
                        <span>Celková síla:</span> 
                        <span style="font-weight: bold;">${totalStats}</span>
                    </div>                
                </div>
            </div>
        `;
    }
    return html;
};