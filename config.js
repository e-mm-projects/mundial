// --- KONFIGURACE HRY ---
const buildingsConfig = {
    scout: { name: "Kancelář skauta", baseCost: 100, baseTime: 300, costMult: 1.5, timeMult: 1.3, desc: "Zrychluje skautování a zvyšuje šanci na nalezení lepších talentů." },
    shop: {
        name: "Klubový Fanshop",
        desc: "Zajišťuje stálý pasivní příjem. S vyšší úrovní roste rychlost prodeje i velikost pokladny.",
        baseCost: 500,
        costMult: 1.6,
        baseTime: 300,
        timeMult: 1.5,
        baseIncome: 100,  // Kolik to vydělává na Lvl 1 za hodinu
        incomeMult: 1.2,  // Každý level se výdělek zvedne o 20 %
        baseCap: 500,     // Kapacita pokladny na Lvl 1
        capMult: 1.5      // Každý level se kapacita zvětší o 50 %
    },
    tribune: { name: "Tribuny", baseCost: 200, baseTime: 900, costMult: 1.7, timeMult: 1.5, desc: "Přitáhneš na ten svůj nefotbal více lidí ochotných zaplatit." },
    pitch: { name: "Trávník", baseCost: 500, baseTime: 1200, costMult: 2.0, timeMult: 1.6, desc: "Prvotřídní pažit umožňuje hráčům rychlejší pohyb. Každá úroveň zvyšuje rychlost všech tvých hráčů v zápase o 1 % (Max. úroveň 10)."},
    training: { name: "Tréninkové centrum", baseCost: 250, baseTime: 900, costMult: 1.6, timeMult: 1.5, desc: "Zvyšuje množství zkušeností, které tvoje kopyta získají z každého zápasu o 5 % za úroveň." }
};


const defaultPlayerData = {
    level: 1,
    xp: 0,
    money: 0,
    energy: 100,
    buildings: { scout: 1, shop: 1, tribune: 1, pitch: 1, training: 1 },
    activeTask: null,
    activeUpgrade: null,
    formation: '4-4-2',
    players: [],
    scoutedPlayers: [],
    lastScoutRefresh: 0,
    officeTasks: [],     
    lastEnergyUpdate: 0,   
    league: null,
    nextMatchTime: 0,
    isPrepared: false,
    seasonEndTime: 0,
    shopSafe: 0,  // Kolik peněz je aktuálně v pokladně obchodu
    lastShopUpdate: Date.now(), // Kdy se naposledy přičetly peníze do pokladny
    mail: []
};

// --- TVORBA HRÁČŮ A RPG SYSTÉM ---
const firstNames = ['Jan', 'Diego', 'Petr', 'Tomáš', 'Lukáš', 'Jakub', 'Martin', 'Michal', 'Jiří', 'Ondřej', 'David', 'Karel', 'Pavel', 'Tonda', 'Pepa', 'Vašek', 'Patrik', 'Mario', 'Radek', 'Aleš', 'Dodo'];
const lastNames = ['Mišun', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec', 'Pokorný', 'Stanovský', 'Vlasák', 'Machala', 'Pavelka', 'Suchán', 'Pala', 'Vašina', 'Mikala', 'Bakalík'];

const PLAYER_RANKS = [
    { name: "Kopyto", cap: 15, minStart: 1, maxStart: 10 },
    { name: "Slibný amatér", cap: 25, minStart: 10, maxStart: 20 },
    { name: "Srdcař", cap: 45, minStart: 20, maxStart: 40 },
    { name: "Ligový borec", cap: 65, minStart: 40, maxStart: 60 },
    { name: "Reprezentant", cap: 85, minStart: 60, maxStart: 80 },
    { name: "Legenda", cap: 99, minStart: 70, maxStart: 90 }
];

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

// --- GLOBÁLNÍ DATA A NASTAVENÍ ---

// Definice rozestavení hráčů na hřišti (Brankář, Obrana, Záloha, Útok)
const FORMATIONS_LAYOUT = {
    '4-4-2': { gk: [0, 1], def: [1, 5], mid: [5, 9], att: [9, 11] },
    '4-3-3': { gk: [0, 1], def: [1, 5], mid: [5, 8], att: [8, 11] },
    '5-4-1': { gk: [0, 1], def: [1, 6], mid: [6, 10], att: [10, 11] }
};

// Generátory jmen botů pro ligu (rozděleno podle úrovně)
const BOT_TEAM_NAMES = {
    village: ["Sokol Horní Lhota", "SK Prdelkovice", "FC Dřeváci", "Tatran Sedlčany", "Dynamo Vesnice", "AFK Bída", "Zoufalci United", "TJ Sokol Pěnčín", "Sokol Brozany", "FK Kolomaz", "SK Holomajzna", "Sokol Řeporyje", "FC Horní Nětčice", "FC Dolní Nětčice", "Mrlínek", "Rusava", "Hlinsko pod Hostýnem"],
    pro: ["Baník Ostrava (B)", "Slavoj Žižkov", "FC Bystřice pod Hostýnem", "FK Admira", "SK Slavia (B)", "Meteor Praha", "Slavoj Vyšehrad", "Sokol Hostivice", "FK Jablonec (B)", "SK Kladno", "FK Teplice (B)", "FC Graffin Vlašim", "1.FK Příbram", "FK Viktoria Žižkov"]
};

// --- SEZNAM NÁRODNOSTÍ ---
const NATIONALITIES = [
    { name: "Česko", flag: "🇨🇿" }, { name: "Slovensko", flag: "🇸🇰" }, { name: "Německo", flag: "🇩🇪" },
    { name: "Anglie", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, { name: "Španělsko", flag: "🇪🇸" }, { name: "Brazílie", flag: "🇧🇷" },
    { name: "Argentina", flag: "🇦🇷" }, { name: "Francie", flag: "🇫🇷" }, { name: "Itálie", flag: "🇮🇹" },
    { name: "Polsko", flag: "🇵🇱" }, { name: "Portugalsko", flag: "🇵🇹" }, { name: "Nizozemsko", flag: "🇳🇱" }
];

// --- DEFINICE STATISTIK PODLE POZIC ---
const POSITION_STATS = {
    'att': { label: 'Útočník', stats: ['atk', 'spd', 'eng', 'tek'], colorClass: 'pos-att' },
    'mid': { label: 'Záložník', stats: ['spd', 'str', 'eng', 'tek'], colorClass: 'pos-mid' },
    'def': { label: 'Obránce', stats: ['def', 'spd', 'str', 'eng'], colorClass: 'pos-def' },
    'gk':  { label: 'Brankář',  stats: ['def', 'spd', 'tek', 'gk'],  colorClass: 'pos-gk' }
};