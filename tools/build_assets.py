# Builds public/assets/ from DashX360's asset folder, the DOOM shareware WAD
# and Microsoft's Selawik font release.
#
#   python3 tools/build_assets.py <path to dashx360/Assets> <path to Selawik release folder>
#
# DashX360 by ZivvoZ: https://github.com/ZivvoZ/dashx360
# Selawik (SIL OFL 1.1): https://github.com/microsoft/Selawik/releases
#
# Images are resized to twice the size they are drawn at on the 1280x720
# dashboard and saved as WebP. Crops match DashX360's CropImageSourceConverter
# parameters (x, y, width, height in source pixels).
import os
import shutil
import struct
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'public', 'assets')
SRC = os.path.abspath(sys.argv[1])
FONTS = os.path.abspath(sys.argv[2])
WAD = os.path.join(ROOT, 'public', 'doom', 'doom1.wad')
SCALE = 2


def out(rel):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def save(im, rel, quality=84):
    path = out(rel)
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGBA')
    im.save(path, 'WEBP', quality=quality, method=6)
    return path


def load(rel, crop=None):
    im = Image.open(os.path.join(SRC, rel))
    im = im.convert('RGBA') if im.mode in ('P', 'LA', 'RGBA') or 'transparency' in im.info else im.convert('RGB')
    if crop:
        x, y, w, h = crop
        im = im.crop((x, y, x + w, y + h))
    return im


def cover(rel, w, h, crop=None, name=None):
    """UniformToFill: keep the aspect ratio, cover w x h, crop the overflow centred."""
    im = load(rel, crop)
    tw, th = w * SCALE, h * SCALE
    k = max(tw / im.width, th / im.height)
    if k < 1:
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    k = max(tw / im.width, th / im.height)
    cw, ch = min(im.width, round(tw / k)), min(im.height, round(th / k))
    left, top = (im.width - cw) // 2, (im.height - ch) // 2
    im = im.crop((left, top, left + cw, top + ch))
    return save(im, name)


def fit(rel, w, h, crop=None, name=None):
    """Uniform: the whole image (transparent margins included) inside w x h."""
    im = load(rel, crop)
    k = min(w * SCALE / im.width, h * SCALE / im.height)
    if k < 1:
        im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    return save(im, name, quality=90)


# ---------- DashX360 artwork ----------
T = 'Tiles/'
M = 'Misc/'
cover(T + 'halo4home.jpg', 466, 263, name='tiles/halo4.webp')
cover(T + 'dexterhome.jpg', 231, 133, name='tiles/dexter.webp')
cover(T + 'maroon5home.jpg', 233, 133, name='tiles/maroon5.webp')
cover(T + 'dancecentralhome.jpg', 179, 131, name='tiles/dancecentral.webp')
cover(T + 'espn.jpg', 179, 131, name='tiles/espn.webp')
cover(T + 'youtubehome.jpg', 179, 131, name='tiles/youtube-home.webp')
cover(T + 'forzahorizongames.jpg', 400, 303, name='tiles/forza.webp')
cover(T + 'minecraftgames.jpg', 200, 151, name='tiles/minecraft.webp')
cover(T + 'blackops2games.jpg', 200, 150, name='tiles/blackops2.webp')
cover(T + 'thedarkkightvideo.jpg', 308, 301, name='tiles/darkknight.webp')
cover(T + 'cloudywithachanceofmeatballsvideo.jpg', 148, 150, name='tiles/cloudy.webp')
cover(T + 'kungfupanda2video.jpg', 148, 149, name='tiles/kungfupanda2.webp')
cover(T + 'hbogovideo.jpg', 198, 149, name='tiles/hbogo-video.webp')
cover(T + 'overexposedmusic.jpg', 306, 298, name='tiles/overexposed.webp')
cover(T + 'evanescencerecent.png', 158, 148, name='tiles/evanescence.webp')
cover(T + 'panchikomusic.jpg', 348, 148, name='tiles/panchiko.webp')
cover(T + 'hbogoapps.jpg', 306, 298, name='tiles/hbogo-apps.webp')
cover(T + 'netflixapps.png', 158, 148, name='tiles/netflix.webp')
cover(T + 'youtubeapps.jpg', 188, 148, name='tiles/youtube-apps.webp')
for k in ['windows-media-center', 'system-music-player', 'internet-explorer', 'movies-and-tv']:
    cover(T + f'myapps-{k}.png', 198, 198, name=f'apps/{k}.webp')
cover(T + 'youtube-icon.png', 198, 198, name='apps/youtube.webp')

fit(M + 'disc-tray.png', 74, 74, name='icons/disc-tray.webp')
fit(M + 'pin.png', 38, 38, crop=(574, 274, 392, 392), name='icons/pin.webp')
fit(M + 'music.png', 58, 58, crop=(250, 210, 460, 540), name='icons/music.webp')
fit(M + 'myapps.png', 72, 72, crop=(535, 295, 455, 330), name='icons/myapps.webp')
fit(T + 'Marketplace/mygames.png', 72, 72, name='icons/mygames.webp')
for k in ['game', 'video', 'music', 'apps']:
    fit(T + f'Marketplace/{k}_marketplace.png', 58, 58, name=f'icons/{k}-marketplace.webp')
fit(T + 'Marketplace/my_video_apps_custom.png', 144, 102, name='icons/my-video-apps.webp')
for k in ['friends', 'sign_in_or_out', 'avatar_store']:
    fit(T + f'Social/{k}.png', 58, 58, name=f'icons/{k.replace("_", "-")}.webp')
fit(T + 'Social/join_the_fun_text.png', 230, 168, crop=(294, 102, 782, 594), name='tiles/join-the-fun.webp')
fit(T + 'Social/transparent_avatars.png', 300, 256, name='tiles/avatars.webp')
for k in ['system', 'preferences', 'account', 'kinect', 'privacy', 'family', 'turnoff']:
    fit(M + f'SettingsIcons/{k}.png', 85, 85, name=f'icons/settings-{k}.webp')
fit(M + 'SignIn/xbox-orb.png', 64, 64, name='ui/xbox-orb.webp')
fit(M + 'SignIn/live-alert.png', 64, 64, name='ui/live-alert.webp')
for k in ['Hard Drive', 'songs', 'saved playlists']:
    fit(M + f'MusicBrowserIcons/{k}.png', 96, 96, name=f'icons/music-{k.lower().replace(" ", "-")}.webp')
cover('References/penguin_bing_background.png', 960, 540, name='ui/bing-background.webp')
for f in sorted(os.listdir(os.path.join(SRC, 'Profile', 'FriendPool'))):
    shutil.copy(os.path.join(SRC, 'Profile', 'FriendPool', f), out(f'gamerpics/{f}'))
for theme in sorted(t for t in os.listdir(os.path.join(SRC, 'Custom Files', 'Themes')) if not t.startswith('.')):
    for part in ['home', 'games', 'apps', 'settings']:
        im = load(f'Custom Files/Themes/{theme}/{part}.png').convert('RGB')
        save(im.resize((1280, 720), Image.LANCZOS), f'themes/{theme.lower()}/{part}.webp', quality=80)

# ---------- Sounds and the boot video (copied untouched) ----------
SOUNDS = {
    'startup.wav': 'startup-after-loading.wav',
    'notify.wav': 'notify-popup.wav',
    'page-left.mp3': '08. Page Left.mp3',
    'page-right.mp3': '09. Page Right.mp3',
    'select.mp3': '10. Select A.mp3',
    'select-alt.mp3': '11. Select A (Alt).mp3',
    'back.mp3': '14. Back.mp3',
    'menu-in.wav': 'select-into-menu.wav',
    'menu-out.wav': 'select-out-menu.wav',
    'focus.wav': 'tile-hover.wav',
    'guide-open.wav': 'hud-open.wav',
    'guide-close.wav': 'hud-close.wav',
    'guide-blade-open.wav': 'blade-open.wav',
    'guide-blade-switch-1.wav': 'blade-switch-1.wav',
    'guide-blade-switch-2.wav': 'blade-switch-2.wav',
    'guide-blade-switch-3.wav': 'blade-switch-3.wav',
    'guide-blade-switch-4.wav': 'blade-switch-4.wav',
    'guide-hover.wav': 'guide-hover.wav',
    'guide-select.wav': 'guide-select.wav',
    'guide-back.wav': 'guide-back.wav',
}
for dst, src in SOUNDS.items():
    shutil.copy(os.path.join(SRC, 'Audio', 'Sounds', src), out(f'sounds/{dst}'))
shutil.copy(os.path.join(SRC, 'Boot', 'Boot Screen.mp4'), out('video/boot.mp4'))

# ---------- Fonts ----------
for f in ['selawkl', 'selawksl', 'selawk', 'selawksb', 'selawkb']:
    shutil.copy(os.path.join(FONTS, f'{f}.woff2'), out(f'fonts/{f}.woff2'))


# ---------- DOOM art from the shareware WAD (freely distributable) ----------
def wad_pictures(*names):
    w = open(WAD, 'rb').read()
    _, n, off = struct.unpack('<4sii', w[:12])
    lumps = {}
    for i in range(n):
        p, s, name = struct.unpack('<ii8s', w[off + 16 * i:off + 16 * i + 16])
        lumps.setdefault(name.rstrip(b'\0').decode(), (p, s))
    pal = w[lumps['PLAYPAL'][0]:lumps['PLAYPAL'][0] + 768]
    pics = {}
    for name in names:
        p, s = lumps[name]
        d = w[p:p + s]
        width, height = struct.unpack('<hh', d[:4])
        im = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        px = im.load()
        for x, c in enumerate(struct.unpack(f'<{width}i', d[8:8 + 4 * width])):
            i = c
            while d[i] != 255:
                top, ln = d[i], d[i + 1]
                i += 3
                for k in range(ln):
                    v = d[i + k]
                    px[x, top + k] = (pal[3 * v], pal[3 * v + 1], pal[3 * v + 2], 255)
                i += ln + 1
        pics[name] = im
    return pics


doom = wad_pictures('TITLEPIC', 'HELP1', 'CREDIT')
# DOOM draws 320x200 at a 4:3 aspect, so stretch rows by 1.2 before scaling.
title = doom['TITLEPIC'].convert('RGB').resize((960, 720), Image.NEAREST)
save(title, 'covers/doom-wide.webp', quality=88)
for lump, name in [('HELP1', 'doom-help'), ('CREDIT', 'doom-credit')]:
    save(doom[lump].convert('RGB').resize((960, 720), Image.NEAREST), f'covers/{name}.webp', quality=88)
# Portrait cover: the title screen letterboxed over a blurred, darkened copy of itself.
bg = title.resize((1200, 900), Image.LANCZOS).crop((300, 0, 900, 900)).filter(ImageFilter.GaussianBlur(18))
c = Image.blend(bg, Image.new('RGB', bg.size, (0, 0, 0)), 0.45)
c.paste(title.resize((600, 450), Image.LANCZOS), (0, 225))
save(c, 'covers/doom.webp', quality=86)


# ---------- Hamza's own artwork ----------
SYS = '/System/Library/Fonts/Supplemental/'
SELAWIK_TTF = os.path.join(FONTS, 'selawkb.ttf')
SELAWIK_L = os.path.join(FONTS, 'selawkl.ttf')


def grad(w, h, stops, diagonal=True):
    im = Image.new('RGB', (w, h))
    px = im.load()
    for y in range(h):
        for x in range(w):
            t = ((x / w + y / h) / 2) if diagonal else y / h
            for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
                if t0 <= t <= t1:
                    f = (t - t0) / (t1 - t0 or 1)
                    px[x, y] = tuple(round(a + (b - a) * f) for a, b in zip(c0, c1))
                    break
    return im


# Gamerpic: the yellow "h" from the favicon.
g = grad(256, 256, [(0, (255, 243, 166)), (1, (245, 184, 0))], diagonal=False)
d = ImageDraw.Draw(g)
d.text((128, 112), 'h', font=ImageFont.truetype(SYS + 'Georgia Italic.ttf', 190), fill=(43, 33, 0), anchor='mm')
save(g, 'gamerpics/hamza.webp', quality=92)


def poster(w, h, stops, glyph, title, sub, glyph_color, rel, glyph_size=None, title_size=None):
    im = grad(w, h, stops)
    d = ImageDraw.Draw(im)
    gs = glyph_size or int(h * 0.62)
    face = SELAWIK_TTF if glyph.isascii() else '/System/Library/Fonts/Apple Symbols.ttf'
    d.text((w * 0.72, h * (0.34 if title else 0.44)), glyph, font=ImageFont.truetype(face, gs), fill=glyph_color, anchor='mm')
    if title:
        ts = title_size or int(h * 0.11)
        d.text((w * 0.07, h * 0.80), title, font=ImageFont.truetype(SELAWIK_TTF, ts), fill=(255, 255, 255), anchor='ls')
        d.text((w * 0.07, h * 0.80 + ts * 0.95), sub, font=ImageFont.truetype(SELAWIK_L, int(ts * 0.48)), fill=(255, 240, 220), anchor='ls')
    save(im, rel, quality=88)


PANIC = [(0, (255, 196, 64)), (0.45, (240, 98, 30)), (1, (120, 22, 18))]
UNLIKE = [(0, (255, 120, 170)), (0.5, (214, 41, 118)), (1, (79, 12, 74))]
poster(600, 900, PANIC, '!', 'Panic Pack!', 'Godot 4', (255, 236, 200), 'covers/panic-pack.webp', glyph_size=500, title_size=86)
poster(932, 526, PANIC, '!', '', '', (255, 236, 200), 'tiles/panic-pack.webp', glyph_size=440)
poster(600, 900, UNLIKE, '♡', 'Unliker', 'Instagram', (255, 220, 236), 'covers/instagram-unliker.webp', glyph_size=440, title_size=86)
poster(932, 526, UNLIKE, '♡', '', '', (255, 220, 236), 'tiles/instagram-unliker.webp', glyph_size=380)
poster(396, 396, UNLIKE, '♡', '', '', (255, 220, 236), 'apps/instagram-unliker.webp', glyph_size=260)
print('assets written to', OUT)
