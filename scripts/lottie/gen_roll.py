# 뀰 첫 화면용 로티: 데굴데굴 굴러와 멈춤 → 잎이 톡 → 눈 뜨고 웃음 → "뀰" 글자 (0~72프레임, 한 번)
# 72~146프레임: 제자리에서 숨쉬기 + 눈 깜빡임 → 146~150 글자 사라짐 → 150~180 왼쪽으로 굴러 나감 → 다시 처음부터 (전체 반복)
# 500x500, 30fps. 보이는 곳은 가운데 지름 300 원
import json, sys
from fontTools.ttLib import TTCollection
from fontTools.pens.recordingPen import RecordingPen

FR, OP, W, H = 30, 206, 500, 500  # 굴러 나간 뒤(176) 1초(30프레임) 비었다가 반복
OUT0, OUT1 = 150, 176  # 굴러 나가는 구간
INTRO = 72
CX, GROUND = 250, 374
R = 76
CY = GROUND - R  # 몸 중심


def hexc(h, a=1):
    h = h.lstrip("#"); return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [a]
def st(v): return {"a": 0, "k": v}
def anim(keys, ease=(0.42, 0.58)):
    out = []
    for i, kk in enumerate(keys):
        t, v = kk[0], kk[1]
        v = v if isinstance(v, list) else [v]
        k = {"t": t, "s": v}
        if i < len(keys) - 1:
            e = ease if not (len(keys[i]) > 2) else keys[i][2]
            k["o"] = {"x": [e[0]], "y": [0]}; k["i"] = {"x": [e[1]], "y": [1]}
        out.append(k)
    return {"a": 1, "k": out}
def tr(p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    f = lambda x: x if isinstance(x, dict) else st(list(x) if isinstance(x, tuple) else x)
    return {"ty": "tr", "p": f(p), "a": f(a), "s": f(s), "r": f(r), "o": f(o), "sk": st(0), "sa": st(0), "nm": "tr"}
def ks(p=(0, 0, 0), a=(0, 0, 0), s=(100, 100, 100), r=0, o=100):
    f = lambda x: x if isinstance(x, dict) else st(list(x) if isinstance(x, tuple) else x)
    return {"o": f(o), "r": f(r), "p": f(p), "a": f(a), "s": f(s)}
def ellipse(w, h, p=(0, 0)): return {"ty": "el", "p": st(list(p)), "s": st([w, h]), "d": 1, "nm": "el"}
def fill(c, o=100): return {"ty": "fl", "c": st(c), "o": st(o) if not isinstance(o, dict) else o, "r": 1, "nm": "fl"}
def stroke(c, w, o=100): return {"ty": "st", "c": st(c), "o": st(o), "w": st(w), "lc": 2, "lj": 2, "ml": 4, "nm": "st"}
def path(v, i, o, closed=True): return {"ty": "sh", "ks": st({"v": v, "i": i, "o": o, "c": closed}), "nm": "sh"}
def group(items, name="g", t=None): return {"ty": "gr", "nm": name, "it": items + [t or tr()]}

layers, ind = [], [0]
def layer(name, shapes, kss, parent=None, ip=0, op=OP):
    ind[0] += 1
    L = {"ddd": 0, "ind": ind[0], "ty": 4, "nm": name, "sr": 1, "ks": kss, "ao": 0, "shapes": shapes, "ip": ip, "op": op, "st": 0, "bm": 0}
    if parent: L["parent"] = parent
    layers.append(L); return ind[0]
def null(name, kss, parent=None):
    ind[0] += 1
    L = {"ddd": 0, "ind": ind[0], "ty": 3, "nm": name, "sr": 1, "ks": kss, "ao": 0, "ip": 0, "op": OP, "st": 0, "bm": 0}
    if parent: L["parent"] = parent
    layers.append(L); return ind[0]

# ---------- "뀰" 글자 (Noto Sans CJK Black 윤곽 → 로티 도형; SIL OFL 글꼴) ----------
def glyph_shapes(ch, size):
    font = TTCollection("/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc").fonts[1]  # KR
    gs = font.getGlyphSet(); name = font.getBestCmap()[ord(ch)]
    pen = RecordingPen(); gs[name].draw(pen)
    upm = font["head"].unitsPerEm; k = size / upm
    adv = gs[name].width * k
    asc = font["OS/2"].sTypoAscender * k; desc = -font["OS/2"].sTypoDescender * k
    mid = (asc - desc) / 2  # 글자 가운데를 0으로
    P = lambda pt: [pt[0] * k - adv / 2, -(pt[1] * k - mid + desc) + 0 ]
    shapes, cur = [], None
    def start(p):
        return {"v": [P(p)], "i": [[0, 0]], "o": [[0, 0]]}
    def close(c):
        if c and len(c["v"]) > 1:
            if c["v"][0] == c["v"][-1]:
                c["i"][0] = c["i"][-1]; c["v"].pop(); c["i"].pop(); c["o"].pop()
            shapes.append(path(c["v"], c["i"], c["o"]))
    for op, args in pen.value:
        if op == "moveTo": close(cur); cur = start(args[0])
        elif op == "lineTo": cur["v"].append(P(args[0])); cur["i"].append([0, 0]); cur["o"].append([0, 0])
        elif op in ("curveTo", "qCurveTo"):
            pts = [P(a) for a in args]
            if op == "qCurveTo":  # 2차 곡선 → 3차 (암시적 점 처리)
                ctrl, end = pts[:-1], pts[-1]
                seq = []
                for j, c in enumerate(ctrl):
                    nxt = end if j == len(ctrl) - 1 else [(c[0] + ctrl[j + 1][0]) / 2, (c[1] + ctrl[j + 1][1]) / 2]
                    seq.append((c, nxt))
                for c, e in seq:
                    p0 = cur["v"][-1]
                    c1 = [p0[0] + 2 / 3 * (c[0] - p0[0]), p0[1] + 2 / 3 * (c[1] - p0[1])]
                    c2 = [e[0] + 2 / 3 * (c[0] - e[0]), e[1] + 2 / 3 * (c[1] - e[1])]
                    cur["o"][-1] = [c1[0] - p0[0], c1[1] - p0[1]]
                    cur["v"].append(e); cur["i"].append([c2[0] - e[0], c2[1] - e[1]]); cur["o"].append([0, 0])
            else:
                c1, c2, e = pts
                p0 = cur["v"][-1]
                cur["o"][-1] = [c1[0] - p0[0], c1[1] - p0[1]]
                cur["v"].append(e); cur["i"].append([c2[0] - e[0], c2[1] - e[1]]); cur["o"].append([0, 0])
        elif op in ("closePath", "endPath"): close(cur); cur = None
    close(cur)
    return shapes

TEXT_Y = 158
txt = glyph_shapes("뀰", 50)
txt_scale = anim([(0, [0, 0, 100]), (56, [0, 0, 100]), (63, [118, 118, 100]), (68, [96, 96, 100]), (72, [100, 100, 100]), (143, [100, 100, 100]), (146, [112, 112, 100]), (150, [0, 0, 100]), (OP, [0, 0, 100])], (0.3, 0.7))
txt_op = anim([(0, 0), (56, 0), (60, 100), (147, 100), (150, 0), (OP, 0)])
layer("text", [group(txt + [fill(hexc("#EA580C"))], "kkyul")], ks(p=(CX, TEXT_Y, 0), s=txt_scale, o=txt_op))

# ---------- 반짝이 (글자 나올 때) ----------
def star(s):
    a = s * 0.28; v = [[0, -s], [a, -a], [s, 0], [a, a], [0, s], [-a, a], [-s, 0], [-a, -a]]; z = [[0, 0]] * 8
    return path(v, z, z)
for (x, y), size, t0 in [((190, 165), 12, 58), ((312, 150), 15, 62), ((344, 250), 11, 66), ((158, 258), 12, 70)]:
    a, b, c = t0, t0 + 8, t0 + 18
    layer(f"sp{t0}", [group([star(size), fill(hexc("#FFD54F"))], "star")],
          ks(p=(x, y, 0), s=anim([(0, [0, 0, 100]), (a, [0, 0, 100]), (b, [100, 100, 100]), (c, [0, 0, 100]), (OP, [0, 0, 100])]), r=anim([(0, 0), (OP, 120)])))

# ---------- 귤 몸 (rig: 몸 중심) ----------
# 굴러오기 0~34: 오른쪽 밖(x 620)에서 가운데로, 반시계로 1.5바퀴 (왼쪽으로 굴러가니까)
roll_x = anim([(0, [490, CY, 0]), (34, [CX, CY, 0]), (OUT0, [CX, CY, 0], (0.55, 1)), (OUT1, [40, CY, 0]), (OP, [40, CY, 0])], (0.2, 0.6))
roll_r = anim([(0, 300), (34, 0), (OUT0, 0, (0.55, 1)), (OUT1, -280), (OP, -280)], (0.2, 0.6))
# 멈출 때 찌그러짐 + 숨쉬기(72~132)
sq = [(0, [100, 100, 100]), (34, [100, 100, 100]), (38, [112, 88, 100]), (44, [95, 105, 100]), (50, [100, 100, 100])]
for t in (72, 102, 132):
    sq += [(t, [100, 100, 100]), (t + 15, [103, 97, 100])]
sq = [k for k in sq if k[0] < 146] + [(146, [100, 100, 100]), (149, [106, 94, 100]), (153, [100, 100, 100]), (OP, [100, 100, 100])]  # 출발할 때 살짝 움츠림
rig_pos = null("pos", ks(p=roll_x))
# 찌그러짐은 바닥 기준이 자연스러워서: 몸 중심(pos) 아래 R만큼에 기준점을 둔 null
rig_sq = null("squash", ks(p=(0, R, 0), a=(0, 0, 0), s=anim(sq)), parent=rig_pos)
rig = null("rot", ks(p=(0, -R, 0), r=roll_r), parent=rig_sq)

# 눈: 굴러오는 동안 감음(꾹) → 44프레임에 번쩍 → 54~ 웃는 눈. 숨쉬는 동안 112프레임쯤 깜빡
EY = -10
z3 = [[0, 0]] * 3
closed = [path([[-33, EY - 8], [-19, EY], [-33, EY + 8]], z3, z3, False), path([[33, EY - 8], [19, EY], [33, EY + 8]], z3, z3, False)]  # > <
happy = [path([[-33, EY + 3], [-17, EY + 3]], [[0, 0], [-6, -10]], [[6, -10], [0, 0]], False), path([[17, EY + 3], [33, EY + 3]], [[0, 0], [-6, -10]], [[6, -10], [0, 0]], False)]  # ^ ^
layer("eyes-closed", [group(closed + [stroke(hexc("#3B2314"), 4.5)], "c")], ks(o=anim([(0, 100), (43, 100), (44, 0), (OUT0 - 1, 0), (OUT0, 100), (OP, 100)], (0, 1))), parent=rig)
open_eyes = [group([ellipse(15, 19, (dx, EY)), fill(hexc("#3B2314"))], "eye") for dx in (-25, 25)] + \
            [group([ellipse(6, 6, (dx + 3, EY - 5)), fill(hexc("#FFFFFF"))], "shine") for dx in (-25, 25)]
open_op = anim([(0, 0), (43, 0), (44, 100), (56, 100), (57, 0), (OP, 0)], (0, 1))
layer("eyes-open", open_eyes[::-1], ks(p=(0, EY, 0), a=(0, EY, 0), s=anim([(0, [100, 100, 100]), (44, [100, 70, 100]), (47, [100, 112, 100]), (52, [100, 100, 100]), (OP, [100, 100, 100])]), o=open_op), parent=rig)
blink = anim([(0, [100, 100, 100]), (110, [100, 100, 100]), (113, [100, 15, 100]), (116, [100, 100, 100]), (OP, [100, 100, 100])], (0.3, 0.7))
layer("eyes-happy", [group(happy + [stroke(hexc("#3B2314"), 4.5)], "h")], ks(p=(0, EY, 0), a=(0, EY, 0), s=blink, o=anim([(0, 0), (56, 0), (57, 100), (OUT0 - 1, 100), (OUT0, 0), (OP, 0)], (0, 1))), parent=rig)

# 입·볼
smile = group([path([[-13, 8], [13, 8]], [[0, 0], [-7, 11]], [[7, 11], [0, 0]], closed=False), stroke(hexc("#3B2314"), 4.5)], "smile")
cheeks = [group([ellipse(26, 14, (dx, 12)), fill(hexc("#FF6B6B"), 45)], "cheek") for dx in (-43, 43)]
layer("face", [smile] + cheeks, ks(), parent=rig)

# 잎: 굴러오는 동안 숨어 있다가 46프레임에 톡 (커졌다 줄며 살랑)
TOP = -R + 4
leaf_shape = path([[0, 0], [64, -20]], [[26, 12], [-22, -6]], [[18, -26], [-14, 18]])
vein = path([[6, -3], [50, -16]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], closed=False)
leaf_s = anim([(0, [0, 0, 100]), (44, [0, 0, 100]), (50, [125, 125, 100]), (55, [92, 92, 100]), (60, [100, 100, 100]), (OUT0, [100, 100, 100]), (OUT0 + 6, [0, 0, 100]), (OP, [0, 0, 100])], (0.3, 0.7))
leaf_r = anim([(0, -40), (44, -40), (52, 6), (60, -12), (72, -6), (102, -14), (132, -6), (OP, -10)], (0.45, 0.55))
layer("leaf", [group([vein, stroke(hexc("#A5D6A7"), 2.5)], "vein"), group([leaf_shape, fill(hexc("#43A047"))], "leaf")],
      ks(p=(3, TOP - 8, 0), s=leaf_s, r=leaf_r), parent=rig)
layer("stem", [group([{"ty": "rc", "p": st([0, TOP - 4]), "s": st([9, 18]), "r": st(4), "nm": "rc", "d": 1}, fill(hexc("#6D4C41"))], "stem")], ks(), parent=rig)

# 몸통
gloss = group([ellipse(26, 15, (-34, -38)), fill(hexc("#FFFFFF"), 55)], "gloss", tr(p=(-34, -38), a=(-34, -38), r=-25))
light = group([ellipse(106, 92, (-12, -12)), fill(hexc("#FFB74D"), 85)], "light")
body = group([ellipse(R * 2 + 8, R * 2 - 4, (0, 2)), fill(hexc("#FB8C00"))], "body")
shade = group([ellipse(R * 2 + 8, R * 2 - 4, (6, 8)), fill(hexc("#EF6C00"))], "shade")
dots = [group([ellipse(4, 4, p), fill(hexc("#F57C00"), 70)], "dot") for p in [(-44, 30), (36, 36), (52, -18), (-55, -6), (10, 50), (-18, 46)]]
layer("body", [gloss] + dots + [light, body, shade], ks(), parent=rig)

# 그림자: 귤을 따라 오고, 멈출 때 살짝 퍼짐
sh_s = anim([(0, [90, 90, 100]), (34, [100, 100, 100]), (38, [110, 110, 100]), (46, [100, 100, 100]), (72, [100, 100, 100]), (87, [104, 104, 100]), (102, [100, 100, 100]), (117, [104, 104, 100]), (132, [100, 100, 100]), (OP, [100, 100, 100])])
layer("shadow", [group([ellipse(134, 18), fill(hexc("#7A3E00"))], "shadow")],
      ks(p=anim([(0, [490, GROUND + 4, 0]), (34, [CX, GROUND + 4, 0]), (OUT0, [CX, GROUND + 4, 0], (0.55, 1)), (OUT1, [40, GROUND + 4, 0]), (OP, [40, GROUND + 4, 0])], (0.2, 0.6)), s=sh_s, o=st(20)))

doc = {"v": "5.7.4", "fr": FR, "ip": 0, "op": OP, "w": W, "h": H, "nm": "kkyul-roll", "ddd": 0, "assets": [], "layers": layers,
       
       "meta": {"g": "kkyul (hand-written)"}}
json.dump(doc, open(sys.argv[1], "w"), ensure_ascii=False, separators=(",", ":"))
print("layers", len(layers), "bytes", len(json.dumps(doc)))
