Perfect! Hier is een volledig uitgewerkte **README.md** voor jouw game, compleet met alle mechanics, systemen, uitleg en suggesties voor implementatie. Je kunt dit direct als document gebruiken bij een project of repository.

---

# Kingdom Clicker: Age of Empires

**Een idle/clicker game in middeleeuws RTS-thema: bouw een koninkrijk, train ridders en verdedig of val aan.**

![Kingdom Clicker Preview](screenshot_placeholder.png)

---

## Inhoudsopgave

1. [Beschrijving](#beschrijving)
2. [Gameplay](#gameplay)
3. [Resources](#resources)
4. [Werkers](#werkers)
5. [Gebouwen](#gebouwen)
6. [Leger](#leger)
7. [Combat](#combat)
8. [Upgrades](#upgrades)
9. [Prestige systeem](#prestige-systeem)
10. [Events](#events)
11. [Hero units](#hero-units)
12. [Progressie & midgame](#progressie--midgame)
13. [Endgame doelen](#endgame-doelen)
14. [UX / feel](#ux--feel)
15. [Tech stack](#tech-stack)
16. [Game loop & structuur](#game-loop--structuur)

---

## Beschrijving

Stap in de schoenen van een middeleeuwse heerser. Begin met een klein dorpje, verzamel goud, voedsel, hout en steen, train een leger van ridders en vecht tegen vijanden. Kies een strategie: offensief, defensief of gebalanceerd, en ontwikkel je koninkrijk tot een machtige natie.

*Kingdom Clicker* combineert de verslavende clicker-actie van games zoals Cookie Clicker met de strategische lagen van RTS-games als Age of Empires 2.

---

## Gameplay

De kernloop:

1. Klik op de **“Belasting innen”**-knop voor goud.
2. Wijs werkers toe aan voedsel, hout of steenproductie.
3. Bouw en upgrade gebouwen voor economische en militaire voordelen.
4. Train een leger van ridders, speerdragers, boogschutters of siege units.
5. Voer aanvallen uit of verdedig je koninkrijk tegen aanvallen.
6. Verdien upgrades, speciale abilities en prestige-punten.
7. Herhaal en ontwikkel je rijk.

---

## Resources

| Resource | Gebruik                                   |
| -------- | ----------------------------------------- |
| Goud     | Koop upgrades, train units, bouw gebouwen |
| Voedsel  | Onderhoud leger, groei bevolking          |
| Hout     | Bouw en upgrade gebouwen                  |
| Steen    | Versterk muren en torens                  |

**Productieformules:**

```text
Goud_per_klik = base_click * (1 + upgrades) * crit_multiplier
Passief goud = werkers * 1.0 / sec
Voedsel = boeren * 1.2 / sec
Hout = houthakkers * 1.0 / sec
Steen = mijnwerkers * 0.6 / sec
```

---

## Werkers

Werkers produceren resources passief. Types:

* **Boeren** → voedsel
* **Houthakkers** → hout
* **Mijnwerkers** → steen
* **Belastinginners** → extra goud

**Kosten scaling:**

```text
Cost_next_worker = base_cost * (1.15 ^ aantal)
```

---

## Gebouwen

### Economy

* Boerderij → +voedsel productie
* Houthakkerskamp → +hout productie
* Mijn → +steen productie
* Markt → +goud bonus

### Military

* Barracks → infantry unlock
* Stable → ridders unlock
* Archery Range → boogschutters unlock
* Siege Workshop → siege units unlock

### Defense

* Muren → damage reduction
* Torens → auto damage per seconde
* Kasteel → grote buff en unlocks

**Upgrades verhogen efficiëntie en unlocken nieuwe units.**

---

## Leger

### Units

| Unit     | Kosten | Sterkte           | Zwakte              |
| -------- | ------ | ----------------- | ------------------- |
| Spearman | cheap  | goed tegen cav    | zwak tegen algemeen |
| Archer   | mid    | ranged            | kwetsbaar vs cav    |
| Knight   | duur   | sterk aanval      | duur                |
| Siege    | duur   | sterk vs gebouwen | kwetsbaar           |

### Formatie strategie

* Aggressief → +30% schade, +30% verlies
* Defensief → -50% verlies, -20% schade
* Gebalanceerd → normaal

**Voedsel verbruik:**

```text
Food_usage = total_units * 0.5 / sec
```

Bij <0 voedsel → desertie en verliezen.

---

## Combat

```text
Player_power = sum(units * attack_value)
Enemy_power = generated_enemy
Result = Player_power * strategie_multiplier - Enemy_power
Losses = units * (Enemy_power / Player_power) * modifier
Loot = Enemy_power * random(0.8-1.5)
```

---

## Upgrades

### Trees

1. **Economie** → werkers output, click waarde, resource multipliers
2. **Militair** → unit damage, nieuwe units, lagere training costs
3. **Defensie** → muren sterker, minder losses, auto-healing

**Scaling:**

```text
Cost = base * (1.25 ^ level)
Effect = base * level
```

---

## Prestige systeem

Wanneer progressie vertraagt:

* Reset koninkrijk
* Verdien **Kroonpunten**

```text
Prestige = sqrt(totaal_verdient_goud / 1,000,000)
```

**Permanente upgrades:**

* +10% productie per punt
* +klik power
* Nieuwe mechanics unlocken

---

## Events

Randomized events voor variatie:

* Gouden oogst → +200% voedsel (30s)
* Bandieten → verlies tenzij leger
* Held verschijnt → tijdelijke army boost
* Brand → verlies hout

---

## Hero units

* 1 per run
* XP door battles
* Skills: army boost, resource boost, special ability

---

## Progressie & midgame

* Nieuwe units elke 10–15 minuten
* Nieuwe gebouwen / mechanics unlocken
* Prevent “dead zones” → continue engagement

---

## Endgame doelen

* Bereik Imperial Age
* Mega boss verslaan (AI kingdom)
* Max tech tree
* Oneindige scaling voor highscore

---

## UX / feel

* Floating numbers bij clicks
* Kritische hits
* Visuele groei: dorp → stad → kasteel
* Units zichtbaar op het veld

---

## Tech stack

* HTML + CSS + Vanilla JS (prototype)
* Optioneel: React / Vue voor grotere projecten
* LocalStorage voor saves

---

## Game loop & structuur

```javascript
game = {
  resources: { gold, food, wood, stone },
  workers: {},
  army: {},
  buildings: {},
  upgrades: {},
  prestige: 0
}

setInterval(() => {
  produceResources();
  consumeFood();
  handleEvents();
  handleCombat();
}, 1000);
```

---

## Waarom dit werkt

* Idle + actieve keuzes → verslavend
* Strategische keuzes (economisch vs militair vs defensief)
* Replayability door prestige en events
* Mid- en endgame pacing voorkomt verveling
* Visueel beloningssysteem houdt spelers betrokken

---

## Volgende stappen

1. Prototype bouwen (HTML/JS)
2. UI design + visuals implementeren
3. Balancing van units, kosten, en events
4. Optioneel: leaderboard of multiplayer

