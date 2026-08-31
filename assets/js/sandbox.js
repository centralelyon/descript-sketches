let dataBinding = {}

let drawLegend = true

let showAxis = false
let chartAxis = {
    x: "none",
    y: "none"
}

const defaultMinColor = "#a50026"
const defaultMaxColor = "#313695"

let useForce = true
let gridMod = false


let layout = "force"
let megaGlyph = {}

let simulation

let debugGlyph = {
    temp0: {
        dataColumn: "species",
        color: {
            dataColumn: "species",
            scale: "ordinal",
        },
        size: {
            dataColumn: "species",
            scale: "linear",
        },
        intensity: {
            dataColumn: "species",
            scale: "linear",
        }
    },

    temp2: {
        dataColumn: "species",
        color: {
            dataColumn: "species",
            scale: "ordinal",
        },
        size: {
            dataColumn: "species",
            scale: "linear",
        },
        intensity: {
            dataColumn: "species",
            scale: "linear",
        }
    }
}

let chartDataset = {
    data: []
}

let defaultCan = document.createElement('canvas')
defaultCan.width = 30
defaultCan.height = 30
let defaultCont = defaultCan.getContext("2d")

defaultCont.fillStyle = "#fff"
defaultCont.fillRect(0, 0, 30, 30)

async function loadDataset(url) {
    let data = await loadCsv(url).then(r => r)
    if (url.includes("pinguin")) { //TODO: too unfazed to bother with NONE stuff
        data.splice(3, 1)
        data.splice(338, 1)
    }
    chartDataset.data = data
    // fillAxis()
}


function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
        !isNaN(parseFloat(str))
}

function isCont(data, column) {
    let allVals = [...new Set(data.map(d => d[column]))]

    if (allVals.length > data.length * 0.1) {
        let tn = allVals.map(d => isNumeric(d)).filter(d => d).length
        return tn >= data.length * 0.7;

    } else {

        return false
    }
}

function drawSvg() {

    let svg = d3.select("#fakePreviewSvg")

    let data = chartDataset.data

    svg.selectAll("*").remove();

    let timages
    let size = svg.node().getBoundingClientRect()

    let margin = 20

    let xScale = d3.scaleLinear(d3.extent(data.map(d => d[chartAxis.x])), [margin, size.width - margin])
    let yScale = d3.scaleLinear(d3.extent(data.map(d => d[chartAxis.y])), [size.height - margin, margin])


    for (let i = 0; i < data.length; i++) {
        data[i].x = size.width / 2
        data[i].y = size.height / 2
    }

    let encodings = Object.keys(dataBinding) //TODO: Replace with MegaGlyph

    if (encodings.length === 0) {

        let useColor = false

        if (megaGlyph["new"]) {
            if (megaGlyph["new"].color) {
                if (megaGlyph["new"].color.dataColumn !== "" && megaGlyph["new"].color.dataColumn != "none") {
                    useColor = true
                }
            }
        }

        svg.selectAll("dots")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d[chartAxis.x]))
            .attr("cy", d => yScale(d[chartAxis.y]))
            .style("fill", (d, i) => {
                if (useColor) {
                    if (megaGlyph["new"].color.isLinear) {
                        return megaGlyph["new"].color.colorScale(megaGlyph["new"].color.linearScale(d[megaGlyph["new"].color.dataColumn]))
                    } else {
                        if (megaGlyph["new"].color.colors[d[megaGlyph["new"].color.dataColumn]]) {
                            return megaGlyph["new"].color.colors[d[megaGlyph["new"].color.dataColumn]]
                        } else {
                            return megaGlyph["new"].color.colors["default"]
                        }
                    }
                }
            })
            .attr("r", 5)

    } else if (encodings.length === 1) {
        if (encodings[0] !== "new") {


            let pal = megaPalettes[encodings[0]]

            if (pal.displayType === "range") {

                let markKeys = Object.keys(pal.encodings.range.marks)

                let marks = pal.encodings.range.marks

                if (markKeys[0].match(/mark[0-9]/)) {

                    let allVals = [...new Set(data.map(d => d[dataBinding[encodings[0]]]))]

                    marks = {}

                    for (let i = 0; i < allVals.length; i++) {

                        if (i < markKeys.length) {
                            marks[allVals[i]] = pal.encodings.range.marks[markKeys[i]]
                        } else {
                            marks[allVals[i]] = pal.encodings.range.marks[markKeys[0]] //todo: set a default visual when no encoding is provided
                        }
                    }
                }

                marks[undefined] = {source: defaultCont}
                marks[NaN] = {source: defaultCont}
                marks[null] = {source: defaultCont}


                let useColor = false
                let useMorph = false


                let useDatCol = ""
                let useDatMorph = ""

                let lin = false
                let mlin = false

                let colScale
                let linScale
                let morphScale

                if (megaGlyph[encodings[0]].color) {
                    if (megaGlyph[encodings[0]].color.dataColumn !== "none" && megaGlyph[encodings[0]].color.dataColumn !== "") {
                        useDatCol = megaGlyph[encodings[0]].color.dataColumn
                        useColor = true

                        if (isCont(data, useDatCol)) {
                            lin = true
                            linScale = d3.scaleLinear(d3.extent(data.map(d => d[useDatCol])), [0, 1])
                            // colScale = d3.interpolateRdYlBu
                            colScale = megaGlyph[encodings[0]].color.colorScale
                        } else {
                            colScale = megaGlyph[encodings[0]].color.colors
                        }
                    }
                }

                if (megaGlyph[encodings[0]].size) {

                    if (megaGlyph[encodings[0]].size.dataColumn !== "") {

                        useDatMorph = megaGlyph[encodings[0]].size.dataColumn
                        useMorph = true
                        if (isCont(data, useDatMorph)) {
                            mlin = true
                            console.log(megaPalettes[encodings[0]].encodings.morph)
                            if (megaPalettes[encodings[0]].encodings.morph) {
                                if (megaPalettes[encodings[0]].encodings.morph.min !== 0) {

                                    let bounds = [megaPalettes[encodings[0]].encodings.morph.min.proto.canvas.width,
                                        megaPalettes[encodings[0]].encodings.morph.max.proto.canvas.width]
                                    morphScale = d3.scaleLinear(d3.extent(data.map(d => d[useDatMorph])), bounds)
                                } else {
                                    let bounds = [0.2, 2]
                                    morphScale = d3.scaleLinear(d3.extent(data.map(d => d[useDatMorph])), bounds)
                                }
                            }

                        }


                    }
                }


                if (gridMod) {

                    let xCumul = 5
                    let yCumul = 5

                    let width = 700

                    for (let i = 0; i < data.length; i++) {

                        let d = data[i]
                        let can = marks[d[dataBinding[encodings[0]]]].proto.canvas
                        let cl = 1
                        if (useColor) {

                            if (lin) {
                                let tcol = colScale(linScale(d[useDatCol])).replace("rgb(", "").replace(")", "").split(",")
                                can = toColor(can, +tcol[0] * cl, +tcol[1] * cl, +tcol[2] * cl, 210)
                            } else {
                                let tt = colScale["default"]
                                if (colScale[d[useDatCol]]) {
                                    tt = colScale[d[useDatCol]]
                                }
                                let tcol = hexToRgb(tt)
                                can = toColor(can, tcol.r * cl, tcol.g * cl, tcol.b * cl, 210)

                            }

                            // removeColor(230, 230, 230, can, 25)


                        }

                        let tw = can.width
                        let th = can.height

                        if (useDatMorph) {
                            let tval = d[useDatMorph]


                            if (morphScale(tval) !== undefined) {
                                tw = tw * morphScale(tval)
                                th = th * morphScale(tval)
                            }
                        }


                        timages = svg.append("image")
                            .attr("xlink:href", can.toDataURL("image/png"))
                            .attr("x", xCumul)
                            .attr("y", yCumul)
                            .attr("width", tw)
                            .attr("height", th)


                        xCumul += Math.max(tw, can.width)
                        if (xCumul + tw > width) {
                            yCumul += Math.max(th, can.height)
                            xCumul = 5
                        }


                    }
                } else {


                    timages = svg.selectAll("dots")
                        .data(data)
                        .enter()
                        .append("image")
                        .attr("xlink:href", d => {
                            let can = marks[d[dataBinding[encodings[0]]]].proto.canvas
                            let cl = 1
                            if (useColor) {

                                if (lin) {
                                    let tcol = colScale(linScale(d[useDatCol])).replace("rgb(", "").replace(")", "").split(",")

                                    can = toColor(can, +tcol[0] * cl, +tcol[1] * cl, +tcol[2] * cl, 210)
                                } else {
                                    let tcol = hexToRgb(colScale["default"])
                                    if (colScale[d[useDatCol]])
                                        tcol = hexToRgb(colScale[d[useDatCol]])
                                    // can = toColor(can, tcol.r * cl, tcol.g * cl, tcol.b * cl, 210)
                                    // can = toColor(can, tcol.r * cl, tcol.g * cl, tcol.b * cl, 210)
                                    recolorCanvasLAB(can, [tcol.r, tcol.g, tcol.b], 1)
                                }

                                // removeColor(230, 230, 230, can, 25)
                            }
                            // removeColor(240, 240, 240, can, 15)
                            return can.toDataURL("image/png")

                        })
                        .attr("x", d => {
                            return xScale(d[chartAxis.x])
                        })
                        .attr("y", d => {
                            return yScale(d[chartAxis.y]);
                        })
                        .attr("width", d => {
                            if (useMorph) {
                                return marks[d[dataBinding[encodings[0]]]].proto.canvas.width * morphScale(d[useDatMorph])
                            } else {
                                return marks[d[dataBinding[encodings[0]]]].proto.canvas.width
                            }


                        })
                        .attr("height", d => {
                            if (useMorph) {
                                return marks[d[dataBinding[encodings[0]]]].proto.canvas.height * morphScale(d[useDatMorph])
                            } else {
                                return marks[d[dataBinding[encodings[0]]]].proto.canvas.height
                            }


                        })

                }
            } else if (pal.displayType === "morph") {

                let sizeScale = d3.scaleLinear(d3.extent(data.map(d => d[dataBinding[encodings[0]]])), [pal.encodings.morph.min.proto.size[0], pal.encodings.morph.max.proto.size[0]])


                svg.selectAll("dots")
                    .data(data)
                    .enter()
                    .append("image")
                    .attr("xlink:href", pal.encodings.morph.max.proto.canvas.toDataURL("image/png"))
                    .attr("x", d => {
                        return xScale(d[chartAxis.x]);
                    })
                    .attr("y", d => {
                        return yScale(d[chartAxis.y])
                    })

                    .attr("width", d => {
                        return sizeScale(d[dataBinding[encodings[0]]])
                    })
                    .attr("height", d => sizeScale(d[dataBinding[encodings[0]]]))


            }

        } else {
            console.log("dadasda");
        }
    } else {

        let tmarks = makeMarks(encodings, data)
        let order = getOrder(encodings)

        if (gridMod) {

            let xCumul = 5
            let yCumul = 5

            let width = 700

            for (let i = 0; i < data.length; i++) {

                let d = data[i]

                let can = makeCollageFromData(encodings, order, tmarks, d)


                let tw = can.width
                let th = can.height

                timages = svg.append("image")
                    .attr("xlink:href", can.toDataURL("image/png"))
                    .attr("x", xCumul)
                    .attr("y", yCumul)
                    .attr("width", tw)
                    .attr("height", th)

                xCumul += tw
                if (xCumul + tw > width) {
                    yCumul += th
                    xCumul = 5
                }

            }
        } else {
            let allColScales = {}

            for (let i = 0; i < encodings.length; i++) {
                allColScales[encodings[i]] = {}
            }
            //TODO: here use makeColorScale(data, palette) and make dicts for each palette
            timages = svg.selectAll("dots")
                .data(data)
                .enter()
                .append("image")
                .attr("xlink:href", d =>
                    makeCollageFromData(encodings, order, tmarks, d).toDataURL("image/png"))
                .attr("x", d => {
                    return xScale(d[chartAxis.x])
                })
                .attr("y", d => {
                    return yScale(d[chartAxis.y]);
                })


        }
    }

    if (timages && !gridMod && useForce) {

        const simulation = d3.forceSimulation(data)
            .force("collide", d3.forceCollide().radius(d => 18).strength(0.01))
            .force("x", d3.forceX().strength(0.00025))
            .force("y", d3.forceY().strength(0.00032))
            .on("tick", ticked)

        let duration = 2000

        let t = d3.timer(elapsed => {
            let dt = elapsed / duration
            simulation.force("collide").strength(dt)
            if (dt >= 1.0) t.stop()
        })//timer


        function ticked() {

            timages
                .attr("x", d => clampVal(d.x, 0, size.width))
                .attr("y", d => clampVal(d.y, 0, size.height))
        }//function ticked
    }
    populateSandboxMenu(data)
}

function makeContColorRamp(palette) {

    let cont = document.createElement('div')

    cont.classList.add('colorRamp')

    let minDiv = document.createElement('div')
    // minDiv.setAttribute('id', `${palette}_minRamp`)
    minDiv.setAttribute('class', `rampLabel`)
    minDiv.style.left = "85px"

    minDiv.innerHTML = `<p>min</p><span style="background-color:${palette.colors[0][0]} "></span>`


    let maxDiv = document.createElement('div')
    // maxDiv.setAttribute('id', `${palette}_maxRamp`)
    maxDiv.setAttribute('class', `rampLabel`)
    maxDiv.style.left = "306px"

    maxDiv.innerHTML = `<p>max</p><span style="background-color:${palette.colors[1][1]}"></span>`

    cont.appendChild(minDiv)
    cont.appendChild(maxDiv)
    // cont.innerHTML = `<div id="${palette}_minRamp" class="rampLabel" style="left: 85px"></div> <div id="${palette}_maxRamp" class="rampLabel" style="left: 306px"><p>max<p><span style="background-color:${palette.colors[1][1]}"></span></div>`

    let tcan = document.createElement('canvas')
    tcan.width = 190
    tcan.height = 15

    tcan.classList.add("colorRampCan")


    cont.appendChild(tcan)

    console.log(maxDiv);
    console.log(minDiv);
    setMinMaxPicker(palette, minDiv, maxDiv, tcan)

    ramp(tcan, palette.colorScale)

    return cont

}

function setOrdinalPicker(palette, div, key) {
    let tcolpick = document.createElement("input")

    tcolpick.type = "color"
    tcolpick.id = "tcolpick"
    tcolpick.style.display = "none"

    div.onclick = function (e) {
        tcolpick.value = palette.colors[key]
        tcolpick.style.display = "inline-block"
        tcolpick.click()
        tcolpick.onchange = function () {

            palette.colors[key] = tcolpick.value

            div.children[1].style.backgroundColor = `${palette.colors[key]}`
            palette.colors[key] = tcolpick.value
            // ramp(tcan, palette.colorScale)

            updateSvg()
            tcolpick.remove()
        }
    }
}


function setMinMaxPicker(palette, minDiv, maxDiv, tcan) {

    let tcolpick = document.createElement("input")

    tcolpick.type = "color"
    tcolpick.id = "tcolpick"
    tcolpick.style.display = "none"

    minDiv.onclick = function (e) {

        tcolpick.value = palette.colors[0][0]
        tcolpick.style.display = "inline-block"
        tcolpick.click()

        tcolpick.onchange = function () {

            palette.colors[0][0] = tcolpick.value

            minDiv.children[1].style.backgroundColor = `${palette.colors[0][0]}`
            palette.colorScale = d3.interpolateLab(palette.colors[0][0], palette.colors[1][1])
            ramp(tcan, palette.colorScale)
            updateSvg()
            tcolpick.remove()
        }
    }


    if (maxDiv !== undefined) {


        maxDiv.onclick = function (e) {

            tcolpick.value = palette.colors[0][0]
            tcolpick.style.display = "inline-block"
            tcolpick.click()

            tcolpick.onchange = function () {

                palette.colors[1][1] = tcolpick.value

                maxDiv.children[1].style.backgroundColor = `${palette.colors[1][1]}`

                palette.colorScale = d3.interpolateLab(palette.colors[0][0], palette.colors[1][1])
                ramp(tcan, palette.colorScale)

                updateSvg()
                tcolpick.remove()
            }
        }

    }

}

function ramp(can, colorScale, n = 400) {

    const context = can.getContext("2d");
    can.style.imageRendering = "-moz-crisp-edges";
    can.style.imageRendering = "pixelated";
    let w = can.width / n
    for (let i = 0; i < n; ++i) {
        context.fillStyle = colorScale(i / (n - 1));
        context.fillRect(i * w, 0, w, can.height);
    }


}


function populateSandboxMenu(data) {


    let chartSettingsContainer = document.getElementById("chartSettings");
    chartSettingsContainer.innerHTML = '';
    let select = document.createElement("select");

    select.innerHTML = `<option>penguins.csv </option>`;

    let datasetRow = document.createElement("div");

    datasetRow.innerHTML = `<p> Dataset</p>`;
    datasetRow.classList.add("fakeGrammarRow")

    datasetRow.appendChild(select)

    chartSettingsContainer.appendChild(datasetRow)


    let axes = ["x", "y"];

    let keys = Object.keys(data[0])
    for (let i = 0; i < axes.length; i++) {
        let tdiv = makeAxisMenu(keys, axes[i], chartAxis[axes[i]]);
        tdiv.classList.add("fakeGrammarRow")
        chartSettingsContainer.append(tdiv);
    }


    /*    let container = document.getElementById("fakeGrammar");
        container.innerHTML = '';
        for (let i = 0; i < keys.length; i++) {

            let tdiv = makeSingleMenu(keys[i], dataBinding[keys[i]]);
            tdiv.classList.add("fakeGrammarRow")
            container.append(tdiv);

        }*/

}

function makePaletteMenu(palettes, name = undefined) {
    let select = document.createElement("select");

    if (name === undefined || name === "new") {
        select.innerHTML += `<option value="new">*new*</option>`;

    }

    select.setAttribute("name", name);
    for (const [key, value] of Object.entries(palettes)) {
        select.innerHTML += `<option ${(value === name ? "selected" : "")}  value="${value}">${value}</option>`;
    }

    select.onchange = function (e) {
        let tval = select.value
        let prev = select.getAttribute("name");
        megaGlyph[tval] = megaGlyph[prev]
        delete megaGlyph[prev];

        makeMarkTree()
        // drawSvg()
    }

    return select;

}

function makeDataColumnMenu(columns, name, selected, mode = "palette") {
    let select = document.createElement("select");
    select.setAttribute("name", name);
    select.setAttribute("mode", mode);
    let options = {}

    select.innerHTML += `<option value="none">none</option>`;
    for (const [key, value] of Object.entries(columns)) {
        select.innerHTML += `<option ${(value === selected ? "selected" : "")} value="${value}">${value}</option>`;
    }

    if (mode === "palette") {

        select.onchange = function (e) {
            let tval = select.value
            let palette = select.getAttribute("name");

            if (megaGlyph[palette]) {
                megaGlyph[palette].dataColumn = tval
            } else {
                megaGlyph[palette] = {
                    dataColumn: tval
                }
            }

            if (tval === "none") {
                delete dataBinding[palette]
            } else {
                dataBinding[palette] = tval
            }
            updateSvg()
            // delete megaGlyph[prev];

        }

    } else {
        if (mode === "color") {
            if (megaGlyph[name][mode].dataColumn !== "none" && megaGlyph[name][mode].dataColumn !== "") {
                if (megaGlyph[name][mode].isLinear) {
                    let tcont = makeContColorRamp(megaGlyph[name].color)
                    options["color"] = tcont
                } else {

                    let tcont = makeContColorDisplay(megaGlyph[name].color)
                    options["color"] = tcont
                }
            }
        }

        select.onchange = function (e) {
            let tval = select.value
            let palette = select.getAttribute("name");
            let mode = select.getAttribute("mode");

            let container = d3.select(select.parentElement.parentElement)

            if (megaGlyph[palette]) {


                if (megaGlyph[palette][mode]) {
                    if (mode === "color") {
                        megaGlyph[palette][mode] = makeColorScale(palette, tval)

                        if (megaGlyph[palette].color.isLinear) {


                            let t = d3.select(select.parentElement)
                            container.selectAll(".colorRamp").remove()
                            container.selectAll(".colorDisplay").remove()


                            let tcont = makeContColorRamp(megaGlyph[palette].color)
                            select.parentElement.parentElement.appendChild(tcont)

                            // setMinMaxPicker(palette, tcont)
                        } else {
                            let t = d3.select(select.parentElement)
                            container.selectAll(".colorRamp").remove()
                            container.selectAll(".colorDisplay").remove()
                            // megaGlyph[palette][mode] = makeColorScale(palette, tval)
                            let tcont = makeContColorDisplay(megaGlyph[palette].color)
                            select.parentElement.parentElement.appendChild(tcont)
                        }
                    } else {
                        megaGlyph[palette][mode].dataColumn = tval
                    }
                } else {
                    if (mode === "color") {

                        megaGlyph[palette][mode] = makeColorScale(palette, tval)
                    } else {
                        megaGlyph[palette][mode] = {dataColumn: tval}
                    }

                }
            } else {
                console.log("heresomehow");
                megaGlyph[palette] = {
                    dataColumn: tval
                }
            }

            updateSvg()

        }


    }

    return [select, options];
}


function makeContColorDisplay(palette) {
    let cont = document.createElement('div')
    cont.classList.add('colorDisplay')

    for (const [key, value] of Object.entries(palette.colors)) {
        let tdivCont = document.createElement('div')
        let tdiv = document.createElement('div')
        tdiv.classList.add('colorDisplayElem')
        tdiv.style.backgroundColor = value

        let p = document.createElement('p')
        p.classList.add('colorDisplayLabel')

        p.innerText = key

        tdivCont.appendChild(p)
        tdivCont.appendChild(tdiv)

        cont.appendChild(tdivCont)

        setOrdinalPicker(palette, tdivCont, key)
    }

    return cont

}

function makeColorScale(palette, tval) {
    // let colorScale =

    if (!megaGlyph[palette].color) {
        megaGlyph[palette].color = {
            isLinear: false,
            linearScale: undefined,
            colorScale: d3.scaleOrdinal(d3.schemeAccent),
            colors: [
                {0: defaultMinColor, at: 0},
                {1: defaultMaxColor, at: 1}
            ],
            dataColumn: tval
        }
    } else {
        megaGlyph[palette].color.dataColumn = tval
    }

    if (megaGlyph[palette].color.dataColumn !== "none" && megaGlyph[palette].color.dataColumn !== "") {
        let useDatCol = megaGlyph[palette].color.dataColumn


        if (isCont(chartDataset.data, useDatCol)) {

            megaGlyph[palette].color.isLinear = true
            megaGlyph[palette].color.linearScale = d3.scaleLinear(d3.extent(chartDataset.data.map(d => d[useDatCol])), [0, 1])
            megaGlyph[palette].color.colorScale = d3.interpolateRdYlBu
            megaGlyph[palette].color.colors = [
                {0: megaGlyph[palette].color.colorScale(0), at: 0},
                {1: megaGlyph[palette].color.colorScale(1), at: 1}
            ]
        } else {

            megaGlyph[palette].color.isLinear = false
            megaGlyph[palette].color.colorScale = d3.scaleOrdinal(d3.schemeAccent);
            megaGlyph[palette].color.allVal = [...new Set(chartDataset.data.map(d => d[useDatCol]))]
            megaGlyph[palette].color.colors = {default: "#555"}
            for (let i = 0; i < megaGlyph[palette].color.allVal.length; i++) {
                megaGlyph[palette].color.colors[megaGlyph[palette].color.allVal[i]] = d3.schemeAccent[i % d3.schemeAccent.length]

            }

        }
    }

    return megaGlyph[palette].color;
}


function makeParamOption(name, columns, palette) {
    let list = document.createElement("div");
    let tdiv = document.createElement("div");

    let tselected = undefined

    if (megaGlyph[palette][name]) {
        if (megaGlyph[palette][name].dataColumn) {
            tselected = megaGlyph[palette][name].dataColumn
        }
    }
    let [select, options] = makeDataColumnMenu(columns, palette, tselected, name)

    let div = document.createElement("div");
    div.classList.add("fakeGrammarRow")
    tdiv.classList.add("dataEncodingColumn")

    let p = document.createElement("p");
    p.innerHTML = `${name}:`;

    let tkeys = Object.keys(options)

    tdiv.appendChild(p)
    tdiv.appendChild(select)

    if (tkeys.length > 0) {
        if (options[tkeys[0]] !== undefined) {
            div.appendChild(options[tkeys[0]])
        }
    }
    // div.appendChild(select)
    div.appendChild(tdiv)
    list.appendChild(div)

    return list
}

function makeMarkTree() {
    let palettes = Object.keys(megaPalettes)
    let columns = Object.keys(chartDataset.data[0])

    let glyph = megaGlyph

    let root = document.getElementById("glyphTree")


    root.innerHTML = ``


    for (const [key, value] of Object.entries(glyph)) {
        let container = document.createElement("li");
        let details = document.createElement("details");
        details.setAttribute("open", "")
        let summary = document.createElement("summary");


        // ---------------------- Mark & data column selector ------------------
        let tdiv = document.createElement("div");
        tdiv.classList.add("fakeGrammarRow")

        let p = document.createElement("p");
        p.innerHTML = " | ";
        p.classList.add("fakeGrammarLabel")

        let labelMark = document.createElement("p");
        labelMark.innerHTML = "Palette";
        labelMark.classList.add("fakeGrammarTitleMark")

        let labelData = document.createElement("p");
        labelData.innerHTML = "Data";
        labelData.classList.add("fakeGrammarTitleData")

        tdiv.appendChild(labelMark)
        tdiv.appendChild(labelData)

        tdiv.appendChild(makePaletteMenu(palettes, key))
        tdiv.appendChild(p)
        let [tsel, opts] = makeDataColumnMenu(columns, key, value.dataColumn)


        tdiv.appendChild(tsel)

        summary.appendChild(tdiv)
        details.appendChild(summary)
        container.appendChild(details)

        // ---------------------- Mark rendering Settings------------------
        let markParamContainer = document.createElement("ul");


        let color = makeParamOption("color", columns, key)
        let size = makeParamOption("size", columns, key)

        markParamContainer.appendChild(color)
        markParamContainer.appendChild(size)


        details.appendChild(markParamContainer);

        root.appendChild(container)

    }


}


function addAMark() {

    if (megaGlyph["new"] === undefined)
        megaGlyph["new"] = {
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

    megaGlyph["new"].color = makeColorScale("new", "")

    makeMarkTree()


}


function cancelCollapse(e) {

    // e.stopPropagation()

    e.preventDefault()
}

function makeAxisMenu(keys, name, selected) {
    let options = ``


    for (let i = 0; i < keys.length; i++) {

        options += `<option name="${name}" ${(keys[i] === selected ? "selected" : "")} value="${keys[i]}">${keys[i]}</option>`
    }
    let select = document.createElement("select");

    select.innerHTML = options;

    select.setAttribute("name", name);


    select.oninput = function (e) {
        updateDatabinding(select)
    }


    let tdiv = document.createElement("div");

    tdiv.innerHTML = `<p> ${name}-axis</p>`;

    tdiv.appendChild(select)

    return tdiv
}

function makeSingleMenu(name, selected = undefined) {


    let palletes = Object.keys(megaPalettes)

    let options = `<option value="none">none</option>`


    for (let i = 0; i < palletes.length; i++) {

        options += `<option name="${name}" ${(dataBinding[palletes[i]] === name ? "selected" : "")} value="${palletes[i]}">${palletes[i]}</option>`
    }
    let select = document.createElement("select");

    select.innerHTML = options;

    select.setAttribute("name", name);


    select.oninput = function (e) {
        updateDatabinding(select)
    }


    let tdiv = document.createElement("div");

    tdiv.innerHTML = `<p> ${name}</p>`;

    tdiv.appendChild(select)

    return tdiv


}


function updateDatabinding(elem) {

    let key = elem.value

    let name = elem.getAttribute("name")

    if (name === "x" || name == "y") {
        chartAxis[name] = key

    } else {
        if (key === "none") {
            delete dataBinding[getKeyByValue(dataBinding, name)];
        } else {
            dataBinding[key] = name;
        }
    }

    // drawSvg()
}


function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


function switchLayout(elem, type) {

    d3.select(".selectedLayout").attr("class", "")


    elem.classList.add("selectedLayout")

    layout = type


    tdrawRefactor(true)

    // updateSvg()
}

function switchGrid() {

    gridMod = !gridMod;
    drawSvg()
}

function switchForce() {

    useForce = !useForce;
    drawSvg()
}

async function updateSvg(changedEncoding = false) {


    if (displayMode === "1") {

        if (changedEncoding) {
            showExample()
        } else {
            let svg = d3.select("#bigCartesian")
            console.log("called");


            let data = chartDataset.data

            let encodings = Object.keys(dataBinding)
            let [xScale, yScale] = getScales(svg, data)


            let tmarks = makeMarks(encodings, data)

            let order = getOrder(encodings)


            svg.selectAll("image")
                .attr("xlink:href", d =>
                    makeCollageFromData(encodings, order, tmarks, d, d).toDataURL("image/png"))

        }
    } else {


        //
        if (changedEncoding) {
            tdrawRefactor()
        } else {
            let svg = d3.select("#fakePreviewSvg")
            let data = chartDataset.data

            let encodings = Object.keys(dataBinding)
            let [xScale, yScale] = getScales(svg, data)


            let tmarks = makeMarks(encodings, data)

            let order = getOrder(encodings)

            svg.selectAll("image")
                .attr("xlink:href", d =>
                    makeCollageFromData(encodings, order, tmarks, d).toDataURL("image/png"))

        }
        /*        .attr("x", d => {
                    return xScale(d[chartAxis.x])
                })
                .attr("y", d => {
                    return yScale(d[chartAxis.y]);
                })*/

    }
}


function drawAxis(svg, data, xScale, yScale, marginH, marginV) {

    let viewport = d3.select("#viewport")

    viewport.selectAll(".axis").remove();

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    let size = svg.node().getBoundingClientRect()
    let width = size.width
    let height = size.height


    viewport.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - marginV})`)
        .call(xAxis);

// Draw y-axis
    viewport.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${marginH},0)`)
        .call(yAxis);
}


async function drawGrid(svg, viewport, data, encodings, order, tmarks, update) {
    let xCumul = 5
    let yCumul = 5

    let size = svg.node().getBoundingClientRect()

    let width = size.width
    let height = size.height

    let tdat = []

    for (let i = 0; i < data.length; i++) {
        let d = data[i]

        let can = makeCollageFromData(encodings, order, tmarks, d)

        let tw = can.width
        let th = can.height
        tdat.push({can: can, tw: tw, th: th, x: xCumul, y: yCumul})

        xCumul += tw
        if (xCumul + tw > width) {
            yCumul += th
            xCumul = 5
        }
    }


    if (update) {
        if (simulation) {
            simulation.stop()
            simulation = undefined
        }

        d3.selectAll(".axis").remove()
        // simulation.stop();

        await d3.select("#viewport").selectAll("image").transition().duration(550)
            .attr("x", (d, i) => {
                return tdat[i].x
            })
            .attr("y", (d, i) => tdat[i].y).end()

    } else {
        for (let i = 0; i < data.length; i++) {
            viewport.append("image")
                .attr("xlink:href", tdat[i].can.toDataURL("image/png"))
                .attr("x", tdat[i].xCumul)
                .attr("y", tdat[i].yCumul)
                .attr("width", tdat[i].tw)
                .attr("height", tdat[i].th)
        }
    }


}

function drawScatter(svg, viewport, data, encodings, order, tmarks, update) {
    let [xScale, yScale] = getScales(svg, data)
    const tdata = data.map(d => ({...d}));
    let size = svg.node().getBoundingClientRect()
    let width = size.width
    let height = size.height

    let maxW = 0
    let maxH = 0
    tdata.forEach((d, i) => {
        d.canvas = makeCollageFromData(encodings, order, tmarks, d);

        if (d.canvas.width > maxW) {
            maxW = d.canvas.width;
        }

        if (d.canvas.height > maxH) {
            maxH = d.canvas.height;
        }
    });


    if (drawLegend) {

        let marginH = width * 0.05;
        let marginV = height * 0.09;

        xScale.range([marginH, width - marginH]);
        yScale.range([height - marginV, marginV - 25]);

        drawAxis(svg, tdata, xScale, yScale, marginH, marginV)
        xScale.range([marginH, width - marginH - maxW]);
        yScale.range([height - marginV - maxH, marginV]);

    }

    function scaledX(d) {
        return xScale.bandwidth
            ? xScale(d[chartAxis.x]) + xScale.bandwidth() / 2
            : xScale(d[chartAxis.x]);
    }

    function scaledY(d) {
        return yScale.bandwidth
            ? yScale(d[chartAxis.y]) + yScale.bandwidth() / 2
            : yScale(d[chartAxis.y]);
    }


    if (!update) {
        viewport.selectAll("dots")
            .data(tdata)
            .enter()
            .append("image")
            .attr("xlink:href", d =>
                d.canvas.toDataURL("image/png"))
            .attr("x", d => {
                return scaledX(d) + d.canvas.width / 2
            })
            .attr("y", d => {
                return scaledY(d) - d.canvas.height;
            })
    } else {
        d3.select("#viewport").selectAll("image")
            .data(tdata).transition().duration(550)
            .attr("x", d => {
                return scaledX(d) + d.canvas.width / 2
            })
            .attr("y", d => {
                return scaledY(d) - d.canvas.height;
            })

    }


}

function highlightFromData(d, flag) {
    for (const [name, mark] of Object.entries(megaGlyph)) {
        if (mark.dataColumn !== '' && mark.dataColumn !== 'none') {
            let allVals = [...new Set(chartDataset.data.map(d => d[megaGlyph[name].dataColumn]))]
            let n = allVals.indexOf(d[mark.dataColumn])

            let markId = Object.keys(megaPalettes[name].encodings.range.marks)[n]
            bordercan(name, markId, flag, d)
        } else {
            let markId = Object.keys(megaPalettes[name].encodings.range.marks)[0]
            bordercan(name, markId, flag, d)
        }

    }
}


async function drawDrag(svg, viewport, data, encodings, order, tmarks, update) {

    let size = svg.node().getBoundingClientRect()

    let xScale, yScale

    let xAx = chartAxis.x
    let yAx = chartAxis.y

    const tdata = deepClone(data).map(d => ({...d}));

    if (xAx !== "none" || yAx !== "none") {
        [xScale, yScale] = getScales(svg, tdata)

    }


    let timages

    tdata.forEach((d, i) => {
        d.canvas = makeCollageFromData(encodings, order, tmarks, d);
        d.radius = 0.5 * Math.sqrt(d.canvas.width * d.canvas.height);
        d.x = (xScale !== undefined ? xScale(d[xAx]) : (size.width / 2) + 20 * Math.random());
        d.y = (yScale !== undefined ? yScale(d[yAx]) : (size.height / 2) + 20 * Math.random());
    });


    const drag = d3.drag()
        .on("start", function (event, d) {
            d3.select(this).interrupt();          // <-- cancel any in-flight/pending transition
            d3.select(this).raise().classed("dragging", true);

            // read current rendered position instead of trusting d.x/d.y
            const currentX = +d3.select(this).attr("x");
            const currentY = +d3.select(this).attr("y");

            d._dragOffsetX = event.x - currentX;
            d._dragOffsetY = event.y - currentY;

            if (typeof simulation !== "undefined" && simulation) {
                simulation.alphaTarget(0.3).restart();
                d.fx = currentX;
                d.fy = currentY;
            }
        })
        .on("drag", function (event, d) {
            d.x = event.x - d._dragOffsetX;
            d.y = event.y - d._dragOffsetY;

            d3.select(this)
                .attr("x", d.x)
                .attr("y", d.y);

            if (typeof simulation !== "undefined" && simulation) {
                d.fx = d.x;
                d.fy = d.y;
            }
        })
        .on("end", function (event, d) {
            d3.select(this).classed("dragging", false);

            if (typeof simulation !== "undefined" && simulation) {
                simulation.alphaTarget(0);
                d.fx = d.x;
                d.fy = d.y;
            }
        });


    if (!update) {



        timages = viewport.selectAll("dots")
            .data(tdata)
            .enter()
            .append("image")
            .attr("xlink:href", d =>
                d.canvas.toDataURL("image/png"))
            .attr("x", (d, i) => {
                return d.x
            })
            .attr("y", (d, i) => {
                return d.y
            }).on("mouseover", function (e, d) {

                highlightFromData(d, true)

            })
            .on("mouseout", function (e, d) {
                highlightFromData(d, false)
            }).call(drag);


        simulation = d3.forceSimulation(tdata)
            .force("collide", d3.forceCollide(d => d.radius + 2))
            .on("tick", ticked);



    } else {
        if (simulation) {
            simulation.stop()
            simulation = undefined
        }


        d3.selectAll(".axis").remove()
        await d3.select("#viewport").selectAll("image")
            .data(tdata)
            .transition().delay(100)
            .attr("x", (d, i) => {
                return tdata[i].x
            })
            .attr("y", (d, i) => {
                return tdata[i].y
            }).end()

        simulation = d3.forceSimulation(tdata)
            .force("collide", d3.forceCollide(d => d.radius + 2))
            .on("tick", ticked);


        timages = d3.select("#viewport").selectAll("image")
        timages.call(drag);


        console.log(tdata);
    }





    // const simulation = d3.forceSimulation(data)
    //     .force("collide", d3.forceCollide().radius(d => 18).strength(0.000000001))
    //     .force("x", d3.forceX().strength(0.0000025))
    //     .force("y", d3.forceY().strength(0.0000032))
    //     .on("tick", ticked)


    function ticked() {
        if (layout == "force") {
            timages
                .attr("x", d => d.x)
                // .attr("x", d => clampVal(d.x, 0, size.width))
                // .attr("y", d => clampVal(d.y, 0, size.height))
                .attr("y", d => d.y)
        }
    }


}


async function drawForce(svg, viewport, data, encodings, order, tmarks, update) {

    let size = svg.node().getBoundingClientRect()

    let xScale, yScale

    let xAx = chartAxis.x
    let yAx = chartAxis.y

    const tdata = deepClone(data).map(d => ({...d}));

    if (xAx !== "none" || yAx !== "none") {
        [xScale, yScale] = getScales(svg, tdata)

    }


    let timages

    tdata.forEach((d, i) => {
        d.canvas = makeCollageFromData(encodings, order, tmarks, d);
        d.radius = 0.5 * Math.sqrt(d.canvas.width * d.canvas.height);
        d.x = (xScale !== undefined ? xScale(d[xAx]) : (size.width / 2) + 20 * Math.random());
        d.y = (yScale !== undefined ? yScale(d[yAx]) : (size.height / 2) + 20 * Math.random());
    });
    if (!update) {


        const drag = d3.drag()
            .on("start", function (event, d) {
                d3.select(this).interrupt();          // <-- cancel any in-flight/pending transition
                d3.select(this).raise().classed("dragging", true);

                // read current rendered position instead of trusting d.x/d.y
                const currentX = +d3.select(this).attr("x");
                const currentY = +d3.select(this).attr("y");

                d._dragOffsetX = event.x - currentX;
                d._dragOffsetY = event.y - currentY;

                if (typeof simulation !== "undefined" && simulation) {
                    simulation.alphaTarget(0.3).restart();
                    d.fx = currentX;
                    d.fy = currentY;
                }
            })
            .on("drag", function (event, d) {
                d.x = event.x - d._dragOffsetX;
                d.y = event.y - d._dragOffsetY;

                d3.select(this)
                    .attr("x", d.x)
                    .attr("y", d.y);

                if (typeof simulation !== "undefined" && simulation) {
                    d.fx = d.x;
                    d.fy = d.y;
                }
            })
            .on("end", function (event, d) {
                d3.select(this).classed("dragging", false);

                if (typeof simulation !== "undefined" && simulation) {
                    simulation.alphaTarget(0);
                    d.fx = d.x;
                    d.fy = d.y;
                }
            });



        timages = viewport.selectAll("dots")
            .data(tdata)
            .enter()
            .append("image")
            .attr("xlink:href", d =>
                d.canvas.toDataURL("image/png"))
            .attr("x", (d, i) => {
                return d.x
            })
            .attr("y", (d, i) => {
                return d.y
            }).on("mouseover", function (e, d) {

                highlightFromData(d, true)

            })
            .on("mouseout", function (e, d) {
                highlightFromData(d, false)
            }).call(drag);


    } else {
        if (simulation) {
            simulation.stop()
            simulation = undefined
        }
        d3.selectAll(".axis").remove()
        await d3.select("#viewport").selectAll("image")
            .data(tdata)
            .transition().delay(100)
            .attr("x", (d, i) => {
                return tdata[i].x
            })
            .attr("y", (d, i) => {
                return tdata[i].y
            }).end()


        timages = d3.select("#viewport").selectAll("image")

        console.log(tdata);
    }


    simulation = d3.forceSimulation(tdata)
        .force("center", d3.forceCenter(size.width / 2, size.height / 2))
        .force("collide", d3.forceCollide(d => {
            return d.radius
        }).strength(0.2))
        .on("tick", ticked)


    if (xScale !== undefined && yScale !== undefined) {
        simulation = d3.forceSimulation(tdata)
            .force("x", d3.forceX(d => xScale(d[xAx])).strength(0.3))
            .force("y", d3.forceY(d => yScale(d[yAx])).strength(0.3))
            .force("collide", d3.forceCollide(d => d.radius))
            .on("tick", ticked)
    } else if (xScale !== undefined && yScale === undefined) {
        simulation = d3.forceSimulation(tdata)
            .force("x", d3.forceX(d => xScale(d[xAx])).strength(0.3))
            .force("y", d3.forceY(d => d.y).strength(0.3))
            .force("collide", d3.forceCollide(d => d.radius))
            .on("tick", ticked)
    } else if (xScale === undefined && yScale !== undefined) {
        simulation = d3.forceSimulation(tdata)
            .force("x", d3.forceX(d => d.x).strength(0.3))
            .force("y", d3.forceY(d => yScale(d[yAx])).strength(0.3))
            .force("collide", d3.forceCollide(d => d.radius))
            .on("tick", ticked)
    }


    // const simulation = d3.forceSimulation(data)
    //     .force("collide", d3.forceCollide().radius(d => 18).strength(0.000000001))
    //     .force("x", d3.forceX().strength(0.0000025))
    //     .force("y", d3.forceY().strength(0.0000032))
    //     .on("tick", ticked)


    function ticked() {
        if (layout == "force") {
            timages
                .attr("x", d => d.x)
                // .attr("x", d => clampVal(d.x, 0, size.width))
                // .attr("y", d => clampVal(d.y, 0, size.height))
                .attr("y", d => d.y)
        }
    }


}

async function tdrawRefactor(update = false) {
    let svg = d3.select("#fakePreviewSvg")
    let viewport
    if (!update) {
        svg.selectAll("*").remove();
        viewport = svg.append("g")
            .attr("id", "viewport")
    } else {
        viewport = svg.select("#viewport")
    }


    const zoom = d3.zoom()
        .scaleExtent([0.2, 10])
        .filter((event) => {
            // only allow zoom/pan gestures while shift is held
            if (!event.shiftKey) return false;

/*            const startingOnImage =
                (event.type === "mousedown" || event.type === "touchstart" || event.type === "pointerdown") &&
                event.target.tagName === "image";
            if (startingOnImage) return false;*/

            return !event.ctrlKey && !event.button;
        })
        .on("zoom", (event) => {
            viewport.attr("transform", event.transform);
        });

    svg.call(zoom);
    let data = chartDataset.data

    let encodings = Object.keys(dataBinding)

    let tmarks = makeMarks(encodings, data)
    let order = getOrder(encodings)


    let timages
    //TODO: here use makeColorScale(data, palette) and make dicts for each palette
    /*    let allColScales = {}

        for (let i = 0; i < encodings.length; i++) {
            allColScales[encodings[i]] = {}
        }*/


    if (layout === "grid") {
        drawGrid(svg, viewport, data, encodings, order, tmarks, update)
    } else if (layout === "scatterplot") {
        drawScatter(svg, viewport, data, encodings, order, tmarks, update)
    } else if (layout === "force") {
        drawForce(svg, viewport, data, encodings, order, tmarks, update)
    } else if (layout === "drag") {
        drawDrag(svg, viewport, data, encodings, order, tmarks, update)
    }


    /*
        if (gridMod) {

            let xCumul = 5
            let yCumul = 5

            let width = 700

            for (let i = 0; i < data.length; i++) {

                let d = data[i]

                let can = makeCollageFromData(encodings, order, tmarks, d)


                let tw = can.width
                let th = can.height

                timages = svg.append("image")
                    .attr("xlink:href", can.toDataURL("image/png"))
                    .attr("x", xCumul)
                    .attr("y", yCumul)
                    .attr("width", tw)
                    .attr("height", th)

                xCumul += tw
                if (xCumul + tw > width) {
                    yCumul += th
                    xCumul = 5
                }

            }
        } else {


            timages = svg.selectAll("dots")
                .data(data)
                .enter()
                .append("image")
                .attr("xlink:href", d =>
                    makeCollageFromData(encodings, order, tmarks, d).toDataURL("image/png"))
                .attr("x", d => {
                    return xScale(d[chartAxis.x])
                })
                .attr("y", d => {
                    return yScale(d[chartAxis.y]);
                })


            if (timages && !gridMod && useForce) {

                const simulation = d3.forceSimulation(data)
                    .force("collide", d3.forceCollide().radius(d => 18).strength(0.000000001))
                    .force("x", d3.forceX().strength(0.0000025))
                    .force("y", d3.forceY().strength(0.0000032))
                    .on("tick", ticked)

                let duration = 10

                let t = d3.timer(elapsed => {
                    let dt = elapsed / duration
                    simulation.force("collide").strength(dt)
                    if (dt >= 1.0) t.stop()
                })//timer


                function ticked() {

                    timages
                        .attr("x", d => clampVal(d.x, 0, size.width))
                        .attr("y", d => clampVal(d.y, 0, size.height))
                }//function ticked
            }
        }*/
}


function getScales(svg, data) {

    let size = svg.node().getBoundingClientRect()

    let margin = 20


    let xScale = d3.scaleLinear(d3.extent(data.map(d => d[chartAxis.x])), [margin, size.width - margin])
    let yScale = d3.scaleLinear(d3.extent(data.map(d => d[chartAxis.y])), [size.height - margin, margin])

    if (!isCont(data, chartAxis.x)) {
        xScale = d3.scaleBand()
            .domain(data.map(d => d[chartAxis.x]))
            .range([margin, size.width - margin])
        // .padding(0.1);
    }

    if (!isCont(data, chartAxis.y)) {
        yScale = d3.scaleBand()
            .domain(data.map(d => d[chartAxis.y]))
            .range([margin, size.height - margin])
            .padding(0.1);
    }


    for (let i = 0; i < data.length; i++) {
        data[i].x = size.width / 2
        data[i].y = size.height / 2
    }


    return [xScale, yScale]
}


function switchSettings() {


    let container = document.getElementById('settingsSandbox')
}