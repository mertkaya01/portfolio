# Builds Set 1's sprite sheet of Mert from his own 64 px character sprites.
#
#   python design/pixel-kit/character/make-sheet.py <folder with Mert's sprites> [preview.png]
#
# What it does:
#  1. every pixel snapped to one of a few clean colours (the sources are anti-aliased)
#  2. the beard removed (high school: no beard yet)
#  3. a front view made on the back view's outline (same hair, a face)
#  4. volleyball poses made from the side view: arms up (set, block, cheer), the forearm pass
#     (bump) and the ready stance
#  5. a second row of the same frames in a sports kit: jersey with a stripe, shorts, knee pads
#
# Output: public/art/set1/mert/mert.png (and a copy in this folder). Frames are 28 × 40: 4 empty
# rows on top and 2 columns either side leave room for raised arms.
#   0 right · 1 right step · 2 left · 3 left step · 4 back · 5 back step · 6 front · 7 front step
#   8 right, arms up · 9 right, bump · 10 right, ready   (left-facing poses: these mirrored)
#   second row (y 40–79): the same frames in the sports kit
import colorsys
import sys
from pathlib import Path

from PIL import Image

SRC = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/art/set1/mert/mert.png'
COPY = Path(__file__).resolve().parent / 'mert-highschool.png'

# class → colour. The jacket (g) is swapped for a uniform or a jersey by the scenes; the
# stripe (T) is the jersey's stripe, a white kept apart from the shoes' white (W).
PAL = {
    'k': (25, 16, 15), 'g': (45, 43, 46), 'W': (238, 237, 240), 'T': (238, 237, 241),
    'S': (243, 159, 95), 's': (214, 132, 78),
    'd': (64, 40, 30), 'b': (107, 68, 51), 'c': (146, 100, 78),
    'e': (52, 30, 24),  # the eyes' brown: its own colour, so a new hair colour never reaches it
}
SW = 24  # width of a frame cut from the sources
P, TOP = 2, 4  # empty columns either side, empty rows on top
FW, FH = SW + 2 * P, 40


def cls(p):
    r, g, b, a = p
    if a < 128: return '.'
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    if l > 0.85: return 'W'
    if l < 0.12: return 'k'
    if s < 0.15: return 'g'
    if r > 200 and g > 130: return 'S'
    if r > 170 and g > 100: return 's'
    if l < 0.25: return 'd'
    if l < 0.40: return 'b'
    return 'c'


FILES = {'right': 'mertkaya_character-sag.png', 'left': 'mertkaya_character-sol.png',
         'back': 'mertkaya_character-yukari.png'}
BEARD = {'right': (29, 37, 28, 31), 'left': (26, 34, 28, 30), 'back': None}  # x0 x1 y0 y1
# the iris pixels (in the 24-wide frame): in the sources they share the hair's browns
EYES = {'right': [(15, 13), (14, 14)], 'left': [(9, 13)], 'back': []}


def at(x, y):
    # a point given in the 24-wide source frame → the padded frame
    return x + P, y + TOP


def load(name):
    im = Image.open(SRC / FILES[name]).convert('RGBA')
    x0, y0 = 20, 12
    g = [['.'] * FW for _ in range(FH)]
    for y in range(FH - TOP):
        for x in range(SW):
            g[y + TOP][x + P] = cls(im.getpixel((x0 + x, y0 + y)))
    if BEARD[name]:
        bx0, bx1, by0, by1 = BEARD[name]
        for y in range(by0, by1 + 1):
            for x in range(bx0, bx1 + 1):
                gx, gy = at(x - x0, y - y0)
                if g[gy][gx] in 'dbcs': g[gy][gx] = 'S'
    for x, y in EYES[name]:
        gx, gy = at(x, y)
        g[gy][gx] = 'e'
    return g


def copy(g): return [row[:] for row in g]


def step(src):
    # legs apart: below the belt the left leg moves 1 px left, the right one 1 px right
    out = copy(src)
    legs = range(TOP + 30, FH)
    cols = [x for x in range(FW) if any(src[y][x] != '.' for y in legs)]
    mid = (min(cols) + max(cols)) // 2
    for y in legs:
        row = ['.'] * FW
        for x in range(FW):
            c = src[y][x]
            if c == '.': continue
            nx = x - 1 if x <= mid else x + 1
            if 0 <= nx < FW: row[nx] = c
        out[y] = row
    return out


def front(back):
    g = copy(back)

    def put(y, x0, x1, c):
        for x in range(x0, x1 + 1):
            gx, gy = at(x, y)
            g[gy][gx] = c

    def dot(x, y, c):
        gx, gy = at(x, y)
        g[gy][gx] = c

    put(10, 7, 16, 'S')
    for x in (7, 10, 13, 16): dot(x, 10, 'd')  # the fringe
    put(11, 7, 16, 'S'); dot(7, 11, 'd'); dot(16, 11, 'd')
    for y in (12, 13, 14, 15): put(y, 6, 17, 'S')
    put(16, 6, 16, 'S')
    put(17, 7, 16, 'S'); dot(7, 17, 's'); dot(16, 17, 's')
    put(18, 9, 14, 'S')
    for x0 in (8, 14):  # eyes, a white glint up top
        dot(x0, 13, 'k'); dot(x0 + 1, 13, 'W')
        dot(x0, 14, 'k'); dot(x0 + 1, 14, 'k')
    dot(11, 16, 's'); dot(12, 16, 's')  # mouth
    put(19, 10, 13, 'S')  # neck
    for y in range(21, 28):  # the open jacket over the white shirt
        put(y, 10, 13, 'W'); dot(9, y, 'k'); dot(14, y, 'k')
    return g


# ---------- volleyball poses, from the right-facing frame ----------

def line(g, a, b, colour, width=2, only_empty=False):
    # a thick line between two points (an arm), with a dark outline around it
    (x0, y0), (x1, y1) = a, b
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    pts = [(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n)) for i in range(n + 1)]
    body = {(x + dx, y) for x, y in pts for dx in range(width)}
    edge = {(x + ox, y + oy) for x, y in body for ox, oy in ((1, 0), (-1, 0), (0, 1), (0, -1))}
    edge -= body
    for (x, y), c in [(p, 'k') for p in edge] + [(p, colour) for p in body]:
        if 0 <= x < FW and 0 <= y < FH and (not only_empty or g[y][x] == '.'):
            g[y][x] = c


def hand(g, x, y):
    # a 2 × 2 hand with a dark outline
    for dx in range(-1, 3):
        for dy in range(-1, 3):
            inside = 0 <= dx < 2 and 0 <= dy < 2
            px, py = x + dx, y + dy
            if not (0 <= px < FW and 0 <= py < FH): continue
            if inside: g[py][px] = 'S'
            elif g[py][px] == '.': g[py][px] = 'k'


def no_arms(src):
    # the arms hanging at the sides taken away: the jacket closes over where they were
    g = copy(src)
    for y in range(22, 29):
        for x, c in ((4, '.'), (5, 'k'), (6, 'g'), (7, 'g')):
            gx, gy = at(x, y)
            g[gy][gx] = c
        gx, gy = at(15, y)
        if g[gy][gx] == 'S': g[gy][gx] = 'g'
        gx, gy = at(16, y)
        if g[gy][gx] in 'kS': g[gy][gx] = 'k'
    gx, gy = at(5, 29)
    g[gy][gx] = '.'
    return g


def crouch(src, by=2):
    # knees bent: the body lower by `by` px, the legs shorter
    g = [['.'] * FW for _ in range(FH)]
    legs = list(range(30 + TOP, FH))
    keep = legs[:2] + legs[2 + by:]  # `by` rows go from the middle of the legs
    for y in range(0, 30 + TOP):
        if y + by < FH: g[y + by] = src[y][:]
    for i, y in enumerate(keep):
        g[30 + TOP + by + i] = src[y][:]
    return g


def arms_up(right):
    # both arms raised beside the head: a set, a block, a cheer
    g = no_arms(right)
    line(g, (7, 25), (1, 7), 'g', only_empty=True)  # the far arm, behind the head
    hand(g, 0, 3)
    line(g, (17, 25), (25, 9), 'g')  # the near arm, clear of the face
    hand(g, 25, 5)
    return g


def bump(right):
    # the forearm pass: knees bent, arms straight out in front and down, hands together
    g = crouch(no_arms(right))
    line(g, (15, 27), (22, 33), 'g')
    hand(g, 22, 33)
    return g


def ready(right):
    # waiting for the ball: knees bent, hands up in front of the body
    g = crouch(no_arms(right))
    line(g, (15, 28), (20, 30), 'g')
    hand(g, 20, 29)
    return g


# ---------- the sports kit ----------

def kit(src, legs_top):
    # jersey (the jacket colour stays: the scenes swap it), the white shirt → the stripe,
    # legs (from row legs_top): shorts, knee pads, bare shins, white shoes
    g = copy(src)
    rows = [y for y in range(FH) if any(c != '.' for c in g[y])]
    bottom = rows[-1]
    for y in range(legs_top):
        for x in range(FW):
            if g[y][x] == 'W': g[y][x] = 'T'
    for i, y in enumerate(range(legs_top, bottom - 1)):  # above the 2 shoe rows
        for x in range(FW):
            if g[y][x] != 'g' or i < 2: continue  # the first two rows: shorts
            g[y][x] = 'W' if i == 2 else 'S'  # knee pads, then bare shins
    return g


sides = {name: load(name) for name in FILES}
LEGS, BENT = 30 + TOP, 32 + TOP  # where the legs start, standing and crouched
frames = [
    (sides['right'], LEGS), (step(sides['right']), LEGS),
    (sides['left'], LEGS), (step(sides['left']), LEGS),
    (sides['back'], LEGS), (step(sides['back']), LEGS),
    (front(sides['back']), LEGS), (step(front(sides['back'])), LEGS),
    (arms_up(sides['right']), LEGS), (bump(sides['right']), BENT), (ready(sides['right']), BENT),
]
sheet = Image.new('RGBA', (FW * len(frames), FH * 2), (0, 0, 0, 0))
for row in (0, 1):
    for i, (f, legs_top) in enumerate(frames):
        g = f if row == 0 else kit(f, legs_top)
        for y in range(FH):
            for x in range(FW):
                if g[y][x] != '.': sheet.putpixel((i * FW + x, row * FH + y), PAL[g[y][x]] + (255,))
OUT.parent.mkdir(parents=True, exist_ok=True)
sheet.save(OUT)
sheet.save(COPY)
if len(sys.argv) > 2:  # an optional big preview to look at
    bg = Image.new('RGBA', sheet.size, (40, 40, 48, 255))
    bg.alpha_composite(sheet)
    bg.resize((sheet.width * 8, sheet.height * 8), Image.NEAREST).save(sys.argv[2])
print(OUT.relative_to(ROOT), sheet.size)
