// =======================================================================
// --------------- FOTBALOVÉ PODZEMÍ (PvE) --------------- 
// =======================================================================

// --- KONFIGURACE FOTBALOVÉHO PODZEMÍ (PvE) ---
const PVE_DUNGEONS = [
    // --- 1. POHÁR ---
    {
        id: 'kopyta',
        name: 'Pohár Zlámaných Kopyt',
        desc: 'Pralesní liga nejhrubšího zrna. Tady se nehraje na taktiku, tady se hraje na přežití.',
        stages: [
            {
                name: 'FC JZD (Traktoristi)',
                desc: 'Přijeli na zápas rovnou z pole. Mají obrovskou sílu, ale rychlost a techniku nechali v kabině.',
                botPower: { att: 7, mid: 8, def: 11, gk: 8 },
                reward: { xp: 200, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Hospoda u Zrzavého Psa',
                desc: 'O poločase do sebe kopli dvě piva. Mají šílenou výdrž, ale z míče mají strach.',
                botPower: { att: 8, mid: 12, def: 7, gk: 8 },
                reward: { xp: 300, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Sokol "Stará Garda"',
                desc: 'Věkový průměr 55 let. Moc toho nenaběhají, ale jejich obranný beton a zkušený brankář jsou legendární.',
                botPower: { att: 6, mid: 6, def: 13, gk: 13 },
                reward: { xp: 400, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Řezníci z Masokombinátu',
                desc: 'Hrají ostře a neberou si servítky. Z jejich útočníků jde strach.',
                botPower: { att: 14, mid: 8, def: 7, gk: 8 },
                reward: { xp: 500, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Výběr Okresního Přeboru',
                isBoss: true,
                desc: 'To nejlepší (rozuměj nejhorší), co místní vesnice nabízí. Tým, který ti nedá nic zadarmo.',
                botPower: { att: 14, mid: 12, def: 12, gk: 11 },
                reward: { xp: 1000, rank: 'Slibný amatér', minStars: 1, maxStars: 1 }
            }
        ]
    },

    // --- 2. POHÁR ---
    {
        id: 'drevorubci',
        name: 'Turnaj Ohebných Loktů',
        desc: 'Rozhodčí sem jezdí s ochrankou. Fotbal se tu mísí s bojovými uměními.',
        stages: [
            {
                name: 'FC Betonárka',
                desc: 'Jejich taktika je jednoduchá: Postavit před bránu zeď a modlit se. Útok neexistuje.',
                botPower: { att: 8, mid: 10, def: 18, gk: 15 },
                reward: { xp: 600, rank: 'Slibný amatér', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Dřevorubci z Lesa',
                desc: 'Chlapi jako hory. Balón většinou netrefí, ale holeně protihráčů ano.',
                botPower: { att: 16, mid: 12, def: 14, gk: 10 },
                reward: { xp: 700, rank: 'Slibný amatér', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Okresní Simulanti',
                desc: 'Při každém vánku padají na zem a křičí. Naučili se skvěle zdržovat hru.',
                botPower: { att: 14, mid: 18, def: 12, gk: 12 },
                reward: { xp: 800, rank: 'Slibný amatér', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Věční Ofsajdisti',
                desc: 'Jejich útočník kempuje u tvojí brány už od rozcvičky. Jednou mu to ale vyjde.',
                botPower: { att: 22, mid: 12, def: 10, gk: 11 },
                reward: { xp: 900, rank: 'Slibný amatér', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Králové Faulů',
                isBoss: true,
                desc: 'Zákeřní, hrubí a překvapivě sehraní. Mají vlastního právníka na červené karty.',
                botPower: { att: 20, mid: 22, def: 20, gk: 18 },
                reward: { xp: 1500, rank: 'Srdcař', minStars: 1, maxStars: 3 }
            }
        ]
    },

    // --- 3. POHÁR ---
    {
        id: 'ztraceny_mic',
        name: 'Memoriál Ztraceného Míče',
        desc: 'Hraje se poblíž řeky. Kdo překopne míč přes plot, platí po zápase rundu.',
        stages: [
            {
                name: 'Překopávači Tribun',
                desc: 'Mají sílu v noze jako kůň, ale mušku úplně slepou. Občas náhodou trefí bránu z půlky.',
                botPower: { att: 25, mid: 15, def: 18, gk: 15 },
                reward: { xp: 1000, rank: 'Slibný amatér', minStars: 2, maxStars: 4 }
            },
            {
                name: 'Hledači v Kukuřici',
                desc: 'Tráví víc času hledáním míčů v poli než tréninkem. Mají skvělý přehled a zálohu.',
                botPower: { att: 18, mid: 28, def: 20, gk: 18 },
                reward: { xp: 1200, rank: 'Slibný amatér', minStars: 2, maxStars: 4 }
            },
            {
                name: 'FC Zákop',
                desc: 'Zalezou na vápno a odmítají ho opustit. Brankář je tlustý a vyplňuje skoro celou bránu.',
                botPower: { att: 12, mid: 15, def: 30, gk: 32 },
                reward: { xp: 1400, rank: 'Srdcař', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Mlynáři od Řeky',
                desc: 'Běhají nahoru dolů jako voda v mlýně. Fyzicky tě absolutně uštvou.',
                botPower: { att: 24, mid: 26, def: 22, gk: 20 },
                reward: { xp: 1600, rank: 'Srdcař', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Strážci Plotu',
                isBoss: true,
                desc: 'Místní šampioni. Už pět let doma neprohráli a míč přes plot překopnou jen, když chtějí.',
                botPower: { att: 30, mid: 28, def: 28, gk: 26 },
                reward: { xp: 2500, rank: 'Srdcař', minStars: 2, maxStars: 4 }
            }
        ]
    },

    // --- 4. POHÁR ---
    {
        id: 'firemni_liga',
        name: 'Pohár Zlatého Bažanta',
        desc: 'Sponzorská liga firemních týmů. Mají drahé kopačky, ale břicho jim překáží ve výskoku.',
        stages: [
            {
                name: 'FC Kancelářské Krysy',
                desc: 'Celý den sedí u Excelu. Umí si to skvěle spočítat, jejich přihrávky mají geometrickou přesnost.',
                botPower: { att: 22, mid: 34, def: 24, gk: 22 },
                reward: { xp: 1800, rank: 'Srdcař', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Skladníci v Akci',
                desc: 'Zvyklí tahat těžké palety. V osobních soubojích tě jednoduše odtlačí až na střídačku.',
                botPower: { att: 25, mid: 22, def: 35, gk: 28 },
                reward: { xp: 2000, rank: 'Srdcař', minStars: 1, maxStars: 2 }
            },
            {
                name: 'FC Městská Policie',
                desc: 'Zastaví tě a dají ti pokutu za rychlost v pokutovém území. Brání velmi organizovaně.',
                botPower: { att: 25, mid: 30, def: 38, gk: 32 },
                reward: { xp: 2200, rank: 'Srdcař', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Hasiči na Tahu',
                desc: 'Když hoří v obraně, vždycky to hasí. A jejich útok má obrovský tlak v hadici.',
                botPower: { att: 38, mid: 28, def: 32, gk: 28 },
                reward: { xp: 2500, rank: 'Srdcař', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Starostův Výběr',
                isBoss: true,
                desc: 'Sponzorováno z městské kasy. Starosta nakoupil drahé posily a běda, jak mu to překazíš.',
                botPower: { att: 44, mid: 42, def: 40, gk: 38 },
                reward: { xp: 3500, rank: 'Ligový borec', minStars: 1, maxStars: 2 }
            }
        ]
    },

    // --- 5. POHÁR ---
    {
        id: 'betonova_dzungle',
        name: 'Trofej Děravých Tepláků',
        desc: 'Městský fotbal na asfaltu a betonu. Tady se rodí surový talent bez jakýchkoliv pravidel.',
        stages: [
            {
                name: 'Asfaltoví Snipeři',
                desc: 'Odrážejí míč od obrubníku rovnou do šibenice. Z dálky jsou smrtící.',
                botPower: { att: 48, mid: 38, def: 35, gk: 36 },
                reward: { xp: 3000, rank: 'Ligový borec', minStars: 1, maxStars: 1 }
            },
            {
                name: 'FC Sídliště Sever',
                desc: 'Kluci ze sousedství. Jsou neskutečně rychlí, udělají ti kličku i na pětníku.',
                botPower: { att: 42, mid: 50, def: 40, gk: 35 },
                reward: { xp: 3300, rank: 'Ligový borec', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Drtiči z Parku',
                desc: 'Hrají tam, kde není tráva, jen bláto a kamení. Jsou tvrdí jako skála.',
                botPower: { att: 38, mid: 42, def: 55, gk: 48 },
                reward: { xp: 3600, rank: 'Ligový borec', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Futsaloví Kouzelníci',
                desc: 'Z velkého hřiště mají sice trochu závrať, ale míč jim na noze drží jako přilepený.',
                botPower: { att: 55, mid: 55, def: 42, gk: 40 },
                reward: { xp: 4000, rank: 'Ligový borec', minStars: 2, maxStars: 2 }
            },
            {
                name: 'Králové Ulice',
                isBoss: true,
                desc: 'Legendy sídliště. Nikdy nehráli za profíky, ale strčili by je všechny s přehledem do kapsy.',
                botPower: { att: 58, mid: 56, def: 54, gk: 52 },
                reward: { xp: 5500, rank: 'Ligový borec', minStars: 2, maxStars: 5 }
            }
        ]
    },

    // --- 6. POHÁR ---
    {
        id: 'odpadlici',
        name: 'Liga Natažených Třísel',
        desc: 'Místo, kam chodí profesionálové dohrát kariéru. Chybí jim kondice, ale fotbalové IQ mají obrovské.',
        stages: [
            {
                name: 'Vysloužilí Profíci',
                desc: 'Hráli první ligu, teď mají 15 kilo nadváhu. Pořád ale umí dát centr přesně na milimetr.',
                botPower: { att: 60, mid: 62, def: 52, gk: 50 },
                reward: { xp: 4500, rank: 'Ligový borec', minStars: 3, maxStars: 4 }
            },
            {
                name: 'FC Křeč',
                desc: 'Kolem 70. minuty všichni lehnou s křečemi. Do té doby je to ale drtivý ofenzivní válec.',
                botPower: { att: 68, mid: 52, def: 48, gk: 45 },
                reward: { xp: 5000, rank: 'Ligový borec', minStars: 3, maxStars: 4 }
            },
            {
                name: 'Loudaví Stopeři',
                desc: 'Obrana je pomalá, ale vždycky stojí přesně tam, kam letí míč. Neprojdeš.',
                botPower: { att: 45, mid: 50, def: 70, gk: 68 },
                reward: { xp: 5500, rank: 'Ligový borec', minStars: 3, maxStars: 4 }
            },
            {
                name: 'Chodící Legendy',
                desc: 'Už vůbec neběhají. Míč za ně dělá veškerou práci. Jejich pasy mažou obranu.',
                botPower: { att: 65, mid: 75, def: 55, gk: 58 },
                reward: { xp: 6000, rank: 'Ligový borec', minStars: 3, maxStars: 5 }
            },
            {
                name: 'Padlé Hvězdy',
                isBoss: true,
                desc: 'Sestava bývalých reprezentantů. Sice u toho funí, ale předvedou ti fotbalovou školu.',
                botPower: { att: 72, mid: 70, def: 68, gk: 65 },
                reward: { xp: 8000, rank: 'Reprezentant', minStars: 1, maxStars: 3 }
            }
        ]
    },

    // --- 7. POHÁR ---
    {
        id: 'akademie',
        name: 'Pohár Umělého Trávníku',
        desc: 'Mladí, draví a velmi drzí. Zimní přípravná liga plná těch nejvíc namistrovaných floutků.',
        stages: [
            {
                name: 'Geloví Fešáci',
                desc: 'O poločase si upravují účes. Nesnášejí souboje, ale technicky jsou na výši.',
                botPower: { att: 72, mid: 78, def: 62, gk: 64 },
                reward: { xp: 7000, rank: 'Reprezentant', minStars: 2, maxStars: 3 }
            },
            {
                name: 'TikŤok Tanečníci',
                desc: 'Góly slaví tanečkem na sítě. Mají nevyčerpatelnou kondici a skvělé přešlapovačky.',
                botPower: { att: 80, mid: 72, def: 65, gk: 62 },
                reward: { xp: 7500, rank: 'Reprezentant', minStars: 2, maxStars: 3 }
            },
            {
                name: 'Sebestřední Sólisti',
                desc: 'Nikomu nepřihrají. Každý chce dát gól sám. Nebezpeční jsou z každé pozice.',
                botPower: { att: 85, mid: 65, def: 70, gk: 72 },
                reward: { xp: 8000, rank: 'Reprezentant', minStars: 2, maxStars: 3 }
            },
            {
                name: 'Plačtiví Junioři',
                desc: 'Při sebemenším kontaktu brečí u rozhodčího. Takticky ale naprosto vyspělí.',
                botPower: { att: 68, mid: 82, def: 80, gk: 68 },
                reward: { xp: 8500, rank: 'Reprezentant', minStars: 2, maxStars: 3 }
            },
            {
                name: 'Akademie Namistrovaných',
                isBoss: true,
                desc: 'Ti největší talenti v republice s obrovským egem. Fotbal hrají fantasticky, o tom žádná.',
                botPower: { att: 85, mid: 84, def: 82, gk: 80 },
                reward: { xp: 12000, rank: 'Legenda', minStars: 1, maxStars: 2 }
            }
        ]
    },

    // --- 8. POHÁR ---
    {
        id: 'taktika',
        name: 'Turnaj Ocelových Holení',
        desc: 'Poloprofesionální úroveň. Tady už končí legrace. Týmy mají analytiky a trénují dvoufázově.',
        stages: [
            {
                name: 'Taktikův Sen',
                desc: 'Hrají přesně podle not, jako roboti. Nevymýšlí blbosti, trestají každou chybu.',
                botPower: { att: 82, mid: 84, def: 82, gk: 80 },
                reward: { xp: 10000, rank: 'Legenda', minStars: 1, maxStars: 1 }
            },
            {
                name: 'FC Catenaccio',
                desc: 'Italský systém absolutní obrany. Dostat se jim do vápna je těžší než vyloupit banku.',
                botPower: { att: 72, mid: 80, def: 92, gk: 88 },
                reward: { xp: 11000, rank: 'Legenda', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Běžci z Keni',
                desc: 'Presují tě celých 90 minut, jako by zrovna běželi maraton. Nedají ti vteřinu klidu.',
                botPower: { att: 88, mid: 88, def: 75, gk: 72 },
                reward: { xp: 12000, rank: 'Legenda', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Brejkoví Predátoři',
                desc: 'Čekají na tvou ztrátu míče a za 5 vteřin z toho dají gól. Smrtící protiútoky.',
                botPower: { att: 92, mid: 80, def: 84, gk: 80 },
                reward: { xp: 13000, rank: 'Legenda', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Taktický Génius',
                isBoss: true,
                desc: 'Trenér soupeře má načtený každý tvůj krok. Tento tým nemá vůbec žádnou slabinu.',
                botPower: { att: 90, mid: 90, def: 88, gk: 88 },
                reward: { xp: 18000, rank: 'Legenda', minStars: 3, maxStars: 3 }
            }
        ]
    },

    // --- 9. POHÁR ---
    {
        id: 'korupce',
        name: 'Pohár Korupčního Skandálu',
        desc: 'Vítej ve světě velkých peněz. Tady se zápasy nevyhrávají jen na hřišti, ale i v zákulisí.',
        stages: [
            {
                name: 'Zlatí Hoši z Dotací',
                desc: 'Mají neomezený rozpočet a hráče, které si normálně nikdo nemůže dovolit.',
                botPower: { att: 90, mid: 88, def: 86, gk: 86 },
                reward: { xp: 15000, rank: 'Legenda', minStars: 2, maxStars: 3 }
            },
            {
                name: 'FC Obálka',
                desc: 'Jejich majitel přijel v nejdražším autě. Podezřele často se pískají penalty v jejich prospěch.',
                botPower: { att: 85, mid: 94, def: 88, gk: 85 },
                reward: { xp: 16000, rank: 'Legenda', minStars: 2, maxStars: 4 }
            },
            {
                name: 'Tým Rozhodčích',
                desc: 'Sehnali si vlastní tým. Mají píšťalky a nebojí se je použít. O ofsajdu rozhodují oni.',
                botPower: { att: 82, mid: 88, def: 96, gk: 92 },
                reward: { xp: 17000, rank: 'Legenda', minStars: 2, maxStars: 4 }
            },
            {
                name: 'Ropní Šejkové B',
                desc: 'Rezervní tým multimiliardářů. I jejich uklízečka bere víc než tvůj nejlepší útočník.',
                botPower: { att: 96, mid: 90, def: 88, gk: 86 },
                reward: { xp: 18000, rank: 'Legenda', minStars: 2, maxStars: 4 }
            },
            {
                name: 'Nedotknutelní',
                isBoss: true,
                desc: 'Kartel fotbalových mocipánů. Tohle už není sport, tohle je demonstrace absolutní fotbalové moci.',
                botPower: { att: 94, mid: 95, def: 94, gk: 93 },
                reward: { xp: 25000, rank: 'Legenda', minStars: 3, maxStars: 5 }
            }
        ]
    },

    // --- 10. POHÁR ---
    {
        id: 'bohove',
        name: 'Liga Fotbalových Bohů',
        desc: 'Poslední hranice. Vyzýváš bytosti, které fotbal nehrály, ony ho stvořily.',
        stages: [
            {
                name: 'FC Galacticos (Wish verze)',
                desc: 'Nejslavnější jména historie hrající v naprosté symfonii. Míč jim z nohy nevezmeš.',
                botPower: { att: 96, mid: 97, def: 93, gk: 92 },
                reward: { xp: 20000, rank: 'Legenda', minStars: 3, maxStars: 4 }
            },
            {
                name: 'Kybernetičtí Atleti',
                desc: 'Vypadají jako lidi, ale podle toho, jak rychle běhají a jak přesně střílí, to musí být stroje.',
                botPower: { att: 95, mid: 98, def: 95, gk: 94 },
                reward: { xp: 22000, rank: 'Legenda', minStars: 3, maxStars: 4 }
            },
            {
                name: 'Ocelová Opona',
                desc: 'Jejich obránci mají dva metry a brankář levituje. Nedatelný gól získal zcela nový význam.',
                botPower: { att: 88, mid: 92, def: 99, gk: 99 },
                reward: { xp: 24000, rank: 'Legenda', minStars: 4, maxStars: 4 }
            },
            {
                name: 'Vládci Vesmíru',
                desc: 'Míč u nich porušuje fyzikální zákony. Zahýbá za roh a zrychluje ve vzduchu.',
                botPower: { att: 99, mid: 96, def: 95, gk: 94 },
                reward: { xp: 26000, rank: 'Legenda', minStars: 4, maxStars: 4 }
            },
            {
                name: 'Absolutní Fotbalová Singularita',
                isBoss: true,
                desc: 'Ztělesnění samotného fotbalu. Poraz je, a staneš se největším manažerem v historii vesmíru.',
                botPower: { att: 99, mid: 99, def: 99, gk: 99 }, // Finální boss přesně na maximu!
                reward: { xp: 50000, rank: 'Legenda', minStars: 5, maxStars: 5 }
            }
        ]
    }
];

// Testovací tlačítko pro přeskočení cooldownu
window.skipPvETime = function() {
    if (playerData.pve) {
        playerData.pve.nextMatchTime = 0;
        saveGame();
        if (typeof renderPvE === 'function') renderPvE();
    }
}

// Opravený generátor odměny v podobě hráče
window.generateRewardPlayer = function(rankName, minStars, maxStars) {
    const positions = ['att', 'mid', 'def', 'gk'];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const nat = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
    
    const stars = Math.floor(Math.random() * (maxStars - minStars + 1)) + minStars;
    const rankObj = PLAYER_RANKS.find(r => r.name === rankName);
    
    // Zjistíme správné mantinely pro daný rank
    const minS = rankObj.minStart || 1;
    const maxS = rankObj.maxStart || 10;
    
    const stats = { atk: 0, def: 0, spd: 0, str: 0, eng: 0, gk: 0, tek: 0 };
    const allowedStats = POSITION_STATS[position].stats;
    
    // Vygenerujeme čísla podle ranku
    allowedStats.forEach(s => {
        let generatedValue = Math.floor(Math.random() * (maxS - minS + 1)) + minS;
        stats[s] = Math.min(rankObj.cap, generatedValue);
    });

    return {
        id: 'pve_' + Math.random().toString(36).substr(2, 9),
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        position: position,
        nationality: nat.name,
        flag: nat.flag, 
        rank: rankObj.name,
        statCap: rankObj.cap,
        stars: stars,
        level: 1,           
        maxLevel: stars === 0 ? 1 : stars * 5, 
        xp: 0,
        unspentPoints: 0,
        stats: stats
    };
}

// Simulace podzemí
window.startPvEMatch = function(dIndex, sIndex) {
    const stage = PVE_DUNGEONS[dIndex].stages[sIndex];
    playerData.pve.nextMatchTime = Date.now() + 3600000;

    const botFormation = '4-4-2';
    const layout = FORMATIONS_LAYOUT[botFormation];
    const botPlayers = [];

    for (let i = 0; i < 11; i++) {
        let pos = 'att';
        if (i >= layout.gk[0] && i < layout.gk[1]) pos = 'gk';
        else if (i >= layout.def[0] && i < layout.def[1]) pos = 'def';
        else if (i >= layout.mid[0] && i < layout.mid[1]) pos = 'mid';

        const power = stage.botPower[pos];
        const stats = { atk: 0, def: 0, spd: 0, str: 0, eng: 0, gk: 0, tek: 0 };
        POSITION_STATS[pos].stats.forEach(s => stats[s] = power);

        botPlayers.push({ name: `Hráč soupeře`, position: pos, stats: stats });
    }

    const mySectors = calculateSectorStrength(playerData.players, playerData.formation, playerData.isPrepared);
    const botSectors = calculateSectorStrength(botPlayers, botFormation, false);
    const myBaseRating = calculateBaseTeamRating(playerData.players, playerData.formation);
    const botBaseRating = calculateBaseTeamRating(botPlayers, botFormation);

    const result = simulateMatch(mySectors, botSectors, playerData.formation, botFormation, playerData.players, botPlayers, stage.name);

    let isVictory = result.myGoals > result.botGoals;
    let mailSubject = `⚔️ Záznam z podzemí: FC ${playerData.managerName} vs ${stage.name}`;

    if (isVictory) {
        let levelUps = [];
        playerData.players.slice(0, 11).forEach(p => {
            if (addPlayerXp(p, stage.reward.xp)) levelUps.push(p.name);
        });
        if (levelUps.length > 0) {
            result.log.push({ min: 'Konec', text: `🌟 ZLEPŠENÍ: Hráči ${levelUps.join(', ')} postoupili na novou úroveň!`, score: `${result.myGoals}:${result.botGoals}`, zone: 50, type: 'neutral' });
        }
        
        // Zde voláme naši opravenou funkci (přidáno window. kvůli globální dostupnosti)
        const newPlayer = window.generateRewardPlayer(stage.reward.rank, stage.reward.minStars, stage.reward.maxStars);
        playerData.players.push(newPlayer);
        
        result.log.push({ min: 'Konec', text: `🎁 ZÍSKAL JSI NOVÉHO HRÁČE! Podívej se do Šatny. Jmenuje se ${newPlayer.name}.`, score: `${result.myGoals}:${result.botGoals}`, zone: 50, type: 'goal' });

        if (stage.reward && stage.reward.isBoss) {
            window.awardPvETrophy(PVE_DUNGEONS[dIndex].name, stage.name);
        }

        playerData.pve.stageIndex++;
        if (playerData.pve.stageIndex >= PVE_DUNGEONS[dIndex].stages.length) {
            playerData.pve.stageIndex = 0;
            playerData.pve.dungeonIndex++; 
        }
    } else {
        result.log.push({ min: 'Konec', text: `Soupeř byl tentokrát příliš silný. Odpočiň si, uprav taktiku a zkus to za hodinu znovu!`, score: `${result.myGoals}:${result.botGoals}`, zone: 50, type: 'bad-goal' });
    }

    const matchRewards = {
        homeTeam: `FC ${playerData.managerName}`,
        awayTeam: stage.name,
        myRating: myBaseRating,
        botRating: botBaseRating,
        money: 0,
        xp: isVictory ? 50 : 0,
        pXp: isVictory ? stage.reward.xp : 0
    };
    
    // Čas záznamu zarovnaný bez vteřin (jak jsme to dělali u ligy)
    const matchDateObj = new Date();
    const formattedMatchDate = matchDateObj.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });

    addMailMessage(mailSubject, result.log, `${result.myGoals}:${result.botGoals}`, matchRewards, formattedMatchDate);

    playerData.mail[0].isPvE = true;

    saveGame();
    if (typeof renderPvE === 'function') renderPvE();
}

// reset podzemí pro testování //
window.resetDungeonTest = function() {
    if (confirm("Opravdu chceš resetovat postup v podzemí pro testování?")) {
        playerData.pve.dungeonIndex = 0;
        playerData.pve.stageIndex = 0;
        playerData.pve.nextMatchTime = 0; 
        saveGame();
        if (typeof renderPvE === 'function') renderPvE();
        alert("Podzemí bylo resetováno na úplný začátek!");
    }
};

// =======================================================================
// --------------- VYKRESLENÍ UI PRO PVE --------------- 
// =======================================================================
function renderPvE() {
    const mainContent = document.getElementById('main-content');
    
    if (!playerData.pve) playerData.pve = { dungeonIndex: 0, stageIndex: 0, nextMatchTime: 0 };

    // 1. KONTROLA NEPŘEČTENÝCH ZPRÁV (Spoiler lock) - Sjednocen název proměnné
    const hasUnreadPvEMatch = playerData.mail && playerData.mail.some(m => m.isPvE && !m.read);
    
    // --- KONTROLA NEPŘEČTENÉHO ZÁPASU V PODZEMÍ ---
    if (hasUnreadPvEMatch) {
        mainContent.innerHTML = `
            <button class="help-btn-corner" onclick="showHelp('pve')">Nápověda</button>
            
            <div class="text-center" style="margin-bottom: 25px; position: relative; z-index: 10;">
                <h2 class="section-title" style="background-color: #e5e7eb; display: inline-block; padding: 10px 25px; border: 2px solid #f59e0b; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.8); position: relative; z-index: 10;">FOTBALOVÉ PODZEMÍ</h2>
            </div>
            
            <div class="info-box" style="background: rgba(17, 24, 39, 0.95); border: 2px solid #3b82f6; border-radius: 12px; padding: 30px 20px; max-width: 550px; margin: 20px auto; box-shadow: 0 6px 15px rgba(0,0,0,0.7); text-align: center; position: relative; z-index: 10;">
                
                <h3 style="color: #60a5fa; margin-top: 0; margin-bottom: 15px; font-size: 1.6rem; text-shadow: 1px 1px 2px black;">
                    📺 Záznam bitvy je připraven!
                </h3>
                
                <p style="color: #e5e7eb; font-size: 1.1rem; margin-bottom: 30px; line-height: 1.6; text-shadow: 1px 1px 2px black;">
                    Zápas už se odehrál, ale výsledek je tajný. Běž do pošty, pusť si záznam a zjisti, jestli jsi postoupil na dalšího bosse!
                </p>
                
                <button class="btn-prepare-wood" onclick="document.querySelector('.nav-btn[data-target=\\'mail\\']').click()">
                    Přejít do pošty a zjistit výsledek
                </button>
                
            </div>
        `;
        return;
    }

    // --- TLAČÍTKO RESETU PRO TESTOVÁNÍ ---
    let testResetHtml = '';
    if (window.IS_TEST_MODE) {
        testResetHtml = `
            <button class="btn-task btn-test" style="position: absolute; top: 10px; right: 10px; z-index: 100;" 
                onclick="resetDungeonTest()">
                🔄 [TEST] Reset Podzemí
            </button>
        `;
    }

    const dIndex = playerData.pve.dungeonIndex;
    const sIndex = playerData.pve.stageIndex;

    // 2. KONTROLA DOKONČENÍ VŠECH DUNGEONŮ
    if (dIndex >= PVE_DUNGEONS.length) {
        mainContent.innerHTML = `
            <div class="text-center" style="padding-top: 20px;">
                <h2 class="section-title">Fotbalové podzemí</h2>
                <div class="info-box warning" style="margin-bottom: 20px;">
                    <h3 class="text-highlight-gold">🏆 Všechna podzemí pokořena! 🏆</h3>
                    <p>Jsi absolutní mistr okresu. Počkej na další aktualizaci s novými bossy!</p>
                </div>
                
                ${window.IS_TEST_MODE ? `
                <button class="btn-task btn-test" style="font-size: 1.2rem; padding: 15px 30px; background: #991b1b; color: white;" onclick="resetDungeonTest()">
                    🔄 [TEST] Resetovat Podzemí na začátek
                </button>
                ` : ''}
                
            </div>
        `;
        return;
    }

    const dungeon = PVE_DUNGEONS[dIndex];
    const stage = dungeon.stages[sIndex];
    const hasSpace = playerData.players.length < 18;
    const now = Date.now();
    const nextTime = playerData.pve.nextMatchTime || 0;
    const isOnCooldown = now < nextTime;

    // 3. GENEROVÁNÍ OBSAHU
    let warningHtml = hasSpace ? '' : `<div class="pve-warning-box">Nemáš místo na střídačce! Běž do Šatny a někoho prodej.</div>`;

    let actionSection = '';
    if (isOnCooldown) {
        actionSection = `
            <div class="pve-cooldown-box">
                <p class="pve-cooldown-label">Hráči odpočívají po těžkém utkání. Další pokus bude možný za:</p>
                <div class="huge-timer" style="margin-top: 0;">
                    ⏳ <span id="pve-timer">Počítám...</span>
                </div>
            </div>
            ${window.IS_TEST_MODE ? `<button class="btn-task btn-test" onclick="skipPvETime()">[TEST] Přeskočit čekání</button>` : ''}
            <button class="btn-pve-challenge" disabled>Odpočinek...</button>
        `;
    } else {
        actionSection = `
        <button class="btn-pve-challenge" ${hasSpace ? `onclick="startPvEMatch(${dIndex}, ${sIndex})"` : 'disabled'}>
            ⚔️ Vyzvat soupeře (Zdarma)
        </button>
        `;
    }

    // Příprava na budoucí obrázek na pozadí z dat configu
    const bgImageStyle = stage.bgImage ? `style="background-image: url('images/pve/${stage.bgImage}');"` : '';

    // --- GENEROVÁNÍ KRESLENÉ MAPY POSTUPU ---
    const totalDungeons = PVE_DUNGEONS.length;
    const progressPercent = (dIndex / (totalDungeons - 1)) * 100;

    const timelineNodesHtml = PVE_DUNGEONS.map((d, idx) => {
        let nodeClass = 'locked';
        let icon = idx + 1; 
        
        if (idx < dIndex) {
            nodeClass = 'completed';
            icon = '✓'; 
        } else if (idx === dIndex) {
            nodeClass = 'current';
            icon = '⚽';
        }
        
        return `
            <div class="pve-node ${nodeClass}">
                ${icon}
                <span class="tooltip-text">${d.name}</span>
            </div>
        `;
    }).join('');

    const timelineHtml = `
        <div class="pve-timeline-wrapper">
            <div class="pve-timeline-line"></div>
            <div class="pve-timeline-progress" style="width: ${progressPercent}%;"></div>
            <div class="pve-timeline-nodes">
                ${timelineNodesHtml}
            </div>
        </div>
    `;

    mainContent.innerHTML = `
        <div style="position: relative;">
            ${testResetHtml} 
            <button class="help-btn-corner" onclick="showHelp('pve')">Nápověda</button>
            <div class="text-center">
                <h2 class="section-title">${dungeon.name}</h2>
                <p class="pve-dungeon-description">"${dungeon.desc}"</p>
            </div>

            ${timelineHtml}

            <div class="pve-stage-card ${stage.isBoss ? 'is-boss' : ''}">
                
                <div class="pve-card-bg" ${bgImageStyle}></div>
                <div class="pve-card-overlay"></div>

                <div class="pve-card-content">
                    <div class="pve-card-header" style="justify-content: center; margin-bottom: 15px;">
                        <span class="pve-badge ${stage.isBoss ? 'boss' : 'normal'}" style="font-size: 1rem; padding: 6px 15px;">
                            Soupeř ${sIndex + 1} / ${dungeon.stages.length}
                        </span>
                    </div>
                    
                    <h3 class="pve-opponent-title" style="text-align: center; font-size: 1.8rem; color: ${stage.isBoss ? '#fca5a5' : '#fcd34d'}; margin-bottom: 15px;">
                        ${stage.isBoss ? '☠️ ' : ''}${stage.name}
                    </h3>

                    <div class="pve-stage-desc">
                        "${stage.desc}"
                    </div>
                    
                    <div class="pve-inline-stats">
                        <div class="pve-stat-item">
                            <span class="pve-stat-label">⚔️ Útok</span>
                            <span class="pve-stat-val">${stage.botPower.att}</span>
                        </div>
                        <div class="pve-stat-item">
                            <span class="pve-stat-label">🧭 Záloha</span>
                            <span class="pve-stat-val">${stage.botPower.mid}</span>
                        </div>
                        <div class="pve-stat-item">
                            <span class="pve-stat-label">🛡️ Obrana</span>
                            <span class="pve-stat-val">${stage.botPower.def}</span>
                        </div>
                        <div class="pve-stat-item">
                            <span class="pve-stat-label">🧤 Brankář</span>
                            <span class="pve-stat-val">${stage.botPower.gk}</span>
                        </div>
                    </div>

                    <div style="text-align: center; font-size: 0.8rem; color: #9ca3af; margin-top: -10px; margin-bottom: 20px; font-style: italic;">
                        * Uvedené hodnoty představují průměrnou sílu hráčů soupeře.
                    </div>

                    <div class="pve-reward-box">
                        <h4 class="pve-reward-header" style="text-align: center; margin-bottom: 10px;">🎁 Odměna za vítězství</h4>
                        <ul class="scout-odds-list" style="color: #e5e7eb; padding: 0; text-align: center; list-style: none;">
                            <li style="margin-bottom: 5px;"><strong>+${stage.reward.xp} XP</strong> pro všechny hráče na hřišti</li>
                            <li><strong>Zisk hráče:</strong> Rank [${stage.reward.rank}] (${stage.reward.minStars} až ${stage.reward.maxStars} ⭐)</li>
                        </ul>
                    </div>

                    ${warningHtml}
                    ${actionSection}
                </div>
            </div>
        </div>
    `;

    if (isOnCooldown) updateTimerUI('pve-timer', nextTime);
}

// --- ZOBRAZENÍ DETAILU SOUPEŘE V PODZEMÍ ---
window.viewPvEBot = function(dIndex, sIndex) {
    const stage = PVE_DUNGEONS[dIndex].stages[sIndex];
    const power = stage.botPower;
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="scouting-card">
            <h2 class="section-title" style="margin-top: 0; text-shadow: 2px 2px 4px black;">Skauting soupeře</h2>
            <h3 class="scouting-title">${stage.name}</h3>
            <p class="text-muted" style="margin-top: 0;">Odhadovaná síla řad soupeře</p>
            
            <p class="scouting-desc">${stage.desc}</p>
            
            <div class="scouting-grid">
                <div class="stat-box stat-atk">
                    <span class="stat-label">⚔️ Útočná síla</span>
                    <span class="stat-val">${power.att}</span>
                </div>
                <div class="stat-box stat-def">
                    <span class="stat-label">🛡️ Obranná síla</span>
                    <span class="stat-val">${power.def}</span>
                </div>
                <div class="stat-box stat-mid">
                    <span class="stat-label">🧭 Síla zálohy</span>
                    <span class="stat-val">${power.mid}</span>
                </div>
                <div class="stat-box stat-gk">
                    <span class="stat-label">🧤 Kvalita brankáře</span>
                    <span class="stat-val">${power.gk}</span>
                </div>
            </div>
            
            <div class="scouting-note" style="margin-top: 20px; border-bottom: none;">
                ℹ️ Čísla představují průměrnou úroveň každého hráče v dané řadě.
            </div>
            
            <button class="btn-task btn-full-width" style="margin-top: 10px; background-color: #4b5563; border-color: #374151;" onclick="renderPvE()">⬅ Návrat do podzemí</button>
        </div>
    `;
}