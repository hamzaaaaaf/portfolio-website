import json, hashlib, re
RAW = """Minecraft|2011|Sandbox|h
Batman: Arkham Asylum|2009|Action|h
Batman: Arkham City|2011|Action|h
Batman: Arkham Origins|2013|Action|h
Batman: Arkham Knight|2015|Action|h
Uncharted 4: A Thief's End|2016|Adventure|h
Grand Theft Auto V|2013|Open world|h
Fortnite|2017|Battle royale|h
Call of Duty: Warzone|2020|Battle royale|h
Rocket League|2015|Sports|h
Friday the 13th: The Game|2017|Horror|h
Crash of the Titans|2007|Platformer|h
Spider-Man 3|2007|Action|h
The Amazing Spider-Man|2012|Action|h
The Amazing Spider-Man 2|2014|Action|h
The Legend of Zelda: Breath of the Wild|2017|Adventure|
The Legend of Zelda: Ocarina of Time|1998|Adventure|
The Legend of Zelda: Tears of the Kingdom|2023|Adventure|
Super Mario 64|1996|Platformer|
Super Mario Odyssey|2017|Platformer|
Super Mario Bros.|1985|Platformer|
Super Mario Kart 8 Deluxe|2017|Racing|
Super Smash Bros. Ultimate|2018|Fighting|
Pokémon Red and Blue|1996|RPG|
Pokémon Emerald|2004|RPG|
Pokémon Scarlet and Violet|2022|RPG|
Animal Crossing: New Horizons|2020|Life sim|
Metroid Prime|2002|Action|
Splatoon 3|2022|Shooter|
The Last of Us|2013|Action|
The Last of Us Part II|2020|Action|
God of War|2018|Action|
God of War Ragnarök|2022|Action|
Marvel's Spider-Man|2018|Action|
Marvel's Spider-Man: Miles Morales|2020|Action|
Marvel's Spider-Man 2|2023|Action|
Ghost of Tsushima|2020|Action|
Horizon Zero Dawn|2017|Action|
Bloodborne|2015|Action RPG|
Uncharted 2: Among Thieves|2009|Adventure|
Red Dead Redemption|2010|Open world|
Red Dead Redemption 2|2018|Open world|
Grand Theft Auto: San Andreas|2004|Open world|
Grand Theft Auto IV|2008|Open world|
Grand Theft Auto: Vice City|2002|Open world|
Halo: Combat Evolved|2001|Shooter|
Halo 3|2007|Shooter|
Halo Reach|2010|Shooter|
Gears of War|2006|Shooter|
Forza Horizon 5|2021|Racing|
Call of Duty 4: Modern Warfare|2007|Shooter|
Call of Duty: Modern Warfare 2|2009|Shooter|
Call of Duty: Black Ops|2010|Shooter|
Call of Duty: Black Ops II|2012|Shooter|
Battlefield 3|2011|Shooter|
Battlefield 1|2016|Shooter|
Apex Legends|2019|Battle royale|
PUBG: Battlegrounds|2017|Battle royale|
Valorant|2020|Shooter|
Counter-Strike 2|2023|Shooter|
Overwatch|2016|Shooter|
Team Fortress 2|2007|Shooter|
Half-Life 2|2004|Shooter|
Portal 2|2011|Puzzle|
Left 4 Dead 2|2009|Shooter|
BioShock|2007|Shooter|
Doom|2016|Shooter|
Doom Eternal|2020|Shooter|
Titanfall 2|2016|Shooter|
Destiny 2|2017|Shooter|
Borderlands 2|2012|Shooter|
Fallout 3|2008|RPG|
Fallout 4|2015|RPG|
Fallout: New Vegas|2010|RPG|
The Elder Scrolls V: Skyrim|2011|RPG|
The Witcher 3: Wild Hunt|2015|RPG|
Cyberpunk 2077|2020|RPG|
Elden Ring|2022|Action RPG|
Dark Souls|2011|Action RPG|
Sekiro: Shadows Die Twice|2019|Action|
Baldur's Gate 3|2023|RPG|
Mass Effect 2|2010|RPG|
Final Fantasy VII|1997|RPG|
Final Fantasy VII Remake|2020|RPG|
Persona 5 Royal|2020|RPG|
Kingdom Hearts II|2005|RPG|
Assassin's Creed II|2009|Action|
Assassin's Creed IV: Black Flag|2013|Action|
Assassin's Creed Odyssey|2018|Action|
Far Cry 3|2012|Shooter|
Watch Dogs 2|2016|Action|
Tom Clancy's Rainbow Six Siege|2015|Shooter|
Metal Gear Solid|1998|Stealth|
Metal Gear Solid V: The Phantom Pain|2015|Stealth|
Hitman 3|2021|Stealth|
Resident Evil 4|2005|Horror|
Resident Evil 2|2019|Horror|
Resident Evil Village|2021|Horror|
Silent Hill 2|2001|Horror|
Outlast|2013|Horror|
Five Nights at Freddy's|2014|Horror|
Dead by Daylight|2016|Horror|
Phasmophobia|2020|Horror|
Alan Wake 2|2023|Horror|
Dead Space|2008|Horror|
Lethal Company|2023|Horror|
Among Us|2018|Party|
Fall Guys|2020|Party|
Roblox|2006|Sandbox|
Terraria|2011|Sandbox|
Stardew Valley|2016|Life sim|
The Sims 4|2014|Life sim|
Garry's Mod|2006|Sandbox|
No Man's Sky|2016|Adventure|
Subnautica|2018|Survival|
Rust|2018|Survival|
Valheim|2021|Survival|
It Takes Two|2021|Co-op|
A Way Out|2018|Co-op|
Portal|2007|Puzzle|
Tetris|1984|Puzzle|
Pac-Man|1980|Arcade|
Street Fighter II|1991|Fighting|
Mortal Kombat 11|2019|Fighting|
Tekken 7|2015|Fighting|
Sonic the Hedgehog 2|1992|Platformer|
Crash Bandicoot N. Sane Trilogy|2017|Platformer|
Spyro Reignited Trilogy|2018|Platformer|
Ratchet & Clank: Rift Apart|2021|Platformer|
Celeste|2018|Platformer|
Hollow Knight|2017|Metroidvania|
Cuphead|2017|Platformer|
Hades|2020|Roguelike|
Undertale|2015|RPG|
Inside|2016|Puzzle|
Limbo|2010|Puzzle|
Journey|2012|Adventure|
Shadow of the Colossus|2005|Adventure|
Detroit: Become Human|2018|Adventure|
Until Dawn|2015|Horror|
Life Is Strange|2015|Adventure|
League of Legends|2009|MOBA|
Dota 2|2013|MOBA|
World of Warcraft|2004|MMO|
Clash Royale|2016|Strategy|
Clash of Clans|2012|Strategy|
Angry Birds|2009|Puzzle|
Subway Surfers|2012|Arcade|
Temple Run|2011|Arcade|
Geometry Dash|2013|Arcade|
FIFA 23|2022|Sports|
EA Sports FC 24|2023|Sports|
NBA 2K24|2023|Sports|
Tony Hawk's Pro Skater 2|2000|Sports|
Wii Sports|2006|Sports|
Need for Speed: Most Wanted|2005|Racing|
Gran Turismo 7|2022|Racing|
Plants vs. Zombies|2009|Strategy|
StarCraft II|2010|Strategy|
Civilization VI|2016|Strategy|
Age of Empires II|1999|Strategy|
LEGO Star Wars: The Complete Saga|2007|Action|
Star Wars Jedi: Fallen Order|2019|Action|
Star Wars: Battlefront II|2005|Shooter|
Injustice 2|2017|Fighting|
Sea of Thieves|2018|Adventure|
Palworld|2024|Survival|
Helldivers 2|2024|Shooter|"""
GLYPH = {"Sandbox": "▦", "Action": "◆", "Adventure": "✦", "Open world": "$", "Battle royale": "★", "Sports": "●", "Horror": "✕", "Platformer": "▲", "Racing": "➤", "Fighting": "✊",
         "RPG": "⚔", "Life sim": "✿", "Shooter": "◎", "Action RPG": "⚔", "Puzzle": "◇", "Stealth": "◐", "Party": "♥", "Survival": "☀", "Co-op": "∞", "Arcade": "▣", "Metroidvania": "▼",
         "Roguelike": "☠", "MOBA": "⬡", "MMO": "⬢", "Strategy": "♜"}
def slug(t): return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:40]
def pal(t):
    h = int(hashlib.md5(t.encode()).hexdigest(), 16)
    hue = h % 360; hue2 = (hue + 25 + (h >> 9) % 60) % 360
    return [f"hsl({hue} 70% 52%)", f"hsl({hue2} 65% 26%)", f"hsl({(hue + 180) % 360} 90% 72%)"]
games = []
for line in RAW.strip().splitlines():
    t, y, g, mine = line.split("|")
    games.append({"id": slug(t), "t": t, "y": int(y), "g": g, "i": GLYPH.get(g, "◆"), "c": pal(t), **({"h": 1} if mine else {})})
assert len({x["id"] for x in games}) == len(games)
json.dump(games, open(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..", "public", "games.json"), "w"), separators=(",", ":"))
print(len(games))
