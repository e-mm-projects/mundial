function calculateSectorStrength(players, formation, isPrepared = false) {
    const sectors = { mid: 0, att: 0, def: 0, gk: 0 };
    const counts = { mid: 0, att: 0, def: 0, gk: 0 }; // Nové: počítadlo hráčů v sektoru
    
    const formations = {
        '4-4-2': { gk: [0, 1], def: [1, 5], mid: [5, 9], att: [9, 11] },
        '4-3-3': { gk: [0, 1], def: [1, 5], mid: [5, 8], att: [8, 11] },
        '5-4-1': { gk: [0, 1], def: [1, 6], mid: [6, 10], att: [10, 11] }
    };
    const layout = formations[formation];

    // --- BONUS ZA TRÁVNÍK ---
    const pitchLevel = playerData.buildings.pitch || 0;
    const pitchBonus = 1 + (pitchLevel * 0.01); // 1 % za každý level

    players.slice(0, 11).forEach((p, index) => {
        // Vytvoříme si pro výpočet "naboostovanou" rychlost
        const effectiveSpd = p.stats.spd * pitchBonus;

        if (index >= layout.gk[0] && index < layout.gk[1]) {
            sectors.gk += (p.stats.gk * 1.2) + p.stats.tek + p.stats.def + effectiveSpd;
            counts.gk++;
        } else if (index >= layout.def[0] && index < layout.def[1]) {
            sectors.def += (p.stats.def * 1.2) + p.stats.str + effectiveSpd + p.stats.eng;
            counts.def++;
        } else if (index >= layout.mid[0] && index < layout.mid[1]) {
            sectors.mid += (p.stats.tek * 1.2) + p.stats.atk + p.stats.def + effectiveSpd + p.stats.eng;
            counts.mid++;
        } else if (index >= layout.att[0] && index < layout.att[1]) {
            sectors.att += (p.stats.atk * 1.2) + effectiveSpd + p.stats.tek + p.stats.eng;
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

function updateTeamStats(t1, t2, g1, g2) {
    t1.z++; t2.z++;
    t1.gf += g1; t1.ga += g2;
    t2.gf += g2; t2.ga += g1;
    if (g1 > g2) { t1.v++; t1.points += 3; t2.p++; }
    else if (g1 === g2) { t1.r++; t1.points += 1; t2.r++; t2.points += 1; }
    else { t1.p++; t2.v++; t2.points += 3; }
}

function generateBotTeam(division) {
    const formations = ['4-4-2', '4-3-3', '5-4-1'];
    const botFormation = formations[Math.floor(Math.random() * formations.length)];
    const botPlayers = [];

    // Logika pro výběr ranků podle divize (přesně podle tvého zadání)
    let possibleRankIndices = [];
    if (division === 10) possibleRankIndices = [0]; // Jen Kopyta
    else if (division === 9) possibleRankIndices = [0, 1]; // Kopyta + Slibní amatéři
    else if (division === 8) possibleRankIndices = [1]; // Jen Slibní amatéři
    else if (division === 7) possibleRankIndices = [1, 2]; // Slibní + Srdcaři
    else if (division === 6) possibleRankIndices = [2]; // Jen Srdcaři
    else if (division === 5) possibleRankIndices = [2, 3]; // Srdcaři + Ligoví borci
    else if (division === 4) possibleRankIndices = [3]; // Jen Ligoví borci
    else if (division === 3) possibleRankIndices = [3, 4]; // Borci + Reprezentanti
    else if (division === 2) possibleRankIndices = [4]; // Jen Reprezentanti
    else if (division === 1) possibleRankIndices = [4, 5]; // Reprezentanti + Legendy
    else possibleRankIndices = [0];

    for (let i = 0; i < 11; i++) {
        // Vybereme náhodný rank z povolených pro tuto divizi
        const rankIdx = possibleRankIndices[Math.floor(Math.random() * possibleRankIndices.length)];
        const rankData = PLAYER_RANKS[rankIdx];
        
        const minS = rankData.minStart || 1;
        const maxS = rankData.maxStart || 10;

        botPlayers.push({
            id: 'bot_' + Math.random().toString(36).substr(2, 9),
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            rank: rankData.name,
            level: 1,
            statCap: rankData.cap,
            stars: Math.floor(Math.random() * 3) + 1, // Boti mají 1-3 hvězdy
            stats: {
                atk: Math.floor(Math.random() * (maxS - minS + 1)) + minS,
                def: Math.floor(Math.random() * (maxS - minS + 1)) + minS,
                spd: Math.floor(Math.random() * (maxS - minS + 1)) + minS,
                str: Math.floor(Math.random() * (maxS - minS + 1)) + minS,
                eng: Math.floor(Math.random() * (maxS - minS + 1)) + minS,
                gk:  Math.floor(Math.random() * (maxS - minS + 1)) + minS,
                tek: Math.floor(Math.random() * (maxS - minS + 1)) + minS
            }
        });
    }

    return { formation: botFormation, players: botPlayers };
}