// --- KATALOG VŠECH PŘEDMĚTŮ ---
const ITEM_CATALOG = [
    // --- ÚTOK ---
    { id: 'klapky', name: 'Klapky na oči', role: 'att', duration: 10, type: 'stat', stat: 'att', value: 1.25, desc: 'Útočníci vidí jen bránu. Bonus k útoku +25 %.' },
    { id: 'uces', name: 'Sprej na dokonalý účes', role: 'mid', duration: 8, type: 'stat', stat: 'tek', value: 1.30, desc: 'Vypadají skvěle. Bonus k technice +30 %.' },
    { id: 'pistalky', name: 'Falešné píšťalky', role: 'att', duration: 6, type: 'event', tag: 'penalty_boost', desc: 'Zvýšená šance na penaltu ve vápně soupeře.' },
    { id: 'teziste', name: 'Kopačky s posunutým těžištěm', role: 'att', duration: 7, type: 'event', tag: 'penalty_master', desc: 'Vysoká šance na penaltu, ale snižuje techniku.' },
    { id: 'magnet_spicka', name: 'Magnetická špička', role: 'att', duration: 5, type: 'event', tag: 'heavy_magnet', desc: 'Bonus k útoku, ale občas je míč moc těžký.' },
    { id: 'zlate_strevice', name: 'Zlaté střevíce z tržnice', role: 'att', duration: 10, type: 'stat', stat: 'spd', value: 1.20, desc: 'Létají jako vítr. Rychlost +20 %.' },
    { id: 'zrcatko', name: 'Zrcátko ve štulpně', role: 'att', duration: 8, type: 'stat', stat: 'tek', value: 1.20, desc: 'Skvělé kličky, ale stojí to výdrž. Technika +20 %.' },
    { id: 'volej_triko', name: 'Triko "Podejte mi to"', role: 'att', duration: 5, type: 'event', tag: 'volley_master', desc: 'Šance na nechytatelný gól z voleje.' },
    { id: 'zimni_rukavice', name: 'Zimní rukavice v srpnu', role: 'att', duration: 12, type: 'stat', stat: 'spd', value: 1.15, desc: 'Vypadají drsně a běhají rychleji. Rychlost +15 %.' },
    { id: 'pivo_poukazka', name: 'Poukázka na pivo a párek', role: 'att', duration: 6, type: 'stat', stat: 'eng', value: 1.30, desc: 'Obrovská motivace. Výdrž +30 %.' },
    { id: 'vhs_goly', name: 'Kompilace vlastních gólů', role: 'att', duration: 10, type: 'stat', stat: 'att', value: 1.20, desc: 'Sebevědomí v nebesích. Útok +20 %.' },
    { id: 'slovnik_ofsajd', name: 'Slovník "Jak na ofsajd"', role: 'att', duration: 8, type: 'event', tag: 'bypass_def', desc: 'Hráči ukecají rozhodčího a projdou obranou.' },
    { id: 'neviditelny_plast', name: 'Neviditelný plášť', role: 'att', duration: 3, type: 'event', tag: 'stealth_box', desc: 'Vysoká šance projít do vápna bez souboje.' },
    { id: 'god_hand', name: 'Božská ruka (replika)', role: 'att', duration: 5, type: 'event', tag: 'hand_of_god', desc: '15% šance na gól rukou bez ohledu na gólmana.' },

    // --- ZÁLOHA ---
    { id: 'kyslik_maska', name: 'Kyslíkové masky z letadla', role: 'mid', duration: 10, type: 'stat', stat: 'eng', value: 1.25, desc: 'Běhají jako fretky. Výdrž +25 %.' },
    { id: 'kompas', name: 'Kouzelný kompas', role: 'mid', duration: 10, type: 'stat', stat: 'tek', value: 1.25, desc: 'Konečně najdou spoluhráče. Technika +25 %.' },
    { id: 'treti_oko', name: 'Třetí oko (na gumě)', role: 'mid', duration: 4, type: 'event', tag: 'super_vision', desc: 'Vysoká šance na průnikovou přihrávku.' },
    { id: 'dalekohled', name: 'Námořnický dalekohled', role: 'mid', duration: 7, type: 'event', tag: 'vision_boost', desc: 'Lepší hledání skulinek v obraně.' },
    { id: 'ovladac_meruna', name: 'Dálkový ovladač na merunu', role: 'mid', duration: 3, type: 'event', tag: 'remote_ball', desc: 'Míč poslechne na slovo. Průniky +40 %.' },

    // --- OBRANA ---
    { id: 'zednik_lziha', name: 'Zednická lžíce a malta', role: 'def', duration: 10, type: 'stat', stat: 'def', value: 1.25, desc: 'Postaví neprostupnou zeď. Obrana +25 %.' },
    { id: 'krvave_chranice', name: 'Krvavé chrániče', role: 'def', duration: 10, type: 'stat', stat: 'str', value: 1.30, desc: 'Soupeř má strach. Síla +30 %.' },
    { id: 'vidle', name: 'Vidle na odklízení míčů', role: 'def', duration: 8, type: 'event', tag: 'long_clear', desc: 'Žádné složité rozehrávky, prostě odkop na tribunu.' },
    { id: 'titan_koliky', name: 'Titanové kolíky', role: 'def', duration: 6, type: 'event', tag: 'injury_maker', desc: 'Šance vyřadit soupeře, ale snižuje rychlost.' },
    { id: 'atlet_tretry', name: 'Lehké atletické tretry', role: 'def', duration: 10, type: 'stat', stat: 'spd', value: 1.25, desc: 'Dohoní každého, ale souboje bolí. Rychlost +25 %.' },
    { id: 'repka_vhs', name: 'Sestřih faulů T. Řepky', role: 'def', duration: 5, type: 'event', tag: 'agressive_def', desc: 'Bonus k obraně, ale riziko červené karty.' },
    { id: 'gandalf_staff', name: 'Gandalfova hůl', role: 'def', duration: 4, type: 'event', tag: 'thou_shall_not_pass', desc: 'Neprojdeš dál! 15% šance na okamžité zastavení útoku.' },
    { id: 'michacka', name: 'Kapesní míchačka na beton', role: 'def', duration: 8, type: 'stat', stat: 'def', value: 1.35, desc: 'Betonování vápna. Obrana +35 %.' },

    // --- BRANKÁŘ ---
    { id: 'tlusty_svetr', name: 'Tlustý svetr z 80s', role: 'gk', duration: 12, type: 'stat', stat: 'gk', value: 1.20, desc: 'Gólman zabere víc místa v bráně. Brankář +20 %.' },
    { id: 'megafon', name: 'Osobní tlampač', role: 'gk', duration: 10, type: 'stat', stat: 'def', value: 1.15, desc: 'Obránci konečně poslouchají. Obrana +15 %.' },
    { id: 'lapacka', name: 'Hokejová lapačka', role: 'gk', duration: 5, type: 'event', tag: 'hockey_gk', desc: 'Obrovská šance na chycení střely, ale těžká rozehrávka.' },
    { id: 'teplaky_gabor', name: 'Vytahané šedé tepláky', role: 'gk', duration: 15, type: 'stat', stat: 'gk', value: 1.25, desc: 'Styl Gábora Királyho. Brankář +25 %.' },
    { id: 'plysak_sit', name: 'Plyšák v síti', role: 'gk', duration: 10, type: 'stat', stat: 'gk', value: 1.20, desc: 'Sebevědomí a štěstí. Brankář +20 %.' },
    { id: 'krizovka', name: 'Křížovka a tužka', role: 'gk', duration: 8, type: 'event', tag: 'puzzle_gk', desc: 'Celý tým běhá lépe, ale gólman může usnout.' },
    { id: 'figurina', name: 'Nafukovací figurína', role: 'gk', duration: 6, type: 'stat', stat: 'gk', value: 1.20, desc: 'Neprojde vůbec nic. Brankář +20 %.' },
    { id: 'chapadla', name: 'Chobotničí chapadla', role: 'gk', duration: 4, type: 'event', tag: 'octopus_gk', desc: '15% šance na chycení jakékoliv střely.' }
];