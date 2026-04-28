let dataBinding = {}


let chartAxis = {
    x: "flipper_length_mm",
    y: "body_mass_g"
}


const datasetList = ["pinguin"]

let megaGlyph = {}

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
    console.log(data);
    if (url.includes("pinguin")) { //TODO: to unfazed to bother with NONE stuff
        data.splice(3, 1)
        data.splice(338, 1)
    }
    chartDataset.data = data
}

async function drawSvg() {

    let svg = d3.select("#fakePreviewSvg")


    let data = chartDataset.data

    svg.selectAll("*").remove();

    let size = svg.node().getBoundingClientRect()

    let margin = 20

    let xScale = d3.scaleLinear(d3.extent(data.map(d => d[chartAxis.x])), [margin, size.width - margin])
    let yScale = d3.scaleLinear(d3.extent(data.map(d => d[chartAxis.y])), [size.height - margin, margin])

    let encodings = Object.keys(dataBinding)

    console.log(encodings);
    if (encodings.length === 0) {

        svg.selectAll("dots")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d[chartAxis.x]))
            .attr("cy", d => yScale(d[chartAxis.y]))
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

                console.log(marks);

                svg.selectAll("dots")
                    .data(data)
                    .enter()
                    .append("image")
                    .attr("xlink:href", d => marks[d[dataBinding[encodings[0]]]].source.toDataURL("image/png"))
                    .attr("x", d => xScale(d[chartAxis.x]))
                    .attr("y", d => yScale(d[chartAxis.y]))
                    .attr("width", d => marks[d[dataBinding[encodings[0]]]].source.width)
                    .attr("height", d => marks[d[dataBinding[encodings[0]]]].source.height)


            } else if (pal.displayType === "morph") {

                let sizeScale = d3.scaleLinear(d3.extent(data.map(d => d[dataBinding[encodings[0]]])), [pal.encodings.morph.min.proto.size[0], pal.encodings.morph.max.proto.size[0]])


                svg.selectAll("dots")
                    .data(data)
                    .enter()
                    .append("image")
                    .attr("xlink:href", pal.encodings.morph.max.proto.canvas.toDataURL("image/png"))
                    .attr("x", d => xScale(d[chartAxis.x]))
                    .attr("y", d => yScale(d[chartAxis.y]))
                    .attr("width", d => {
                        return sizeScale(d[dataBinding[encodings[0]]])
                    })
                    .attr("height", d => sizeScale(d[dataBinding[encodings[0]]]))


            }

        }
    } else {

        let tmarks = makeMarks(encodings, data)

        let order = getOrder(encodings)

        svg.selectAll("dots")
            .data(data)
            .enter()
            .append("image")
            .attr("xlink:href", d =>
                makeCollageFromData(encodings, order, tmarks, d).toDataURL("image/png"))
            .attr("x", d => xScale(d[chartAxis.x]))
            .attr("y", d => yScale(d[chartAxis.y]))

        //TODO: here generate glyphs WRT data and use it as a single image
    }

    populateSandboxMenu(data)
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
    }

    return select;

}

function makeDataColumnMenu(columns, name, selected, mode = "palette") {
    let select = document.createElement("select");
    select.setAttribute("name", name);
    select.setAttribute("mode", mode);


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
            drawSvg()
            // delete megaGlyph[prev];

        }

    } else {

        select.onchange = function (e) {
            let tval = select.value
            let palette = select.getAttribute("name");
            let mode = select.getAttribute("mode");

            if (megaGlyph[palette]) {

                if (megaGlyph[palette][mode]) {
                    megaGlyph[palette][mode].dataColumn = tval
                } else {
                    megaGlyph[palette][mode] = {dataColumn: tval}
                }
            } else {
                megaGlyph[palette] = {
                    dataColumn: tval
                }
            }

            drawSvg()

        }
    }

    return select;
}


function makeParamOption(name, columns, palette) {
    let list = document.createElement("li");

    let tselected = undefined

    if (megaGlyph[palette][name]) {
        if (megaGlyph[palette][name].dataColumn) {
            tselected = megaGlyph[palette][name].dataColumn
        }
    }
    let select = makeDataColumnMenu(columns, palette, tselected, name)

    let div = document.createElement("div");
    div.classList.add("fakeGrammarRow")

    let p = document.createElement("p");
    p.innerHTML = `${name}:`;


    div.appendChild(p)
    div.appendChild(select)
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
        tdiv.appendChild(makeDataColumnMenu(columns, key, value.dataColumn))

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

    megaGlyph["new"] = {
        dataColumn: "",
        color: {
            dataColumn: "",
            scale: "ordinal",
        },
        size: {
            dataColumn: "",
            scale: "",
        },
        intensity: {
            dataColumn: "",
            scale: "",
        }
    }

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

    drawSvg()
}

async function loadCsv(url) {


    return await d3.csv(
        url,
        d3.autoType
    )
}


function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

