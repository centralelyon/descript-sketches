let drawnMarks = {}
const spiralOptions = {
    padding: 30,
    step: 12,
    maxRadius: 190,
};

let tFrom, tTo = {}

let anchoring = false

let newAnchors = []
let anchoringRef = ""
let nAnchor = 0

let collageMod = "details"
let selectedAnchor


let collageDisplaySwitch = false // false = cartesian ?


function cartesianOfMarks(root) {
    const rootKeys = Object.keys(root);

    const keySets = rootKeys.map(rk => {
        const marks = root[rk]?.encodings?.range?.marks ?? {};
        return Object.keys(marks);
    });

    const combos = keySets.reduce(
        (acc, set) => acc.flatMap(a => set.map(v => [...a, v])),
        [[]]
    );

    return combos.map(combo =>
        Object.fromEntries(rootKeys.map((rk, i) => [rk, combo[i]]))
    );
}


function showExample() {

    let svg = d3.select("#bigCartesian")


    svg.selectAll("*").remove();

    let encodings = Object.keys(dataBinding)

    let data = chartDataset.data
    let tmarks = makeMarks(encodings, data)
    let order = getOrder(encodings)

    let trect = svg.node().getBoundingClientRect()

    // console.log(tmarks);


    let cart = cartesianOfMarks(megaPalettes)

    let n = cart.length
    let size = 120
    let margin = 5
    // data[(Math.random() * data.length) | 0] -- Random Data
    for (let i = 0; i < n; i++) {
        let can = makeCollageFromData(encodings, order, tmarks, data[(Math.random() * data.length) | 0], cart[i])

        let coords = getGridLayout(trect.width, trect.height, n, i, size)

        svg.append("image")
            .attr("xlink:href", can.toDataURL("image/png"))
            .attr("x", coords.x)
            .attr("y", coords.y)
            .attr("width", coords.itemSize)
            .attr("height", coords.itemSize)
            .datum(cart[i])
            .on("mouseover", function (e, d) {

                for (const [name, mark] of Object.entries(d)) {

                    bordercan(name, mark, true)
                }
            })
            .on("mouseout", function (e, d) {
                for (const [name, mark] of Object.entries(d)) {

                    bordercan(name, mark, false)
                }
            })


    }


}

function bordercan(name, mark, highlight, d) {
    let can = document.getElementById(`canvas_${name}_${mark}`)

    if (can) {
        if (highlight) {
            can.style.border = "1px solid red"
            can.style.backgroundColor = "rgba(255,78,78,0.63)"
        } else {
            can.style.border = "1px solid #424242"
            can.style.backgroundColor = ""
        }
    } else {
        let cont = document.getElementById(`bind-${name}`)

        can = cont.querySelector(`div[data='${d[megaGlyph[name].dataColumn]}']`)
        console.log(can);
        if (highlight) {
            can.style.border = "1px solid red"
            can.style.backgroundColor = "rgba(255,78,78,0.63)"
        } else {
            can.style.border = ""
            can.style.backgroundColor = ""
        }
    }
}

function getGridLayout(
    containerWidth,
    containerHeight,
    itemCount,
    currentIndex,
    maxItemSize
) {
    let bestCols = 1;
    let bestRows = itemCount;
    let bestSize = 0;

    for (let cols = 1; cols <= itemCount; cols++) {
        const rows = Math.ceil(itemCount / cols);

        const size = Math.min(
            containerWidth / cols,
            containerHeight / rows,
            maxItemSize // never exceed this size
        );

        if (size > bestSize) {
            bestSize = size;
            bestCols = cols;
            bestRows = rows;
        }
    }

    return {
        cols: bestCols,
        rows: bestRows,
        itemSize: bestSize,
        x: (currentIndex % bestCols) * bestSize,
        y: Math.floor(currentIndex / bestCols) * bestSize
    };
}


function placeMark() {

    let rects = Object.keys(drawnMarks).map(d => drawnMarks[d])
    if (Object.keys(drawnMarks).length === 0) {
        return {x: 200 - 30, y: 200 - 30, w: 60, h: 60};
    } else {
        return placeRectangleSpiral(rects,
            {w: 60, h: 60}, spiralOptions
        )
    }

}

function setMarker() {
    let svg = d3.select("#composition")

    svg.selectAll("defs").remove("*");

    let def = svg.append("defs")

    let marker = def.append("marker")
        .attr("id", "arrow")
        .attr("refX", "-0")
        .attr("refY", "3.5")
        .attr("markerWidth", "7")
        .attr("markerHeight", "7")
        .attr("orient", "auto")


    // marker.append("path")
    //     .attr("d", "M 0 5 L 8 0 L 8 9 z")
    //     .attr("stroke-width", 3)
    //     .attr("stroke", "red")
    //     .attr("fill", "none")

    marker.append("image")
        .attr("xlink:href", "assets/images/buttons/side.png")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", "7")
        .attr("height", "7")
}


function drawAllCollageAnchor() {
    let svg = d3.select("#composition")

    svg.selectAll("circle").remove();
    svg.selectAll("path").remove();

    let keys = Object.keys(megaPalettes)

    for (const [key, value] of Object.entries(megaPalettes)) {

        if (value.linkTo !== undefined) {
            console.log(key);

            let name = key

            let frAnchor = megaPalettes[value.apply].encodings.range.marks["mark0"].proto.anchors[value.linkTo]
            let toAnchor = megaPalettes[key].encodings.range.marks["mark0"].proto.anchors[value.linkTo]

            tFrom = {
                x: drawnMarks[value.apply].x + drawnMarks[value.apply].w * frAnchor.rx,
                y: drawnMarks[value.apply].y + drawnMarks[value.apply].h * frAnchor.ry,
                name: value.apply
            }
            tTo = {
                x: drawnMarks[key].x + drawnMarks[key].w * toAnchor.rx,
                y: drawnMarks[key].y + drawnMarks[key].h * toAnchor.ry,
                name: key
            }

            svg.append("path")
                // .attr("d", `M ${tFrom.x} ${tFrom.y} Q ${cx} ${curve} ${tTo.x} ${tTo.y}`)
                .attr("d", makeLink(tFrom.x, tFrom.y, tTo.x, tTo.y))
                .attr("stroke-width", 3)
                .style("stroke", "#424242")
                .attr("fill", "none")
                .attr("name", name)
                .attr("nAnchor", value.linkTo)
                .attr("from", tFrom.name)
                .attr("to", tTo.name)
                .on("click", selAnchorPath)
            // .attr("marker-mid", "url(#arrow)")
            // .attr("stroke", drawnMarks[name].x)


            svg.append("circle")
                .attr("cx", tFrom.x)
                .attr("cy", tFrom.y)
                .attr("type", "from")
                .style("fill", collageColScale(tTo.name))
                .attr("from", tFrom.name)
                .attr("to", tTo.name)
                .attr("name", name)
                .attr("nAnchor", value.linkTo)
                .attr("r", 5)

                .attr("fill", drawnMarks[name].x)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))


            svg.append("circle")
                .attr("cx", tTo.x)
                .attr("cy", tTo.y)
                .attr("type", "to")
                .attr("from", tFrom.name)
                .attr("to", tTo.name)
                .attr("name", name)
                .style("fill", collageColScale(tFrom.name))
                .attr("nAnchor", value.linkTo)
                .attr("r", 5)
                .attr("fill", drawnMarks[name].x)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))

        }
    }

}

function addPaletteInfoToCollage(palette, name) {

    let svg = d3.select("#composition")

    let show = palette.encodings.range.marks["mark0"].proto.canvas

    drawnMarks[name] = placeMark()
    setMarker()

    const drag = d3.drag()
        .on("start", markDragStarted)
        .on("drag", markDragged)
        .on("end", markDragEnded);


    svg.append("g")
        .attr("id", "g-" + name)
        .append("image")
        .attr("class", "collageElement")
        .style("outline", `${collageColScale(name)} solid 3px`)
        .attr("xlink:href", show.toDataURL("image/png"))
        .attr("id", `collage-${name}`)
        .attr("x", drawnMarks[name].x)
        .attr("y", drawnMarks[name].y)
        .attr("width", drawnMarks[name].w)
        .attr("height", drawnMarks[name].h)
        .call(drag)
        .on("click", function (e) {
            let elem = e.target
            if (collageMod !== "details") {
                if (!anchoring) {
                    anchoring = true
                    anchoringRef = name

                    let [px, py] = d3.pointer(e, svg.node())
                    let offx = px - drawnMarks[name].x
                    let offy = py - drawnMarks[name].y
                    svg.append("circle")
                        .attr("cx", drawnMarks[name].x + offx)
                        .attr("cy", drawnMarks[name].y + offy)
                        .attr("r", 5)
                        .attr("fill", collageColScale(name))
                        .attr("type", "from")
                        .attr("from", name)
                        .attr("name", name)
                        .attr("nAnchor", nAnchor)
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended))

                    tFrom = {x: drawnMarks[name].x + offx, y: drawnMarks[name].y + offy, rx: offx, ry: offy, name: name}

                } else {
                    if (anchoringRef !== name) {

                        let [px, py] = d3.pointer(e, svg.node())
                        let offx = px - drawnMarks[name].x
                        let offy = py - drawnMarks[name].y


                        let fromCr = d3.select(`circle[from="${tFrom.name}"][nAnchor="${nAnchor}"][type="from"]`)


                        tTo = {
                            x: drawnMarks[name].x + offx,
                            y: drawnMarks[name].y + offy,
                            rx: offx,
                            ry: offy,
                            name: name
                        }


                        let tpath = d3.selectAll(`path[from="${tTo.name}"][to="${tFrom.name}"]`)
                        let tpath2 = d3.selectAll(`path[from="${tFrom.name}"][to="${tTo.name}"]`)


                        if (tpath.size() === 0 && tpath2.size() === 0) {

                            svg.append("circle")
                                .attr("cx", drawnMarks[name].x + offx)
                                .attr("cy", drawnMarks[name].y + offy)
                                .attr("r", 5)
                                .attr("type", "to")
                                .attr("from", tFrom.name)
                                .attr("to", name)
                                .attr("name", name)
                                .attr("nAnchor", nAnchor)
                                .attr("fill", collageColScale(tFrom.name))
                                .call(d3.drag()
                                    .on("start", dragstarted)
                                    .on("drag", dragged)
                                    .on("end", dragended)).raise()


                            fromCr.attr("name", tTo.name).attr("to", tTo.name).attr("fill", collageColScale(tTo.name)).raise()


                            const cx = (tFrom.x + tTo.x) / 2;
                            const curve = 2;


                            svg.append("path")
                                // .attr("d", `M ${tFrom.x} ${tFrom.y} Q ${cx} ${curve} ${tTo.x} ${tTo.y}`)
                                .attr("d", makeLink(tFrom.x, tFrom.y, tTo.x, tTo.y))
                                .attr("marker-mid", "url(#arrow)")
                                .attr("stroke-width", 3)
                                .style("stroke", "#424242")
                                .attr("fill", "none")
                                .attr("name", name)
                                .attr("nAnchor", nAnchor)
                                .attr("from", tFrom.name)
                                .attr("to", tTo.name)
                                .on("click", selAnchorPath)


                            // .attr("stroke", drawnMarks[name].x)


                            setAnchorOnAllMarks(tFrom.name, offx, offy, nAnchor, 0, name)
                            setAnchorOnAllMarks(name, offx, offy, nAnchor, 0, tFrom.name)

                            resolveAnchorTree(findRoot(tFrom.name))
                            nAnchor++
                            anchoring = false
                            anchoringRef = ""
                            setAnchor()

                        } else {
                            //     TODO: DELETE from
                            fromCr.remove()
                            anchoring = false
                            anchoringRef = ""
                            setAnchor()
                        }

                    } else {
                        let [px, py] = d3.pointer(e, svg.node())
                        let offx = px - drawnMarks[name].x
                        let offy = py - drawnMarks[name].y

                        d3.select(`circle[from="${name}"][nAnchor="${nAnchor}"][type="from"]`).remove()

                        svg.append("circle")
                            .attr("cx", drawnMarks[name].x + offx)
                            .attr("cy", drawnMarks[name].y + offy)
                            .attr("r", 5)
                            .attr("fill", collageColScale(name))
                            .attr("type", "from")
                            .attr("from", name)
                            .attr("name", name)
                            .attr("nAnchor", nAnchor)
                            .call(d3.drag()
                                .on("start", dragstarted)
                                .on("drag", dragged)
                                .on("end", dragended))

                        tFrom = {
                            x: drawnMarks[name].x + offx,
                            y: drawnMarks[name].y + offy,
                            rx: offx,
                            ry: offy,
                            name: name
                        }
                    }
                }

            } else {

                // displayPalette(name)

            }
        })

    let tkeys = Object.keys(drawnMarks)

    //TODO: Here check if anchor already exist


    if (megaPalettes[name].apply || megaPalettes[name].linkTo || megaPalettes[name].linkto) {

        if (megaPalettes[name].linkto) {
            tFrom = {
                x: drawnMarks[tkeys[0]].x + drawnMarks[tkeys[0]].w * 0.5,
                y: drawnMarks[tkeys[0]].y + drawnMarks[tkeys[0]].h * 0.5,
                name: tkeys[0]
            }
            tTo = {
                x: drawnMarks[name].x + drawnMarks[name].w * 0.5,
                y: drawnMarks[name].y + drawnMarks[name].h * 0.5,
                name: name
            }
        }


    } else {

        console.log("here ????????????????//");
        console.log(name);

        /*    if (megaPalettes[tkeys[0]].apply !== undefined || megaPalettes[tkeys[0]].linkto !== undefined) {

            } else if (megaPalettes[tkeys[1]].apply !== undefined || megaPalettes[tkeys[1]].linkto !== undefined) {

            } else {*/

        if (tkeys.length > 1) {
            console.log(tkeys[0]);
            setAnchorOnAllMarks(name, drawnMarks[name].w * 0.5, drawnMarks[name].h * 0.5, nAnchor, 0, tkeys[0])
            setAnchorOnAllMarks(tkeys[0], drawnMarks[tkeys[0]].w * 0.5, drawnMarks[tkeys[0]].h * 0.5, nAnchor, 0, name)
            megaPalettes[tkeys[0]].linkto = tkeys[0]

            tFrom = {
                x: drawnMarks[tkeys[0]].x + drawnMarks[tkeys[0]].w * 0.5,
                y: drawnMarks[tkeys[0]].y + drawnMarks[tkeys[0]].h * 0.5,
                name: tkeys[0]
            }
            tTo = {
                x: drawnMarks[name].x + drawnMarks[name].w * 0.5,
                y: drawnMarks[name].y + drawnMarks[name].h * 0.5,
                name: name
            }


            svg.append("path")
                // .attr("d", `M ${tFrom.x} ${tFrom.y} Q ${cx} ${curve} ${tTo.x} ${tTo.y}`)
                .attr("d", makeLink(tFrom.x, tFrom.y, tTo.x, tTo.y))
                .attr("stroke-width", 3)
                .style("stroke", "#424242")
                .attr("fill", "none")
                .attr("name", name)
                .attr("nAnchor", nAnchor)
                .attr("from", tFrom.name)
                .attr("to", tTo.name)
                .on("click", selAnchorPath)
            // .attr("marker-mid", "url(#arrow)")
            // .attr("stroke", drawnMarks[name].x)


            svg.append("circle")
                .attr("cx", tFrom.x)
                .attr("cy", tFrom.y)
                .attr("type", "from")
                .style("fill", collageColScale(tTo.name))
                .attr("from", tFrom.name)
                .attr("to", tTo.name)
                .attr("name", name)
                .attr("nAnchor", nAnchor)
                .attr("r", 5)

                .attr("fill", drawnMarks[name].x)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))


            svg.append("circle")
                .attr("cx", tTo.x)
                .attr("cy", tTo.y)
                .attr("type", "to")
                .attr("from", tFrom.name)
                .attr("to", tTo.name)
                .attr("name", name)
                .style("fill", collageColScale(tFrom.name))
                .attr("nAnchor", nAnchor)
                .attr("r", 5)
                .attr("fill", drawnMarks[name].x)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))

            resolveAnchorTree(findRoot(tFrom.name))
            nAnchor++
        }
    }
    // }
}


function hidePalette() {
    const container = document.getElementById("paletteDetails")
    container.style.display = "none"
}


function delPalette(key) {


    d3.select("#collage-" + key).remove()
    d3.selectAll(`#composition circle[name="${key}"]`).remove()
    d3.selectAll(`#composition circle[from="${key}"]`).remove()
    d3.selectAll(`#composition circle[to="${key}"]`).remove()


    d3.selectAll("#composition path")
        .each(function (d, i) {
            let p = d3.select(this);
            let to = p.attr("to")
            let from = p.attr("from")
            let n = p.attr("nAnchor")
            console.log(from, to, n)
            if (from === key || to === key) {
                console.log(from, to, n)
                purgeAnchor(from, to, n)
            }

        });

    d3.selectAll(`#composition path[name="${key}"]`).remove()
    d3.selectAll(`#composition path[from="${key}"]`).remove()
    d3.selectAll(`#composition path[to="${key}"]`).remove()
    delete megaPalettes[key]
    delete megaGlyph[key]
    delete dataBinding[key]

    if (Object.keys(megaPalettes).length > 0) {
        updateSvg()
    } else {
        d3.select("#fakePreviewSvg").selectAll("image").remove()
    }

    // hidePalette()
    d3.select(`.selectedPaletteRow[name='${key}']`).remove()
    d3.select(`#list-${key}`).remove()
}


function newSavePalette() {
    savePalette2(selectedPalette)
}

function displayPalette(name) {

    selectedPalette = name

    let trange = document.getElementById("strokewidth")

    trange.onchange = function (e) {

        const val = parseInt(document.getElementById("strokewidth").value);
        stWidth = val

    }

    document.getElementById('strokecolor').onchange = function () {

        stColor = this.value
    }


    const expo = document.createElement("button")
    expo.innerHTML = `<img class="buttonImg" src="/assets/images/buttons/export.png">`

    expo.setAttribute("class", "exportPaletteBtn")
    expo.setAttribute("id", "exportPaletteBtn_" + name)


    const tdiv = document.createElement("div")
    tdiv.id = "palette_" + name
    tdiv.className = "paletteName"
    tdiv.appendChild(expo)
    tdiv.innerHTML += `<input type="text" onchange="renameRow(this,'${name}')" row="${tdiv.id}" value="${name}" class="waypointTitle" />`

    const container = document.getElementById("paletteDetails")
    container.style.display = "flex"


    const containerTitle = document.getElementById("paletteTitle")
    const containerMarks = document.getElementById("paletteMarks")
    const containerControls = document.getElementById("paletteControls")

    containerTitle.innerHTML = ""
    containerMarks.innerHTML = ""
    containerControls.innerHTML = ""

    const palette = megaPalettes[name]
    containerTitle.appendChild(tdiv)


    document.getElementById("exportPaletteBtn_" + name).onclick = function (e) {

        // savePalette2(name)
        // console.log(e.target.parentElement);

        let tname = e.target.parentElement.getAttribute("name")

        appendSingle(palette, tname)
    }

    newSelectedPalette = name
    const tdiv_mark = document.createElement("div")
    tdiv_mark.id = "mark_" + name
    tdiv_mark.className = "paletteMark"
    tdiv_mark.setAttribute("key", name)

    tdiv_mark.onclick = function (e) {
        e.preventDefault()
        if (mode !== "anchor") {
            if (e.target.matches("canvas")) {
                // editPalette(this)
            }
        } else {
            //TODO: Set for CATA and other primitive
            setAnchorOnProto(e, this)
        }
    }


    makeRangeMark(name, containerMarks, palette, "range")

    containerMarks.appendChild(tdiv_mark)

    // dragElement3(tdiv_mark)

    if (megaGlyph[name]) {
        let columns = Object.keys(chartDataset.data[0])
        let [tsel, opts] = makeDataColumnMenu(columns, name, megaGlyph[name].dataColumn)

        tsel.style.marginTop = "5px"

        let tdiv = document.createElement("div")
        tdiv.style.display = "flex";

        tdiv.innerHTML = `<p style="margin-top: 9px;
  margin-right: 6px;">Data Column: </p>`
        tdiv.appendChild(tsel)

        let color = makeParamOption("color", columns, name)
        let size = makeParamOption("size", columns, name)
        let orientation = makeParamOption("orientation", columns, name)

        containerControls.appendChild(tdiv)
        containerControls.appendChild(color)
        containerControls.appendChild(size)
        containerControls.appendChild(orientation)

    }
}


function makePaletteControls(name, container, palette) {


}


function selAnchorPath(e) {

    let elem = e.target


    let path = d3.select(elem)

    let name = path.attr("name")
    let tnAnchor = path.attr("nAnchor")
    let from = path.attr("from")
    let to = path.attr("to")

    path.style("stroke", "red")

    let circles = d3.selectAll(`#composition circle[name="${name}"][nAnchor="${tnAnchor}"]`).style("stroke", "red")


    selectedAnchor = {
        path: path,
        circles: circles,
        name: name,
        n: tnAnchor,
        from: from,
        to: to,
    }

}


function setAnchorOnAllMarks(name, x, y, from, nb, related) {


    for (const [id, value] of Object.entries(megaPalettes[name].encodings.range.marks)) {
        if (!value.proto.anchors) {
            value.proto.anchors = {}
        }

        value.proto.anchors[from] = {
            x: x,
            y: y,
            rx: x / 60,
            ry: y / 60,
            relatedTo: related
        }
    }
    if (selectedPalette === name) {
        d3.selectAll(`.markAnchorSvg circle[num="${nb}"]`).attr("fill", collageColScale(related)).transition().duration(60).attr("cx", x).attr("cy", y)
    }

}


// Walks .apply pointers upward from `name` to find the current root of
// whatever tree it already belongs to (a mark with no .apply of its own).
// Used so that adding a new anchor to an already-connected mark doesn't
// arbitrarily re-root its existing tree.
function findRoot(name, visited = new Set()) {
    if (visited.has(name) || !megaPalettes[name]) return name
    visited.add(name)
    let ref = megaPalettes[name]
    if (!ref.apply) return name
    return findRoot(ref.apply, visited)
}

// Recomputes .apply/.linkTo for an entire connected component from scratch,
// starting at `root`, using proto.anchors[*].relatedTo (on mark0, which every
// mark in a palette shares identically thanks to setAnchorOnAllMarks) as the
// single source of truth for the graph. This replaces the old model where
// .apply/.linkTo were separately mutated by whichever anchor-add happened
// most recently -- if a mark (like one in the middle of a chain) picked up a
// second anchor, that overwrite silently discarded its first relationship,
// even though the anchor geometry itself was still intact. Now every anchor
// a mark owns stays meaningful: a BFS from `root` assigns each mark exactly
// one *upstream* anchor (its .apply/.linkTo, pointing toward the root) while
// every other anchor it owns remains available for whatever attaches to it
// further downstream, so multi-neighbor marks keep all their real links.
function resolveAnchorTree(root) {
    if (!megaPalettes[root]) return

    let visited = new Set([root])
    let queue = [root]

    megaPalettes[root].apply = ""
    megaPalettes[root].linkTo = undefined

    while (queue.length) {
        let current = queue.shift()
        let anchors = megaPalettes[current].encodings.range.marks["mark0"].proto.anchors || {}

        for (const [anchorId, a] of Object.entries(anchors)) {
            let neighbor = a.relatedTo

            if (!neighbor || !megaPalettes[neighbor] || visited.has(neighbor)) continue

            visited.add(neighbor)
            megaPalettes[neighbor].apply = current
            megaPalettes[neighbor].linkTo = Number(anchorId)
            queue.push(neighbor)
        }
    }
}

function rand(n) {
    return (Math.random() - 0.5) * n;
}

function makeLink(x1, y1, x2, y2, tension = 0.3) {
    const dx = x2 - x1;


    const c1x = x1 + dx * tension + rand(40);
    const c1y = y1 + rand(40);
    const c2x = x2 - dx * tension + rand(40);
    const c2y = y2 + rand(40);

    return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
}


function overlaps(a, b, padding = 0) {
    return !(
        a.x + a.w + padding <= b.x ||
        b.x + b.w + padding <= a.x ||
        a.y + a.h + padding <= b.y ||
        b.y + b.h + padding <= a.y
    );
}

function intersectsAny(rect, rects, padding = 0) {
    for (const other of rects) {
        if (overlaps(rect, other, padding)) {
            return true;
        }
    }
    return false;
}

function placeRectangleSpiral(
    rects,
    size,
    options = {}
) {


    // console.log(size);
    const center = {x: 125, y: 125}

    const containerWidth = 250
    const containerHeight = 250;

    const padding = options.padding ?? 6;
    const step = options.step ?? 12;

    const maxIterations = 5000;

    const GOLDEN_ANGLE =
        Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < maxIterations; i++) {

        // Faster radial growth
        const radius = step * Math.sqrt(i);

        const theta = i * GOLDEN_ANGLE;

        const x =
            center.x +
            Math.cos(theta) * radius -
            size.w / 2;

        const y =
            center.y +
            Math.sin(theta) * radius -
            size.h / 2;

        const candidate = {
            x,
            y,
            w: size.w,
            h: size.h,
        };

        // Reject outside container
        if (
            candidate.x < 0 ||
            candidate.y < 0 ||
            candidate.x + candidate.w > containerWidth ||
            candidate.y + candidate.h > containerHeight
        ) {
            continue;
        }

        // Reject overlaps
        if (!intersectsAny(candidate, rects, padding)) {
            return candidate;
        }
    }

    return {
        x: center.x + 60,
        y: center.y + 60,
        w: size.w,
        h: size.h,
    }
}

