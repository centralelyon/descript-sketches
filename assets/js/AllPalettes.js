let allPalettes = []

let displayMode = "Visualization"

let palSources = [
    // "test"
    "week15_square",
    // "week15_test",
    "week15_rightSymbol",
    // "week15_Symbol",
    // "week15_InnerCircle",
    "week15_circle",
    "week05_cost",
    "week05_empty",
    "week05_full",
    "week05_star",
    "week05_type"
    // "week26_circle",
    // "sudoku_time",
    // "sudoku_level",
    // "sudoku_hint",
    // "sudoku_mistake",

]

const prevW = 160
const prevH = 40

const subW = 30
const subH = 30

let tempKey, tempNum

function cleanSlate() {


    megaPalettes = {}
    megaGlyph = {}
    dataBinding = {}
    dataEncoding = {}
    viewDim = []
    sampleData = []
    options_type = {}
    displayedMarks = {}
    drawnMarks = {}
    collageColScale = d3.scaleOrdinal(d3.schemeAccent)

    anchoringRef = ""
    nAnchor = 0

    document.getElementById("selectedPaletteCont").innerHTML = ''
    document.getElementById("MarksPaletteList").innerHTML = ''

    d3.select("#composition").selectAll("*").remove()
    d3.select("#fakePreviewSvg").selectAll("*").remove()

}

function updateSelectBind(id) {


    let elem = document.getElementById("shape-" + id)
    let key = elem.value
    megaGlyph[id].dataColumn = key
    dataBinding[id] = key

    let th = document.querySelector(`th[key="${key}"]`)

    if (th) {
        th.innerHTML = `<div style="display: table-cell;background-color: ${collageColScale(id)};margin-left: calc(50% - 38px);" class="colorBrand"></div>${th.innerText}`
    }

    updateSvg()
    updateMarksBindingDisplay(id)

}

function addASelectedPalette(key) {


    const container = document.getElementById("selectedPaletteCont");
    let col = collageColScale(key)
    const palette = megaPalettes[key];

    let tdiv = document.createElement("div");
    tdiv.className = "selectedPaletteRow";
    tdiv.setAttribute("name", key)


    let canContainer = document.createElement("div");
    tdiv.innerHTML = `<div class="platteColorBand" style="background-color: ${col}"></div> `;
    canContainer.className = "selectedCanPreview";

    let leftSide = document.createElement("div");

    leftSide.className = "leftSideSelected";


    leftSide.innerHTML = `<p  style="font-weight: 600;text-decoration: underline #424242 "><img onclick="delPalette('${key}')" class="delSelectedPal" style="" src="assets/images/buttons/del.png" >  ${key}</p> `


    // leftSide.appendChild(canContainer);

    // makeMarksPreview(palette.encodings.range.marks, canContainer)

    tdiv.appendChild(leftSide);


    let propertyContainer = document.createElement("div");
    propertyContainer.className = "propertyContainer";

    let options = makeColumnsSelect()

    // propertyContainer.innerHTML = `<div style="display: flex"><div class="dataSelectContainer" key="${key}" type="shape" style="display: flex;width: 123px"><p  style="font-weight: 500 ">Mark:</p><select oninput="updateSelectBind('${key}')" class="dataSelect" id="shape-${key}" style="width: 70px;height: 30px;padding: 0 8px">${options}</select></div><div style="display: inline-block" onclick="appendEncoding('${key}')"><img  style="width: 15px;cursor: pointer;border-radius: 10px;padding: 2px;border: 1px solid #424242" src="assets/images/buttons/plus.png"></div></div>`;
    propertyContainer.innerHTML = `<div style="display: flex"><div class="dataSelectContainer" key="${key}" type="shape" style=""><p  style=" ">Mark:</p><select oninput="updateSelectBind('${key}')" class="dataSelect" id="shape-${key}" style="">${options}</select></div></div>`;


    // propertyContainer.appendChild(arrowDiv);
    let sel = makeEncodingSelect(key)
    let selectHold = document.createElement("div");
    selectHold.className = "selectHold";
    selectHold.innerHTML = `<div>Encoding: </div> `
    selectHold.appendChild(sel)
    propertyContainer.appendChild(selectHold)
    leftSide.appendChild(propertyContainer);
    container.appendChild(tdiv);

}


function makeColumnsSelect() {
    let options = "<option value='none'>none</option>";

    let columns = Object.keys(chartDataset.data[0])

    for (let i = 0; i < columns.length; i++) {
        options += "<option value='" + columns[i] + "'>" + columns[i] + "</option>";
    }

    return options;
}

function setAddNewMenu() {
    let tdiv = document.createElement("div");
    tdiv.className = "allPaletteRow";

    tdiv.innerHTML = `<div style="display: flex;cursor: pointer;align-items:stretch;margin-top: 3px;height: 42px" onclick="switchPalette()">
                       <img src="assets/images/buttons/plus.png" style="width:25px;height:25px;margin-top:7px;margin-right: 20px;margin-left: 25px"> 
                       <h5> new..</h5>
                        </div>
                        `

    return tdiv
}


async function showThisPalette(name, num) {
    console.log(num);
    console.log(allPalettes[num].originImg);

    let tab = document.querySelector(`.tab[num="2"]`);

    tab.click()

    if (allPalettes[num].originImg) {
        let tcan = document.getElementById("inVis")
        // await allPalettes[num].originImg.decode()

        resetView(tcan, allPalettes[num].originImg)
        displayAllMarksInSvg(allPalettes[num].sampling)
    }
}


function selectThisPalette(name, num) {
    if (megaPalettes[name] !== undefined) {
        name += Object.keys(megaPalettes).length
    }

    let tflag = false

    if (Object.keys(megaPalettes).length === 0) {
        tflag = true
    }

    // megaPalettes[name] = {...allPalettes[num]}
    megaPalettes[name] = deepClone(allPalettes[num])

    if (megaPalettes[name].scale === undefined) {
        megaPalettes[name].scale = 1
    }

    dataBinding[name] = ""
    addPaletteInfoToCollage(megaPalettes[name], name)
    addASelectedPalette(name)

    addPaletteMarksCompo(name)
    updateDotsAndSvgs()


    megaGlyph[name] = {
        dataColumn: "",
        size: {
            dataColumn: "",
            scale: "",
        },
        intensity: {
            dataColumn: "",
            scale: "",
        }
    }
    megaGlyph[name].color = makeColorScale(name, "")

    if (tflag) {
        tdrawRefactor()
    } else {
        if (displayMode == "Visualization") {
            updateSvg()
        } else if (displayMode == "Cartesian Grid") {
            updateSvg(true)
        }
    }
}

async function initAllPalette() {


    if (allPalettes.length === 0) {

        if (useServer) {
            palSources = []
            getPaletteList()
        } else {


            for (let i = 0; i < palSources.length; i++) {

                await loadSavedPalette(`assets/tempData/palettes/${palSources[i]}.json`);
            }
        }

        const container = document.getElementById("AllPaletteCont");

        container.innerHTML = "";

        // container.appendChild(setAddNewMenu());

        for (let i = 0; i < allPalettes.length; i++) {
            let tdiv = document.createElement("div");
            tdiv.className = "allPaletteRow";
            tdiv.setAttribute("number", i)
            tdiv.setAttribute("name", palSources[i])

            let canContainer = document.createElement("div");
            tdiv.innerHTML = `<p>${palSources[i]}</p>`;
            canContainer.className = "canPreview";

            tdiv.appendChild(canContainer);
            let arrowDiv = document.createElement("div");

            arrowDiv.className = "paletteArrowDiv";
            arrowDiv.innerHTML = `
              <img src ="assets/images/buttons/show.png" style="position: absolute;top: -23px;right: -2px;width: 18px;height: auto;cursor: pointer" onclick="showThisPalette('${palSources[i]}',${i})" >
            <img src ="assets/images/buttons/right-arrow.png" style=";cursor: pointer" onclick="selectThisPalette('${palSources[i]}',${i})" >`
            tdiv.appendChild(arrowDiv);
            container.appendChild(tdiv);

            dragElement(tdiv)
            // bindingMouseOver(tdiv)
            let allMarks = allPalettes[i].encodings.range.marks;

            let MarkNames = Object.keys(allMarks)
            let n = MarkNames.length;
            let offx = 14
            let offy = 3

            if (offx * n + subW > prevW || offy * n + subH > prevH) {
                offx = (prevW - subW) / n
                offy = (prevH - subH) / n
            }
            canContainer.style.width = prevW + "px"
            canContainer.style.height = prevH + "px"

            for (let j = n - 1; j > -1; j--) {
                let b64 = allMarks[MarkNames[j]].source
                if (allMarks[MarkNames[j]].source === undefined) {
                    b64 = allMarks[MarkNames[j]].proto.canvas
                    allMarks[MarkNames[j]].source = allMarks[MarkNames[j]].proto.canvas
                }
                let tcan = cloneCanvas(b64)
                tcan.style.width = `${subW}px`
                tcan.style.height = `${subH}px`

                tcan.style.left = `${offx + (j * offx)}px`
                tcan.style.top = `${(prevH - subH) - (j * offy)}px`


                canContainer.appendChild(tcan);
            }


        }
    }

    let tPalCont = document.getElementById("paletteCont")


    tPalCont.onmouseover = function (e) {
        if (dragging) {

            this.classList.add("draggedover");
        }
    }

    tPalCont.onmouseleave = function (e) {
        if (dragging) {
            this.classList.remove("draggedover");
        }
    }


}


async function loadSavedPalette(url) {

    const palette = await d3.json(url)
    console.log(palette);

    for (const [key, value] of Object.entries(palette.encodings.range.marks)) {
        if (value.proto) {


            value.proto.canvas = await convertToCanvas(value.proto.canvas)

            // console.log(tcan);
            // value.proto.canvas = tcan

            // removeColor(241, 241, 241,   value.proto.canvas, 15)
        }

        /*      if (value.source) {
                  console.log("here");
                  value.source = await convertToCanvas(value.source)
                  // removeColor(241, 241, 241, value.source, 15)
              }*/
    }

    for (const [key, value] of Object.entries(palette.sampling)) {
        value.canvas = await convertToCanvas(value.canvas)
    }


    if (palette.originImg) {
        if (palette.originImg !== "") {
            const img = new Image();
            img.src = palette.originImg;
            palette.originImg = img;
        }
    }
    if (palette.preloadName) {
        if (palette.preloadName !== "") {
            palette.originImg = preload[palette.preloadName];
        }
    }
    // console.log(preload[palette.preloadName]);
    // console.log(palette.originImg);

    document.body.appendChild(palette.originImg);
    let n = Object.keys(megaPalettes).length


    allPalettes.push(palette)

// megaPalettes[`temp${n}`] = jsonObj

    return palette
}


let flipSide = false
let containerWidth = 250
let offsetWidth = 15

let sideOffset = containerWidth - offsetWidth / 2
let placeHolderBool = true


function openNav() {
    let container = document.getElementById("dataPopupReduced")
    let containerImg = document.getElementById("sideArrow")


    flipSide = !flipSide

    let img = document.getElementById("sideImg");

    if (flipSide) {
        img.style.transform = "rotate(90deg)";
        container.style.height = `${800}px`

        let tcont = container.getElementsByTagName('div')[0]

        tcont.style.height = `${800}px`
        tcont.style.overflowY = `auto`

        // containerImg.style.right = `${sideOffset}px`

        // container.style.border = "solid 1px #333"
        // container.style.height = `${80.5}vh`
        // container.style.top = `${6}%`

        document.querySelectorAll(".sideContent").forEach(el => {
            el.style.display = "inline-block";
        })
    } else {

        img.style.transform = "";
        container.style.height = `${30}px`


        let tcont = container.getElementsByTagName('div')[0]
        tcont.style.overflowY = `hidden`

        tcont.style.height = `${30}px`
        // containerImg.style.right = "-22px";

        // container.style.height = `${35}vh`
        // container.style.top = `${30}%`

        document.querySelectorAll(".sideContent").forEach(el => {
            el.style.display = "none";
        })
    }
}


function bindingMouseOver(elem) {


    elem.addEventListener("mouseover", displayOrigin)
    elem.addEventListener("mouseout", hideOrigin)


    async function displayOrigin(e) {

        let tempKey = elem.getAttribute("name")
        let tempNum = +elem.getAttribute("number");

        if (tempNum !== undefined) {
            if (displayMode === "Visualization") {

                if (allPalettes[tempNum].originImg) {
                    displaySample()

                    let tcan = document.getElementById("inVis")
                    await allPalettes[tempNum].originImg.decode()

                    resetView(tcan, allPalettes[tempNum].originImg)


                    displayAllMarksInSvg(allPalettes[tempNum].sampling)
                } else {
                    hideSample()
                }


            }
        }
    }

    function hideOrigin() {
        tempKey = undefined
        tempNum = undefined
        if (displayMode === "Visualization") {
            hideSample()
        }
    }


}

function appendSingle(palette, name) {
    const container = document.getElementById("AllPaletteCont");


    palSources.push(name)


    let tdiv = document.createElement("div");
    tdiv.className = "allPaletteRow";
    tdiv.setAttribute("number", palSources.length - 1)
    tdiv.setAttribute("name", name)

    let canContainer = document.createElement("div");
    tdiv.innerHTML = `<p>${name}</p>`;
    canContainer.className = "canPreview";


    let arrowDiv = document.createElement("div");

    arrowDiv.className = "paletteArrowDiv";
    arrowDiv.innerHTML = `
              <img src ="assets/images/buttons/show.png" style="position: absolute;top: -23px;right: -2px;width: 18px;height: auto;cursor: pointer" onclick="showThisPalette('${name}',${palSources.length - 1})" >
            <img src ="assets/images/buttons/right-arrow.png" style=";cursor: pointer" onclick="selectThisPalette('${name}',${palSources.length - 1})" >`

    tdiv.appendChild(canContainer);
    tdiv.appendChild(arrowDiv);


    if (container.firstChild) {
        container.insertBefore(tdiv,container.firstChild.nextSibling );
    } else {
        container.appendChild(tdiv);
    }



    // container.appendChild(tdiv);

    dragElement(tdiv)
    // bindingMouseOver(tdiv)
    let allMarks = palette.encodings.range.marks;

    let MarkNames = Object.keys(allMarks)
    let n = MarkNames.length;
    let offx = 14
    let offy = 1

    if (offx * n + subW > prevW || offy * n + subH > prevH) {
        offx = (prevW - subW) / n
        offy = (prevH - subH) / n
    }
    canContainer.style.width = prevW + "px"
    canContainer.style.height = prevH + "px"

    for (let j = n - 1; j > -1; j--) {

        let tcan = cloneCanvas(allMarks[MarkNames[j]].proto.canvas)
        tcan.style.width = `${subW}px`
        tcan.style.height = `${subH}px`

        tcan.style.left = `${offx + (j * offx)}px`
        tcan.style.top = `${(prevH - subH) - (j * offy)}px`


        canContainer.appendChild(tcan);


    }
    allPalettes.push(palette)
}

function makeMarksPreview(marks, container) {
    let MarkNames = Object.keys(marks)
    let n = MarkNames.length;
    let offx = 14
    let offy = 3


    // console.log(MarkNames);
    for (let j = 0; j < n; j++) {

        let tcan = cloneCanvas(marks[MarkNames[j]].proto.canvas)
        tcan.style.width = `${subW}px`
        tcan.style.height = `${subH}px`
        //
        // tcan.style.left = `${offx + (j * offx)}px`
        // tcan.style.top = `${(prevH - subH) - (j * offy)}px`


        container.appendChild(tcan);


    }
}


function addPaletteMarksCompo(key) {

    const canWidth = 80
    const canHeight = 80

    let container = document.getElementById("MarksPaletteList");
    let currMarksContainer = document.createElement("div");
    currMarksContainer.className = "paletteMarksList";
    currMarksContainer.id = "list-" + key


    let marks = megaPalettes[key].encodings.range.marks;

    // let first = marks[Object.keys(marks)[0]].proto.canvas;

    // let firstCont = document.createElement("div");


    let colorBrand = document.createElement("div");

    colorBrand.className = "colorBrand";

    colorBrand.style.backgroundColor = "" + collageColScale(key)


    let sizeDiv = document.createElement("div");

    sizeDiv.className = "sizeDiv";

    sizeDiv.innerHTML = `<div class="sizeControl" onclick="changeScale('${key}','-')">-</div><div>size</div><div class="sizeControl" onclick="changeScale('${key}','+')">+</div>`;


    currMarksContainer.appendChild(sizeDiv)
    currMarksContainer.appendChild(colorBrand);
    // currMarksContainer.appendChild(proto);

    makeRangeMark(key, currMarksContainer, megaPalettes[key], "")


    /*    for (const [key, value] of Object.entries(marks)) {
            let tdiv = document.createElement("div");
            tdiv.className = "paletteMarksCanvasHolder"
            tdiv.appendChild(cloneCanvas(value.proto.canvas));
            currMarksContainer.appendChild(tdiv);
        }*/

    container.appendChild(currMarksContainer);

}


function updateDotsAndSvgs() {

    for (const [id, palette] of Object.entries(megaPalettes)) {


        for (const [name, mark] of Object.entries(palette.encodings.range.marks)) {

            let tcan = document.getElementById(`canvas_${id}_${name}`)
            let trect = tcan.getBoundingClientRect()

            let tsvg = d3.select(`#svg-${id}-${name}`)

            tsvg.attr("viewBox", `0 0 ${trect.width} ${trect.height}`)
                .attr("width", trect.width)
                .attr("height", trect.height)

            tsvg.selectAll("circle").remove();

            if (mark.proto.anchors) {
                tsvg.selectAll("circle").remove();
                for (const [anchor, coords] of Object.entries(mark.proto.anchors)) {
                    tsvg.append("circle")
                        .attr("cx", trect.width * coords.rx)
                        .attr("cy", trect.height * coords.ry)
                        .attr("num", anchor)
                        .attr("fill", collageColScale(coords.relatedTo))
                        .style("stroke", "1px")
                        .attr("palette", id)
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
}


async function savePal(palette, key) {

    palette = deepClone(palette)
    console.log(palette);
    let res = {}
    for (const [key, value] of Object.entries(palette)) {
        if (typeof value === "object" && key !== "originImg" && key !== "sampling") {
            const tval = {...value}
            res[key] = tval
        }

    }

    // palette.originImg.crossOrigin = "anonymous";

    palette.originImg.crossOrigin = "anonymous";
    await palette.originImg.decode();
    let tstr = imageToBase64(palette.originImg)

    palette.originImg = tstr
    const marks = {}
    for (const [key, value] of Object.entries(palette.encodings.range.marks)) {
        /*        marks[key] = {
                    ...value,
                    proto: {
                        ...value.proto
                    }
                };*/

        console.log(key);

        // marks[key].proto.canvas = cloneCanvas(palette.encodings.range.marks[key].proto.canvas).toDataURL("image/png")
        value.proto.canvas = value.proto.canvas.toDataURL("image/png")

        if (palette.encodings.range.marks[key].source) {

            value.source = value.source.toDataURL("image/png")
        }
    }

    let sample = {}
    for (const [key, value] of Object.entries(palette.sampling)) {
        sample[key] = {...value}

        sample[key].canvas = cloneCanvas(palette.sampling[key].canvas).toDataURL("image/png")
    }

    palette.sampling = sample


    let tt = document.querySelector(".tab").click()
    console.log(tt);
    download(JSON.stringify(palette), "palette_" + key + ".json", "text/json");

}

function updateShapeOptions() {


    let options = `<option value="none">none</option>`;

    let tkeys = Object.keys(chartDataset.data[0]);
    console.log(chartDataset.data[0]);
    for (let i = 0; i < tkeys.length; i++) {


        options += `<option value="${tkeys[i]}">${tkeys[i]}</option>`;
    }


    let selects = document.querySelectorAll(".dataSelect");

    selects.forEach(select => {
        select.innerHTML = options
    });


}