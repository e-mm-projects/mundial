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

    // --- NOVINKA: EVIDENCA ČERVENÝCH KARET ---
    const redCardedIds = [];

    // Chytřejší funkce pro náhodný výběr hráče (vynechá ty s červenou)
    const getActivePlayer = (players, range) => {
        let p;
        let attempts = 0;
        do {
            p = players[Math.floor(Math.random() * (range[1] - range[0])) + range[0]];
            attempts++;
        } while (redCardedIds.includes(p.id) && attempts < 10);
        return p;
    };

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
            matchLog.push({ min: 45, text: `Rozhodčí ukončil první půli a po přestávce zahajuje druhý poločas.`, score: `${myGoals}:${botGoals}`, zone: 50, type: 'neutral' });
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
            const pMyMid = getActivePlayer(myPlayers, formations[myFormation].mid);
            const pBotMid = getActivePlayer(botPlayers, formations[botFormation].mid);
            
            if (myMidPower > botMidPower) {
                if (Math.random() < 0.30) {
                    gameState = 'away_def'; 
                    matchLog.push({ min: minute, text: `Fantastický přehled! ${pMyMid.name} poslal prudký pas středem pole přímo na útočníky!`, score: `${myGoals}:${botGoals}`, zone: 80, type: 'chance' });
                } else {
                    gameState = 'away_mid'; 
                    matchLog.push({ min: minute, text: `Naše záloha vyhrála souboj ve středu hřiště. ${pMyMid.name} kontroluje míč.`, score: `${myGoals}:${botGoals}`, zone: 65, type: 'mid' });
                }
            } else {
                if (Math.random() < 0.30) {
                    gameState = 'home_def'; 
                    matchLog.push({ min: minute, text: `Soupeř hraje přímočaře! ${pBotMid.name} našel průnikovou nahrávkou volného spoluhráče.`, score: `${myGoals}:${botGoals}`, zone: 20, type: 'danger' });
                } else {
                    gameState = 'home_mid'; 
                    matchLog.push({ min: minute, text: `Soupeř ovládl střed hřiště. ${pBotMid.name} rozjíždí postupný útok.`, score: `${myGoals}:${botGoals}`, zone: 35, type: 'mid' });
                }
            }
        } 
        // 2. ZÓNA: STŘED SOUPEŘOVA POLOVINA
        else if (gameState === 'away_mid') {
            const pMyMid = getActivePlayer(myPlayers, formations[myFormation].mid);
            const pBotMid = getActivePlayer(botPlayers, formations[botFormation].mid);

            // ČERVENÁ KARTA (Soupeř)
            if (Math.random() < 0.02 && !redCardedIds.includes(pBotMid.id)) {
                redCardedIds.push(pBotMid.id);
                botFinalSectors.mid *= 0.75; // Ztrácí 25 % síly zálohy
                matchLog.push({ min: minute, text: `🟥 ČERVENÁ KARTA! Záložník soupeře ${pBotMid.name} předvedl likvidační faul na ${pMyMid.name} a je vyloučen! Získáváme standardku.`, score: `${myGoals}:${botGoals}`, zone: 75, type: 'goal' });
                gameState = 'away_def';
                continue;
            }

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
            const pMyMid = getActivePlayer(myPlayers, formations[myFormation].mid);
            const pBotMid = getActivePlayer(botPlayers, formations[botFormation].mid);

            // ČERVENÁ KARTA (Náš hráč)
            if (Math.random() < 0.02 && !redCardedIds.includes(pMyMid.id)) {
                redCardedIds.push(pMyMid.id);
                myFinalSectors.mid *= 0.75;
                matchLog.push({ min: minute, text: `🟥 ČERVENÁ KARTA! Náš ${pMyMid.name} úplně zbytečně zajel do protihráče a jde do sprch! Dohráváme v oslabení.`, score: `${myGoals}:${botGoals}`, zone: 25, type: 'bad-goal' });
                gameState = 'home_def';
                continue;
            }

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
            const pMyAtt = getActivePlayer(myPlayers, formations[myFormation].att);
            const pBotDef = getActivePlayer(botPlayers, formations[botFormation].def);

            // ČERVENÁ KARTA (Obránce soupeře)
            if (Math.random() < 0.03 && !redCardedIds.includes(pBotDef.id)) {
                redCardedIds.push(pBotDef.id);
                botFinalSectors.def *= 0.75; 
                matchLog.push({ min: minute, text: `🟥 ČERVENÁ KARTA! Soupeřův obránce ${pBotDef.name} hasil chybu loktem do tváře. Červená a obrovský tlak pro nás!`, score: `${myGoals}:${botGoals}`, zone: 85, type: 'goal' });
                gameState = 'away_box';
                continue;
            }

            if (myAttPower > botDefPower) { 
                gameState = 'away_box'; 
                matchLog.push({ min: minute, text: `Paráda! ${pMyAtt.name} obešel posledního obránce a proniká do vápna!`, score: `${myGoals}:${botGoals}`, zone: 90, type: 'chance' });
            } else {
                if (Math.random() < 0.40) {
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
            const pBotAtt = getActivePlayer(botPlayers, formations[botFormation].att);
            const pMyDef = getActivePlayer(myPlayers, formations[myFormation].def);

            // ČERVENÁ KARTA (Můj obránce)
            if (Math.random() < 0.03 && !redCardedIds.includes(pMyDef.id)) {
                redCardedIds.push(pMyDef.id);
                myFinalSectors.def *= 0.75;
                matchLog.push({ min: minute, text: `🟥 ČERVENÁ KARTA! Náš obránce ${pMyDef.name} zatahuje za záchrannou brzdu jako poslední hráč! Rozhodčí bez milosti tasí červenou.`, score: `${myGoals}:${botGoals}`, zone: 15, type: 'bad-goal' });
                gameState = 'home_box';
                continue;
            }

            if (botAttPower > myDefPower) { 
                gameState = 'home_box'; 
                matchLog.push({ min: minute, text: `Kritický moment! ${pBotAtt.name} se prodral přes naši obranu do vápna!`, score: `${myGoals}:${botGoals}`, zone: 10, type: 'danger' });
            } else {
                if (Math.random() < 0.40) {
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
            const pMyAtt = getActivePlayer(myPlayers, formations[myFormation].att);
            const pBotGk = getActivePlayer(botPlayers, formations[botFormation].gk);

            // --- PENALTA PRO NÁS (10 % šance, 80 % gól) ---
            if (Math.random() < 0.10) {
                matchLog.push({ min: minute, text: `🚨 PENALTA! Náš hráč byl tvrdě poslán k zemi ve vápně! K míči se staví ${pMyAtt.name}.`, score: `${myGoals}:${botGoals}`, zone: 92, type: 'chance' });
                if (Math.random() < 0.80) {
                    myGoals++;
                    gameState = 'center';
                    matchLog.push({ min: minute, text: `GÓÓÓL! ${pMyAtt.name} suverénně proměňuje penaltu, brankář skočil na druhou stranu!`, score: `${myGoals}:${botGoals}`, zone: 95, type: 'goal' });
                } else {
                    gameState = 'home_mid';
                    matchLog.push({ min: minute, text: `Zahozená penalta! Gólman ${pBotGk.name} vytáhl skvělý zákrok a odkopává míč směrem k nám!`, score: `${myGoals}:${botGoals}`, zone: 35, type: 'danger' });
                }
                continue;
            }

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
            const pBotAtt = getActivePlayer(botPlayers, formations[botFormation].att);
            const pMyGk = getActivePlayer(myPlayers, formations[myFormation].gk);

            // ---  PENALTA PRO SOUPEŘE ---
            if (Math.random() < 0.10) {
                matchLog.push({ min: minute, text: `🚨 PENALTA! Faul v našem vápně, rozhodčí nekompromisně ukazuje na značku! Kope ${pBotAtt.name}.`, score: `${myGoals}:${botGoals}`, zone: 8, type: 'danger' });
                if (Math.random() < 0.80) {
                    botGoals++;
                    gameState = 'center';
                    matchLog.push({ min: minute, text: `Gól. ${pBotAtt.name} z penalty nezaváhal a prostřelil našeho brankáře.`, score: `${myGoals}:${botGoals}`, zone: 5, type: 'bad-goal' });
                } else {
                    gameState = 'away_mid';
                    matchLog.push({ min: minute, text: `NESKUTEČNÉ! Náš brankář ${pMyGk.name} penaltu chytá a otáčí hru dlouhým výkopem!`, score: `${myGoals}:${botGoals}`, zone: 65, type: 'goal' });
                }
                continue;
            }

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

    // Pomocná funkce pro generování náhodného počtu v rozmezí
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Počty hráčů pro jednotlivé ranky v týmu (Indexy 0 až 5 podle PLAYER_RANKS)
    let counts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0 };

    if (division === 10) { 
        counts[0] = 11; 
    } else if (division === 9) { 
        counts[1] = rand(1, 8); counts[0] = 11 - counts[1]; 
    } else if (division === 8) { 
        counts[2] = rand(1, 6); counts[1] = 11 - counts[2]; 
    } else if (division === 7) { 
        counts[3] = rand(1, 4); counts[2] = rand(1, 4); counts[1] = 11 - counts[3] - counts[2]; 
    } else if (division === 6) { 
        counts[3] = rand(4, 8); counts[2] = 11 - counts[3]; 
    } else if (division === 5) { 
        counts[4] = rand(1, 4); counts[3] = rand(1, 4); counts[2] = 11 - counts[4] - counts[3]; 
    } else if (division === 4) { 
        counts[4] = rand(4, 8); counts[3] = 11 - counts[4]; 
    } else if (division === 3) { 
        counts[5] = rand(1, 3); counts[4] = rand(4, 7); counts[3] = 11 - counts[5] - counts[4]; 
    } else if (division === 2) { 
        counts[5] = rand(4, 8); counts[4] = 11 - counts[5]; 
    } else if (division === 1) { 
        counts[5] = rand(8, 11); counts[4] = 11 - counts[5]; 
    } else { 
        counts[0] = 11; // Bezpečnostní pojistka
    }

    // Sestavíme bazén ranků (11 pozic) na základě našich počtů
    let rankPool = [];
    for (let r = 0; r <= 5; r++) {
        for (let i = 0; i < counts[r]; i++) {
            rankPool.push(r);
        }
    }
    
    // Zamícháme je, aby hvězdy nebyly vždy jen v útoku (nebo naopak)
    rankPool.sort(() => 0.5 - Math.random());

    for (let i = 0; i < 11; i++) {
        const rankIdx = rankPool[i];
        const rankData = PLAYER_RANKS[rankIdx];
        
        const minS = rankData.minStart || 1;
        const maxS = rankData.maxStart || 10;

        botPlayers.push({
            id: 'bot_' + Math.random().toString(36).substr(2, 9),
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            rank: rankData.name,
            level: 1,
            statCap: rankData.cap,
            stars: Math.floor(Math.random() * 3) + 1, // Boti mají průměrně 1-3 hvězdy
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