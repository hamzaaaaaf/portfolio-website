"""Draws the Minecraft-style scene for Where It Began: public/assets/tiles/minecraft.webp.

Original pixel art (grass, dirt, stone, an oak tree), not Mojang artwork.
Run: python3 tools/minecraft_scene.py public/assets/tiles/minecraft.webp
"""
from PIL import Image
import random, sys
rnd = random.Random(7)
B = 8
W, H = 22, 10
img = Image.new('RGB', (W * B, H * B))
px = img.load()
for y in range(H * B):
    t = y / (H * B)
    c = (int(120 + 50 * t), int(170 + 40 * t), 255)
    for x in range(W * B):
        px[x, y] = c
pick = lambda pal: rnd.choice(pal)
GRASS = [(95, 159, 53), (106, 173, 62), (84, 143, 46), (118, 184, 70)]
DIRT = [(134, 96, 67), (150, 108, 74), (121, 85, 58), (104, 74, 50), (143, 103, 70)]
STONE = [(125, 125, 125), (112, 112, 112), (138, 138, 138), (100, 100, 100)]
LOG = [(104, 83, 50), (88, 69, 41), (118, 94, 58)]
LEAF = [(58, 120, 30), (70, 138, 38), (49, 104, 25), (80, 150, 44)]
def block(bx, by, kind):
    for yy in range(B):
        drip = 2 + (rnd.random() < 0.45) + (rnd.random() < 0.2)
        for xx in range(B):
            x, y = bx * B + xx, by * B + yy
            if kind == 'grass':
                px[x, y] = pick(GRASS) if yy < 2 or (yy < 4 and rnd.random() < 0.35) else pick(DIRT)
            elif kind == 'dirt':
                px[x, y] = pick(DIRT)
            elif kind == 'stone':
                px[x, y] = pick(STONE)
            elif kind == 'log':
                px[x, y] = LOG[1] if xx in (1, 5) else pick(LOG)
            elif kind == 'leaf':
                if rnd.random() < 0.12: continue
                px[x, y] = pick(LEAF)
tops = []
h = 7
for i in range(W):
    if rnd.random() < 0.3: h = max(6, min(7, h + rnd.choice([-1, 1])))
    tops.append(h)
for bx, top in enumerate(tops):
    for by in range(top, H):
        block(bx, by, 'grass' if by == top else 'dirt' if by < top + 2 else 'stone')
tx = 15; ty = tops[tx]
for k in range(1, 4):
    block(tx, ty - k, 'log')
for lx in range(tx - 2, tx + 3):
    for ly in (ty - 5, ty - 4):
        if not (abs(lx - tx) == 2 and ly == ty - 5): block(lx, ly, 'leaf')
for lx in range(tx - 1, tx + 2):
    block(lx, ty - 6, 'leaf')
for y in range(6, 18):
    for x in range(20, 32): px[x, y] = (255, 247, 190)
for cx, cy, cw in [(46, 12, 20), (76, 5, 22), (152, 12, 16)]:
    for y in range(cy, cy + 4):
        for x in range(cx, cx + cw): px[x, y] = (245, 248, 255)
    for y in range(cy - 2, cy):
        for x in range(cx + 4, cx + cw - 6): px[x, y] = (245, 248, 255)
big = img.resize((W * B * 6, H * B * 6), Image.NEAREST)
big.save(sys.argv[1], 'WEBP', lossless=True)
print(big.size)
