let gSampleType = "rect"

let saveAllowed = false;
let currSampleList = {}

let sampling = false

let currSampleEdited;


function resetListeners(can) {
    // can.onmousemove = null;
    // can.onmousedown = null;
    // can.onmouseup = null;

    can.onpointerdown = null
    can.onpointermove = null
    can.onpointerup = null
}

function switchMode(type) {
    let can = document.getElementById("inVis")
    gSampleType = type


    if (type === "rect") {
        resetListeners(can)

        can.onpointerdown = e => {
            if (isDragging) return
            document.getElementById("sampleDisplay").style.display = "none"
            origin = {x: e.offsetX, y: e.offsetY};
            sampling = true

        };

        can.onpointerup = e => {
            if (isDragging) return
            const torigin = {...origin}

            origin = null;
            sampling = false
            clear();
            drawImage();

            addRectSample(torigin.x, torigin.y, e.offsetX - torigin.x, e.offsetY - torigin.y);
        };
        can.onpointermove = render;
    } else if (type === "free") {

        resetListeners(can)

        /*
                can.onmousedown = onMouseDown
                can.onmousemove = onMouseMove
                can.onmouseup = onMouseUp
        */

        can.onpointerdown = onMouseDown
        can.onpointermove = onMouseMove
        can.onpointerup = onMouseUp

    } else if (type === "grab") {

        resetListeners(can)


        can.onpointerdown = e => {
            if (isDragging) return
            origin = {x: e.offsetX, y: e.offsetY};
            sampling = true

        };

        can.onpointermove = render;

        can.onpointerup = e => {
            if (isDragging) return
            const torigin = {...origin}

            origin = null;
            sampling = false
            clear();
            drawImage();

            addGrabSample(torigin.x, torigin.y, e.offsetX - torigin.x, e.offsetY - torigin.y);
        };

    } else if (type === "move") {

        sampling = false
    }


}


//----------------- Rect stuff

const drawImage = () => {
    if (!isDragging) {
        let can = document.getElementById("inVis")
        let cont = can.getContext('2d');


        cont.setTransform(1, 0, 0, 1, 0, 0);
        cont.clearRect(0, 0, can.width, can.height);

        cont.setTransform(
            zoom, 0,
            0, zoom,
            -x0 * zoom,
            -y0 * zoom
        );
        cont.drawImage(currImg, 0, 0, reducedDim[0], reducedDim[1]);
    }
}

const drawSelection = (e) => {
    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');

    cont.strokeStyle = "#000";
    cont.beginPath();

    cont.setTransform(1, 0, 0, 1, 0, 0);
    cont.rect(origin.x, origin.y, e.offsetX - origin.x, e.offsetY - origin.y);
    cont.stroke();
};

const clear = () => {
    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');

    let w = can.getBoundingClientRect().width
    let h = can.getBoundingClientRect().height

    // cont.strokeStyle = "#fff";
    cont.clearRect(0, 0, w, h);
};

const render = (e) => {

    if (origin && !isDragging && sampling) {
        clear();
        drawImage();
        drawSelection(e);


    }
}

async function addRectSample(x, y, width, height) {


    let coords = curateCoordinates(x, y, width, height);
    coords = screenRectToWorld(coords)

    let can = document.getElementById("inVis")
    let trec = can.getBoundingClientRect()
    let tx = reducedDim[0]
    let ty = reducedDim[1]


    let tcan = document.createElement('canvas');
    let tcont = tcan.getContext('2d');


    let canW = 80
    let canH = 80


    tcan.width = Math.min(coords[2], canW)
    tcan.height = Math.min(coords[3], canH)

    // tcan.style.border = "solid " + categories[selectedCategory].color + " 2px"

    let tcat = {}

    // tcat[selectedCategory] = categories[selectedCategory]

    let tres = {
        x: coords[0],
        y: coords[1],
        width: coords[2],
        height: coords[3],
        type: "rect",
        canvas: tcan,
        // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
        rx: coords[0] / tx,
        ry: coords[1] / ty,
        rWidth: coords[2] / tx,
        rHeight: coords[3] / ty,
        // categories: tcat,
        data: {}
    }

    let dp = tres

    let n = Object.keys(currSampleList).length
    currSampleList[`mark${n}`] = tres

    let container = document.getElementById("marksHolder")

    let tdiv = document.createElement("div");
    tdiv.style.position = "relative";
    tdiv.innerHTML = `<img onclick="removeMark('mark${n}',this)" src="assets/images/buttons/del.png" style="width: 12px;cursor: pointer;position: absolute;top: 3px;left: 3px"> `
    tdiv.appendChild(tcan);
    container.appendChild(tdiv)

    // dragElement4(tdiv)


    // tdiv.onclick = editSample

    // sampleData.push(tres)
    /*
        let marks = document.getElementById("marks")

        marks.append(tcan)*/

    tcont.drawImage(currImg,
        Math.round(dp.rx * currImg.width),
        Math.round(dp.ry * currImg.height),
        Math.round(dp.rWidth * currImg.width),
        Math.round(dp.rHeight * currImg.height),
        0,
        0,
        tcan.width,
        tcan.height);

    // let svg = d3.select("#sampleDisplay")

    // fillSvg(sampleData)
    // showControls(svg, [tres.x - 25, tres.y - 25], tcan)
}


async function addGrabSample(x, y, width, height) {

    let coords = curateCoordinates(x, y, width, height);
    coords = screenRectToWorld(coords)


    let can = document.getElementById("inVis")
    can.style.crossOrigin = "anonymous";
    can.crossOrigin = "anonymous";

    let trec = can.getBoundingClientRect()

    let tcan = document.createElement('canvas');
    let tcont = tcan.getContext('2d');

    tcan.crossOrigin = "anonymous";

    tcan.width = coords[2]
    tcan.height = coords[3]

    let tx = coords[0] / reducedDim[0]
    let ty = coords[1] / reducedDim[1]

    let tw = coords[2] / reducedDim[0]
    let th = coords[3] / reducedDim[1]

    let imgW = currImg.width
    let imgH = currImg.height


    tcont.drawImage(currImg,
        tx * imgW,
        ty * imgH,
        tw * imgW,
        th * imgH,
        0,
        0,
        coords[2],
        coords[3]);


    // let tx = trec.width
    // let ty = trec.height

    // document.body.appendChild(tcan);


    let container = document.getElementById("marksHolder")

    // container.appendChild(tcan);

    let grabbed = otherGrab(tcan, [1, 1, coords[2] - 1, coords[3] - 1]);


    let tres = {
        x: coords[0],
        y: coords[1],
        width: coords[2],
        height: coords[3],
        type: "grab",
        canvas: grabbed,
        rx: coords[0] / tx,
        ry: coords[1] / ty,
        rWidth: coords[2] / tx,
        rHeight: coords[3] / ty,
    }


    let n = Object.keys(currSampleList).length
    currSampleList[`mark${n}`] = tres


    let tdiv = document.createElement("div");
    tdiv.style.position = "relative";
    tdiv.innerHTML = `<img onclick="removeMark('mark${n}',this)" src="assets/images/buttons/del.png" style="width: 12px;cursor: pointer;position: absolute;top: 3px;left: 3px"> `
    tdiv.appendChild(grabbed);
    container.appendChild(tdiv)

    // dragElement4(tdiv)


}

function curateCoordinates(x, y, width, height) {

    if (width < 0) {
        width = Math.abs(width)
        x = Math.max(x - width, 0)
    }

    if (height < 0) {
        height = Math.abs(height)
        y = Math.max(y - height, 0)
    }

    return [x, y, width, height]
}


//----------------- Free-form stuff
function draw(cont, x, y) {

    cont.beginPath();
    cont.strokeStyle = categories[selectedCategory].color
    cont.moveTo(...strokePoint);
    cont.lineTo(x, y);
    cont.stroke()
    cont.closePath();

}

function onMouseDown(e) {
    let xy = getMousePos(e);
    strokePoint = [xy.x, xy.y];
    mouseDown = 1;
}

function onMouseUp() {
    mouseDown = 0
    if (gSampleType === "free") {
        addFreeSample(stroke)
    } else if (gSampleType === "grab") {
        newAddGrabbedSample(stroke)
    }

    stroke = []
    // drawImage()

}

function onMouseMove(e) {
    if (mouseDown === 1) {
        let can = document.getElementById("inVis")
        let cont = can.getContext('2d');
        e.preventDefault()
        let xy = getMousePos(e);
        draw(cont, xy.x, xy.y);
        stroke.push([...strokePoint])
        strokePoint = [xy.x, xy.y];
    }
}

function getMousePos(e) {
    let o = {};

    if (e.offsetX) {
        o.x = e.offsetX
        o.y = e.offsetY
    } else if (e.layerX) {
        o.x = e.layerX
        o.y = e.layerY
    }
    return o;
}

async function addFreeSample(points) {
    let corners = getRect(points)

    let can = document.getElementById("inVis")
    let trec = can.getBoundingClientRect()
    let tx = trec.width
    let ty = trec.height


    let tcan = document.createElement('canvas');
    let tcont = tcan.getContext('2d');


    tcan.width = corners[1][0] - corners[0][0]
    tcan.height = corners[1][1] - corners[0][1]

    tcan.style.border = "solid " + categories[selectedCategory].color + " 2px"


    let tw = corners[1][0] - corners[0][0]
    let th = corners[1][1] - corners[0][1]

    let tcat = {}

    tcat[selectedCategory] = categories[selectedCategory]

    // const vectors = PCA.getEigenVectors(points)
    //
    // const angle = get_orr(vectors[0].vector, vectors[1].vector)

    let tres = {
        x: corners[0][0],
        y: corners[0][1],
        width: tw,
        height: th,
        type: "free",
        canvas: tcan,
        perimeter: [...points],
        // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
        rx: corners[0][0] / tx,
        ry: corners[0][1] / ty,
        rWidth: tw / tx,
        rHeight: th / ty,
        categories: tcat,
        data: {
            // orientation: Math.round(angle * 100) / 100
        }
    }

    // console.log(points[0][0] - corners[0][0], points[0][1] - corners[0][1]
    // console.log(points[1][0] - corners[0][0], points[1][1] - corners[0][1])

    tcont.beginPath();
    tcont.moveTo(points[0][0] - corners[0][0], points[0][1] - corners[0][1]);
    for (let i = 1; i < points.length; i++) {
        tcont.lineTo(points[i][0] - corners[0][0], points[i][1] - corners[0][1]);
    }
    // tcont.stroke()
    tcont.closePath();
    tcont.clip()


    tcont.drawImage(currImg,
        tres.rx * currImg.width,
        tres.ry * currImg.height,
        tres.rWidth * currImg.width,
        tres.rHeight * currImg.height,
        0,
        0,
        tw,
        th
    )


    /*    let marks = document.getElementById("marks")

        marks.append(tcan)*/
    sampleData.push(tres)
    fillSvg(sampleData)
}

function getRect(points) {
    let xs = points.map(d => d[0])
    let ys = points.map(d => d[1])

    return [
        [Math.min(...xs), Math.min(...ys)],
        [Math.max(...xs), Math.max(...ys)],
    ]
}

function tempTest() {


    let cont = sampleData[0].canvas.getContext("2d")

    let dp = sampleData[0]
    cont.drawImage(currImg,
        dp.rx * currImg.width,
        dp.ry * currImg.height,
        dp.rWidth * currImg.width,
        dp.rHeight * currImg.height,
        0,
        0,
        dp.width,
        dp.height);

    /*    tcont.drawImage(currImg,
            tres.rx * currImg.width,
            tres.ry * currImg.height,
            tres.rWidth * currImg.width,
            tres.rHeight * currImg.height,
            0,
            0,
            tw,
            th*/
}


function removeMark(id, e) {

    e.parentElement.remove()
    delete currSampleList[id]
}

function updateName(e) {

    let t = e.value
    let btn = document.getElementById("exportPalette")

    if (t === "") {
        btn.classList.add("btnDisabled")
        saveAllowed = false
    } else {
        btn.classList.remove("btnDisabled")
        saveAllowed = true
    }

}

function movePalette2Available() {


    let name = document.getElementById("newPaletteName").value

    if (saveAllowed && name !== "") {

        if (megaPalettes[name] === undefined) {

        } else {
            name += '_' + Object.keys(megaPalettes).length
        }

        let marks = {}
        let i = 0

        for (const [_, val] of Object.entries(currSampleList)) {
            console.log(val.canvas.width, val.canvas.height);
            marks["mark" + i] = {
                proto: {canvas: val.canvas}
            }
            i++
        }

        let tpal = {
            displayType: "range",
            originImg: currImg,
            sampling: currSampleList,
            encodings: {
                range: {
                    marks
                }
            }
        }

        if (useServer) {
            uploadPalette(tpal, name)
        } else {
            savePal(tpal, name)
        }
        appendSingle(tpal, name)
        currSampleList = {}
        document.getElementById("marksHolder").innerHTML = ""
        document.getElementById("newPaletteName").value = ""
        // switchPalette()


    }
}


function editSample(e) {
    let el = e.target

    let proto
    if (el.matches("canvas")) {
        proto = el
    } else {
        proto = el.querySelector('canvas');
    }

    currSampleEdited = proto
    document.getElementById("paletteContainer").style.display = "block";
    primRot = undefined


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

    let w = trec.width
    let h = trec.height


    // corners[1][0] - corners[0][0]
    let tw = proto.width
    let th = proto.height


    cont.clearRect(0, 0, 900, 900)
    cont.drawImage(proto,
        0,
        0,
        proto.width,
        proto.height,
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

    tcon.drawImage(can, 0, 0)

    can.addEventListener("mousewheel", paletteZoom, false);
    can.addEventListener("DOMMouseScroll", paletteZoom, false);
    // can.addEventListener("mousewheel", zoom, false);
    // can.addEventListener("DOMMouseScroll", zoom, false);

}