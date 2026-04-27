let dataBinding = {}


let chartAxis = {
    x: "flipper_length_mm",
    y: "body_mass_g"
}

let chartDataset = {
    data: []
}

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

            console.log(marks);

            svg.selectAll("dots")
                .data(data)
                .enter()
                .append("image")
                .attr("xlink:href", d => marks[d[dataBinding[encodings[0]]]].source.toDataURL("image/png"))
                .attr("x", d => xScale(d[chartAxis.x]))
                .attr("y", d => yScale(d[chartAxis.y]))
                .attr("width", d => marks[d[dataBinding[encodings[0]]].source.width])
                .attr("height", d => marks[d[dataBinding[encodings[0]]].source.height])


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


    } else {

        let tmarks = makeMarks(encodings, data)
        console.log(tmarks);
        let tcan = makeCollageFromData(encodings, tmarks, data[0])
        let bbox = getBBox(tcan)

        let can = document.createElement("canvas")
        let context = can.getContext("2d")
        context.drawImage(tcan, 0, 0, can.width, can.height)

        context.drawImage(tcan, bbox[0][0], bbox[0][1], can.width, can.height, 0, 0, can.width, can.height)


        can.width = bbox[1][0] - bbox[0][0]
        can.height = bbox[1][1] - bbox[0][1]

        console.log(bbox[0][0], bbox[0][1], can.width, can.height)

        ;
        svg.append("image")
            .attr("x", 20)
            .attr("y", 20)
            .attr("width", 200)
            .attr("height", 200)
            .attr("xlink:href", can.toDataURL("image/png"))

        /*        svg.selectAll("dots")
                    .data(data)
                    .enter()
                    .append("image")
                    .attr("xlink:href", d =>
                        makeCollageFromData(encodings, d).toDataURL("image/png"))
                    .attr("x", d => xScale(d[chartAxis.x]))
                    .attr("y", d => yScale(d[chartAxis.y]))*/
        // .attr("width", d => marks[d[dataBinding[encodings[0]]].source.width])
        // .attr("height", d => marks[d[dataBinding[encodings[0]]].source.height])

        //TODO: here generate glyphs WRT data and use it as a single image
    }

    populateSandboxMenu(data)
}


function populateSandboxMenu(data) {

    let keys = Object.keys(data[0])


    let container = document.getElementById("fakeGrammar");
    container.innerHTML = '';
    let axes = ["x", "y"];

    for (let i = 0; i < axes.length; i++) {
        let tdiv = makeAxisMenu(keys, axes[i], chartAxis[axes[i]]);
        tdiv.classList.add("fakeGrammarRow")
        container.append(tdiv);
    }

    for (let i = 0; i < keys.length; i++) {

        let tdiv = makeSingleMenu(keys[i], dataBinding[keys[i]]);
        tdiv.classList.add("fakeGrammarRow")
        container.append(tdiv);

    }

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

