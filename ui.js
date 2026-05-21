// --- TRÉNINKOVÉ HŘIŠTĚ --- //
function renderTraining() {
    const mainContent = document.getElementById('main-content');

    const trainablePlayers = playerData.players.filter(p => p.unspentPoints > 0);
    const practicePlayers = playerData.players.filter(p => p.unspentPoints === 0 && p.level < p.maxLevel && p.stars > 0);
    const maxedPlayers = playerData.players.filter(p => p.unspentPoints === 0 && (p.level >= p.maxLevel || p.stars === 0));

    // Chytrá funkce: Pokud je isTrainableGroup true, přidá pod kartu tlačítko "Přiřadit"
    const renderTrainingCards = (players, isTrainableGroup = false) => {
        return players.map(p => {
            const cardHtml = window.createGraphicCardHtml(p, null, '', '', true);
            
            if (isTrainableGroup) {
                return `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        ${cardHtml}
                        <button class="btn-upgrade" style="width: 100%; max-width: 240px; background: #10b981; font-weight: bold; padding: 10px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.4);" onclick="assignRandomPoints('${p.id}')">
                            Přiřadit body
                        </button>
                    </div>
                `;
            } else {
                return cardHtml;
            }
        }).join('');
    };

    mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('training')">Nápověda</button>
        <div class="text-center">
            <h2 class="section-title">Tréninkové hřiště</h2>
        </div>
        
        <h3 style="color: #fdf5e6; background: rgba(16, 185, 129, 0.8); padding: 5px 15px; border-radius: 5px; display: inline-block;">Hráči připravení k tréninku</h3>
        
        <div class="player-list" style="margin-bottom: 30px; align-items: flex-start;">
            ${trainablePlayers.length > 0 
                ? renderTrainingCards(trainablePlayers, true) // TADY PŘIDÁME TRUE PRO TLAČÍTKO
                : '<p style="color: #4b5563; font-style: italic; background: #fdf5e6; padding: 10px; border-radius: 5px; width: 100%; text-align: center;">Nikdo aktuálně nemá volné tréninkové body.</p>'}
        </div>

        <details class="collapsible-box blue" open>
            <summary class="collapsible-header">
                Hráči, kteří sbírají zápasovou praxi (Rozbalit) ▾
            </summary>
            <div class="player-list" style="margin-top: 20px; opacity: 0.95; align-items: flex-start;">
                ${practicePlayers.length > 0 
                    ? renderTrainingCards(practicePlayers, false) 
                    : '<p style="color: #4b5563; font-style: italic; background: #fdf5e6; padding: 10px; border-radius: 5px; width: 100%; text-align: center;">Všichni aktivní hráči čekají na trénink.</p>'}
            </div>
        </details>

        ${maxedPlayers.length > 0 ? `
        <details class="collapsible-box">
            <summary class="collapsible-header">
                Hráči na maximální úrovni (Rozbalit) ▾
            </summary>
            <div class="player-list" style="opacity: 0.8; margin-top: 20px; align-items: flex-start;">
                ${renderTrainingCards(maxedPlayers, false)}
            </div>
        </details>
        ` : ''}
    `;
}

// --- NÁHODNÉ PŘIŘAZENÍ TRÉNINKOVÝCH BODŮ ---
window.assignRandomPoints = function(playerId) {
    const player = playerData.players.find(p => p.id === playerId);
    if (!player || player.unspentPoints <= 0) return;

    const posConfig = POSITION_STATS[player.position];
    let pointsAssigned = 0;

    // Dokud má hráč body ke spálení
    while (player.unspentPoints > 0) {
        // Najdeme jen ty staty, které ještě nejsou na maximálním stropu (Cap)
        const availableStats = posConfig.stats.filter(s => player.stats[s] < player.statCap);

        // Pokud už má hráč všechno na max, cyklus ukončíme
        if (availableStats.length === 0) {
            alert(`Hráč ${player.name} má všechny klíčové vlastnosti na maximu (${player.statCap}) pro svůj rank! Další body mu v tuto chvíli nelze přiřadit.`);
            break; 
        }

        // Vybereme náhodný stat ze zbývajících volných a přidáme mu bod
        const randomStat = availableStats[Math.floor(Math.random() * availableStats.length)];
        
        player.stats[randomStat]++;
        player.unspentPoints--;
        pointsAssigned++;
    }

    // Pokud se něco vytrénovalo, uložíme a překreslíme
    if (pointsAssigned > 0) {
        saveGame();
        renderTraining(); // Okamžitě se projeví změna na kartě
    }
};

// ---  ŠATNA  ---
function renderLockerRoom() {
    const mainContent = document.getElementById('main-content');
    const currentScroll = window.scrollY;
    const reserveBox = document.querySelector('.reserve-content');
    const wasReserveOpen = reserveBox ? reserveBox.classList.contains('active') : false;
    const layout = FORMATIONS_LAYOUT[playerData.formation];

    const formationHints = {
        '4-4-2': 'Zlatá střední cesta. Výborně si poradí s týmy, které hrají ustrašeného zanďoura.',
        '4-3-3': 'Všechno dopředu! Těžká noční můra pro týmy hrající opatrný vyvážený fotbal.',
        '5-4-1': 'Zaparkovat autobus před bránu je nejlepší proti týmům, které hrají bezhlavý útočný fotbal!'
    };
    const currentHint = formationHints[playerData.formation];

    const sellBtnClass = isSellMode ? 'btn-sell-active' : 'btn-sell-inactive';
    const sellBtnText = isSellMode ? '❌ Zrušit prodej' : '💰 Režim prodeje';

    mainContent.innerHTML = `
        <div class="text-center">
            <button class="help-btn-corner" onclick="showHelp('locker-room')">Nápověda</button>
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
                <h3 class="bench-title">Střídačka (Kapacita: ${playerData.players.length - 11}/7)</h3>
                <button onclick="toggleSellMode()" class="btn-sell-mode ${sellBtnClass}">
                    ${sellBtnText}
                </button>
            </div>
            ${isSellMode ? '<p class="sell-warning-text">Klikni na hráče, kterého chceš vyhodit z klubu.</p>' : ''}
            <div class="player-list">${renderPlayerGroup(11, 18, 'bench')}</div>
        </div>

        <div class="reserve-accordion">
            <div class="reserve-header" onclick="document.querySelector('.reserve-content').classList.toggle('active')">
                <span>📦 REZERVA TÝMU (Hráči mimo aktivní kádr)</span>
                <span>▼</span>
            </div>
            <div class="reserve-content ${wasReserveOpen ? 'active' : ''}" style="display: ${wasReserveOpen ? 'block' : 'none'}; padding: 15px; background: rgba(0,0,0,0.5);">
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
    setTimeout(() => window.scrollTo(0, currentScroll), 0);
}

function renderScouting() {
    const mainContent = document.getElementById('main-content');
    
    // Inicializace dat pro jistotu
    if (!playerData.scoutedPlayers) playerData.scoutedPlayers = [];
    if (!playerData.lastScoutRefresh) playerData.lastScoutRefresh = 0;
    if (!playerData.unlockedScouts) playerData.unlockedScouts = [];
    if (!playerData.sideScoutedPlayers) playerData.sideScoutedPlayers = {};
    
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

    // --- VYKRESLENÍ HRÁČŮ OD HLAVNÍHO SKAUTA (S VYUŽITÍM CARDS.JS) ---
    const playersHtml = playerData.scoutedPlayers.map((player, index) => {
        const price = getPlayerPrice(player);
        const canAfford = playerData.money >= price;
        
        // Vygenerování samotné karty (třetí parametr je prázdný, na skautovací kartu se nekliká)
        const cardHtml = window.createGraphicCardHtml(player, index, '', '');

        // Zabalíme kartu a přidáme pod ni tlačítka s pevnou šířkou (aby lícovala s kartou)
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                ${cardHtml}
                <div style="background: rgba(0,0,0,0.8); border: 2px solid #f59e0b; padding: 6px 15px; border-radius: 6px; color: #fcd34d; font-weight: bold; width: 100%; text-align: center; box-sizing: border-box; max-width: 240px; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
                    Cena: ${price} 💰
                </div>
                <button class="btn-upgrade" style="width: 100%; max-width: 240px; font-weight: bold;" onclick="buyPlayer(${index}, ${price})" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? 'Koupit hráče' : 'Nedostatek financí'}
                </button>
            </div>
        `;
    }).join('');

    // --- VYKRESLENÍ VEDLEJŠÍCH SKAUTŮ ---
    let sideScoutsHtml = '<hr style="margin: 40px 0; border-color: #374151;">';
    
    // Vycentrovaný nadpis a odpočet
    sideScoutsHtml += `
        <button class="help-btn-corner" onclick="showHelp('scouting')">Nápověda</button>
        <div style="text-align: center; margin-bottom: 25px;">
            <h2 class="section-title" style="display: inline-block;">Vedlejší skauti (Lokální hledání)</h2>
            <div style="margin-top: 10px; font-weight: bold; color: #fcd34d; text-shadow: 1px 1px 2px black;">
                Další skautování proběhne za: <span id="side-scout-timer" class="scout-timer-text">Počítám...</span>
            </div>
            <p style="color: #f3f4f6; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); margin-top: 10px; font-size: 0.95rem; max-width: 800px; margin-left: auto; margin-right: auto;">
                Najmi si specialisty na konkrétní nižší soutěže. Zůstanou s tebou navždy a každých 24 hodin ti přivedou přesně 3 nové hráče svého ranku. Ideální pro doplňování minilig!
            </p>
        </div>
    `;

    const sideRanks = [0, 1, 2, 3]; // Indexy pro Kopyto, Amatér, Srdcař, Borec
    const maxAllowedSideRank = window.getMaxAllowedSideScoutRank();

    sideRanks.forEach(rankIdx => {
        const rankObj = PLAYER_RANKS[rankIdx];
        const isUnlocked = playerData.unlockedScouts.includes(rankIdx);
        const isAllowedToBuy = rankIdx <= maxAllowedSideRank;

        if (isUnlocked) {
            // SKAUT JE ODEMČENÝ -> ZOBRAZÍME JEHO HRÁČE (S VYUŽITÍM CARDS.JS)
            const sPlayers = playerData.sideScoutedPlayers[rankIdx] || [];
            let sPlayersCards = sPlayers.map((player, pIndex) => {
                const price = getPlayerPrice(player);
                const canAfford = playerData.money >= price;
                
                // Vygenerování grafické karty
                const cardHtml = window.createGraphicCardHtml(player, pIndex, '', '');

                // Opět zabaleno do úhledného sloupce s cenou a tlačítkem (lehce zmenšeno transform: scale)
                return `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; transform: scale(0.95); transform-origin: top center;">
                        ${cardHtml}
                        <div style="background: rgba(0,0,0,0.8); border: 2px solid #6366f1; padding: 6px 15px; border-radius: 6px; color: #c7d2fe; font-weight: bold; width: 100%; text-align: center; box-sizing: border-box; max-width: 240px; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
                            Cena: ${price} 💰
                        </div>
                        <button class="btn-upgrade" style="width: 100%; max-width: 240px; background: #4f46e5; font-weight: bold;" onclick="buySideScoutedPlayer(${rankIdx}, ${pIndex}, ${price})" ${!canAfford ? 'disabled' : ''}>
                            ${canAfford ? 'Koupit hráče' : 'Nedostatek financí'}
                        </button>
                    </div>
                `;
            }).join('');

            sideScoutsHtml += `
                <div style="margin-bottom: 30px; background: rgba(17, 24, 39, 0.7); padding: 15px; border-radius: 8px; border: 1px solid #4b5563;">
                    <h3 style="color: #fcd34d; margin: 0 0 15px 0; text-shadow: 1px 1px 2px black;"> Skaut na rank: ${rankObj.name}</h3>
                    ${sPlayers.length > 0 ? `<div class="player-list" style="align-items: flex-start;">${sPlayersCards}</div>` : '<p style="color:#e5e7eb; text-align: center; font-style: italic;">Skaut obchází hospody, počkej na další refresh.</p>'}
                </div>
            `;
        } else {
            // SKAUT JE ZAMČENÝ -> ZOBRAZÍME TLAČÍTKO K NÁKUPU (NEBO ZÁMEK)
            const scoutPrice = 1500; // 1 mince
            const canAffordScout = playerData.money >= scoutPrice;

            let actionHtml = '';
            if (isAllowedToBuy) {
                actionHtml = `<button class="btn-upgrade" style="background: #059669; padding: 8px 15px; font-weight: bold;" onclick="unlockSideScout(${rankIdx})" ${!canAffordScout ? 'disabled' : ''}>Najmout trvale (${scoutPrice} 💰)</button>`;
            } else {
                actionHtml = `<button class="btn-upgrade" disabled style="background: #374151; color: #9ca3af; cursor: not-allowed; padding: 8px 15px; border: 1px solid #4b5563;">Odemkne se ve vyšší divizi</button>`;
            }

            sideScoutsHtml += `
                <div style="margin-bottom: 15px; background: rgba(31, 41, 55, 0.75); padding: 15px; border-radius: 8px; border: 1px dashed #6b7280; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3 style="color: #f3f4f6; margin: 0 0 5px 0; text-shadow: 1px 1px 2px black;">🔒 Expert na rank: ${rankObj.name}</h3>
                        <div style="font-size: 0.9rem; color: #d1d5db; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Přivede 3 hráče tohoto ranku vždy při obměně nabídky.</div>
                    </div>
                    <div>
                        ${actionHtml}
                    </div>
                </div>
            `;
        }
    });

    // SLOŽENÍ CELÉHO OKNA
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

                ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" style="margin-top: 15px; padding: 5px 10px;" onclick="forceScoutRefresh()">[TEST] Vygenerovat hned</button>` : ''}
            </div>
        </div>
        
        <div class="player-list" style="align-items: flex-start;">
            ${playersHtml}
        </div>

        ${sideScoutsHtml}
    `;

    // Aktualizujeme oba odpočty najednou
    updateTimerUI('scout-timer', nextRefresh);
    updateTimerUI('side-scout-timer', nextRefresh);
}

function renderMatches() {
 const mainContent = document.getElementById('main-content');

 const myTeam = playerData.league.find(t => t.isPlayer);
 const matchesLeft = 36 - myTeam.z; // 36 je celkový počet zápasů

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

const prepareTooltip = "Aktivuj přípravu, dokud je čas. Zvýšíš tím šanci na výhru a zkušenosti hráčů.";

const prepareBtnHtml = playerData.isPrepared 
    ? `<button class="btn-prepare-wood" disabled title="${prepareTooltip}">Tým je plně připraven! ✓</button>`
    : `<button class="btn-prepare-wood" onclick="prepareForMatch()" title="${prepareTooltip}">Připravit se na zápas (+10% Síly)</button>`;

// --- 2. APLIKACE DO HTML ---
mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('match')">Nápověda</button>
        
        <div class="text-center" style="margin-bottom: 25px; position: relative; z-index: 10;">
            <h2 class="section-title">${divName}</h2>
        </div>
        
        <div class="season-remaining-board" style="position: relative; z-index: 10;">
            ⏳ Do konce sezóny zbývá: <span style="color: white;">${matchesLeft} zápasů</span>
        </div>
        

        <div class="match-graphic-board">
        <h3 style="color: #fcd34d;">NADCHÁZEJÍCÍ ZÁPAS</h3>
            
        <div style="font-size: 1.3rem; margin-bottom: 15px; font-weight: bold; text-shadow: 1px 1px 3px black;">
            <span style="color: #60a5fa;">${playerData.league[myTeamIndex].name}</span> 
            <span style="color: #9ca3af; font-size: 0.9rem; margin: 0 10px;">vs</span> 
            <span style="color: #ef4444;">${opponent.name}</span>
        </div>
            
        <div class="huge-timer" style="margin-bottom: 15px;">
            <span id="match-timer" style="font-size: 2.8rem; font-weight: bold; color: #f59e0b; font-family: monospace; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);">Počítám...</span>
        </div>
            
        <div class="match-buttons-row">
            ${window.IS_TEST_MODE ? `<button class="btn-task btn-test btn-play-now" onclick="skipMatchTime()">[TEST] Odehrát hned</button>` : ''}
            ${window.IS_TEST_MODE ? `<button class="btn-task btn-test btn-sim-season" onclick="testSimulateFullSeason()">⏩ [TEST] Simulovat sezónu</button>` : ''}
        </div>
    </div>

    <div class="prepare-section-container" style="max-width: 500px; margin: 0 auto 30px auto; text-align: center;">
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

// --- POŠTA (Řádkový styl s vycentrovanými prvky) ---
window.renderMail = function() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.mail || playerData.mail.length === 0) {
        mainContent.innerHTML = `
            <button class="help-btn-corner" onclick="showHelp('mail')">Nápověda</button>
            <div class="text-center">
                <h2 class="section-title">Doručená pošta</h2>
            </div>
            <div class="mail-container" style="text-align: center; color: #fdf5e6; padding: 40px;">
                Schránka je zatím prázdná, trenére.
            </div>`;
        return;
    }

    // Spočítáme jen NEpřečtené zápasové reporty
    const unreadMatches = playerData.mail.filter(m => !m.read && !m.type && m.result).length;

    // Menší, vycentrované tlačítko vložené do kontejneru pošty
    const playAllHtml = unreadMatches > 0 
        ? `<div class="mail-top-actions">
               <button class="btn-play-all-small" onclick="playAllMail()">▶ Přehrát vše (${unreadMatches})</button>
           </div>` 
        : ``;

    const mailHtml = playerData.mail.map((m, index) => {
        const isUnread = !m.read;
        const unreadClass = isUnread ? 'unread' : '';

        // --- 1. ŽÁDOST O PŘIPOJENÍ DO MINILIGY ---
        if (m.type === "ml_invite") {
            return `
            <div class="mail-row ${unreadClass}" style="border-left-color: #f59e0b;">
                <div class="mail-info">
                    <div class="mail-title">${m.subject}</div>
                    <div class="mail-date">${m.date}</div>
                    <div class="mail-text">${m.text}</div>
                </div>
                <div class="mail-action" style="flex-direction: column; justify-content: center; min-width: 100px; gap: 5px;">
                    <button class="btn-mail-text accept" style="width: 100%;" onclick="acceptMLInvite('${m.id}', '${m.applicantUid}', '${m.applicantName}', '${m.leagueName}', '${m.leagueRank}')">✅ Přijmout</button>
                    <button class="btn-mail-text reject" style="width: 100%;" onclick="rejectMLInvite('${m.id}', '${m.applicantUid}', '${m.leagueName}')">❌ Zamítnout</button>
                </div>
            </div>
            `;
        }

        // --- 2. KLASICKÁ TEXTOVÁ ZPRÁVA (S IKONKOU KOŠE) ---
        if (m.text && !m.result) {
            return `
            <div class="mail-row ${unreadClass}" style="border-left-color: #3b82f6;">
                <div class="mail-info">
                    <div class="mail-title">${m.subject}</div>
                    <div class="mail-date">${m.date}</div>
                    <div class="mail-text">${m.text}</div>
                </div>
                <div class="mail-action">
                    <button class="btn-icon delete" title="Smazat zprávu" onclick="playerData.mail.splice(${index}, 1); saveGame(); renderMail();">
                        🗑️
                    </button>
                </div>
            </div>
            `;
        }

        // --- 3. VIDEO ZÁZNAM ZÁPASU (S Kulatým Tlačítkem) ---
        const scoreDisplay = m.read ? m.result : '? : ?';
        let scoreColor = '#4e342e'; 
        let borderInline = ''; // Pro nepřečtené zprávy necháme HTML čisté, postará se o to CSS třída .unread

        // Nastavíme barvu levé čáry JENOM u přečtených zápasů (podle výsledku)
        if (m.read && m.result && m.result.includes(':')) {
            const [myGoals, botGoals] = m.result.split(':').map(Number);
            let borderColor = '#9ca3af'; // Výchozí šedá
            
            if (myGoals > botGoals) {
                scoreColor = '#166534'; // Zelený text
                borderColor = '#10b981'; // Zelená čára
            } else if (myGoals < botGoals) {
                scoreColor = '#b91c1c'; // Červený text
                borderColor = '#ef4444'; // Červená čára
            } else {
                scoreColor = '#4b5563'; // Šedý text
                borderColor = '#6b7280'; // Šedá čára
            }
            borderInline = `style="border-left-color: ${borderColor};"`;
        } else if (m.read) {
            borderInline = `style="border-left-color: #9ca3af;"`; // Pojistka pro přečtené bez skóre
        }

        const iconClass = isUnread ? 'play' : 'replay';
        const iconSymbol = isUnread ? '▶' : '↻'; 

        return `
        <div class="mail-row ${unreadClass}" ${borderInline}>
            <div class="mail-info">
                <div class="mail-title">${m.subject}</div>
                <div class="mail-date">${m.date}</div>
            </div>
            
            <div class="mail-score-box" style="color: ${scoreColor};">
                ${scoreDisplay}
            </div>
            
            <div class="mail-action">
                <button class="btn-icon ${iconClass}" title="${isUnread ? 'Přehrát zápas' : 'Znovu přehrát'}" onclick="openMatchReport(${index})">
                    ${iconSymbol}
                </button>
            </div>
        </div>
        `;
    }).join('');

    mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('mail')">Nápověda</button>
        <div class="text-center">
            <h2 class="section-title">Doručená pošta</h2>
        </div>
        <div class="mail-container">
            ${playAllHtml}
            ${mailHtml}
        </div>
    `;
    window.updateMailNotification();
};

// NOTIFIKACE PRO POŠTU
window.updateMailNotification = function() {
    // Najdeme navigační tlačítko pošty
    const mailBtn = document.querySelector('.nav-btn[data-target="mail"]');
    if (!mailBtn) return; // Pokud z nějakého důvodu menu ještě není, končíme

    // Zkontrolujeme, zda existuje alespoň 1 nepřečtená zpráva
    const hasUnread = playerData.mail && playerData.mail.some(m => m.read === false);

    // Zkusíme najít existující tečku, nebo ji vytvoříme
    let badge = mailBtn.querySelector('.mail-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'mail-badge';
        mailBtn.appendChild(badge);
    }

    // Pokud je nepřečtená zpráva, tečku rozsvítíme
    if (hasUnread) {
        badge.classList.add('active');
    } else {
        badge.classList.remove('active');
    }
};

// --- CHYTRÉ HROMADNÉ PŘEHRÁNÍ VÝSLEDKŮ ---
window.playAllMail = function() {
    if (!playerData.mail) return;
    
    let changed = false;
    playerData.mail.forEach(m => {
        if (!m.read && !m.type && m.result) {
            m.read = true;
            changed = true;
        }
    });
    
    if (changed) {
        saveGame();
        renderMail(); 
    }
};

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

    const commentHtml = `
        <div style="display: flex; margin-bottom: 12px; background: ${bgColor}; padding: 8px; border-radius: 5px; border-left: 3px solid ${textColor};">
            <div style="min-width: 45px; font-weight: bold; color: ${textColor};">${action.min}'</div>
            <div style="margin-right: 10px;">${icon}</div>
            <div style="flex: 1; color: ${textColor};">${action.text}</div>
        </div>
    `;
    
    // POUŽITÍ afterbegin PRO VLOŽENÍ NAHORU!
    replayWindow.insertAdjacentHTML('afterbegin', commentHtml);
}

// --- FUNKCE PRO ZRYCHLENÍ ZÁZNAMU ---
// Globální proměnné pro záznam
window.currentReplayIndex = 0;
window.isReplayFast = false; 

// --- POMOCNÉ FUNKCE PRO OVLÁDÁNÍ ZÁZNAMU (OPRAVENÝ TOGGLE) ---
window.speedUpReplay = function() {
    if (!window.matchReplayInterval) return;

    // 1. Přepneme stav (True / False)
    window.isReplayFast = !window.isReplayFast;

    // 2. Zastavíme aktuálně běžící časovač
    clearInterval(window.matchReplayInterval);

    // 3. Spočítáme novou rychlost (Standard: 2500ms, Zrychleno o 150%: 1000ms)
    const newSpeed = window.isReplayFast ? 1000 : 2500;

    // 4. Nastartujeme nový interval s upravenou rychlostí
    window.matchReplayInterval = setInterval(() => {
        const replayWindow = document.getElementById('replay-window');
        if (!replayWindow) { clearInterval(window.matchReplayInterval); return; }
        
        if (window.currentReplayIndex < window.currentMatchMsg.content.length) { 
            renderReplayAction(window.currentMatchMsg.content[window.currentReplayIndex]); 
            window.currentReplayIndex++; 
        } else { 
            finishMatchReplay(); 
        }
    }, newSpeed);

    // 5. Grafická reakce tlačítka a změna textu
    // Najdeme tlačítko podle jeho onclick atributu (jelikož nemá ID)
    const btnSpeed = document.querySelector('button[onclick="speedUpReplay()"]');
    if (btnSpeed) {
        if (window.isReplayFast) {
            btnSpeed.innerHTML = "⏪ Zpomalit";
            btnSpeed.classList.add('pressed'); // Přidá stisknutý styl z CSS
        } else {
            btnSpeed.innerHTML = "⏩ Zrychlit";
            btnSpeed.classList.remove('pressed'); // Odebere stisknutý styl
        }
    }
};

window.skipReplay = function() {
    if (!window.matchReplayInterval) return;
    clearInterval(window.matchReplayInterval);

    const replayWindow = document.getElementById('replay-window');
    if (!replayWindow) return;

    // Okamžitě vykreslíme zbytek zápasu
    while (window.currentReplayIndex < window.currentMatchMsg.content.length) {
        renderReplayAction(window.currentMatchMsg.content[window.currentReplayIndex]);
        window.currentReplayIndex++;
    }

    finishMatchReplay();
};

// --- KLUBOVÝ FANSHOP ---
window.renderShop = function() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.position = 'relative';

    mainContent.innerHTML = `
        <div style="position: relative; z-index: 10; text-align: center; margin-bottom: 15px; pointer-events: none;">
            <button class="help-btn-corner" onclick="showHelp('shop')" style="pointer-events: auto;">Nápověda</button>
            <h2 class="section-title" style="text-shadow: 2px 2px 5px rgba(0,0,0,0.8);">Klubový Fanshop</h2>
            <p class="stadium-subtitle" style="text-shadow: 1px 1px 3px black; font-weight: bold; color: #fdf5e6;">Klikni na pult nebo regál pro správu předmětů.</p>
        </div>
        
        <div class="interactive-stadium-container">
            
            <div class="stadium-click-zone" 
                 onclick="openInventoryMenu()" 
                 style="top: 15%; left: 5%; width: 40%; height: 70%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">Tvoje zakoupené předměty</strong>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Týmový trezor</div>
                </div>
            </div>

            <div class="stadium-click-zone" 
                 onclick="openShopMenu()" 
                 style="top: 10%; left: 65%; width: 35%; height: 80%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">Denní nabídka předmětů</strong>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Nové zboží za:</div>
                    <div class="zone-timer" id="zone-timer-shop" style="color: #10b981;">Počítám...</div>
                </div>
            </div>
            
        </div>
    `;
};

// Vyskakovací okno s předměty (Fanshop)
window.openShopMenu = function() {
    const oldModal = document.getElementById('shop-modal');
    if (oldModal) oldModal.remove();

    let itemsHtml = '';

    if (!playerData.dailyShopItems || playerData.dailyShopItems.length === 0) {
        itemsHtml = `
            <div class="info-box" style="margin: 30px auto; max-width: 500px; text-align: center; width: 100%;">
                <p style="font-style: italic; font-size: 1.1rem;">"Dneska už máme vyprodáno, trenére. Stavte se zítra."</p>
                ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" style="margin-top: 15px;" onclick="refreshDailyShop(true); openShopMenu();"> 
                    📦 [TEST] Obnovit nabídku ihned 
                </button>` : ''}
            </div>
        `;
    } else {
        itemsHtml = playerData.dailyShopItems.map((item, index) => {
            const canAfford = playerData.money >= item.currentPrice;

            const roleLabels = { att: '⚔️ Útočníky', mid: '🧭 Záložníky', def: '🛡️ Obránce', gk: '🧤 Brankáře' };
            const roleText = roleLabels[item.role] || 'Neznámé';

            return `
                <div class="shop-item-card">
                    <div>
                        <div class="shop-item-title">${item.name}</div>
                        
                        <div style="font-size: 0.8rem; color: #60a5fa; margin-bottom: 5px; font-weight: bold; text-transform: uppercase;">
                            Pro: ${roleText}
                        </div>
                        
                        <div class="shop-img-container">
                            <!-- AUTOMATICKÉ NAČÍTÁNÍ OBRÁZKU PODLE ID -->
                            <img src="images/items/${item.id}.png" alt="${item.name}" onerror="this.onerror=null; this.src='images/items/triko.png';">
                            <span class="shop-item-tooltip">${item.desc}</span>
                        </div>
                    </div>
                    
                    <div>
                        <div class="shop-item-duration" style="margin-bottom: 10px;">
                            ⏳ Vydrží: <strong>${item.duration} zápasů</strong>
                        </div>
                        
                        <button class="btn-upgrade" style="width: 100%; padding: 12px 5px; font-size: 0.95rem; display: flex; justify-content: center; align-items: center; gap: 6px;" onclick="buyItem(${index})" ${!canAfford ? 'disabled' : ''}>
                            <span>${canAfford ? 'Koupit za' : 'Nedostatek:'}</span>
                            <strong style="color: #fcd34d; font-size: 1.1rem;">${item.currentPrice} 💰</strong>
                        </button>
                        
                        ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" style="width: 100%; padding: 5px; font-size: 0.75rem; margin-top: 5px;" onclick="buyItem(${index}, true)">
                            [TEST] Koupit ZDARMA
                        </button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    const modalHtml = `
        <div id="shop-modal" class="ml-selector-overlay" onclick="this.remove()">
            <div class="ml-selector-box" style="max-width: 750px; width: 95%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4b5563; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #fcd34d; margin: 0;">Denní nabídka předmětů</h2>
                    <button class="btn-task" style="padding: 8px 15px; background: #991b1b; font-weight: bold;" onclick="document.getElementById('shop-modal').remove()">Zavřít</button>
                </div>
                
                <div class="stadium-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                    ${itemsHtml}
                </div>
                
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// --- NOVÉ OKNO TREZORU ---
window.openInventoryMenu = function() {
    const oldModal = document.getElementById('inventory-modal');
    if (oldModal) oldModal.remove();

    if (!playerData.inventory) {
        playerData.inventory = { att: [], mid: [], def: [], gk: [] };
    }

    const renderCompactSlot = (role, label, limit) => {
        const items = playerData.inventory[role] || [];
        let slotsHtml = '';
        
        for (let i = 0; i < limit; i++) {
            const item = items[i];
            if (item) {
                slotsHtml += `
                    <div class="shop-item-card compact">
                        <div class="shop-item-title">${item.name}</div>
                        
                        <div class="shop-img-container">
                            <!-- AUTOMATICKÉ NAČÍTÁNÍ OBRÁZKU PODLE ID -->
                            <img src="images/items/${item.id}.png" alt="${item.name}" onerror="this.onerror=null; this.src='images/items/triko.png';">
                            <span class="shop-item-tooltip">${item.desc}</span>
                        </div>

                        <div class="shop-item-duration">⏳ Zbývá: ${item.duration} záp.</div>
                        <button class="btn-task" style="width: 100%; padding: 4px; font-size: 0.7rem; background: #7f1d1d; border: 1px solid #450a0a; color: #fca5a5;" onclick="discardItem('${role}', ${item.instanceId})">Vyhodit</button>
                    </div>
                `;
            } else {
                slotsHtml += `
                    <div class="inventory-slot-empty compact">
                        <div>Volný slot</div>
                    </div>
                `;
            }
        }
        return `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #374151;">
                <h4 style="color: #fcd34d; margin: 0 0 10px 0; font-size: 1rem; text-transform: uppercase;">${label}</h4>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">${slotsHtml}</div>
            </div>
        `;
    };

    const modalHtml = `
        <div id="inventory-modal" class="ml-selector-overlay" onclick="this.remove()">
            <div class="ml-selector-box" style="max-width: 650px; width: 95%; max-height: 85vh; overflow-y: auto; background: #1f2937;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4b5563; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #fcd34d; margin: 0;">Týmový trezor</h2>
                    <button class="btn-task" style="padding: 8px 15px; background: #991b1b;" onclick="document.getElementById('inventory-modal').remove()">Zavřít</button>
                </div>
                
                <div style="text-align: left;">
                    ${renderCompactSlot('att', '⚔️ Útočné bonusy', 2)}
                    ${renderCompactSlot('mid', '🧭 Záložní bonusy', 2)}
                    ${renderCompactSlot('def', '🛡️ Obranné bonusy', 2)}
                    ${renderCompactSlot('gk', '🧤 Brankářské vybavení', 1)}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// --- DETAIL ZÁPASU (Záznam utkání) ---
window.openMatchReport = function(index) {
    const msg = playerData.mail[index];
    if (!msg) { renderMail(); return; } 
    msg.read = true; 
    saveGame();
    window.currentMatchMsg = msg; 
    
    // Vynulujeme počítadlo pro nově otevřený zápas a resetujeme rychlost
    window.currentReplayIndex = 0;
    window.isReplayFast = false; 

    const mainContent = document.getElementById('main-content');
    const homeTeam = msg.rewards?.homeTeam || "Domácí";
    const awayTeam = msg.rewards?.awayTeam || "Hosté";
    
    const myR = msg.rewards?.myRating;
    const botR = msg.rewards?.botRating;

    // Pomocná funkce pro panel
    const createRatingPanel = (teamName, rating, isHome) => `
        <div class="rating-panel ${isHome ? 'home' : 'away'}" style="flex-shrink: 0;">
            <h4 class="rating-panel-title">${teamName}</h4>
            <div class="rating-row"><span>⚔️ Útok:</span> <strong>${rating.att}</strong></div>
            <div class="rating-row"><span>🧭 Záloha:</span> <strong>${rating.mid}</strong></div>
            <div class="rating-row"><span>🛡️ Obrana:</span> <strong>${rating.def}</strong></div>
            <div class="rating-row last"><span>🧤 Brankář:</span> <strong>${rating.gk}</strong></div>
        </div>
    `;

    mainContent.innerHTML = `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 5px;">
            
            <div class="match-report-header" style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-bottom: 10px; width: 90%; max-width: 1200px;">
                <div style="text-align: left;">
                    <button onclick="renderMail()" style="padding: 10px 20px; background: #4e342e; color: white; border: 2px solid #3e2723; border-radius: 5px; cursor: pointer; font-weight: bold; font-family: inherit;">⬅ Zpět</button>
                </div>
                <div style="text-align: center;">
                    <h2 class="section-title">ZÁZNAM UTKÁNÍ</h2>
                </div>
                <div></div> </div>
            
            <div class="match-report-board" style="width: 90%; max-width: 1200px; margin-bottom: 5px;">
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

            <div style="width: 100%; display: flex; justify-content: center; gap: 15px; margin-bottom: 5px;">
                <button class="btn-wood-action" style="/* tvoje případné styly pro pozici */" onclick="speedUpReplay()">⏩ Zrychlit</button>
                <button class="btn-wood-action" style="/* tvoje případné styly pro pozici */" onclick="skipReplay()">⏭ Přeskočit</button>
            </div>

            <div class="match-report-layout" style="display: flex; justify-content: center; align-items: flex-start; gap: 30px; width: 95%; max-width: 1400px; flex-wrap: wrap;">
                ${myR ? createRatingPanel(homeTeam, myR, true) : '<div style="width: 220px; border: 1px dashed #444; color: #666; display: flex; align-items: center; justify-content: center; border-radius: 10px;">Data nedostupná</div>'}
                
                <div id="replay-window" class="replay-window-container" style="flex: 2 1 auto; width: 100%; min-width: 280px; max-width: 800px; height: 350px; max-height: 50vh; box-sizing: border-box; background: #111827; padding: 15px; border: 4px solid #374151; border-radius: 10px; overflow-y: auto;">
                </div>
                
                ${botR ? createRatingPanel(awayTeam, botR, false) : '<div style="width: 220px; border: 1px dashed #444; color: #666; display: flex; align-items: center; justify-content: center; border-radius: 10px;">Data nedostupná</div>'}
            </div>
            
        </div>
    `;

    if (window.matchReplayInterval) clearInterval(window.matchReplayInterval);
    
    window.matchReplayInterval = setInterval(() => {
        const replayWindow = document.getElementById('replay-window');
        if (!replayWindow) { clearInterval(window.matchReplayInterval); return; }
        
        if (window.currentReplayIndex < msg.content.length) { 
            renderReplayAction(msg.content[window.currentReplayIndex]); 
            window.currentReplayIndex++; 
        } else { 
            finishMatchReplay(); 
        }
    }, 2500); 
}

// --- ZOBRAZENÍ DETAILU SOUPEŘE V LIZE ---
window.viewBotTeam = function(teamName) {
    const mainContent = document.getElementById('main-content');
    const botTeam = playerData.league.find(t => t.name === teamName);
    if (!botTeam || botTeam.isPlayer) return;

    const layout = FORMATIONS_LAYOUT[botTeam.formation];

    // Pomocná funkce, která teď jen tahá hotové grafické karty z cards.js
    const renderBotGroup = (startIndex, endIndex, players) => {
        let html = '';
        for (let i = startIndex; i < endIndex; i++) {
            const player = players[i];
            if (!player) continue;
            
            // Využijeme univerzální generátor!
            // Předáme prázdnou onClick akci, protože na soupeře se nekliká
            html += window.createGraphicCardHtml(player, i, '', '');
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

// Pomocná funkce pro výpočet fixních časů zápasů (08:00, 16:00, 00:00)
window.getGlobalNextMatchTime = function() {
    const now = new Date();
    const next = new Date(now);
    const hours = now.getHours();
    
    if (hours < 8) {
        next.setHours(8, 0, 0, 0);
    } else if (hours < 16) {
        next.setHours(16, 0, 0, 0);
    } else {
        next.setDate(next.getDate() + 1); // Posun na další den
        next.setHours(0, 0, 0, 0); // Půlnoc
    }
    return next.getTime();
};

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
    // --- POJISTKA PRO NOVÉ ÚČTY ---
    if (!playerData.reserve) playerData.reserve = [];
    const players = filter === 'all' 
        ? playerData.reserve 
        : playerData.reserve.filter(p => p.rank === filter);

    if (players.length === 0) return `<p class="text-muted" style="width:100%; text-align:center;">V této kategorii nemáš žádné hráče.</p>`;

    return players.map((player, index) => {
        // Vygenerování samotné grafické karty (prázdné parametry pro kliknutí, v rezervě klikáme až na tlačítka pod ní)
        const cardHtml = window.createGraphicCardHtml(player, index, '', '');
        
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                ${cardHtml}
                
                <div style="display: flex; gap: 6px; width: 100%; max-width: 240px;">
                    <button class="btn-reserve-action btn-to-bench" style="flex: 1; padding: 8px 4px; font-size: 0.85rem; font-weight: bold; border-radius: 6px; box-shadow: 0 3px 5px rgba(0,0,0,0.3);" onclick="returnFromReserve('${player.id}')">
                        Na střídačku
                    </button>
                    <button class="btn-reserve-action btn-to-ml" style="flex: 1; padding: 8px 4px; font-size: 0.85rem; font-weight: bold; border-radius: 6px; box-shadow: 0 3px 5px rgba(0,0,0,0.3);" onclick="openMLSelector('${player.id}')">
                        Do miniligy
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// --- SYSTÉM NÁPOVĚDY ---
const HELP_TEXTS = {
    'office': `
        <h3>🏢 Kancelář</h3>
        <p>Tohle je tvůj hlavní manažerský stan. Zde můžeš využívat svou energii na plnění úkolů pro vedení klubu.</p>
        <ul>
            <li><strong>Jednání se sponzory:</strong> Přinese ti tolik potřebné finance do klubové kasy.</li>
            <li><strong>Taktický rozbor:</strong> Získáš zkušenosti (XP) pro sebe jako trenéra. Zvyšováním své úrovně (Levelu) se ti zlepšují i odměny za tyto úkoly!</li>
        </ul>
        <p class="help-tip">Tip: Energie se automaticky doplňuje reálným časem. Nezapomeň ji tedy pravidelně spotřebovávat. Za hodinu se ti doplní přibližně 5 bodů energie.</p>
    `,
    'match': `
        <h3>⚽ Liga a zápasy</h3>
        <p>Tady vidíš rozlosování a tabulku své aktuální divize. Zápasy se hrají <strong>zcela automaticky</strong> v pevných časech (08:00, 16:00, 00:00).</p>
        <ul>
            <li>Nemusíš být u hry online! Pokud tu nejsi, tým zápas odehraje bez tvé přímé taktické přípravy.</li>
            <li>Po odehrání 32 zápasů sezóna končí. První dva týmy postupují o divizi výš, poslední sestupují.</li>
        </ul>
        <p class="help-tip">Tip: Tlačítko "Příprava na zápas" ti před hvizdem poskytne taktickou výhodu a přidá tvým hráčům 10% k jejich statistikám.</p>
    `,
    'locker-room': `
        <h3>👕 Šatna a Taktika</h3>
        <p>Zde skládáš svou základní sestavu (prvních 11 hráčů) a střídačku.</p>
        <ul>
            <li><strong>Přesun hráčů:</strong> Klikni na jednoho hráče a pak na druhého. Tím si vymění svá místa. Pamatuj ale, že každá pozice na hřišti vyžaduje správného specialistu (např. útočník nemůže do obrány). Pokud bys z jakéhokoli důvodu měl hráče na špatné pozici, nepočítá se vůbec do statistik pro zápas.</li>
            <li><strong>Rezerva:</strong> Hráče, které momentálně nevyužiješ, můžeš poslat do Rezervy, abys udělal místo na střídačce novým posilám. Rezerva má kapacitu 11 hráčů pro každý rank. Z rezervy pak můžeš své hráče posílat do Miniligy, kde můžeš hrát proti svým přátelům.</li>
            <li><strong>Klubový trezor:</strong> V obchodě si můžeš nakoupit různé předměty, které ti dočasně zlepšují tvůj tým. Jejich seznam najdeš ve svém trezoru. Každý předmět má vlastní výdrž a po jejich spotřebě zmizí.</li>
        </ul>
    `,
    'training': `
        <h3>🏋️ Tréninkové hřiště</h3>
        <p>Každý zápas (ať už v lize nebo podzemí) přináší tvým hráčům zkušenosti. Když jich nasbírají dost, postoupí na novou úroveň. To je jasné, ne?</p>
        <ul>
            <li>Za každý nový level dostane hráč <strong>2 tréninkové body</strong>.</li>
            <li>Zde v Tréninku můžeš tyto body manuálně rozdělit do jeho statistik (Útok, Rychlost, Síla atd.) pomocí tlačítek <code>[+]</code>.</li>
            <li>Každá hvězdička u hráče umožňuje získat 5 levelů.</li>
        </ul>
    `,
    'scouting': `
        <h3>🔎 Skauting hráčů</h3>
        <p>Místo, kde získáváš čerstvou krev do týmu.</p>
        <ul>
            <li><strong>Hlavní skaut:</strong> Každých 24 hodin přivede nové hráče. Čím vyšší divizi tvůj klub hraje, tím lepší fotbalisty (ranky) najde.</li>
            <li><strong>Vedlejší skauti:</strong> Můžeš si je jednorázově a natrvalo najmout. Vždy ti zaručeně přivedou 3 hráče jednoho specifického ranku. Skvělé pro hledání kopyt do nižších minilig!</li>
        </ul>
    `,
    'minileague': `
        <h3>🏆 Miniliga</h3>
        <p>Vytvoř si vlastní soutěž nebo se přidej k přátelům (max. 10 manažerů v jedné lize). Zápasy se generují stylem "každý s každým".</p>
        <ul>
            <li><strong>Oddělená šatna:</strong> Tým pro miniligu si stavíš v její vlastní záložce! Používáš základní výplňové hráče nebo si do ní stahuješ vlastní hvězdy ze své Rezervy z hlavní hry.</li>
            <li><strong>Výplňoví hráči:</strong> Prvotní automaticky vygenerovaná sestava hráčů nelze prodat, ani odeslat do šatny / rezervy týmu.</li>
        </ul>
    `,
    'stadium': `
        <h3>🏟️ Stadion a zázemí</h3>
        <p>Tvůj klub je tak silný, jak silné má zázemí. Vylepšuj budovy za herní peníze!</p>
        <ul>
            <li><strong>Kancelář skauta:</strong> Zvyšuje šanci, že skaut objeví 5-hvězdičkového supertalenta. Navíc zrychluje skautování</li>
            <li><strong>Tribuny a Fanshop:</strong> Zvyšují tvé finanční příjmy ze zápasů a generují pasivní zisk.</li>
            <li><strong>Tréninkové centrum:</strong> Hráči získávají více XP z každého odehraného zápasu.</li>
            <li><strong>Trávník:</strong> Hráči získávají % bonus ke své rychlosti při zápasech.</li>
        </ul>
    `,
    'shop': `
        <h3>🛒 Fanshop (Předměty)</h3>
        <p>Tady si můžeš koupit speciální taktické vybavení, které hráčům přidává dočasné bonusy k síle v zápasech.</p>
        <p>Pozor, tyto předměty mají <strong>omezenou výdrž</strong> a po několika odehraných zápasech se opotřebují a zničí!</p>
    `,
    'pve': `
        <h3>🏰 Fotbalové Podzemí (PvE)</h3>
        <p>Máš tým v plné síle, ale liga se hraje až večer? Vydej se do podzemí!</p>
        <p>Stojíš proti řadě speciálních robotických týmů. Za poražení každého soupeře získáš jako odměnu <strong>nového hráče zdarma</strong> a obrovskou porci XP. Další zápas v podzemí můžeš hrát vždy až po hodinovém odpočinku.</p>
    `,
    'hall-of-fame': `
        <h3>⭐ Síň Slávy</h3>
        <p>Tady je zapsána celá tvá historie – sbírka odznaků, statistik a nejdůležitějších milníků tvé manažerské kariéry. (Ve výstavbě)</p>
    `,
    'mail': `
        <h3>✉️ Pošta</h3>
        <p>Tvoje poštovní schránka. Chodí ti sem všechny <strong>záznamy ze zápasů</strong> (z ligy, miniligy i podzemí), shrnutí sezóny a schvalování pozvánek od přátel.</p>
    `
};

window.showHelp = function(sectionKey) {
    const oldModal = document.getElementById('help-modal');
    if (oldModal) oldModal.remove();

    const helpContent = HELP_TEXTS[sectionKey] || "<p>Nápověda pro tuto sekci se připravuje...</p>";

    const modalHtml = `
        <div id="help-modal" class="help-modal-backdrop">
            <div class="help-modal-content">
                <div>
                    ${helpContent}
                </div>
                <div style="text-align: center; margin-top: 25px;">
                    <button class="btn-upgrade" style="background: #4b5563; padding: 8px 25px;" onclick="document.getElementById('help-modal').remove()">Jasná věc, díky!</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// --- SÍŇ SLÁVY ---
window.renderHallOfFame = function() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.position = 'relative';

    if (!playerData.hallOfFame) playerData.hallOfFame = { league: [], pve: [] };

    // Používáme obrázek sin_slavy1.png (z dřívějšího kódu navigace)
    mainContent.innerHTML = `
        <div style="position: relative; z-index: 10; text-align: center; margin-bottom: 15px; pointer-events: none;">
            <button class="help-btn-corner" onclick="showHelp('hall-of-fame')" style="pointer-events: auto;">Nápověda</button>
            <h2 class="section-title" style="text-shadow: 2px 2px 5px rgba(0,0,0,0.8);">Síň Slávy</h2>
            <p class="stadium-subtitle" style="text-shadow: 1px 1px 3px black; font-weight: bold; color: #fdf5e6;">Historie tvých největších manažerských triumfů.</p>
        </div>
        
        <div class="interactive-stadium-container">
            
            <div class="stadium-click-zone" 
                 onclick="openHoFMenu('league')" 
                 style="top: 15%; left: 10%; width: 35%; height: 70%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">🏆 Zlaté poháry</strong>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Ligové tituly (${playerData.hallOfFame.league.length})</div>
                </div>
            </div>

            <div class="stadium-click-zone" 
                 onclick="openHoFMenu('pve')" 
                 style="top: 15%; left: 55%; width: 35%; height: 70%;">
                <div class="zone-tag">
                    <strong style="display: block; margin-bottom: 5px;">☠️ Trofeje bossů</strong>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Pokořená podzemí (${playerData.hallOfFame.pve.length})</div>
                </div>
            </div>
            
        </div>
    `;
};

window.openHoFMenu = function(type) {
    const oldModal = document.getElementById('hof-modal');
    if (oldModal) oldModal.remove();

    let itemsHtml = '';
    let titleText = '';
    let modalWidth = '800px'; // Sjednocená šířka pro obě vitríny

    if (type === 'league') {
        // --- 🏆 VITRÍNA LIGOVÝCH TITULŮ (10 PEVNÝCH SLOTŮ) ---
        titleText = '🏆 Získané ligové tituly';
        let trophiesHtml = "";

        // CYKLUS GENERUJE PEVNĚ 10 SLOTŮ (Od 10. divize dolů k 1. divizi)
        for (let d = 10; d >= 1; d--) {
            const trophy = (playerData.hallOfFame.league || []).find(t => t.div === d);
            
            // Hra se pokusí najít div10.png, pokud není, použije univerzální trophy.jpg
            const imgSrc = `images/trophies/div${d}.png`;
            const fallbackImg = `this.onerror=null; this.src='images/trophies/trophy.jpg';`;
            
            if (trophy) {
                // --- UNLOCKED: POHÁR JE ZÍSKANÝ ---
                const posLabels = { gk: 'BR', def: 'OB', mid: 'ZÁ', att: 'ÚT' };
                const rosterHtml = trophy.roster.map(p => `
                    <div style="font-size: 0.8rem; color: #d1d5db; display: flex; justify-content: space-between; width: 100%; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 2px 0;">
                        <span style="text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</span> 
                        <span style="color: #60a5fa; font-weight: bold; flex-shrink: 0;">${posLabels[p.position] || p.position}</span>
                    </div>
                `).join('');

                trophiesHtml += `
                    <div class="trophy-plaque">
                        <div class="trophy-img-container">
                            <img src="${imgSrc}" alt="${d}. Divize" class="trophy-img" onerror="${fallbackImg}">
                        </div>
                        <div class="trophy-title" style="margin-top: 5px;">${d}. Divize</div>
                        <div class="trophy-status" style="color: #10b981; font-weight: bold;">🏆 ${trophy.date}</div>
                        <div style="font-size: 0.8rem; color: #fcd34d; margin-bottom: 10px;">Získáno: ${trophy.count || 1}x</div>
                        
                        <details style="width: 100%; text-align: left;">
                            <summary style="color: #a78bfa; font-size: 0.8rem; cursor: pointer; user-select: none; text-align: center; font-weight: bold; outline: none; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 4px;">👕 Sestava</summary>
                            <div style="background: rgba(0,0,0,0.6); padding: 8px; border-radius: 5px; margin-top: 5px; display: flex; flex-direction: column; gap: 4px; box-sizing: border-box;">
                                ${rosterHtml}
                            </div>
                        </details>
                    </div>
                `;
            } else {
                // --- LOCKED: POHÁR JE ZAMČENÝ ---
                trophiesHtml += `
                    <div class="trophy-plaque locked">
                        <div class="trophy-img-container">
                            <img src="${imgSrc}" alt="${d}. Divize" class="trophy-img" onerror="${fallbackImg}">
                            <div class="trophy-lock-icon">🔒</div>
                        </div>
                        <div class="trophy-title" style="margin-top: 5px;">${d}. Divize</div>
                        <div class="trophy-status">🔒 Dosud nezískáno</div>
                    </div>
                `;
            }
        }

        // Vložení do stejné mřížky (cabinet) jako má PvE
        itemsHtml = `
            <div class="trophy-cabinet">
                ${trophiesHtml}
            </div>
        `;

    } else {
        // --- ☠️ SEKCE PRO PVE TROFEJE (Nezměněna) ---
        titleText = '☠️ Trofeje z Fotbalového podzemí';
        
        const pveTrophiesHtml = PVE_DUNGEONS.map((dungeon, index) => {
            const isUnlocked = playerData.pve.dungeonIndex > index;
            const statusText = isUnlocked ? '🏆 Získáno' : '🔒';
            const lockedClass = isUnlocked ? '' : 'locked';
            const lockIcon = isUnlocked ? '' : '<div class="trophy-lock-icon">🔒</div>';
            
            return `
                <div class="trophy-plaque ${lockedClass}">
                    <div class="trophy-img-container">
                        <img src="images/trophies/${dungeon.id}.png" alt="${dungeon.name}" class="trophy-img" onerror="this.onerror=null; this.src='images/trophies/trophy.jpg';">
                        ${lockIcon}
                    </div>
                    <div class="trophy-title">${dungeon.name}</div>
                    <div class="trophy-status">${statusText}</div>
                </div>
            `;
        }).join('');

        itemsHtml = `
            <div class="trophy-cabinet">
                ${pveTrophiesHtml}
            </div>
        `;
    }

    const modalHtml = `
        <div id="hof-modal" class="ml-selector-overlay" onclick="this.remove()">
            <div class="ml-selector-box" style="max-width: ${modalWidth}; width: 95%; max-height: 85vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4b5563; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #fcd34d; margin: 0;">${titleText}</h2>
                    <button class="btn-task" style="padding: 8px 15px; background: #991b1b;" onclick="document.getElementById('hof-modal').remove()">Zavřít</button>
                </div>
                <div>
                    ${itemsHtml}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};