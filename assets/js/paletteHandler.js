let selectedPalette;
let newSelectedPalette;
let marks = {}
let primitive = {}
let palette_cat = {}

let stWidth = 1
let mode = "stroke"

let paletteScale = 1
let paletteOrigin = {x: 0, y: 0};
const paletteInitCoords = {x: 0, y: 0};
let paletteTempCan

let isPalettePanning = false
let palettePanLast = {x: 0, y: 0}

let paletteUndoStack = []
let paletteRedoStack = []
const PALETTE_UNDO_LIMIT = 20

let paletteInkMode = false
let palettePrevMoveTime = 0

let stColor = '#333'
let primRot

let global_anchors = {}
let currAnchor = 0

let palIt = 0

let megaPalettes = {}
let megaPalette2 = {}


let nSelPaltette;
let nSelMark;
let nSelType;

function editPalette(e) {
    let el = e

    document.getElementById("paletteContainer").style.display = "block";
    primRot = undefined

    let type = "markCan"
    let num = ""
    let key = ""
    if (!el.matches("canvas")) {
        num = el.getAttribute("number")
        key = el.getAttribute("key")
        type = el.getAttribute("id").split("_")[0]

        if (type === "canvas") {
            type = el.getAttribute("type")
            key = el.getAttribute("id").split("_")[1]

        }
        selectedPalette = [key, num, type]
    }

    let trange = document.getElementById("strokewidth")
    trange.onchange = function (e) {
        const val = parseInt(document.getElementById("strokewidth").value);
        stWidth = val
    }

    document.getElementById('strokecolor').onchange = function () {

        stColor = this.value
    }

    paletteResetZoom()

    let can = document.getElementById("paletteEdit")
    let cont = can.getContext("2d")

    let trec = can.getBoundingClientRect()

    can.width = trec.width;
    can.height = trec.height;

    applyPaletteCheckerboard(can)

    let w = trec.width
    let h = trec.height

    let proto

    if (type === "mark") {

        proto = megaPalettes[key].encodings.range.marks[num].proto


    } else {
        proto = {canvas: el, corners: [[0, 0], [el.width, el.height]]}
    }


    let tw = proto.canvas.width
    let th = proto.canvas.height
    if (proto.corners) {

        tw = proto.corners[1][0] - proto.corners[0][0]
        th = proto.corners[1][1] - proto.corners[0][1]

    }
    cont.clearRect(0, 0, 900, 900)
    cont.drawImage(proto.canvas,
        0,
        0,
        proto.canvas.width,
        proto.canvas.height,
        can.width / 2 - tw / 2,
        can.height / 2 - th / 2,
        tw,
        th
    );


    can.onpointerdown = onMouseDownPalette
    can.onpointermove = onMouseMovePalette
    can.onpointerup = onMouseUpPalette
    can.onclick = onClickPalette


    let control = document.getElementById('editControl')

    control.onclick = function (e) {

        let el = e.target

        if (el.matches('img')) {
            el = el.parentNode
            if (el.classList.contains('selectablePallete')) {
                document.getElementById("selectedButton2").removeAttribute("id")
                el.setAttribute("id", "selectedButton2")
            }
        }

    }
    // can.onwheel = paletteZoom

    document.getElementById("paletteEditRotate").oninput = function (e) {
        primRot = +this.value
        paletteRotate(primRot)
    }
    paletteTempCan = document.createElement("canvas");
    paletteTempCan.width = can.width;
    paletteTempCan.height = can.height;

    let tcon = paletteTempCan.getContext('2d')
    console.log(can);
    tcon.drawImage(can, 0, 0)

    paletteUndoStack = []
    paletteRedoStack = []

    can.addEventListener("mousewheel", paletteZoom, false);
    can.addEventListener("DOMMouseScroll", paletteZoom, false);
    can.addEventListener("wheel", paletteZoom, {passive: false});


    window.removeEventListener("keydown", paletteKeyHandler)
    window.addEventListener("keydown", paletteKeyHandler)
}

function applyPaletteCheckerboard(can) {
    can.style.backgroundImage =
        "linear-gradient(45deg, rgba(128,128,128,0.18) 25%, transparent 25%)," +
        "linear-gradient(-45deg, rgba(128,128,128,0.18) 25%, transparent 25%)," +
        "linear-gradient(45deg, transparent 75%, rgba(128,128,128,0.18) 75%)," +
        "linear-gradient(-45deg, transparent 75%, rgba(128,128,128,0.18) 75%)"
    can.style.backgroundSize = "16px 16px"
    can.style.backgroundPosition = "0 0, 0 8px, 8px -8px, -8px 0px"
}

function onClickPalette(e) {
    if (e.shiftKey) {
        return
    }

    if (mode === "anchor") {
        let xy = getMousePos(e);
        xy = toWorld(xy, paletteOrigin, paletteScale)

        let selProto = marks[selectedPalette[0]][selectedPalette[1]].proto

        let tw = selProto.corners[1][0] - selProto.corners[0][0]
        let th = selProto.corners[1][1] - selProto.corners[0][1]


        if (selProto.anchors) {
            selProto.anchors[currAnchor] = {
                x: xy.x,
                y: xy.y,
                color: catColors[currAnchor],
                rx: xy.x / paletteTempCan.width,
                ry: xy.y / paletteTempCan.height,
                px: (xy.x - paletteTempCan.width / 2 + tw / 2),
                py: (xy.y - paletteTempCan.height / 2 + th / 2),
                prx: (xy.x - paletteTempCan.width / 2 + tw / 2) / paletteTempCan.width,
                pry: (xy.y - paletteTempCan.height / 2 + th / 2) / paletteTempCan.height,
            }
        } else {

            selProto.anchors = {
                currAnchor: {
                    x: xy.x,
                    y: xy.y,
                    color: catColors[currAnchor],
                    rx: xy.x / paletteTempCan.width,
                    ry: xy.y / paletteTempCan.height,
                    px: (xy.x - paletteTempCan.width / 2 + tw / 2),
                    py: (xy.y - paletteTempCan.height / 2 + th / 2),
                    prx: (xy.x - paletteTempCan.width / 2 + tw / 2) / paletteTempCan.width,
                    pry: (xy.y - paletteTempCan.height / 2 + th / 2) / paletteTempCan.height,
                },
            }
            ;

        }

        global_anchors[currAnchor] = {
            from: selectedPalette[0],
            data_from: selProto.anchors[currAnchor]
        }


    } else if (mode === "eraseColor") {
        let xy = getMousePos(e);
        xy = toWorld(xy, paletteOrigin, paletteScale)

        const canvasXY = paletteToCanvasSpace(xy)

        let tcan = paletteTempCan


        let cont = tcan.getContext("2d")
        // const [r, g, b, a] = cont.getImageData(tx, ty, 1, 1).data;
        const [r, g, b, a] = cont.getImageData(canvasXY.x, canvasXY.y, 1, 1).data;

        const range = 20

        pushPaletteUndoSnapshot()
        removeColor(r, g, b, paletteTempCan, range)
        paletteRedraw()
        // removeColor(r, g, b, megaPalettes[nSelPaltette].encodings.range.marks[nSelMark].source, range)
        // removeColor(r, g, b, megaPalettes[nSelPaltette].encodings.range.marks[nSelMark].proto.canvas, range)

    } else if (mode === "fill") {
        let xy = getMousePos(e);
        xy = toWorld(xy, paletteOrigin, paletteScale)

        const canvasXY = paletteToCanvasSpace(xy)

        const tolerance = 20

        pushPaletteUndoSnapshot()
        floodFillPaletteCanvas(paletteTempCan, canvasXY.x, canvasXY.y, stColor, tolerance)
        paletteRedraw()

    } else if (mode === "eyedropper") {
        let xy = getMousePos(e);
        xy = toWorld(xy, paletteOrigin, paletteScale)

        const canvasXY = paletteToCanvasSpace(xy)

        let cont = paletteTempCan.getContext("2d")
        const [r, g, b, a] = cont.getImageData(canvasXY.x, canvasXY.y, 1, 1).data;

        if (a === 0) return // nothing drawn here to sample

        const hex = rgbToHex(r, g, b)
        stColor = hex

        const colorInput = document.getElementById('strokecolor')
        if (colorInput) colorInput.value = hex
    }
}


function hidePaletteContainer() {

    document.getElementById("paletteContainer").style.display = "none";
    selectedPalette = undefined
}

function updateAnchorCont(container) {


    container.innerHTML = ''

    for (const [key, value] of Object.entries(global_anchors)) {

        const tdiv = document.createElement('div')

        let sel = ""

        if (key === currAnchor) {
            sel = " selectedAnchor"
        }

        tdiv.setAttribute('id', 'currAnchor_' + key)
        tdiv.setAttribute('class', 'currAnchor' + sel)

        tdiv.innerHTML = key
        tdiv.onclick = function (e) {
            document.querySelector(".selectedAnchor").classList.remove("selectedAnchor")
            this.classList.add("selectedAnchor")
            const id = this.getAttribute('id')
            currAnchor = id.split("_")[1]
        }
        container.appendChild(tdiv)
    }

}

function displayCircle(xy) {

    const toolColors = {
        stroke: stColor,
        erase: "#e5484d",
        eraseColor: "#f2994a",
        fill: "#27ae60",
        eyedropper: "#9b59b6",
        anchor: "#2f80ed",
    }

    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');
    cont.save()
    cont.strokeStyle = toolColors[mode] || "#333"
    cont.lineWidth = 1 / (paletteScale || 1)

    if (mode === "eraseColor" || mode === "fill" || mode === "eyedropper") {
        // All three sample a point rather than paint with a given width —
        // brush width is irrelevant, so show a crosshair/target
        // instead of a size ring that would otherwise imply a brush effect.
        const r = 6 / (paletteScale || 1)
        cont.beginPath();
        cont.arc(xy.x, xy.y, r, 0, 2 * Math.PI);
        cont.moveTo(xy.x - r * 1.8, xy.y);
        cont.lineTo(xy.x - r * 0.6, xy.y);
        cont.moveTo(xy.x + r * 0.6, xy.y);
        cont.lineTo(xy.x + r * 1.8, xy.y);
        cont.moveTo(xy.x, xy.y - r * 1.8);
        cont.lineTo(xy.x, xy.y - r * 0.6);
        cont.moveTo(xy.x, xy.y + r * 0.6);
        cont.lineTo(xy.x, xy.y + r * 1.8);
        cont.stroke();
        cont.closePath();
    } else {
        cont.beginPath();
        cont.arc(xy.x, xy.y, stWidth, 0, 2 * Math.PI);
        cont.stroke();
        cont.closePath();
    }

    cont.restore()
}


function paletteResetZoom() {
    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');
    cont.setTransform(1, 0, 0, 1, 0, 0);
    paletteScale = 1
    paletteOrigin.x = 0
    paletteOrigin.y = 0
}

function onMouseUpPalette(e) {
    if (isPalettePanning) {
        isPalettePanning = false
        if (e && e.target && e.target.releasePointerCapture && e.pointerId !== undefined) {
            e.target.releasePointerCapture(e.pointerId)
        }
        let can = document.getElementById("paletteEdit")
        if (can) can.style.cursor = ""
        return
    }

    mouseDown = 0

    stroke = []
}

function drawPalette(cont, x, y, w, type, can) {
    cont.save()
    if (type === "erase")
        cont.globalCompositeOperation = 'destination-out';

    const rawPrev = stroke.length ? stroke[stroke.length - 1] : null

    let start = [strokePoint[0], strokePoint[1]]
    let end = [x, y]
    let prev = rawPrev ? [rawPrev[0], rawPrev[1]] : null

    if (primRot) {
        const cx = paletteTempCan.width / 2
        const cy = paletteTempCan.height / 2
        cont.translate(cx, cy);
        cont.rotate(toRad(-primRot));
        start = [start[0] - cx, start[1] - cy]
        end = [end[0] - cx, end[1] - cy]
        if (prev) {
            prev = [prev[0] - cx, prev[1] - cy]
        }
    }


    cont.lineCap = 'round';
    cont.lineJoin = 'round';
    cont.beginPath();
    // cont.strokeStyle = "#333"
    cont.strokeStyle = stColor
    cont.lineWidth = w

    if (prev) {

        const midPrev = [(prev[0] + start[0]) / 2, (prev[1] + start[1]) / 2]
        const midCurr = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
        cont.moveTo(midPrev[0], midPrev[1])
        cont.quadraticCurveTo(start[0], start[1], midCurr[0], midCurr[1])
    } else {
        cont.moveTo(start[0], start[1]);
        cont.lineTo(end[0], end[1]);
    }

    cont.stroke()
    cont.closePath();
    cont.restore()

    let tcon = can.getContext('2d')
    tcon.clearRect(0, 0, 9000, 9000);

    tcon.drawImage(cont.canvas, 0, 0)
}

function getPaletteInkWidth(e, xy) {

    const pressure = (e.pressure && e.pressure > 0) ? e.pressure : 0.5

    const now = performance.now()
    const dt = Math.max(now - palettePrevMoveTime, 1)
    palettePrevMoveTime = now

    const dx = xy.x - strokePoint[0]
    const dy = xy.y - strokePoint[1]
    const dist = Math.hypot(dx, dy)
    const speed = dist / dt // px per ms


    const speedFactor = clampVal(1.15 - speed * 1.5, 0.35, 1.15)

    return Math.max(1, stWidth * pressure * speedFactor)
}

function onMouseDownPalette(e) {
    if (e.shiftKey) {
        isPalettePanning = true
        palettePanLast = {x: e.offsetX, y: e.offsetY}
        if (e.target && e.target.setPointerCapture && e.pointerId !== undefined) {
            e.target.setPointerCapture(e.pointerId)
        }
        e.target.style.cursor = "grabbing"
        e.preventDefault()
        return
    }

    let xy = getMousePos(e);
    xy = toWorld(xy, paletteOrigin, paletteScale)
    strokePoint = [xy.x, xy.y];
    mouseDown = 1;
    palettePrevMoveTime = performance.now()

    pushPaletteUndoSnapshot()
}


function onMouseMovePalette(e) {
    if (isPalettePanning) {
        e.preventDefault()
        const dx = e.offsetX - palettePanLast.x
        const dy = e.offsetY - palettePanLast.y
        palettePanLast = {x: e.offsetX, y: e.offsetY}

        paletteOrigin.x += dx
        paletteOrigin.y += dy

        paletteRedraw()
        return
    }

    let xy = getMousePos(e);

    xy = toWorld(xy, paletteOrigin, paletteScale)
    let can = document.getElementById("paletteEdit")
    can.style.cursor = e.shiftKey ? "grab" : ""

    if (mouseDown === 1) {

        // let cont = can.getContext('2d');
        e.preventDefault()

        let w = stWidth
        if (paletteInkMode && mode === "stroke") {
            w = getPaletteInkWidth(e, xy)
        }

        let cont = paletteTempCan.getContext('2d')
        drawPalette(cont, xy.x, xy.y, w, mode, can);
        stroke.push([...strokePoint])
        strokePoint = [xy.x, xy.y];
    }
    let tcon = can.getContext('2d')
    tcon.clearRect(0, 0, 9000, 9000);

    if (primRot) {
        tcon.save()
        tcon.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
        tcon.rotate(toRad(primRot));
        tcon.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
        tcon.restore();
    } else {
        tcon.drawImage(paletteTempCan, 0, 0)
    }

    displayCircle(xy)

}

function getClosestPrev() {
    let ind = selectedPalette[1]
    let keys = Object.keys(marks[selectedPalette[0]])

    let bg

    for (let i = ind; i > 0; i--) {
        if (marks[selectedPalette[0]][keys[i]].type !== "fake") {
            bg = marks[selectedPalette[0]][keys[i]]
            break
        }
    }
    loadbg(bg)
}

function loadbg(bg) {
    if (bg) {

        let can = document.getElementById("paletteEdit")
        let cont = can.getContext("2d")

        let tw = bg.proto.corners[1][0] - bg.proto.corners[0][0]
        let th = bg.proto.corners[1][1] - bg.proto.corners[0][1]


        cont.clearRect(0, 0, 900, 900)
        cont.drawImage(bg.proto.canvas,
            0,
            0,
            bg.proto.canvas.width,
            bg.proto.canvas.height,
            can.width / 2 - tw / 2,
            can.height / 2 - th / 2,
            tw,
            th
        );

        paletteTempCan = document.createElement("canvas");
        paletteTempCan.width = can.width;
        paletteTempCan.height = can.height;

        let pcont = paletteTempCan.getContext("2d");

        pcont.drawImage(can, 0, 0, can.width, can.height)

        paletteUndoStack = []
        paletteRedoStack = []
    }
}

function getClosestNext() {
    let ind = selectedPalette[1]
    let keys = Object.keys(marks[selectedPalette[0]])

    let bg

    for (let i = ind; i < keys.length; i++) {
        if (marks[selectedPalette[0]][keys[i]].type !== "fake") {
            bg = marks[selectedPalette[0]][keys[i]]
            break
        }
    }

    loadbg(bg)
}

function switchmod(val) {
    mode = val
}

function togglePaletteInk(enabled) {
    paletteInkMode = !!enabled
}

function paletteRotate(angle) {
    let tcan = document.getElementById('paletteEdit');
    let tcont = tcan.getContext('2d');


    tcont.clearRect(0, 0, 9000, 9000)

    tcont.save()
    tcont.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
    tcont.rotate(toRad(angle));
    tcont.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
    tcont.restore();

    // paletteTempCan = can
    // tcont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
}


function paletteZoom(e) {
    e.preventDefault();
    let zoomStep = 1.1

    let x = e.offsetX;
    let y = e.offsetY;
    let delta
    if (e.type === "mousewheel") {
        delta = e.wheelDelta
    } else if (e.type === "wheel") {
        delta = -e.deltaY
    } else {
        delta = -e.detail
    }

    if (delta > 0) {
        paletteScaleAt(x, y, zoomStep);
    } else {
        paletteScaleAt(x, y, 1 / zoomStep);
    }

    paletteRedraw();
}

function paletteRedraw() {
    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');

    cont.clearRect(0, 0, can.width, can.height);
    cont.setTransform(paletteScale, 0, 0, paletteScale, paletteOrigin.x, paletteOrigin.y);

    cont.save()
    cont.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
    cont.rotate(toRad(primRot));
    cont.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
    cont.restore();
    // cont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
}

function paletteToCanvasSpace(xy) {
    if (!primRot) return {x: xy.x, y: xy.y}

    const cx = paletteTempCan.width / 2
    const cy = paletteTempCan.height / 2
    const rad = toRad(-primRot)
    const dx = xy.x - cx
    const dy = xy.y - cy
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    return {
        x: cx + (dx * cos - dy * sin),
        y: cy + (dx * sin + dy * cos)
    }
}

function hexToRgb(hex) {
    hex = hex.replace('#', '')
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
    }
    const num = parseInt(hex, 16)
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToHex(r, g, b) {
    const toHexPart = (v) => clampVal(Math.round(v), 0, 255).toString(16).padStart(2, '0')
    return '#' + toHexPart(r) + toHexPart(g) + toHexPart(b)
}

function floodFillPaletteCanvas(canvas, startX, startY, fillHex, tolerance) {
    const w = canvas.width
    const h = canvas.height
    startX = Math.round(startX)
    startY = Math.round(startY)
    if (startX < 0 || startY < 0 || startX >= w || startY >= h) return

    const ctx = canvas.getContext("2d")
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const idx = (x, y) => (y * w + x) * 4

    const startIdx = idx(startX, startY)
    const targetR = data[startIdx]
    const targetG = data[startIdx + 1]
    const targetB = data[startIdx + 2]
    const targetA = data[startIdx + 3]

    const [fr, fg, fb] = hexToRgb(fillHex)
    const fa = 255


    if (Math.abs(targetR - fr) <= tolerance && Math.abs(targetG - fg) <= tolerance &&
        Math.abs(targetB - fb) <= tolerance && Math.abs(targetA - fa) <= tolerance) {
        return
    }

    const matches = (i) =>
        Math.abs(data[i] - targetR) <= tolerance &&
        Math.abs(data[i + 1] - targetG) <= tolerance &&
        Math.abs(data[i + 2] - targetB) <= tolerance &&
        Math.abs(data[i + 3] - targetA) <= tolerance

    const visited = new Uint8Array(w * h)
    const stack = [[startX, startY]]

    while (stack.length) {
        const [x, y] = stack.pop()
        if (x < 0 || y < 0 || x >= w || y >= h) continue

        const vIdx = y * w + x
        if (visited[vIdx]) continue

        const pIdx = idx(x, y)
        if (!matches(pIdx)) continue

        visited[vIdx] = 1
        data[pIdx] = fr
        data[pIdx + 1] = fg
        data[pIdx + 2] = fb
        data[pIdx + 3] = fa

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
}

function paletteSnapshotCanvas(source) {
    const snap = document.createElement("canvas")
    snap.width = source.width
    snap.height = source.height
    snap.getContext("2d").drawImage(source, 0, 0)
    return snap
}

function pushPaletteUndoSnapshot() {
    if (!paletteTempCan) return
    try {
        paletteUndoStack.push(paletteSnapshotCanvas(paletteTempCan))
        if (paletteUndoStack.length > PALETTE_UNDO_LIMIT) {
            paletteUndoStack.shift()
        }
        paletteRedoStack = []
    } catch (err) {
        console.error("Palette undo snapshot failed", err)
    }
}

function paletteRestoreSnapshot(snap) {
    paletteTempCan.width = snap.width
    paletteTempCan.height = snap.height
    paletteTempCan.getContext("2d").drawImage(snap, 0, 0)

    paletteRedraw()
}

function palettePerformUndo() {
    if (!paletteUndoStack.length || !paletteTempCan) return
    paletteRedoStack.push(paletteSnapshotCanvas(paletteTempCan))
    paletteRestoreSnapshot(paletteUndoStack.pop())
}

function palettePerformRedo() {
    if (!paletteRedoStack.length || !paletteTempCan) return
    paletteUndoStack.push(paletteSnapshotCanvas(paletteTempCan))
    paletteRestoreSnapshot(paletteRedoStack.pop())
}

function paletteKeyHandler(e) {
    const paletteContainer = document.getElementById("paletteContainer")
    if (!paletteContainer || paletteContainer.style.display !== "block") return

    const active = document.activeElement
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return

    const ctrlOrCmd = e.ctrlKey || e.metaKey
    if (!ctrlOrCmd) return

    const key = e.key.toLowerCase()

    if (key === "z" && e.shiftKey) {
        e.preventDefault()
        palettePerformRedo()
    } else if (key === "z") {
        e.preventDefault()
        palettePerformUndo()
    } else if (key === "y") {
        e.preventDefault()
        palettePerformRedo()
    }
}


function paletteScaleAt(x, y, scaleBy) {
    paletteScale *= scaleBy;
    paletteOrigin.x = x - (x - paletteOrigin.x) * scaleBy;
    paletteOrigin.y = y - (y - paletteOrigin.y) * scaleBy;
}


function savePalette() {
    const corn = getMinimalBoundingBox(paletteTempCan)

    let resCan

    if (selectedPalette === undefined) {
        resCan = currSampleEdited
    } else {

        if (selectedPalette[2] === "mark") {
            if (selectedPalette[1]) {
                resCan = megaPalettes[selectedPalette[0]].encodings.range.marks[selectedPalette[1]].proto.canvas

            } else {
                resCan = marks[selectedPalette[0]].proto.canvas
            }

        } else if (selectedPalette[2] === "cat") {
            resCan = palette_cat[selectedPalette[0]].proto.canvas
        }
    }

    let tw = Math.min(corn.width, resCan.width)
    let th = Math.min(corn.height, resCan.height)

    resCan.width = tw
    resCan.height = th

    const resCont = resCan.getContext('2d')


    resCont.clearRect(0, 0, 999, 999)
    resCont.save()
    resCont.translate(resCan.width / 2, resCan.height / 2);

    if (primRot !== undefined)
        resCont.rotate(toRad(primRot));

    let factor = 2

    if (tw < 15) {
        factor = 4
    } else if (tw < 40) {
        factor = 2.5
    } else {
        factor = 2
    }


    resCont.drawImage(paletteTempCan,
        corn.x,
        corn.y,
        corn.width,
        corn.height,
        -(tw / factor),
        -(th / factor),
        tw,
        th
    )


    if (selectedPalette) {

        if (selectedPalette[2] === "mark" && !palSwitch) {
            if (selectedPalette[1]) {

                megaPalettes[selectedPalette[0]].encodings.range.marks[selectedPalette[1]].proto.corners = [[corn.x, corn.y], [corn.x + corn.width, corn.y + corn.height]]
            } else {
                marks[selectedPalette[0]].proto.corners = [[corn.x, corn.y], [corn.x + corn.width, corn.y + corn.height]]

            }


        }
        updateSvg()
    }
    document.getElementById("paletteContainer").style.display = "none";

    // fillPalette()

    selectedPalette = undefined


}


function toBW() {
    let src = opencv.imread(paletteTempCan);


    let temp = new opencv.MatVector();
    let temp2 = new opencv.MatVector();
    opencv.split(src, temp)


    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);

    // dst = opencv.merge(src, temp.get(3))

    let mergedPlanes = new opencv.MatVector();

    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 1);

    opencv.split(src, temp2)

    mergedPlanes.push_back(temp2.get(0))
    mergedPlanes.push_back(temp2.get(0))
    mergedPlanes.push_back(temp2.get(0))
    mergedPlanes.push_back(temp.get(3))

    // opencv.merge(src, mergedPlanes)
    opencv.merge(mergedPlanes, src)

    opencv.imshow(paletteTempCan, src);


    let can = document.getElementById("paletteEdit")

    let tcon = can.getContext('2d')
    tcon.clearRect(0, 0, 900, 900);
    tcon.drawImage(paletteTempCan, 0, 0)

    src.delete();
    dst.delete();
    mergedPlanes.delete();
    temp.delete();
    temp2.delete();
}


function setAnchor() {
    let el = document.getElementById("anchorBtn")

    if (collageMod === 'anchor') {
        el.classList.remove('selectedAnchorBtn');
        collageMod = "details"
    } else {
        collageMod = 'anchor';
        el.classList.add('selectedAnchorBtn');
    }
    // mode = 'anchor';
}


function getOptions() {
    let ancres = Object.keys(global_anchors)

    let mess = ""


    for (let i = 0; i < ancres.length; i++) {

        mess += "<option class ='anchor_" + ancres[i] + "'>" + ancres[i] + "</option>"
    }

    return mess
}


function clampVal(val, min, max) {

    return Math.max(Math.min(val, max), min)
}


function updateMarksBindingDisplay(palette) {

    let cont = document.getElementById('bind-' + palette)
    cont.innerHTML = ""

    if (dataBinding[palette]) {
        makeBindingDisplay(cont, palette, dataBinding[palette])
    }


}

function hideMarkInVis(e, div) {
    if (displayMode === "0") {
        d3.select("#viewport").selectAll(".selectedImageMark").classed("selectedImageMark", false);
    } else if (displayMode === "1") {
        d3.select("#bigCartesian").selectAll(".selectedImageMark").classed("selectedImageMark", false);
    }
}

function highlightMarkInVis(e, div) {
    let name = div.getAttribute("key")
    let mark = div.getAttribute("number")

    let imgs = d3.select("#viewport").selectAll("image")
    if (displayMode === "1") {
        imgs = d3.select("#bigCartesian").selectAll("image")
    }

    if (megaGlyph[name].dataColumn !== "") {

        let n = Object.keys(megaPalettes[name].encodings.range.marks).indexOf(mark)
        let allVals = [...new Set(chartDataset.data.map(d => d[megaGlyph[name].dataColumn]))]

        imgs.each(function (d) {
            if (displayMode === "0") {
                if (d[megaGlyph[name].dataColumn] === allVals[n]) {
                    d3.select(this).classed("selectedImageMark", true);
                }
            } else if (displayMode === "1") {
                if (d[name] === mark) {
                    d3.select(this).classed("selectedImageMark", true);
                }
            }
        });
    } else {

        if (displayMode === "0") {
            let n = Object.keys(megaPalettes[name].encodings.range.marks).indexOf(mark)
            if (n === 0) {
                imgs.classed("selectedImageMark", true);
            }
        } else if (displayMode === "1") {
            imgs.each(function (d) {

                if (d[name] === mark) {
                    d3.select(this).classed("selectedImageMark", true);

                }
            });
        }
    }


}

function makeRangeMark(key, tdiv, value, typesDisplay) {

    const marks = value.encodings.range.marks


    let dataBindinCont = document.createElement("div")
    dataBindinCont.id = "bind-" + key

    dataBindinCont.className = "dataBindingContainer"

    if (dataBinding[key]) {
        makeBindingDisplay(dataBindinCont, key, dataBinding[key])
    }

    tdiv.appendChild(dataBindinCont)

    for (const [name, value] of Object.entries(marks)) {
        let tmark = makeSingleMark(key, name, "range", value.proto.canvas)
        tdiv.appendChild(tmark)
        // makeBindingDisplay(key, dataBinding[key])
        let tcan = tmark.lastChild;
        let trect = tcan.getBoundingClientRect()

        let tsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tmark.appendChild(tsvg)

        tmark.addEventListener("mouseover", (event) => {
            highlightMarkInVis(event, tmark);
        });
        tmark.addEventListener("mouseout", (event) => {
            hideMarkInVis(event, tmark);
        });

        dragElement3(tmark)
        tsvg = d3.select(tsvg)


        tsvg
            .attr("id", "svg-" + key + "-" + name)
            .attr("class", "markAnchorSvg")
            .attr("viewBox", `0 0 ${trect.width} ${trect.height}`)
            .attr("width", trect.width)
            .attr("height", trect.height)


        if (value.proto.anchors) {
            for (const [id, coords] of Object.entries(value.proto.anchors)) {
                tsvg.append("circle")
                    .attr("cx", trect.width * coords.rx)
                    .attr("cy", trect.height * coords.ry)
                    .attr("num", id)
                    .attr("fill", collageColScale(coords.relatedTo))
                    .style("stroke", "1px")
                    .attr("palette", key)
                    .attr("name", name)
                    .attr("r", "5")
                    .call(d3.drag()
                        .on("start", nodeDragst)
                        .on("drag", nodeDragged)
                        .on("end", nodeDragend))
            }

        }

    }

    let moreCan = document.createElement("div")

    moreCan.className = "moreCan"
    moreCan.innerHTML = ` <img  id="palettePlusMark" src="assets/images/buttons/plus.png" class="buttonImg" 
 style=";margin-top: 28%;margin-left: 28%;width: 25px; cursor: pointer" onclick="addACan(this,'${key}')">`
    tdiv.appendChild(moreCan)

}


function nodeDragst() {

}

function nodeDragged(event) {
    let elem = d3.select(this)
    let htmlSvg = elem.node().parentElement
    let svg = d3.select(htmlSvg)

    let x = clampVal(event.x, 0, htmlSvg.getAttribute("width"));
    let y = clampVal(event.y, 0, htmlSvg.getAttribute("height"));

    elem.attr("cx", x)
    elem.attr("cy", y)

    let pal = elem.attr("palette")
    let mark = elem.attr("name")
    let num = elem.attr("num")


    megaPalettes[pal].encodings.range.marks[mark].proto.anchors[num].x = x
    megaPalettes[pal].encodings.range.marks[mark].proto.anchors[num].y = y
    megaPalettes[pal].encodings.range.marks[mark].proto.anchors[num].rx = x / htmlSvg.getAttribute("width")
    megaPalettes[pal].encodings.range.marks[mark].proto.anchors[num].ry = y / htmlSvg.getAttribute("height")


}

function nodeDragend() {
    updateSvg()
}


function addACan(elem, key, img = undefined) {
    let len = Object.keys(megaPalettes[key].encodings.range.marks).length

    let tcan = document.createElement("canvas")

    tcan.width = 60
    tcan.height = 60
    let name = "mark" + len

    if (img) {
        drawCanvasWithScale(img, tcan, 1)
    }


    if (megaPalettes[key].encodings.range.marks) {
        let anchor = {}
        for (const [_, value] of Object.entries(megaPalettes[key].encodings.range.marks)) {
            if (value.proto.anchors) {
                anchor = deepClone(value.proto.anchors)
                break
            }
        }


        megaPalettes[key].encodings.range.marks[name] = {
            value: name,
            type: "fake",
            proto: {
                canvas: tcan,
                corners: [[0, 0], [tcan.width, tcan.height]],

            },
        }

        if (anchor != {}) {
            megaPalettes[key].encodings.range.marks[name].proto.anchors = anchor
        }

        let tmark = makeSingleMark(key, name, "range", tcan)
        elem.parentElement.parentElement.insertBefore(tmark, elem.parentElement)
        // let tcan = tmark.lastChild;
        let trect = tcan.getBoundingClientRect()

        let tsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tmark.appendChild(tsvg)

        dragElement3(tmark)
        tsvg = d3.select(tsvg)


        tsvg
            .attr("id", "svg-" + key + "-" + name)
            .attr("class", "markAnchorSvg")
            .attr("viewBox", `0 0 ${trect.width} ${trect.height}`)
            .attr("width", trect.width)
            .attr("height", trect.height)


        if (megaPalettes[key].encodings.range.marks[name].proto.anchors) {
            for (const [id, coords] of Object.entries(megaPalettes[key].encodings.range.marks[name].proto.anchors)) {
                tsvg.append("circle")
                    .attr("cx", trect.width * coords.rx)
                    .attr("cy", trect.height * coords.ry)
                    .attr("num", id)
                    .attr("fill", collageColScale(coords.relatedTo))
                    .style("stroke", "1px")
                    .attr("palette", key)
                    .attr("name", name)
                    .attr("r", "5")
                    .call(d3.drag()
                        .on("start", nodeDragst)
                        .on("drag", nodeDragged)
                        .on("end", nodeDragend))
            }

        }


    }
}

function getMarkRange(key) {
    let res = []
    for (let i = 0; i < sampleData.length; i++) {
        for (const [name, value] of Object.entries(sampleData[i].data)) {
            if (name === key && value?.proto?.canvas) {
                res.push([value.value, value.proto.corners])
            }
        }
    }
    let min = getFirstIndexOfMinValue(res)
    let max = getFirstIndexOfMaxValue(res)
    return [res[min], res[max]]
}


function showBinding(e, div) {

    let data = div.innerHTML
    let name= div.parentElement.getAttribute("id").replace("bind-","")

    if (displayMode === "0") {
        let imgs = d3.select("#viewport").selectAll("image")

        imgs.each(function (d) {
            if (d[megaGlyph[name].dataColumn] === data) {
                d3.select(this).classed("selectedImageMark", true);
            }
        })

    } else if (displayMode === "1") {
        let imgs = d3.select("#bigCartesian").selectAll("image")
        imgs.each(function (d) {
            if (d[name] === mark) {
                d3.select(this).classed("selectedImageMark", true);
            }
        })
    }
}




function makeBindingDisplay(container, palette, dataColumn) {
    if (!isCont(chartDataset.data, dataColumn)) {
        let set = new Set(chartDataset.data.map(d => d[dataColumn]));
        console.log(set);
        let uniques = Array.from(set).map(d => "" + d)
        console.log(uniques);
        let nMarks = Object.keys(megaPalettes[palette].encodings.range.marks).length

        for (let i = 0; i < uniques.length; i++) {

            let nameDiv = document.createElement("div")

            nameDiv.setAttribute("class", "dataBindingLabel")
            nameDiv.setAttribute("data", uniques[i])
            nameDiv.innerHTML = uniques[i]


            nameDiv.addEventListener("mouseover", (event) => {
                showBinding(event, nameDiv);
            });

            nameDiv.addEventListener("mouseout", (event) => {
                hideMarkInVis(event, nameDiv);
            });


            if (i > nMarks - 1) {
                nameDiv.style.color = "#EF5350"
                nameDiv.style.fontWeight = "600"
            }

            container.appendChild(nameDiv)

        }

    }

    return container

}

function makeSingleMark(key, label, type, can = undefined) {
    const tdiv_mark = document.createElement("div")
    tdiv_mark.id = "mark_" + key + "_" + label
    tdiv_mark.className = "paletteMark"
    tdiv_mark.setAttribute("key", key)
    tdiv_mark.setAttribute("type", type)
    tdiv_mark.setAttribute("number", "" + label)


    // let mess = `<input type='text' value='${label}' class='paletteMarkName'>`

    // if (type === "morph") {
    //     mess = `<p class='primitiveLabel'>${label}</p>`
    // }
    if (can === undefined) {
        /*
                can = document.createElement("canvas")

                can.width = 60
                can.height = 60
        */

        tdiv_mark.innerHTML = `            <canvas id='canvas_${key}_${label}' style='width: 60px;height: 60px'></canvas>`
    } else {
        // tdiv_mark.innerHTML = mess
        tdiv_mark.appendChild(can)


        can.id = `${"canvas_" + key}_${label}`

    }
    tdiv_mark.onclick = function (e) {

        if (mode !== "anchor") {
            if (e.target.matches("canvas")) {
                nSelPaltette = key
                nSelMark = label
                nSelType = type
                editPalette(this)
            }
        } else {
            setAnchorOnProto(e, this)
        }
    }
    return tdiv_mark
}

function renameRow(elem, key) {
    let name = elem.value

    document.getElementById("exportPaletteBtn_" + key).setAttribute("name", name)

    if (name !== "" && !palSources.includes(key)) {
        megaPalettes[name] = megaPalettes[key]
        delete megaPalettes[key]
        selectedPalette = name
    }


    fillPalette()
}

function savePalette2(key) {

    let res = megaPalettes[key]
    for (const [key, value] of Object.entries(res)) {
        if (typeof value === "object") {
            const tval = {...value}
            res[key] = tval
        }
    }

    for (const [key, value] of Object.entries(res.encodings.range.marks)) {
        res.encodings.range.marks[key].proto.canvas = res.encodings.range.marks[key].proto.canvas.toDataURL("image/png")
        if (res.encodings.range.marks[key].source) {
            res.encodings.range.marks[key].source = res.encodings.range.marks[key].source.toDataURL("image/png")
        }
    }


    download(JSON.stringify(res), "palette_" + key + ".json", "text/json");
}

function purgeAnchor(from, to, n) {
    megaPalettes[to].apply = ""
    megaPalettes[from].linkto = ""

    for (const [key, value] of Object.entries(megaPalettes[from].encodings.range.marks)) {

        delete value.proto.anchors[n]
    }

    for (const [key, value] of Object.entries(megaPalettes[to].encodings.range.marks)) {

        delete value.proto.anchors[n]
    }

    updateSvg()

}

function changeScale(palette, type) {
    const step = 0.03


    if (type === "-") {
        megaPalettes[palette].scale -= step
    } else if (type === "+") {
        megaPalettes[palette].scale += step
    }


    updateSvg()
}


function makeEncodingSelect(key) {

    let select = document.createElement("select")
    select.className = "paletteEncodingSelect"
    select.id = `${key}_encodingSelect`
    select.innerHTML = ` <option value="new">*new*</option>  <option value="color">color</option>` + `<option value="size">size</option>` + `<option value="orientation">orientation</option> <option value="opacity">opacity</option>\``

    select.onchange = function () {
        if (select.value !== "new") {
            let tdiv = document.createElement("div")

            tdiv.className = "dataSelectContainer"
            tdiv.setAttribute("key", key)
            tdiv.setAttribute("val", select.value)
            tdiv.setAttribute("type", select.value)

            let options = makeColumnsSelect()
            tdiv.innerHTML = `<img  onclick="delEncoding('${key}', '${select.value}')" class="delEncoding" src="assets/images/buttons/del.png"><p>${select.value}:</p> <select palette="${key}" encoding="${select.value}" onchange="updateSelectEncoding('${key}', '${select.value}')" class="dataSelect">${options}</select> `
            select.parentElement.parentElement.insertBefore(tdiv, select.parentElement)
            removeOptionByValue(select, select.value)
        }
    }
    return select
}

function removeOptionByValue(select, value) {
    const option = select.querySelector(`option[value="${value}"]`);
    if (option) {
        option.remove();
    }
}


function delEncoding(key, val) {
    let select = document.getElementById(`${key}_encodingSelect`)

    select.innerHTML += `<option value="${val}">${val}</option>`

    let div = document.querySelector(`div[key="${key}"][val="${val}"]`)

    if (val === "color") {
        megaGlyph[key].color.dataColumn = ""
    }


    div.remove()

    updateSvg()
}
