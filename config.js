// --- KONFIGURACE HRY ---
const buildingsConfig = {
    scout: { name: "Kancelář skauta", baseCost: 100, baseTime: 60, costMult: 1.5, timeMult: 1.3, desc: "Zrychluje skautování a zvyšuje šanci na nalezení lepších talentů." },
    shop: { name: "Obchod se suvenýry", baseCost: 150, baseTime: 120, costMult: 1.6, timeMult: 1.4, desc: "Pasivně generuje peníze do klubové pokladny. Nezapomeň si je ale vybírat!" },
    tribune: { name: "Tribuny", baseCost: 200, baseTime: 180, costMult: 1.7, timeMult: 1.5, desc: "Přitáhneš na ten svůj nefotbal více lidí ochotných zaplatit." },
    pitch: { name: "Trávník", baseCost: 500, baseTime: 300, costMult: 2.0, timeMult: 1.6, desc: "Prvotřídní pažit umožňuje hráčům rychlejší pohyb. Každá úroveň zvyšuje rychlost všech tvých hráčů v zápase o 1 % (Max. úroveň 10)."},
    training: { name: "Tréninkové centrum", baseCost: 250, baseTime: 200, costMult: 1.6, timeMult: 1.5, desc: "Zvyšuje množství zkušeností, které tvoje kopyta získají z každého zápasu o 5 % za úroveň." }
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
    {
        id: 'kopyta',
        name: 'Pohár Zlámaných Kopyt',
        desc: 'Pralesní liga nejhrubšího zrna. Tady se nehraje na taktiku, tady se hraje na přežití.',
        stages: [
            {
                name: 'FC JZD (Traktoristi)',
                desc: 'Přijeli na zápas rovnou z pole. Mají obrovskou sílu, ale rychlost a techniku nechali v kabině.',
                botPower: { att: 3, mid: 5, def: 20, gk: 8 },
                reward: { xp: 200, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Hospoda u Zrzavého Psa',
                desc: 'O poločase do sebe kopli dvě piva. Mají šílenou výdrž, ale z míče mají strach.',
                botPower: { att: 3, mid: 25, def: 5, gk: 8 },
                reward: { xp: 300, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Sokol "Stará Garda"',
                desc: 'Věkový průměr 55 let. Moc toho nenaběhají, ale jejich obranný beton a zkušený brankář jsou legendární.',
                botPower: { att: 3, mid: 5, def: 30, gk: 8 },
                reward: { xp: 400, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Řezníci z Masokombinátu',
                desc: 'Hrají ostře a neberou si servítky. Z jejich útočníků jde strach.',
                botPower: { att: 33, mid: 5, def: 7, gk: 8 },
                reward: { xp: 500, rank: 'Kopyto', minStars: 1, maxStars: 2 }
            },
            {
                name: 'Výběr Okresního Přeboru (BOSS)',
                desc: 'To nejlepší (rozuměj nejhorší), co místní vesnice nabízí. Tým, který ti nedá nic zadarmo.',
                botPower: { att: 13, mid: 10, def: 12, gk: 10 },
                reward: { xp: 1000, rank: 'Slibný Amatér', minStars: 1, maxStars: 1, isBoss: true }
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
    village: ["Sokol Horní Lhota", "SK Prdelkovice", "FC Dřeváci", "Tatran Sedlčany", "Dynamo Vesnice", "AFK Bída", "Zoufalci United", "TJ Sokol Pěnčín", "Sokol Brozany", "FK Kolomaz", "SK Holomajzna", "Sokol Řeporyje", "FC Horní Nětčice", "FC Dolní Nětčice", "Mrlínek", "Hlinsko pod Hostýnem"],
    pro: ["Baník Ostrava (B)", "Slavoj Žižkov", "FK Admira", "SK Slavia (B)", "Meteor Praha", "Slavoj Vyšehrad", "Sokol Hostivice", "FK Jablonec (B)", "SK Kladno", "FK Teplice (B)", "FC Graffin Vlašim", "1.FK Příbram", "FK Viktoria Žižkov"]
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