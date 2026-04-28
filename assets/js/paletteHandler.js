let selectedPalette;
let marks = {}
let primitive = {}
let palette_cat = {}

let stWidth = 1
let mode = "stroke"

let paletteScale = 1
let paletteOrigin = {x: 0, y: 0};
const paletteInitCoords = {x: 0, y: 0};
let paletteTempCan

let stColor = '#333'
let primRot

let global_anchors = {}
let currAnchor = 0

let palIt = 0

let megaPalettes = {}

function addAPalette() {

    megaPalettes["temp" + palIt] = {
        displayType: "range",
        encodings: {
            "range": {marks: {}},
            "morph": {min: 0, max: 100},
            "repeat": {}
        }
    }
    // marks["temp" + palIt] = {}

    ++palIt
    fillPalette()

    drawSvg()
}


function fillPalette(reset = false) {

    if (reset) {
        marks = {}
        primitive = {}
        global_anchors = {}
        palette_cat = {}
        // fillTable()
    }

    const container = document.getElementById("paletteCont")
    container.innerHTML = ""

    const anchorCont = document.createElement("div")
    anchorCont.className = "paletteMarks"
    // const anchorBlock = document.createElement("div")

    anchorCont.innerHTML = '' +
        '<h4 style="display: inline-block">Anchors</h4>'

    let anchorsDiv = document.getElementById("anchorsContainer")
    if (anchorsDiv === null) {
        anchorsDiv = document.createElement("div")
        anchorsDiv.setAttribute("id", "anchorsContainer")
    }

    updateAnchorCont(anchorsDiv)

    anchorCont.appendChild(anchorsDiv)
    anchorCont.innerHTML += '<div id="plusAnchor" onclick="addAnchor()">' +
        '<img src="assets/images/buttons/plus.png" style="width:25px;height:25px;margin-top: 12%;margin-left: 4.4%;">' +
        '</div>' +
        '<div class="buttonImg " id="anchorBtn">' +
        '<img src="assets/images/buttons/anchor.png" onClick="setAnchor()" style=""/>' +
        '</div>'
    container.appendChild(anchorCont)


    const mess = getOptions()

    let allPalName = ""

    for (const [key, value] of Object.entries(megaPalettes)) {
        allPalName += `<option >${key}</option>`
    }


    const typesDisplay = "<option value ='range'>range</option>" +
        "<option value ='repeat'>repeat</option>" +
        "<option value ='morph'>morph</option>"

    for (const [key, value] of Object.entries(megaPalettes)) {
        const tdiv = document.createElement("div")
        tdiv.id = "palette_" + key
        tdiv.className = "paletteMarks"
        // tdiv.innerHTML = "<h4 onclick='exportPalette(\"" + key + "\",\"mark\")' class='paletteData'>" + key + ":</h4>"
        tdiv.innerHTML = `<input type="text" onchange="renameRow(this,'${key}')" row="${tdiv.id}" value="${key}" class="waypointTitle" />`

        if (value.displayType !== undefined) {
            if (value.displayType === "repeat") {
                const tdiv_mark = document.createElement("div")
                tdiv_mark.id = "mark_" + key
                tdiv_mark.className = "paletteMark"
                tdiv_mark.setAttribute("key", key)

                tdiv_mark.innerHTML =
                    "<div class='primitiveData'>" +
                    "<p class='primitiveLabel'> Display </p>" +
                    "<select id='" + key + "_displayTypes' class='displayTypes'>" +
                    typesDisplay +
                    "</select>" +
                    "</div>" +

                    "<div class='primitiveData'>" +
                    "<canvas id='canvas_" + key + "' style='width: 60px;height: 60px'>'" +
                    "</div>" +
                    "<div class='primitiveData'>" +
                    "<p class='primitiveLabel'> From anchor </p>" +
                    "<select id='" + key + "_markRepeatFrom' class='markRepeatFrom'>" +
                    "<option selected>None</option>" +
                    +mess +
                    "</select>" +
                    "</div>" +

                    "<div class='primitiveData'>" +
                    "<p class='primitiveLabel'> To anchor </p>" +
                    "<select id='" + key + "_markRepeatTo' class='markRepeatTo'>" +
                    "<option selected>None</option>" +
                    +mess +
                    "</select>" +
                    "</div>"

                tdiv_mark.onclick = function (e) {

                    if (mode !== "anchor") {
                        if (e.target.matches("canvas")) {
                            editPalette(this)
                        }
                    } else {
                        //TODO: Set for CATA and other primitive
                        setAnchorOnProto(e, this)
                    }
                }

                tdiv.appendChild(tdiv_mark)

            } else if (value.displayType === "range") {

                makeRangeMark(key, tdiv, value, typesDisplay)
            } else if (value.displayType === "morph") {


                const t = `<div class="primitiveData"> 
                      <p class='primitiveLabel'> Display </p>
                    <select id='${key + "_displayTypes"}' class='displayTypes'>${typesDisplay}
          
                    </select>
                    </div>`

                tdiv.innerHTML += t

                let minCan = document.createElement("canvas")
                minCan.width = 60
                minCan.height = 60

                let maxCan = document.createElement("canvas")
                maxCan.width = 60
                maxCan.height = 60

                megaPalettes[key].encodings.morph.min = {
                    proto: {
                        canvas: minCan,
                        corners: [[0, 0], [minCan.width, minCan.height]],
                        size: [minCan.width, minCan.height]
                    },
                }

                megaPalettes[key].encodings.morph.max = {
                    proto: {
                        canvas: maxCan,
                        corners: [[0, 0], [maxCan.width, maxCan.height]],
                        size: [maxCan.width, maxCan.height]
                    },
                }

                let min = makeSingleMark(key, "min", "morph", minCan)
                let max = makeSingleMark(key, "max", "morph", maxCan)
                tdiv.appendChild(min)
                tdiv.appendChild(max)
            }
        } else {

            // let rangeCont = document.createElement("div")
            // rangeCont.id = "range_"+key
            makeRangeMark(key, tdiv, value, typesDisplay)
            // tdiv.appendChild(rangeCont)
            // makeRangeMark(range, key, tdiv, value, typesDisplay)
        }

        const div1 = document.createElement("div")
        const div2 = document.createElement("div")
        const div3 = document.createElement("div")

        div1.className = "primitiveData"
        div2.className = "primitiveData"
        div3.className = "primitiveData"

        div1.innerHTML = "<p class='primitiveLabel'> Linked to Palette </p>" +
            "<select id='" + key + "_markLinkedToPalette' class='palettelinkedTo'>" +
            "<option selected>None</option>" +
            +"" + allPalName +
            "</select>"

        div2.innerHTML =
            "<p class='primitiveLabel'> On Anchor </p>" +
            "<select id='" + key + "_markLinkedTo' class='anchorLinkTo'>" +
            "<option selected>None</option>" +
            +mess +
            "</select>"


        div3.innerHTML =
            "<p class='primitiveLabel'>Scale </p>" +
            "<input type='range' min='0.5' max='3' step='0.1' value='1' id='" + key + "_markScale' class='scaleMarks'>"


        tdiv.appendChild(div1)
        tdiv.appendChild(div2)
        tdiv.appendChild(div3)


        container.appendChild(tdiv)

        setMarkEvent(key, value.displayType)

        document.querySelectorAll("#" + key + "_displayTypes option").forEach(option => {
            if (option.value === value.displayType)
                option.setAttribute("selected", "true")
        })
    }

    let trange = document.getElementById("strokewidth")

    trange.onchange = function (e) {

        const val = parseInt(document.getElementById("strokewidth").value);
        stWidth = val
    }

    document.getElementById('strokecolor').onchange = function () {

        stColor = this.value
    }
    // populateSelect()
    // updateLink2Palette()
    drawSvg()
}


function editPalette(e) {
    let el = e

    document.getElementById("paletteContainer").style.display = "block";
    primRot = undefined
    let num = el.getAttribute("number")
    let key = el.getAttribute("key")
    let type = el.getAttribute("id").split("_")[0]

    if (type === "canvas") {
        type = el.getAttribute("type")
        key = el.getAttribute("id").split("_")[1]

    }

    selectedPalette = [key, num, type]

    paletteResetZoom()

    let can = document.getElementById("paletteEdit")
    let cont = can.getContext("2d")

    let trec = can.getBoundingClientRect()

    can.width = trec.width;
    can.height = trec.height;

    let w = trec.width
    let h = trec.height

    let proto

    if (type === "mark") {
        if (num) {
            proto = megaPalettes[key].encodings.range.marks[num].proto
        } else {
            proto = marks[key].proto
        }


    } else if (type === "cat") {
        proto = palette_cat[key].proto
    }

    // corners[1][0] - corners[0][0]
    let tw = proto.corners[1][0] - proto.corners[0][0]
    let th = proto.corners[1][1] - proto.corners[0][1]


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

    tcon.drawImage(can, 0, 0)

    can.addEventListener("mousewheel", paletteZoom, false);
    can.addEventListener("DOMMouseScroll", paletteZoom, false);
    // can.addEventListener("mousewheel", zoom, false);
    // can.addEventListener("DOMMouseScroll", zoom, false);
}

function onClickPalette(e) {
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

        // let el = document.getElementById("anchorsContainer")
        // updateAnchorCont(el)

        // updateLinkTo()

        // mode = "stroke"

        // document.getElementById("selectedButton2").removeAttribute("id")
        // doc
        // el.setAttribute("id", "selectedButton2")
    }
}


function updateAnchorCont(container) {

    // let container = document.getElementById('anchorsContainer')

    container.innerHTML = ''

    for (const [key, value] of Object.entries(global_anchors)) {

        const tdiv = document.createElement('div')

        let sel = ""

        if (key == currAnchor) {
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


    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');
    cont.save()
    cont.beginPath();
    cont.lineWidth = 1
    cont.arc(xy.x, xy.y, stWidth, 0, 2 * Math.PI);
    cont.stroke();
    cont.closePath();
    cont.restore()
}


function paletteResetZoom() {
    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');
    cont.setTransform(1, 0, 0, 1, 0, 0);
    paletteScale = 1
    paletteOrigin.x = 0
    paletteOrigin.y = 0
    //
    // paletteTempCan = document.createElement("canvas");
    // paletteTempCan.width = can.width;
    // paletteTempCan.height = can.height;


    // cont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
    // resetCan()
}

function onMouseUpPalette() {
    mouseDown = 0
    // addFreeSample(stroke)
    // console.log(stroke);
    stroke = []
    // drawImage()


}

function drawPalette(cont, x, y, w, type, can) {
    cont.save()
    if (type === "erase")
        cont.globalCompositeOperation = 'destination-out';

    if (primRot) {
        cont.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
        cont.rotate(toRad(-primRot));
        strokePoint[0] = -paletteTempCan.width / 2 + strokePoint[0]
        strokePoint[1] = -paletteTempCan.height / 2 + strokePoint[1]
        x = -paletteTempCan.width / 2 + x
        y = -paletteTempCan.height / 2 + y
    }


    cont.lineCap = 'round';
    cont.lineJoin = 'round';
    cont.beginPath();
    // cont.strokeStyle = "#333"
    cont.strokeStyle = stColor
    cont.lineWidth = w
    cont.moveTo(...strokePoint);
    cont.lineTo(x, y);
    cont.stroke()
    cont.closePath();
    cont.restore()

    let tcon = can.getContext('2d')
    tcon.clearRect(0, 0, 9000, 9000);

    // if (primRot) {
    //     tcon.save()
    //     tcon.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
    //     tcon.rotate(toRad(primRot));
    //     tcon.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
    //     tcon.restore();
    // } else {
    tcon.drawImage(cont.canvas, 0, 0)
    // }

    //
}

function onMouseDownPalette(e) {
    let xy = getMousePos(e);
    xy = toWorld(xy, paletteOrigin, paletteScale)
    strokePoint = [xy.x, xy.y];
    mouseDown = 1;
}


function onMouseMovePalette(e) {
    let xy = getMousePos(e);

    xy = toWorld(xy, paletteOrigin, paletteScale)
    let can = document.getElementById("paletteEdit")
    if (mouseDown === 1) {

        // let cont = can.getContext('2d');
        e.preventDefault()

        let cont = paletteTempCan.getContext('2d')
        drawPalette(cont, xy.x, xy.y, stWidth, mode, can);
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
    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');

    // paletteTempCan = document.createElement("canvas");
    // paletteTempCan.width = can.width;
    // paletteTempCan.height = can.height;

    // let pcont = paletteTempCan.getContext("2d");
    //
    // pcont.drawImage(can, 0, 0, can.width, can.height, 0, 0, 0, 0)
    e.preventDefault();
    let zoomStep = 1.1

    let x = e.offsetX;
    let y = e.offsetY;
    const delta = e.type === "mousewheel" ? e.wheelDelta : -e.detail;

    if (delta > 0) {
        paletteScaleAt(x, y, zoomStep);
    } else {
        paletteScaleAt(x, y, 1 / zoomStep);
    }

    cont.clearRect(0, 0, can.width, can.height);
    cont.setTransform(paletteScale, 0, 0, paletteScale, paletteOrigin.x, paletteOrigin.y);


    cont.save()
    cont.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
    cont.rotate(toRad(primRot));
    cont.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
    cont.restore();
    // cont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
}


function paletteScaleAt(x, y, scaleBy) {  // at pixel coords x, y scale by scaleBy
    paletteScale *= scaleBy;
    paletteOrigin.x = x - (x - paletteOrigin.x) * scaleBy;
    paletteOrigin.y = y - (y - paletteOrigin.y) * scaleBy;
}


function savePalette() {
    const corn = getBBox(paletteTempCan)
    let resCan
    if (selectedPalette[2] === "mark") {
        if (selectedPalette[1]) {
            resCan = megaPalettes[selectedPalette[0]].encodings.range.marks[selectedPalette[1]].proto.canvas
            // resCan = marks[selectedPalette[0]][selectedPalette[1]].proto.canvas
        } else {
            resCan = marks[selectedPalette[0]].proto.canvas
        }

    } else if (selectedPalette[2] === "cat") {
        resCan = palette_cat[selectedPalette[0]].proto.canvas
    }

    resCan.width = corn[1][0] - corn[0][0]
    resCan.height = corn[1][1] - corn[0][1]

    const resCont = resCan.getContext('2d')

    resCont.save()
    resCont.translate(resCan.width / 2, resCan.width / 2);
    resCont.rotate(toRad(primRot));
    // resCont.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);


    resCont.drawImage(paletteTempCan,
        corn[0][0],
        corn[0][1],
        resCan.width,
        resCan.height,
        -resCan.width / 2,
        -resCan.height / 2,
        resCan.width,
        resCan.height,
    )
    resCont.restore();

    if (selectedPalette[2] === "mark") {
        if (selectedPalette[1]) {

            // marks[selectedPalette[0]][selectedPalette[1]].proto.corners = corn
            megaPalettes[selectedPalette[0]].encodings.range.marks[selectedPalette[1]].proto.corners = corn
        } else {
            marks[selectedPalette[0]].proto.corners = corn

        }


    } else if (selectedPalette[2] === "cat") {
        palette_cat[selectedPalette[0]].proto.corners = corn
        let tcan = document.getElementById("canvas_" + selectedPalette[0])
        let tcont = tcan.getContext('2d')
        let size = fixRatio2([palette_cat[selectedPalette[0]].proto.canvas.width, palette_cat[selectedPalette[0]].proto.canvas.height], [60, 60])

        tcan.width = size[0]
        tcan.height = size[1]
        tcont.drawImage(palette_cat[selectedPalette[0]].proto.canvas, 0, 0, size[0], size[1])
    }
    document.getElementById("paletteContainer").style.display = "none";

    fillPalette()
}


function toBW() {
    let src = opencv.imread(paletteTempCan);

    // paletteTempCan.style.filter = 'grayscale(1)';

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

    if (mode === 'anchor') {
        el.classList.remove('selectedAnchorBtn');
        mode = "stroke"
    } else {
        mode = 'anchor';
        el.classList.add('selectedAnchorBtn');
    }
    // mode = 'anchor';
}


function setPrimitveEvents(type, key) { //TODO: key is out of scope

    document.getElementById(key + "_primitiveAngle").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        primitive[key].angle = this.value
    }

    document.getElementById(key + "_primitiveWidth").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        primitive[key].stroke_width = this.value
    }

    document.getElementById(key + "_primitiveColor").oninput = function () {
        const key = this.getAttribute("id").split("_")[0];
        primitive[key].color = this.value
    }

    document.getElementById(key + "_primitiveAnchor").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        primitive[key].anchor_type = this.value
    }


    document.getElementById(key + "_primitiveAnchors").onchange = function () {

        // currAnchor = this.value
        const key = this.getAttribute("id").split("_")[0];

        const val = +document.getElementById(key + "_primitiveAnchorLocation").value


        if (primitive[key].anchors) {
            primitive[key].anchors[this.value] = {percent: val}

        } else {
            primitive[key].anchors = {}
            primitive[key].anchors[this.value] = {percent: val}
        }

        global_anchors[this.value] = {
            from:
                {
                    data: {percent: val, type: "line"},
                    key: key,
                    type: "primitive",
                }
        }


        // primitive[key].anchor_type = this.value
    }

    document.getElementById(key + "_primitivelinkedTo").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        // primitive[key].anchor_type = this.value
        primitive[key].linkTo = this.value
    }

    document.getElementById(key + "_primitivelinkedToPalette").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        // primitive[key].anchor_type = this.value
        primitive[key].apply = this.value
    }


    document.getElementById(key + "_primitiveAnchorLocation").onchange = function () {

        const key = this.getAttribute("id").split("_")[0];
        let anchor = document.getElementById(key + "_primitiveAnchors").value

        if (anchor === "None") {
            anchor = currAnchor
        }

        const val = +this.value
        if (primitive[key].anchors) {
            primitive[key].anchors[anchor] = {percent: val}

        } else {
            primitive[key].anchors = {}
            primitive[key].anchors[anchor] = {percent: val}
        }

        global_anchors[anchor] = {
            from:
                {
                    data: {percent: val, type: "line"},
                    key: key,
                    type: "primitive",
                }
        }

        document.getElementById(key + "_primitivelinkedTo").onchange = function () {
            const key = this.getAttribute("id").split("_")[0];
            primitive[key].apply = this.value
        }

        // primitive[key].anchors = this.value

    }

    /*    document.getElementById(key + "_primitiveGrowth").onchange = function () {
            const key = this.getAttribute("id").split("_")[0];
            primitive[key].growth = this.value
        }*/
}


function setCatEvents(type, key) {

    document.getElementById(key + "_catStyle").oninput = function (e) {
        const key = this.getAttribute("id").split("_")[0];
        palette_cat[key].styleText = this.value
    }

    if (palette_cat[key].proto === undefined) {

        document.getElementById(key + "_catColorOn").oninput = function () {
            const key = this.getAttribute("id").split("_")[0];
            palette_cat[key].colorOn = +this.value === 1
        }

        document.getElementById(key + "_catColor").oninput = function () {
            const key = this.getAttribute("id").split("_")[0];
            palette_cat[key].color = this.value
        }

        document.getElementById(key + "_catlinkedToMark").oninput = function () {
            const key = this.getAttribute("id").split("_")[0];
            palette_cat[key].apply = this.value
        }

    } else {

        document.getElementById(key + "_catlinkedTo").onchange = function () {
            const key = this.getAttribute("id").split("_")[0];
            palette_cat[key].linkTo = this.value
        }

        document.getElementById(key + "_catlinkedToPalette").onchange = function () {
            const key = this.getAttribute("id").split("_")[0];
            palette_cat[key].apply = this.value
        }
    }
}

function hidePaletteContainer() {

    document.getElementById("paletteContainer").style.display = "none";
}

function updateLinkTo() {

    const mess = getOptions()

    const selects = document.querySelectorAll(".primitiveLinkTo")
    selects.forEach(select => {

        select.innerHTML = "<option selected>None</option>" + mess
    })


    let selects2 = document.querySelectorAll(".primitiveAnchors")
    selects2.forEach(select => {

        select.innerHTML = "<option selected>None</option>" + mess
    })

    let selectsCat = document.querySelectorAll(".catLinkToProto")

    selectsCat.forEach(select => {
        select.innerHTML = "<option selected>None</option>" + mess
    })

    let selectsanchs = document.querySelectorAll(".anchorLinkTo")

    selectsanchs.forEach(select => {
        select.innerHTML = "<option selected>None</option>" + mess
    })


    document.querySelectorAll(".markRepeatFrom").forEach(select => {
        select.innerHTML = "<option selected>None</option>" + mess
    })

    document.querySelectorAll(".markRepeatTo").forEach(select => {
        select.innerHTML = "<option selected>None</option>" + mess
    })
}


function getOptions() {
    let ancres = Object.keys(global_anchors)

    let mess = ""


    for (let i = 0; i < ancres.length; i++) {

        mess += "<option class ='anchor_" + ancres[i] + "'>" + ancres[i] + "</option>"
    }

    return mess
}


/*
function getMarks() {
    let tmarks = Object.keys(marks)
    let prim = Object.keys(primitive)


    let mess = ""

    for (let i = 0; i < tmarks.length; i++) {
        mess += "<option type='mark' id ='apply2_" + tmarks[i] + "'>" + tmarks[i] + "</option>"
    }
    for (let i = 0; i < prim.length; i++) {
        mess += "<option type='prim' id ='apply2_" + prim[i] + "'>" + prim[i] + "</option>"
    }

    return mess
}
*/

function addAnchor() {

    let nb = Object.keys(global_anchors).length

    global_anchors[nb] = {}

    currAnchor = nb

    let el = document.getElementById("anchorsContainer")
    updateAnchorCont(el)
    updateLinkTo()


}


function clampVal(val, min, max) {

    return Math.max(Math.min(val, max), min)
}

function setAnchorOnProto(e, el) {

    if (e.target.matches("canvas")) {
        const xy = getMousePos(e)


        let tcan = e.target
        let trect = tcan.getBoundingClientRect()
        let key = el.getAttribute("key")
        let type = el.getAttribute("type")
        let num = el.getAttribute("number")


        let selProto
        let source
        let scale = 1

        if (type === "range") {
            selProto = megaPalettes[key].encodings.range.marks[num].proto
            source = megaPalettes[key].encodings.range.marks[num].source
            if (megaPalettes[key].encodings.range.scale) {
                scale = megaPalettes[key].encodings.range.scale
            }

        } else if (type === "morph") {
            selProto = megaPalettes[key].encodings.morph[num].proto
            source = megaPalettes[key].encodings.morph[num].source
            if (megaPalettes[key].scale) {
                scale = megaPalettes[key].encodings.morph.scale
            }
        }


        let tw = selProto.corners[1][0] - selProto.corners[0][0]
        let th = selProto.corners[1][1] - selProto.corners[0][1]


        let tx = xy.x
        let ty = xy.y

        if (source) {

            if (source.width * scale < tw && source.height * scale < th) {

                tx = clampVal(xy.x - tw / 2 + source.width / 2, 0, source.width)
                ty = clampVal(xy.y - th / 2 + source.height / 2, 0, source.height)
                // tx = (xy.x *source.width) / tw
                // ty = (xy.y *source.height) / th

            }
            else {
                console.log("heheheh");
                // tx = clampVal(xy.x - tw / 2 + source.width / 2, 0, source.width)
                // ty = clampVal(xy.y - th / 2 + source.height / 2, 0, source.height)


                tx = clampVal(xy.x - tw / 2 + source.width / 2, 0, source.width)
                ty = clampVal(xy.y - th / 2 + source.height / 2, 0, source.height)
            }
            tw = source.width *scale
            th = source.height *scale
        }


        if (selProto.anchors === undefined) {
            selProto.anchors = {}
        }


        console.log(xy.x);

        selProto.anchors[currAnchor] = {
            x: tx,
            y: ty,
            rx: tx / tw,
            ry: ty / th,


            // px: (tx - tw / 2),
            // py: (ty - th / 2),
            // prx: (tx - tw / 2) / tw,
            // pry: (ty - th / 2) / th,
        }


        console.log(selProto.anchors[currAnchor]);
        console.log(source.width, source.height);

        let cont = source.getContext("2d")
        cont.beginPath();
        cont.arc(selProto.anchors[currAnchor].x, selProto.anchors[currAnchor].y, 3, 0, 2 * Math.PI);
        cont.closePath()
        cont.fill();


        // if (type === "mark") {
        if (global_anchors[currAnchor] === undefined) {
            global_anchors[currAnchor] = {}
        }

        global_anchors[currAnchor].from = {
            type: type,
            key: key,
            number: num,
            data: selProto.anchors[currAnchor]

        }

        // }
        /*        else if (type === "cat") {
                    if (global_anchors[currAnchor] === undefined) {
                        global_anchors[currAnchor] = {}
                    }
                    palette_cat[key].apply = global_anchors[currAnchor].from

                    global_anchors[currAnchor].to = {
                        type: type,
                        key: key,
                        data: selProto.anchors[currAnchor]
                    }

                }*/

        // updateAnchorCont()
        updateLinkTo()
    }
}


function exportPalette(key, type) {
    const elem = "";
    let tdat
    if (type === "mark") {
        tdat = marks[key]
    }

    if (type === "primitive") {
        tdat = primitive[key]
    }
    if (type === "category") {
        tdat = palette_cat[key]
    }

    for (const [key, value] of Object.entries(tdat)) {

        const tval = {...value}
        if (tval?.proto?.canvas) {
            tval.proto.canvas = tval.proto.canvas.toDataURL("image/png")
        }
        tdat[key] = tval
    }

    const res = {
        type: type,
        data: tdat,
        name: key
    }

    download(JSON.stringify(res), "palette_" + key + ".json", "text/json");
}

function importPalette(e) {
    const reader = new FileReader();

    reader.onload = async function (e) {
        let jsonObj = JSON.parse(e.target.result);

        for (const [key, value] of Object.entries(jsonObj.data)) {
            if (value.proto) {
                value.proto.canvas = await convertToCanvas(value.proto.canvas)
            }
        }

        if (jsonObj.type === "mark") {
            marks[jsonObj.name] = jsonObj.data;
        }
        if (jsonObj.type === "primitive") {
            primitive[jsonObj.name] = jsonObj.data;
        }
        if (jsonObj.type === "category") {
            palette_cat[jsonObj.name] = jsonObj.data;
        }

        fillPalette([0, 10], false)
    }
    reader.readAsText(e.target.files[0]);
}

function updateLink2Palette() {

    let list = []

    for (const [key, value] of Object.entries(marks)) {
        list.push(key)
    }

    for (const [key, value] of Object.entries(palette_cat)) {
        if (value.proto)
            list.push(key)
    }

    for (const [key, value] of Object.entries(primitive)) {
        list.push(key)
    }


    let mess = ""

    for (let i = 0; i < list.length; i++) {
        mess += "<option> " + list[i] + "</option>"
    }

    document.querySelectorAll(".palettelinkedTo").forEach(d => {


        d.innerHTML = "<option> none</option>" + mess

    })

}

function setMarkEvent(key, type) {

    if (type === "repeat") {
        document.getElementById(key + "_markRepeatFrom").onchange = function (e) {
            const key = this.getAttribute("id").split("_")[0];
            // marks[key].repeatFrom = this.value
            megaPalettes[key].repeatFrom = this.value
        }
        document.getElementById(key + "_markRepeatTo").onchange = function (e) {
            const key = this.getAttribute("id").split("_")[0];
            // marks[key].repeatTo = this.value
            megaPalettes[key].repeatTo = this.value
        }
    }


    document.getElementById(key + "_markScale").onchange = function (e) {

        const key = this.getAttribute("id").split("_")[0];
        megaPalettes[key].encodings.range.scale = +this.value

        for (const [tkey, value] of Object.entries(megaPalettes[key].encodings[type].marks)) {
            if (value.source)
                drawCanvasWithScale(value.source, value.proto.canvas, megaPalettes[key].encodings[type].scale)
        }


        drawSvg()


    }

    document.getElementById(key + "_markLinkedToPalette").onchange = function (e) {

        const key = this.getAttribute("id").split("_")[0];
        // primitive[key].anchor_type = this.value
        megaPalettes[key].apply = this.value
        //
        // for (const [key, value] of Object.entries(megaPalettes)) {
        //     value.apply = this.value
        // }
    }


    document.getElementById(key + "_displayTypes").onchange = function (e) {

        const key = this.getAttribute("id").split("_")[0];

        megaPalettes[key].displayType = this.value

        // #TODO: Here fill 2 canvases for morph
        fillPalette()
    }

    document.getElementById(key + "_markLinkedTo").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        // primitive[key].anchor_type = this.value
        for (const [key, value] of Object.entries(megaPalettes)) {
            value.linkTo = this.value
        }
    }

}

function makeRangeMark(key, tdiv, value, typesDisplay) {

    const marks = value.encodings.range.marks
    const t = "<div class='primitiveData'>" +
        "<p class='primitiveLabel'> Display </p>" +
        "<select id='" + key + "_displayTypes' class='displayTypes'>" +
        typesDisplay +
        "</select>" +
        "</div>"

    tdiv.innerHTML += t

    let names = Object.keys(marks)

    if (names.length === 0) {
        const tcan = document.createElement("canvas")
        tcan.width = 60
        tcan.height = 60

        marks["mark0"] = {
            value: "mark0",
            type: "fake",
            proto: {canvas: tcan, corners: [[0, 0], [tcan.width, tcan.height]]},
        }
    }

    for (const [name, value] of Object.entries(marks)) {
        let tmark = makeSingleMark(key, name, "range", value.proto.canvas)
        tdiv.appendChild(tmark)
    }

    /*    for (let i = 0; i < tnb; i++) {





            const tdiv_mark = document.createElement("div")
            tdiv_mark.id = "mark_" + key
            tdiv_mark.className = "paletteMark"
            tdiv_mark.setAttribute("number", "" + i)
            tdiv_mark.setAttribute("key", key)
            tdiv_mark.setAttribute("type", "range")
            tdiv_mark.innerHTML = "<input type='text' value='mark" + i + "' class='paletteMarkName'>"
            if (marks[i]) {
                tdiv_mark.append(value[i].proto.canvas)
            } else {
                const tcan = document.createElement("canvas")
                tcan.width = 60
                tcan.height = 60
                tdiv_mark.append(tcan)
                marks[i] = {
                    value: i,
                    type: "fake",
                    proto: {canvas: tcan, corners: [[0, 0], [tcan.width, tcan.height]]},
                }
            }
            tdiv_mark.onclick = function (e) {

                if (mode !== "anchor") {
                    editPalette(this)
                } else {
                    //TODO: Set for CATA and other primitive
                    setAnchorOnProto(e, this)
                }
            }*/
    // tdiv.appendChild(tdiv_mark)


    let moreCan = document.createElement("div")

    moreCan.innerHTML = ` <img  src="assets/images/buttons/plus.png" class="buttonImg" style=";margin-top: 41px;
  width: 25px;
  margin-left: 5px;cursor: pointer" onclick="addACan(this,'${key}')">`
    tdiv.appendChild(moreCan)
}

function addACan(elem, key) {
    let len = Object.keys(megaPalettes[key].encodings.range.marks).length
    let tcan = document.createElement("canvas")

    tcan.width = 60
    tcan.height = 60
    let name = "mark" + len

    megaPalettes[key].encodings.range.marks[name] = {
        value: name,
        type: "fake",
        proto: {canvas: tcan, corners: [[0, 0], [tcan.width, tcan.height]]},
    }

    let tmark = makeSingleMark(key, name, "range", tcan)
    elem.parentElement.parentElement.insertBefore(tmark, elem.parentElement)
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


function makeSingleMark(key, label, type, can = undefined) {
    const tdiv_mark = document.createElement("div")
    tdiv_mark.id = "mark_" + key
    tdiv_mark.className = "paletteMark"
    tdiv_mark.setAttribute("key", key)
    tdiv_mark.setAttribute("type", type)
    tdiv_mark.setAttribute("number", "" + label)

    let mess = `<input type='text' value='${label}' class='paletteMarkName'>`

    if (type === "morph") {
        mess = `<p class='primitiveLabel'>${label}</p>`
    }
    if (can === undefined) {
        /*
                can = document.createElement("canvas")

                can.width = 60
                can.height = 60
        */

        tdiv_mark.innerHTML = `${mess}
            <canvas id='${"canvas_" + key}' style='width: 60px;height: 60px'>`
    } else {
        tdiv_mark.innerHTML = mess
        tdiv_mark.appendChild(can)
        can.id = `${"canvas_" + key}`

    }
    tdiv_mark.onclick = function (e) {

        if (mode !== "anchor") {
            if (e.target.matches("canvas")) {
                editPalette(this)
            }
        } else {
            setAnchorOnProto(e, this)
        }
    }
    return tdiv_mark
}

function renameRow(elem, key,) {

    let name = elem.value

    if (name !== "") {
        megaPalettes[name] = megaPalettes[key]
    }

    delete megaPalettes[key]

    fillPalette()
}