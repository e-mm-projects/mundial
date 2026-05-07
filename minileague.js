// ---------- MINILIGA ------ //
// --- UNIVERZÁLNÍ GENERÁTOR TÝMU PRO MINILIGU ---
window.generateMLStarterTeam = function(rankName) {
    const players = new Array(16).fill(null);
    
    // Najdeme data pro požadovaný rank (pokud se splete, dáme první dostupný)
    const rankData = PLAYER_RANKS.find(r => r.name === rankName) || PLAYER_RANKS[0];

    // BEZPEČNÉ HODNOTY (proti chybám NaN, které Firebase tiše maže)
    const minS = rankData.minStart || 1;
    const maxS = rankData.maxStart || 10;

    const generateP = (pos, index) => {
        // Výchozí bezpečné hodnoty
        const stats = { atk: 5, def: 5, spd: 5, str: 5, eng: 5, gk: 5, tek: 5 }; 
        
        // Hodíme kostkou jen u statistik, které pozice využívá
        if (POSITION_STATS[pos]) {
            POSITION_STATS[pos].stats.forEach(s => {
                stats[s] = Math.floor(Math.random() * (maxS - minS + 1)) + minS;
            });
        }

        return {
            id: 'ml_base_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5),
            name: `Nováček (${rankData.name})`,
            position: pos,
            nationality: NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)].name,
            rank: rankData.name,
            statCap: rankData.cap || 20,
            stars: 0,
            level: 1,
            maxLevel: 1,
            xp: 0,
            unspentPoints: 0,
            stats: stats,
            isMLFiller: true // <--- TATO TAJNÁ ZNAČKA ZABRÁNÍ FARMAŘENÍ
        };
    };

    // Naplníme základní jedenáctku
    players[0] = generateP('gk', 0);
    players[1] = generateP('def', 1);
    players[2] = generateP('def', 2);
    players[3] = generateP('def', 3);
    players[4] = generateP('def', 4);
    players[5] = generateP('mid', 5);
    players[6] = generateP('mid', 6);
    players[7] = generateP('mid', 7);
    players[8] = generateP('mid', 8);
    players[9] = generateP('att', 9);
    players[10] = generateP('att', 10);

    return players;
};

window.createNewMinileague = async function(rank) {
    if (playerData.money < 1) {
        alert("Na založení miniligy potřebuješ alespoň 1 💰!");
        return;
    }

    // --- POJISTKA: MAX 3 MINILIGY ---
    if ((playerData.myMinileagues || []).length >= 3) {
        alert("Můžeš být současně maximálně ve 3 miniligách! Pokud chceš založit novou, musíš nějakou starou opustit.");
        return;
    }

    const leagueName = prompt("Zadej název své nové miniligy:");
    if (!leagueName || leagueName.trim().length < 3) {
        alert("Název musí mít alespoň 3 znaky.");
        return;
    }

    const cleanName = leagueName.trim();
    const dbRef = window.dbRef(window.db);

    try {
        // 1. Kontrola, zda liga s tímto názvem už neexistuje
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${cleanName}`));
        if (snapshot.exists()) {
            alert("Miniliga s tímto názvem už existuje. Zvol prosím jiný název.");
            return;
        }

        // 2. Stržení poplatku a příprava týmu
        playerData.money -= 1;
        const initialTeam = window.generateMLStarterTeam(rank);

        // 3. Zápis do Firebase (s novými časovači)
        const nextMatch = window.getNextMatchSlot(); // Najdeme nejbližší hrací okno
        const leagueData = {
            name: cleanName,
            rank: rank,
            owner: playerData.uid,
            createdAt: Date.now(),
            nextMatchTime: nextMatch, 
            seasonEndTime: nextMatch + (7 * 24 * 60 * 60 * 1000), // Začíná odteď přesně 7 dní
            participants: {
                [playerData.uid]: playerData.managerName
            },
            standings: {
                [playerData.uid]: { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }
            },
            teams: {
                [playerData.uid]: {
                    formation: '4-4-2',
                    players: initialTeam
                }
            }
        };

        await window.dbSet(window.dbRef(window.db, `minileagues/${cleanName}`), leagueData);
        
        // 4. Uložení informace o lize k hráči (aby věděl, že v ní je)
        if (!playerData.myMinileagues) playerData.myMinileagues = [];
        playerData.myMinileagues.push({ 
            name: cleanName, 
            creator: playerData.clubName,
            rank: rank, 
            played: 0,
            seasonEndTime: 0 
        });

        saveGame();
        updateTopBarUI();
        
        alert(`Miniliga ${cleanName} byla úspěšně založena!`);
        renderMinileague();

    } catch (error) {
        console.error("Chyba při zakládání ligy:", error);
        alert("Nepodařilo se založit ligu na serveru.");
    }

    // Pomocná funkce pro určení dalšího hracího slotu (00, 08, 16 h)
    window.getNextMatchSlot = function() {
        const now = new Date();
        const currentHour = now.getHours();
        let nextMatch = new Date(now);
        nextMatch.setMinutes(0, 0, 0);

        if (currentHour < 8) {
            nextMatch.setHours(8);
        } else if (currentHour < 16) {
            nextMatch.setHours(16);
        } else {
            nextMatch.setHours(0);
            nextMatch.setDate(now.getDate() + 1);
        }
        return nextMatch.getTime();
    };
}

// MINILIGA  - PŘESOUVÁNÍ A MAZÁNÍ //

window.selectedMLIndex = null;
window.isMLRemoveMode = false;

window.handleMLPlayerClick = async function(leagueName, index) {
    const dbRef = window.dbRef(window.db);
    const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
    const league = snapshot.val();
    const myTeam = league.teams[playerData.uid];

    // 1. KLIKNUTÍ NA PRVNÍHO HRÁČE (VÝBĚR)
    if (window.selectedMLIndex === null) {
        if (!myTeam.players[index]) return; // Na prázdné místo nelze kliknout jako první
        window.selectedMLIndex = index;
        renderMinileagueDetail(leagueName, true); // ZÁSADNÍ OPRAVA: Okamžitý vizuální refresh
        return;
    }

    // 2. KLIKNUTÍ NA STEJNÉHO HRÁČE ZNOVU (ODZNAČENÍ)
    if (window.selectedMLIndex === index) {
        window.selectedMLIndex = null;
        renderMinileagueDetail(leagueName, true);
        return;
    }

    // 3. KLIKNUTÍ NA DRUHOU POZICI (PROHOZENÍ)
    const playerA = myTeam.players[window.selectedMLIndex];
    const playerB = myTeam.players[index] || null; // OPRAVA: Převedeme undefined na bezpečný null

    // ---  POJISTKA: ZÁKLAD MUSÍ BÝT KOMPLETNÍ ---
    if (window.selectedMLIndex < 11 && !playerB) {
        alert("Základní sestava musí být kompletní! Pokud chceš tohoto hráče posadit, musíš za něj na hřiště poslat někoho ze střídačky.");
        window.selectedMLIndex = null;
        renderMinileagueDetail(leagueName, true);
        return;
    }

    // Zjistíme, kam jaký slot patří
    const getMLPos = (idx) => {
        if (idx >= 11) return null; // Střídačka
        if (idx === 0) return 'gk';
        if (idx >= 1 && idx <= 4) return 'def';
        if (idx >= 5 && idx <= 8) return 'mid';
        return 'att';
    };

    const targetPos = getMLPos(index);
    const sourcePos = getMLPos(window.selectedMLIndex);

    // KONTROLY POZIC (Hráč do brány musí být brankář atd.)
    if (targetPos && playerA && playerA.position !== targetPos) {
        alert(`Tento slot vyžaduje pozici: ${POSITION_STATS[targetPos].label}!`);
        window.selectedMLIndex = null;
        renderMinileagueDetail(leagueName, true);
        return;
    }

    if (sourcePos && playerB && playerB.position !== sourcePos) {
        alert(`Tento slot vyžaduje pozici: ${POSITION_STATS[sourcePos].label}!`);
        window.selectedMLIndex = null;
        renderMinileagueDetail(leagueName, true);
        return;
    }

    // Vlastní prohození
    myTeam.players[window.selectedMLIndex] = playerB;
    myTeam.players[index] = playerA;
    window.selectedMLIndex = null; // Vyčistíme výběr
    
    // Uložení a překreslení
    await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}/teams/${playerData.uid}`), myTeam);
    renderMinileagueDetail(leagueName, true);
}

// PŘESUN z rezervy do Miniligy
window.executeMLTransfer = async function(playerId, leagueName) {
    // Odstraníme výběrové okno
    const modal = document.getElementById('ml-selector-modal');
    if (modal) modal.remove();

    const player = playerData.reserve.find(p => p.id === playerId);
    if (!player) return;

    try {
        const dbRef = window.dbRef(window.db);
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
        
        if (!snapshot.exists()) {
            alert("Chyba: Liga už na serveru neexistuje.");
            return;
        }

        const league = snapshot.val();
        const myMLTeam = league.teams[playerData.uid];

        // Kontrola volného místa na střídačce miniligy (hledáme null/prázdné místo v indexech 11-15)
        let freeBenchIndex = -1;
        for (let i = 11; i < 16; i++) {
            if (!myMLTeam.players[i]) {
                freeBenchIndex = i;
                break;
            }
        }

        if (freeBenchIndex === -1) {
            alert("V této minilize už máš plnou střídačku (max 5 míst)!");
            return;
        }

        // 1. ZÁPIS: Vložíme hráče na první volné místo na střídačce miniligy
        myMLTeam.players[freeBenchIndex] = player;
        await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}/teams/${playerData.uid}`), myMLTeam);

        // 2. ÚKLID: Odstraníme z hlavní rezervy
        playerData.reserve = playerData.reserve.filter(p => p.id !== playerId);
        
        saveGame();
        renderLockerRoom();
        alert(`Hráč ${player.name} byl úspěšně odeslán na střídačku miniligy ${leagueName}!`);

    } catch (error) {
        console.error("Transfer failed:", error);
        alert("Chyba při komunikaci se serverem. Zkus to prosím znovu.");
    }
}

// VRÁCENÍ HRÁČE Z MINILIGY DO REZERVY
window.returnFromMLToReserve = async function(leagueName, index) {
    const dbRef = window.dbRef(window.db);
    const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
    const league = snapshot.val();
    const myTeam = league.teams[playerData.uid];
    const playerToReturn = myTeam.players[index];

    if (!playerToReturn) return;

    // --- OCHRANA PROTI VYUŽÍVÁNÍ SILNÝCH VÝPLŇOVÝCH HRÁČŮ ---
    if (playerToReturn.isMLFiller) {
        if (confirm(`Hráč ${playerToReturn.name} je pouze dočasná výplň pro miniligu a nelze ho přesunout do tvého hlavního klubu.\n\nChceš ho trvale smazat, abys uvolnil místo na střídačce?`)) {
            // Hráč souhlasil -> Smažeme ho z miniligy
            myTeam.players[index] = null; 
            await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}/teams/${playerData.uid}`), myTeam);
            saveGame();
            renderMinileagueDetail(leagueName, true);
        }
        return; // Dál už nepokračujeme (hráč se do hlavní rezervy nepřesune)
    }

    // 1. Kontrola kapacity tvé lokální rezervy (max 10 na rank)
    const countInRank = (playerData.reserve || []).filter(p => p.rank === playerToReturn.rank).length;
    if (countInRank >= 10) {
        alert(`Nemůžeš ho vrátit, tvá Rezerva pro rank "${playerToReturn.rank}" je plná (10/10)!`);
        return;
    }

    if (confirm(`Chceš hráče ${playerToReturn.name} stáhnout z Miniligy zpět do své Rezervy?`)) {
        // 2. Přidáme do tvé lokální rezervy
        if (!playerData.reserve) playerData.reserve = [];
        playerData.reserve.push(playerToReturn);
        
        // 3. Odstraníme z Miniligy (z cloudu)
        myTeam.players[index] = null; 
        await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}/teams/${playerData.uid}`), myTeam);
        
        saveGame();
        renderMinileagueDetail(leagueName, true); // true zamezí trhnutí obrazovky
        alert(`Hráč ${playerToReturn.name} byl úspěšně vrácen do tvé Rezervy v hlavní šatně.`);
    }
}

// MINILIGA - OPUŠTĚNÍ MINILIGY //

window.leaveMinileague = async function(leagueName) {
    if (!confirm(`Opravdu chceš opustit miniligu ${leagueName}? Tvé body a statistiky v ní budou smazány. Tví hráči se vrátí do Rezervy (pokud tam máš místo).`)) {
        return;
    }

    try {
        const dbRef = window.dbRef(window.db);
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
        
        if (snapshot.exists()) {
            let league = snapshot.val();
            const myTeam = league.teams ? league.teams[playerData.uid] : null;

            // 1. Záchrana hráčů z miniligy zpět do hlavní Rezervy
            if (myTeam && myTeam.players) {
                if (!playerData.reserve) playerData.reserve = [];
                myTeam.players.forEach(p => {
                    // --- VYFILTRUJEME VÝPLŇOVÉ HRÁČE (!p.isMLFiller) ---
                    if (p && !p.isMLFiller) {
                        const countInRank = playerData.reserve.filter(r => r.rank === p.rank).length;
                        // Vrátí hráče jen pokud není rezerva plná
                        if (countInRank < 10) playerData.reserve.push(p);
                    }
                });
            }

            // 2. Vymazání uživatele z databáze miniligy
            if (league.participants) delete league.participants[playerData.uid];
            if (league.standings) delete league.standings[playerData.uid];
            if (league.teams) delete league.teams[playerData.uid];

            // 3. Rozhodnutí: Aktualizovat ligu, nebo ji celou smazat?
            if (!league.participants || Object.keys(league.participants).length === 0) {
                // Pokud po tvém odchodu nezbyl žádný manažer, ligu rovnou smažeme
                await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}`), null);
            } else {
                // Jinak ligu uložíme bez tvých dat
                await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}`), league);
            }
        }

        // 4. Úklid u tebe lokálně
        playerData.myMinileagues = playerData.myMinileagues.filter(l => {
            const lName = typeof l === 'object' ? l.name : l;
            return lName !== leagueName;
        });

        saveGame();
        renderMinileague();
        alert(`Úspěšně jsi opustil miniligu ${leagueName}.`);

    } catch (error) {
        console.error("Chyba při opouštění ligy:", error);
        alert("Něco se pokazilo při komunikaci se serverem.");
    }
}

//  JÁDRO SIMULÁTORU MINILIGY  // 
window.runMLSimulation = async function(leagueName, league) {
    const participants = Object.keys(league.participants);
    if (participants.length < 2) return; // Miniliga musí mít alespoň 2 hráče

    // --- ALGORITMUS ROUND-ROBIN (Každý s každým) ---
    let rrTeams = [...participants];
    if (rrTeams.length % 2 !== 0) {
        rrTeams.push("BYE"); 
    }

    let totalMatchesPlayed = 0;
    participants.forEach(uid => { totalMatchesPlayed += league.standings[uid].p; });
    let currentRound = Math.floor(totalMatchesPlayed / (participants.length / 2)) || 0;
    
    let n = rrTeams.length;
    for (let r = 0; r < currentRound % (n - 1); r++) {
        rrTeams.splice(1, 0, rrTeams.pop());
    }

    let matches = [];
    for (let i = 0; i < n / 2; i++) {
        const team1 = rrTeams[i];
        const team2 = rrTeams[n - 1 - i];
        
        if (team1 !== "BYE" && team2 !== "BYE") {
            matches.push([team1, team2]);
        }
    }

    // --- SIMULACE ZÁPASŮ ---
    const originalManagerName = playerData.managerName;

    for (const [uidA, uidB] of matches) {
        const teamA = league.teams[uidA] || {};
        const teamB = league.teams[uidB] || {};
        const nameA = league.participants[uidA] || "Neznámý tým";
        const nameB = league.participants[uidB] || "Neznámý tým";

        playerData.managerName = nameA;

        const getSafePlayers = (team) => {
            let players = (team && team.players) ? [...team.players] : new Array(16).fill(null);
            for (let i = 0; i < 11; i++) {
                if (!players[i]) {
                    players[i] = { 
                        id: 'dummy_' + Date.now() + '_' + i, 
                        name: 'Zbloudilý fanoušek', 
                        position: i === 0 ? 'GK' : 'ST',
                        stats: {att: 0, mid: 0, def: 0, gk: 0}, 
                        isMLFiller: true 
                    };
                }
            }
            return players;
        };

        const pA = getSafePlayers(teamA);
        const pB = getSafePlayers(teamB);

        const sectorsA = calculateSectorStrength(pA, teamA.formation || '4-4-2', false);
        const sectorsB = calculateSectorStrength(pB, teamB.formation || '4-4-2', false);
        
        const emptyInv = {att: [], mid: [], def: [], gk: []}; 

        const originalMail = [...playerData.mail];

        const matchResult = simulateMatch(
            sectorsA, sectorsB, 
            teamA.formation || '4-4-2', teamB.formation || '4-4-2', 
            pA, pB, 
            nameB, emptyInv
        );

        playerData.mail = originalMail;

        const scoreA = matchResult.myGoals;
        const scoreB = matchResult.botGoals;
        const logA = matchResult.log;

        const logB = logA.map(act => {
            const newAct = { ...act };
            if (newAct.score) {
                const [gA, gB] = newAct.score.split(':');
                newAct.score = `${gB}:${gA}`;
            }
            if (newAct.type === 'goal') newAct.type = 'bad-goal';
            else if (newAct.type === 'bad-goal') newAct.type = 'goal';

            // Otočení pozice míče! (Pokud je míč na 80%, host ho vidí na 20%)
            if (typeof newAct.zone === 'number') {
                newAct.zone = 100 - newAct.zone;
            }
            
            return newAct;
        });

        const updateStats = (uid, gf, ga) => {
            const s = league.standings[uid];
            if (!s) return;
            s.p++; s.gf += gf; s.ga += ga;
            if (gf > ga) { s.w++; s.pts += 3; }
            else if (gf === ga) { s.d++; s.pts += 1; }
            else { s.l++; }
        };

        updateStats(uidA, scoreA, scoreB);
        updateStats(uidB, scoreB, scoreA);

        const ratingA = calculateBaseTeamRating(pA, teamA.formation || '4-4-2');
        const ratingB = calculateBaseTeamRating(pB, teamB.formation || '4-4-2');

        const mailA = {
            id: 'ml_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            subject: `🏆 ML: ${nameA} vs ${nameB}`,
            content: logA,
            result: `${scoreA}:${scoreB}`,
            rewards: { money: 0, xp: 0, pXp: 0, homeTeam: nameA, awayTeam: nameB, myRating: ratingA, botRating: ratingB, isML: true },
            date: new Date().toLocaleDateString(),
            read: false
        };
        
        const mailB = {
            id: 'ml_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            subject: `🏆 ML: ${nameB} vs ${nameA}`,
            content: logB,
            result: `${scoreB}:${scoreA}`,
            rewards: { money: 0, xp: 0, pXp: 0, homeTeam: nameB, awayTeam: nameA, myRating: ratingB, botRating: ratingA, isML: true },
            date: new Date().toLocaleDateString(),
            read: false
        };
        
        await window.dbSet(window.dbRef(window.db, `mail_queue/${uidA}/${mailA.id}`), mailA);
        await window.dbSet(window.dbRef(window.db, `mail_queue/${uidB}/${mailB.id}`), mailB);
    }

    playerData.managerName = originalManagerName;

    // --- GLOBÁLNÍ POČÍTADLO KOL (PŘIČTENÍ) ---
    // Přičteme 1 kolo, protože se právě odehrál jeden celý "hrací blok"
    league.globalPlayedRounds = (league.globalPlayedRounds || 0) + 1;

    // --- KONEC SEZÓNY (7 DNÍ) ---
    const isSeasonOver = Date.now() >= league.seasonEndTime;
    if (isSeasonOver) {
        const sortedFinal = Object.keys(league.standings)
            .sort((a,b) => league.standings[b].pts - league.standings[a].pts);
        
        const top3 = sortedFinal.slice(0, 3).map(uid => ({
            name: league.participants[uid],
            pts: league.standings[uid].pts
        }));

        for (let i = 0; i < sortedFinal.length; i++) {
            const uid = sortedFinal[i];
            const finalRank = i + 1;
            const finalPts = league.standings[uid].pts;

            const endSeasonMail = {
                id: 'mail_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
                sender: "🏆 Vedení Miniligy",
                subject: `Konec sezóny v lize ${leagueName}`,
                text: `Sezóna v lize ${leagueName} skončila! Skončil jsi na ${finalRank}. místě se ziskem ${finalPts} bodů. Právě byla odstartována nová sezóna, hodně štěstí!`,
                date: new Date().toLocaleDateString(),
                read: false
            };
            await window.dbSet(window.dbRef(window.db, `mail_queue/${uid}/${endSeasonMail.id}`), endSeasonMail);
        }

        league.lastResults = top3;
        
        participants.forEach(uid => {
            league.standings[uid] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, byes: 0 };
        });

        // --- GLOBÁLNÍ POČÍTADLO KOL (RESTART NA KONCI SEZÓNY) ---
        league.globalPlayedRounds = 0;

        // Nová sezóna se opět odrazí od příštího zápasu
        league.seasonEndTime = window.getNextMatchSlot() + (7 * 24 * 60 * 60 * 1000);
    }

    league.nextMatchTime = window.getNextMatchSlot();
    await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}`), league);
};

// PŘIPOJENÍ HRÁČE DO MINILIGY // 
window.joinMinileague = async function() {
    if ((playerData.myMinileagues || []).length >= 3) {
        alert("Můžeš být současně maximálně ve 3 miniligách! Pokud se chceš připojit do další, musíš jinou opustit.");
        return;
    }

    // --- LOGIKA PRO NAČTENÍ NÁZVU Z POLÍČKA ---
    const inputEl = document.getElementById('join-league-input');
    let leagueName = "";

    if (inputEl && inputEl.value.trim() !== "") {
        leagueName = inputEl.value.trim();
        inputEl.value = ""; // Vyčistíme políčko po kliknutí
    } else {
        // Záložní řešení, kdyby hráč klikl na tlačítko a políčko bylo prázdné
        leagueName = prompt("Zadej přesný název miniligy, do které se chceš připojit:");
    }

    if (!leagueName || leagueName.trim() === "") {
        alert("Musíš zadat název miniligy!");
        return;
    }

    try {
        const dbRef = window.dbRef(window.db);
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));

        if (!snapshot.exists()) {
            alert("Tato miniliga neexistuje. Zkontroluj překlepy v názvu a zkus to znovu.");
            return;
        }

        const league = snapshot.val();

        if (league.participants && league.participants[playerData.uid]) {
            alert("V této minilize už dávno jsi!");
            return;
        }

        const participantsCount = league.participants ? Object.keys(league.participants).length : 0;
        if (participantsCount >= 10) {
            alert("Tato miniliga je už bohužel plná (10/10 hráčů)!");
            return;
        }

        const ownerUid = league.owner;
        if (!ownerUid) {
            alert("Tato liga nemá zakladatele, nelze se připojit.");
            return;
        }

        const inviteMail = {
            id: Date.now() + Math.random().toString(36).substring(2),
            type: "ml_invite", 
            sender: "🏆 Systém",
            subject: `Žádost o vstup: ${leagueName}`,
            text: `Manažer **${playerData.managerName}** žádá o vstup do tvé miniligy **${leagueName}**.`,
            applicantUid: playerData.uid,
            applicantName: playerData.managerName,
            leagueName: leagueName,
            leagueRank: league.rank,
            date: new Date().toLocaleDateString(),
            read: false
        };

        await window.dbSet(window.dbRef(window.db, `mail_queue/${ownerUid}/${inviteMail.id}`), inviteMail);
        alert(`Žádost o vstup do ligy ${leagueName} byla odeslána zakladateli! Jakmile ji schválí, dostaneš zprávu do Pošty.`);

    } catch (error) {
        console.error("Chyba při žádosti:", error);
        alert("Něco se pokazilo při komunikaci se serverem.");
    }
};

// --- PŘIJETÍ DO LIGY ---
window.acceptMLInvite = async function(mailId, applicantUid, applicantName, leagueName, leagueRank) {
    try {
        const dbRef = window.dbRef(window.db);
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
        
        if (!snapshot.exists()) {
            alert("Tato liga už neexistuje."); return;
        }
        const league = snapshot.val();
        
        const participantsCount = league.participants ? Object.keys(league.participants).length : 0;
        if (participantsCount >= 10) {
            alert("Nelze přijmout. Miniliga je už plná (10/10 hráčů)!"); return;
        }

        if (!league.participants) league.participants = {};
        league.participants[applicantUid] = applicantName;

        if (!league.standings) league.standings = {};
        league.standings[applicantUid] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, byes: 0 };

        const starterTeam = window.generateMLStarterTeam(leagueRank);
        if (!league.teams) league.teams = {};
        league.teams[applicantUid] = { formation: '4-4-2', players: starterTeam };

        await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}`), league);

        const acceptMail = {
            id: Date.now() + Math.random().toString(36).substring(2),
            type: "ml_accepted", 
            sender: "🏆 Systém",
            subject: `Schváleno: Vítej v lize ${leagueName}`,
            text: `Tvůj vstup do miniligy **${leagueName}** byl schválen! Liga byla automaticky přidána do tvého seznamu. Běž do šatny miniligy a nastav si sestavu.`,
            leagueName: leagueName,
            leagueRank: leagueRank,
            date: new Date().toLocaleDateString(),
            read: false
        };
        await window.dbSet(window.dbRef(window.db, `mail_queue/${applicantUid}/${acceptMail.id}`), acceptMail);

        const mailMsg = playerData.mail.find(m => m.id === mailId);
        if (mailMsg) {
            mailMsg.type = "info"; 
            mailMsg.text = `Manažer **${applicantName}** žádal o vstup do tvé miniligy **${leagueName}**.\n\n**✅ ŽÁDOST BYLA PŘIJATA**`;
            mailMsg.read = true;
        }
        saveGame();
        
        if (typeof renderMail === "function") renderMail();
        alert(`Manažer ${applicantName} byl úspěšně přijat do tvé ligy!`);

    } catch (error) {
        console.error(error); alert("Chyba při přijímání hráče.");
    }
};

// --- ZAMÍTNUTÍ Z LIGY ---
window.rejectMLInvite = async function(mailId, applicantUid, leagueName) {
    try {
        const rejectMail = {
            id: Date.now() + Math.random().toString(36).substring(2),
            sender: "🏆 Systém",
            subject: `Zamítnuto: ${leagueName}`,
            text: `Zakladatel bohužel zamítl tvůj vstup do miniligy **${leagueName}**.`,
            date: new Date().toLocaleDateString(),
            read: false
        };
        await window.dbSet(window.dbRef(window.db, `mail_queue/${applicantUid}/${rejectMail.id}`), rejectMail);

        const mailMsg = playerData.mail.find(m => m.id === mailId);
        if (mailMsg) {
            mailMsg.type = "info";
            mailMsg.text = `Manažer žádal o vstup do tvé miniligy **${leagueName}**.\n\n**❌ ŽÁDOST BYLA ZAMÍTNUTA**`;
            mailMsg.read = true;
        }
        saveGame();

        if (typeof renderMail === "function") renderMail();
        alert("Žádost byla zamítnuta a odesílatel informován.");
    } catch (error) {
        console.error(error); alert("Chyba při zamítání.");
    }
};

// --- VYHOZENÍ HRÁČE Z MINILIGY ---
window.kickFromMinileague = async function(leagueName, targetUid, targetName) {
    if (targetUid === playerData.uid) {
        alert("Sám sebe vyhodit nemůžeš! Pokud chceš ligu zrušit, opust' ji přes hlavní menu.");
        return;
    }
    
    if (!confirm(`Opravdu chceš natrvalo vyhodit manažera ${targetName} z miniligy ${leagueName}?`)) {
        return;
    }

    try {
        const dbRef = window.dbRef(window.db);
        const snap = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
        if (!snap.exists()) return;
        
        const league = snap.val();

        if (league.owner !== playerData.uid) {
            alert("Pouze zakladatel miniligy může vyhazovat hráče!");
            return;
        }

        // Smazání hráče z dat miniligy
        if (league.participants) delete league.participants[targetUid];
        if (league.teams) delete league.teams[targetUid];
        if (league.standings) delete league.standings[targetUid];

        await window.dbSet(window.dbRef(window.db, `minileagues/${leagueName}`), league);

        // --- NOVÉ: ODESLÁNÍ SPECIÁLNÍ ZPRÁVY VYHOZENÉMU HRÁČI ---
        const kickMail = {
            id: 'ml_kick_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            type: "ml_kicked", 
            sender: "🏆 Vedení Miniligy",
            subject: `Vyhození z miniligy: ${leagueName}`,
            text: `Zakladatel tě bohužel vyhodil z miniligy **${leagueName}**. Liga byla odstraněna z tvého seznamu.`,
            leagueName: leagueName,
            date: new Date().toLocaleDateString(),
            read: false
        };
        await window.dbSet(window.dbRef(window.db, `mail_queue/${targetUid}/${kickMail.id}`), kickMail);

        alert(`Manažer ${targetName} byl úspěšně vyhozen z miniligy.`);
        renderMinileagueDetail(leagueName, true);

    } catch (error) {
        console.error("Chyba při vyhazování hráče:", error);
        alert("Něco se pokazilo. Zkus to znovu.");
    }
};

window.renderMinileague = function() {
    const mainContent = document.getElementById('main-content');

    // Vyčistíme starý interval (aby nám na pozadí neběželo více odpočtů najednou)
    if (window.mlTimersInterval) clearInterval(window.mlTimersInterval);

    // 1. POJISTKY A DATA
    if (!playerData.myMinileagues) playerData.myMinileagues = [];
    const MAX_MINILEAGUES = 3;
    const currentCount = playerData.myMinileagues.length;

    // 2. GENEROVÁNÍ SEZNAMU "MOJE MINILIGY"
    let myLeaguesHtml = "";
    if (currentCount === 0) {
        myLeaguesHtml = `<p style="color: #9ca3af; text-align: center; margin-top: 20px;">Zatím nejsi v žádné minilize.</p>`;
    } else {
        myLeaguesHtml = playerData.myMinileagues.map((l, index) => {
            const lData = typeof l === 'object' ? l : { name: l };
            const lName = lData.name;
            const creator = lData.creator || "Neznámý";
            
            // Vezmeme čas konce sezóny (pokud ho ještě nemáme, dáme 0)
            const seasonEndTime = lData.seasonEndTime || 0; 
            
            // --- NOVÝ VÝPOČET ZBÝVAJÍCÍCH KOL PODLE ČASU ---
            let roundsLeft = 0;
            if (seasonEndTime > 0) {
                const timeLeft = seasonEndTime - Date.now();
                if (timeLeft > 0) {
                    // Vydělíme zbývající čas 8 hodinami a zaokrouhlíme nahoru
                    roundsLeft = Math.ceil(timeLeft / (8 * 60 * 60 * 1000));
                    // Pojistka, aby to nikdy neukázalo více než 21
                    roundsLeft = Math.min(21, roundsLeft);
                }
            }
            
            let rankName = "Všechny";
            if (lData.rank !== undefined && PLAYER_RANKS[lData.rank]) {
                rankName = PLAYER_RANKS[lData.rank].name;
            } else if (typeof lData.rank === 'string') {
                rankName = lData.rank;
            }

            return `
                <div class="ml-league-card">
                    <div style="margin-bottom: 10px;">
                        <div class="ml-league-header">${lName}</div>
                        <div class="ml-league-info">👑 Zakladatel: <span style="color:white;">${creator}</span></div>
                        <div class="ml-league-info">⛔ Omezení: <span style="color:#60a5fa;">${rankName}</span></div>
                        <div class="ml-league-info">🗓️ Zbývá kol: <span style="color:white; font-weight:bold;">${roundsLeft} / 21</span></div>
                        <div class="ml-league-info">⏳ Konec ligy za: <span id="ml-season-timer-${index}" data-endtime="${seasonEndTime}" style="color:#fcd34d; font-weight:bold;">Načítám...</span></div>
                    </div>
                    
                    <div class="ml-timer-box">
                        <div style="font-size: 0.75rem; color: #9ca3af; text-transform: uppercase;">Další zápas za:</div>
                        <div id="ml-match-timer-${index}" style="font-weight: bold; color: #fcd34d; font-family: monospace; font-size: 1.1rem;">--:--:--</div>
                    </div>

                    <div class="ml-btn-group">
                        <button class="btn-upgrade" style="flex: 2; background: #10b981; padding: 8px;" onclick="renderMinileagueDetail('${lName}')">VSTOUPIT</button>
                        <button class="btn-task" style="flex: 1; background: #991b1b; padding: 8px; font-size: 0.8rem;" onclick="leaveMinileague('${lName}')">OPUSTIT</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    const rankOptions = PLAYER_RANKS.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');

    mainContent.innerHTML = `
        <button class="help-btn-corner" onclick="showHelp('minileague')" title="Nápověda">Nápověda</button>

        <div class="text-center">
            <h2 class="section-title" style="margin-bottom: 5px;">Online Miniligy</h2>
            <p class="ml-subtitle">Tvé soukromé ligy s přáteli na jednom místě.</p>
        </div>

        <div class="ml-container">
            <div class="ml-column">
                <h3 style="color: #fcd34d; margin-top: 0; border-bottom: 1px solid #4b5563; padding-bottom: 10px; display: flex; justify-content: space-between;">
                    <span>📋 Moje miniligy</span>
                    <span style="font-size: 0.9rem; color: #9ca3af;">${currentCount} / ${MAX_MINILEAGUES}</span>
                </h3>
                <div style="margin-top: 15px;">
                    ${myLeaguesHtml}
                </div>
            </div>

            <div style="flex: 1; min-width: 320px;">
                <div class="ml-box">
                    <h3 style="color: #a78bfa; margin-top: 0; border-bottom: 1px solid #4b5563; padding-bottom: 10px;">Založit novou ligu</h3>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; color: #d1d5db; font-size: 0.85rem; margin-bottom: 5px;">Omezení ranku hráčů:</label>
                        <select id="new-league-rank-select" style="width: 100%; padding: 10px; border-radius: 5px; background: #1f2937; color: white; border: 1px solid #4b5563;">
                            ${rankOptions}
                        </select>
                        <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 5px;">V této lize půjde hrát pouze s hráči tohoto ranku a nižšími.</p>
                    </div>

                    <button class="btn-upgrade" style="width: 100%; background: #7c3aed;" 
                        onclick="createNewMinileague(parseInt(document.getElementById('new-league-rank-select').value))">
                        ZALOŽIT LIGU (1 💰)
                    </button>
                </div>

                <div class="ml-box" style="margin-bottom: 0;">
                    <h3 style="color: #60a5fa; margin-top: 0; border-bottom: 1px solid #4b5563; padding-bottom: 10px;">Připojit se k minilize</h3>
                    <p style="font-size: 0.85rem; color: #9ca3af; margin: 10px 0;">Zadej přesný název ligy, do které se chceš připojit.</p>
                    <input type="text" id="join-league-input" placeholder="Název ligy..." style="width: 100%; padding: 12px; border-radius: 5px; border: 1px solid #4b5563; background: #1f2937; color: white; margin-bottom: 10px; box-sizing: border-box;">
                    <button class="btn-upgrade" style="width: 100%; background: #2563eb;" onclick="joinMinileague()">ODESLAT ŽÁDOST</button>
                </div>
            </div>
        </div>
    `;

    // --- MOTOR PRO ŽIVÝ ODPOČET ČASU ---
    window.mlTimersInterval = setInterval(() => {
        const now = Date.now();
        const nextMatch = window.getGlobalNextMatchTime(); // Spočítá další 8:00, 16:00 nebo 0:00

        playerData.myMinileagues.forEach((l, index) => {
            // 1. Aktualizace času do dalšího zápasu
            const matchEl = document.getElementById(`ml-match-timer-${index}`);
            if (matchEl) {
                const diff = nextMatch - now;
                if (diff <= 0) {
                    matchEl.innerText = "Simuluji...";
                } else {
                    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                    const m = Math.floor((diff / 1000 / 60) % 60);
                    const s = Math.floor((diff / 1000) % 60);
                    // Přidá nulu před čísla menší než 10 (např. 03:05:09)
                    matchEl.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                }
            }

            // 2. Aktualizace času do konce ligy
            const seasonEl = document.getElementById(`ml-season-timer-${index}`);
            if (seasonEl) {
                const endTime = parseInt(seasonEl.getAttribute('data-endtime')) || 0;
                if (endTime === 0) {
                    seasonEl.innerText = "Zjistí se po vstupu";
                } else {
                    const diff = endTime - now;
                    if (diff <= 0) {
                        seasonEl.innerText = "Sezóna končí...";
                    } else {
                        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                        const m = Math.floor((diff / 1000 / 60) % 60);
                        seasonEl.innerText = `${d} dní, ${h} hod, ${m} min`;
                    }
                }
            }
        });
    }, 1000); // 1000 ms = 1 vteřina
};

// MINILIGA - DETAILY //
window.renderMinileagueDetail = async function(leagueName, skipLoader = false) {
    const mainContent = document.getElementById('main-content');
    const currentScroll = window.scrollY; // Zapamatujeme si, kde uživatel je

    if (!skipLoader) {
        mainContent.innerHTML = `<div class="loader">Načítám data z ligy...</div>`;
    }

    try {
        const dbRef = window.dbRef(window.db);
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
        let league = snapshot.val();

        // --- ZÁCHRANNÝ ŠTÍT: HRÁČ UŽ V LIZE NENÍ NEBO LIGA NEEXISTUJE ---
        if (!league || !league.participants || !league.participants[playerData.uid]) {
            alert("Do této miniligy už nemáš přístup (byla zrušena, nebo jsi byl vyhozen).");
            // Rovnou mu ji lokálně smažeme, ať ho to nemate
            if (playerData.myMinileagues) {
                playerData.myMinileagues = playerData.myMinileagues.filter(l => (typeof l === 'object' ? l.name : l) !== leagueName);
                saveGame();
            }
            renderMinileague(); // Vrátíme ho zpět na nový hlavní přehled
            return;
        }

        // --- SPOUŠTĚČ SIMULACE ---
        if (Date.now() >= league.nextMatchTime) {
            let loops = 0; // Bezpečnostní pojistka (max 10 kol najednou)
            
            while (Date.now() >= league.nextMatchTime && loops < 10) {
                await window.runMLSimulation(leagueName, league);
                // Po každém kole načteme nová data, abychom měli aktuální čas nextMatchTime
                const newSnap = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
                league = newSnap.val();
                loops++;
            }
        }

        window.currentMLNextMatch = league.nextMatchTime;

        // --- SYNCHRONIZACE ODEHRANÝCH ZÁPASŮ (GLOBÁLNÍ POČÍTADLO) ---
        if (playerData.myMinileagues) {
            const leagueIndex = playerData.myMinileagues.findIndex(l => 
                (typeof l === 'object' ? l.name : l) === leagueName
            );

            if (leagueIndex !== -1) {
                // Vezmeme oficiální globální počet kol z ligy
                const officialMatchesPlayed = league.globalPlayedRounds || 0;
                
                if (typeof playerData.myMinileagues[leagueIndex] === 'string') {
                    playerData.myMinileagues[leagueIndex] = {
                        name: playerData.myMinileagues[leagueIndex],
                        played: officialMatchesPlayed,
                        seasonEndTime: league.seasonEndTime
                    };
                } else {
                    playerData.myMinileagues[leagueIndex].played = officialMatchesPlayed;
                    playerData.myMinileagues[leagueIndex].seasonEndTime = league.seasonEndTime;
                }
                saveGame();
            }
        }

        const myTeam = league.teams[playerData.uid];
        // --- FIREBASE POJISTKA PRO PRÁZDNÉ POLE HRÁČŮ --- //
        if (myTeam && !myTeam.players) {
            myTeam.players = new Array(16).fill(null);
        }
        const layout = FORMATIONS_LAYOUT['4-4-2'];
        // --- GENEROVÁNÍ NOVÉ TABULKY --- //
        const isOwner = league.owner === playerData.uid; // Zjistíme, jestli jsi zakladatel

        let standingsHtml = Object.keys(league.standings)
            .sort((a,b) => {
                // Nejprve třídíme podle bodů
                if (league.standings[b].pts !== league.standings[a].pts) {
                    return league.standings[b].pts - league.standings[a].pts;
                }
                // Pokud je shoda bodů, rozhoduje rozdíl skóre
                const diffB = league.standings[b].gf - league.standings[b].ga;
                const diffA = league.standings[a].gf - league.standings[a].ga;
                return diffB - diffA;
            })
            .map((uid, i) => {
                const s = league.standings[uid];
                // Zvýrazníme řádek, pokud je to tvůj tým
                const isMyTeam = uid === playerData.uid ? 'class="my-team-row"' : '';
                const participantName = league.participants[uid];

                // Generování tlačítka pro vyhození (jen pro majitele a ne pro něj samotného)
                let actionButton = "";
                if (isOwner && uid !== playerData.uid) {
                    actionButton = `<button class="btn-task" style="background:#991b1b; padding: 2px 8px; font-size: 0.7rem; margin-left: 10px; border-radius: 4px;" onclick="kickFromMinileague('${leagueName}', '${uid}', '${participantName}')">Vyhodit</button>`;
                }
                
                return `
                <tr ${isMyTeam}>
                    <td style="color: #10b981; font-weight: bold;">${i+1}.</td>
                    <td style="text-align:left; display: flex; align-items: center; justify-content: space-between;">
                        <span class="ml-team-name">${participantName}</span>
                        ${actionButton}
                    </td>
                    <td>${s.p}</td>
                    <td style="color: #6b7280;">${s.gf}:${s.ga}</td>
                    <td>${s.w}</td>
                    <td>${s.d}</td>
                    <td>${s.l}</td>
                    <td style="font-weight:bold; font-size:1.1rem;">${s.pts}</td>
                </tr>`;
            }).join('');

        const renderMLRow = (start, end, title) => {
            let cards = "";
            for (let i = start; i < end; i++) cards += renderMLPlayerCard(myTeam.players[i], i, leagueName);
            return `<div class="ml-pitch-row"><span class="ml-row-title">${title}</span><div class="player-list">${cards}</div></div>`;
        };

        // STŘÍDAČKA - Pevně 5 míst (indexy 11 až 16)
        let benchCards = "";
        for (let i = 11; i < 16; i++) {
            benchCards += renderMLPlayerCard(myTeam.players[i], i, leagueName);
        }

        mainContent.innerHTML = `
            <div class="scouting-card minileague-container">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 class="section-title">🏆 ${league.name}</h2>
                    <button class="btn-task" onclick="renderMinileague()" style="background:#4b5563;">Zpět na přehled</button>
                </div>
                
                <div class="info-box" style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 1rem; color: #fcd34d;">⚽ Příští hrací kolo miniligy</h3>
                    <div id="ml-match-timer" style="font-family: 'Courier New', monospace; font-size: 1.8rem; font-weight: bold; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.3);">
                        00:00:00
                    </div>
                    <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #9ca3af;">Zápasy se hrají automaticky každých 8 hodin.</p>
                </div>

                <table class="minileague-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th style="text-align:left;">Manažer</th>
                            <th>Z</th>
                            <th>SKÓRE</th>
                            <th>V</th>
                            <th>R</th>
                            <th>P</th>
                            <th>B</th>
                        </tr>
                    </thead>
                    <tbody>${standingsHtml}</tbody>
                </table>
                <button class="btn-task" style="background:#6366f1; margin-bottom: 15px;" 
                    onclick="showMLHistory('${leagueName}')">📊 Výsledky poslední sezóny</button>

                <div class="minileague-locker-accordion">
                    <div class="locker-header" onclick="document.querySelector('.locker-content').classList.toggle('active')">
                        <span>👕 ŠATNA MINILIGY (Klikni pro sbalení/rozbalení)</span>
                        <span>▼</span>
                    </div>
                    <div class="locker-content active">
                        <div class="ml-pitch-area">
                            ${renderMLRow(layout.att[0], layout.att[1], "Útočníci")}
                            ${renderMLRow(layout.mid[0], layout.mid[1], "Záložníci")}
                            ${renderMLRow(layout.def[0], layout.def[1], "Obránci")}
                            ${renderMLRow(layout.gk[0], layout.gk[1], "Brankář")}
                        </div>
                        <div class="ml-bench-area">
                            <span class="ml-row-title">Střídačka (max 5 míst)</span>
                            <div class="player-list">${benchCards}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Vrátíme hráče tam, kam kliknul, bez trhnutí obrazovky
        if (skipLoader) {
            setTimeout(() => window.scrollTo(0, currentScroll), 0);
        }

    } catch (e) { 
        console.error("Chyba miniligy:", e);
        renderMinileague(); 
    }
}

// Funkce pro karty - je nyní 100% identická s hlavní šatnou
function renderMLPlayerCard(player, index, leagueName) {
    const isSelected = window.selectedMLIndex === index ? 'ml-selected' : '';
    
    if (!player) {
        return `<div class="player-card empty-slot ${isSelected}" onclick="handleMLPlayerClick('${leagueName}', ${index})">
                    <div class="empty-text">Volné místo</div>
                </div>`;
    }
    
    const posConfig = POSITION_STATS[player.position];
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };
    const starsHtml = player.stars > 0 ? '⭐'.repeat(player.stars) : '<span>&nbsp;</span>';
    const totalStats = posConfig.stats.reduce((sum, s) => sum + player.stats[s], 0);

    // Tlačítko pro návrat do rezervy (pouze pro střídačku)
    const returnHtml = index >= 11 
        ? `<button class="btn-reserve-action btn-to-reserve" onclick="event.stopPropagation(); returnFromMLToReserve('${leagueName}', ${index})" style="margin-top:5px; background-color: #3b82f6;">Vrátit do rezervy</button>` 
        : '';

    return `
        <div class="player-card ${posConfig.colorClass} ${isSelected}" onclick="handleMLPlayerClick('${leagueName}', ${index})">
            <div class="player-name">${player.name}</div>
            <div class="player-position-row">${posConfig.label}</div>
            
            <div class="player-info-line">
                <span style="font-style: italic; color: #6b7280;">${player.rank}</span> | ${getPlayerLevelText(player)} ${starsHtml}
            </div>
            
            <div class="player-nationality">Národnost: ${player.nationality}</div>

            ${returnHtml}

            <div class="player-stats" style="margin-top: 10px;">
                ${posConfig.stats.map(s => `
                    <div class="stat-item highlighted">
                        ${statLabels[s]}: <span>${player.stats[s]}</span>
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

window.renderMyMinileaguesList = async function() {
    const mainContent = document.getElementById('main-content');
    const myLeagues = playerData.myMinileagues || [];

    if (myLeagues.length === 0) {
        mainContent.innerHTML = `
            <div class="scouting-card minileague-container">
                <h2 class="section-title">Moje miniligy (0/3)</h2>
                <div style="margin-top:20px; text-align:center;">
                    <p class="text-muted">Zatím nejsi v žádné minilize.<br>Můžeš být maximálně ve 3 současně.</p>
                </div>
                <button class="btn-task btn-full-width" style="margin-top:20px; background:#4b5563;" onclick="renderMinileague()">Zpět na rozcestník</button>
            </div>`;
        return;
    }

    // Loader, protože teď taháme data z cloudu
    mainContent.innerHTML = `<div class="loader">Načítám tvé miniligy z cloudu...</div>`;

    let leaguesHtml = '';
    const dbRef = window.dbRef(window.db);

    for (const leagueData of myLeagues) {
        const leagueName = typeof leagueData === 'object' ? leagueData.name : leagueData;
        const leagueRank = typeof leagueData === 'object' ? `(${leagueData.rank})` : '';

        // Stažení detailů ligy
        const snapshot = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}`));
        
        // Proměnné definujeme nahoře, aby byly dostupné i pro HTML výpis níže
        let timeText = "Status neznámý";
        let ownerName = "Neznámý"; 

        if (snapshot.exists()) {
            const leagueInfo = snapshot.val();
            
            // Bezpečné načtení jména majitele
            if (leagueInfo.participants && leagueInfo.owner) {
                ownerName = leagueInfo.participants[leagueInfo.owner] || "Neznámý";
            }

            const timeLeft = leagueInfo.seasonEndTime - Date.now();
            
            if (timeLeft > 0) {
                const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const h = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                timeText = `⏳ Konec za: <strong>${d}d ${h}h ${m}m</strong>`;
            } else {
                timeText = `✅ Sezóna končí, probíhá vyhodnocení`;
            }
        }

        leaguesHtml += `
        <div style="background: rgba(0,0,0,0.3); border: 1px solid #4b5563; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <strong style="color: #fcd34d; font-size: 1.1rem;">🏆 ${leagueName}</strong> 
                <span style="color: #ccc; font-size: 0.9rem;">${leagueRank}</span>
                <div style="font-size: 0.85rem; color: #9ca3af; margin-top: 4px;">Zakladatel: <span style="color: #60a5fa;">${ownerName}</span></div>
                <div style="font-size: 0.85rem; color: #9ca3af; margin-top: 4px;">${timeText}</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-task" style="background:#2563eb; padding: 8px 15px;" onclick="renderMinileagueDetail('${leagueName}')">Vstoupit</button>
                <button class="btn-task" style="background:#991b1b; padding: 8px 15px;" onclick="leaveMinileague('${leagueName}')">Opustit</button>
            </div>
        </div>`;
    }

    mainContent.innerHTML = `
        <div class="scouting-card minileague-container">
            <h2 class="section-title">Moje miniligy (${myLeagues.length}/3)</h2>
            <div style="margin-top:20px;">${leaguesHtml}</div>
            <button class="btn-task btn-full-width" style="margin-top:20px; background:#4b5563;" onclick="renderMinileague()">Zpět na rozcestník</button>
        </div>
    `;
}

// Pomocná funkce pro vykreslení karet v minilize
function renderMinileaguePlayers(players) {
    const statLabels = { atk: 'Útok', def: 'Obrana', spd: 'Rychlost', str: 'Síla', eng: 'Výdrž', tek: 'Technika', gk: 'Brankář' };
    return players.map((player, i) => {
        const posConfig = POSITION_STATS[player.position];
        
        // DOPLNĚNÝ VÝPOČET CELKOVÉ SÍLY
        const totalStats = posConfig.stats.reduce((sum, s) => sum + player.stats[s], 0);

        return `
            <div class="player-card ${posConfig.colorClass}" style="width:180px; font-size:0.8rem;">
                <div class="player-name">${player.name}</div>
                <div class="player-position-row">${posConfig.label}</div>
                <div class="player-info-line">${player.rank} | Lvl.${player.level}</div>
                <div class="player-stats">
                    ${posConfig.stats.map(s => `<div class="stat-item">${statLabels[s]}: ${player.stats[s]}</div>`).join('')}

                <div class="stat-total">
                    <span>Celková síla:</span> 
                    <span style="font-weight: bold;">${totalStats}</span>
                </div>

                </div>
                ${i >= 11 ? `<button class="btn-small-add" style="background:red; width:100%; margin-top:5px;" onclick="alert('Funkce odstranění bude doplněna')">Odstranit</button>` : ''}
            </div>
        `;
    }).join('');
}

// FUNKCE KTERÁ UKÁŽE VÝSLEDKY POSLEDNÍ MINILIGY //
window.showMLHistory = async function(leagueName) {
    const dbRef = window.dbRef(window.db);
    const snap = await window.dbGet(window.dbChild(dbRef, `minileagues/${leagueName}/lastResults`));
    const results = snap.val();

    if (!results) {
        alert("Zatím nebyly odehrány žádné sezóny.");
        return;
    }

    const resText = results.map((r, i) => `${i+1}. ${r.name} - ${r.pts} bodů`).join('\n');
    alert(`🏆 POSLEDNÍ VÍTĚZOVÉ LIGY ${leagueName}:\n\n${resText}`);
};

window.openMLSelector = function(playerId) {
    const player = playerData.reserve.find(p => p.id === playerId);
    if (!player) return;

    // Filtrujeme ligy podle ranku
    const compatibleLeagues = (playerData.myMinileagues || []).filter(l => {
        if (typeof l === 'object') return l.rank === player.rank;
        return false;
    });

    if (compatibleLeagues.length === 0) {
        alert(`Nemáš žádnou aktivní miniligu pro rank: ${player.rank}`);
        return;
    }

    // Vytvoříme HTML pro overlay
    const overlay = document.createElement('div');
    overlay.className = 'ml-selector-overlay';
    overlay.id = 'ml-selector-modal';

    const listHtml = compatibleLeagues.map(l => `
        <div class="ml-select-item" onclick="executeMLTransfer('${playerId}', '${l.name}')">
            🏆 ${l.name}
        </div>
    `).join('');

    overlay.innerHTML = `
        <div class="ml-selector-box">
            <h3 style="color: #fcd34d; margin-top:0;">Odeslat do miniligy</h3>
            <p style="font-size: 0.85rem; color: #ccc;">
                Hráč <strong>${player.name}</strong> (${player.rank})<br>
                bude odeslán do vybrané ligy:
            </p>
            <div class="ml-selector-list">${listHtml}</div>
            <button class="btn-close-selector" onclick="document.getElementById('ml-selector-modal').remove()">Zavřít</button>
        </div>
    `;

    document.body.appendChild(overlay);
}