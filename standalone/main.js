let jsonURL = "examples/week47.json"


docReady(init)

async function init() {

    let state = await loadStateFromJson(jsonURL)

    initState(state)

    console.log(state);
    let svg = d3.select("#svg-container")

    let data = chartDataset.data
    let encodings = Object.keys(dataBinding)

    let tmarks = makeMarks(encodings, data)
    let order = getOrder(encodings)

    console.log(data);

    let glyphs = svg.selectAll("dots")
        .data(data)
        .enter()
        .append("image")
        .attr("xlink:href", d => {
            let t = makeCollageFromData(encodings, order, tmarks, d).toDataURL("image/png")
            console.log(t);
            return t
        })
        .attr("x", d => {
            return Math.random() * 800
        })
        .attr("y", d => {
            return Math.random() * 800
        })

}