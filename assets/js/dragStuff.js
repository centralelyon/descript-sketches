let dragMode = "canvas"

let dragging = false;

let offsetX = 0;
let offsetY = 0;

let selectedDataColumn = ""


let markOffx = 0
let markOffy = 0

let tdragName = ""

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.onmousedown = dragMouseDown;
    let tsvg = document.getElementById("selectedPaletteCont");

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        dragging = true
        if (elmnt.className === "allPaletteRow") {
            dragMode = "palette"
        } else {
            dragMode = "canvas";
        }


        const rect = elmnt.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;

        if (!e.target.matches("img"))
            tsvg.classList.add("dropArea")
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // set the element's new position:
        elmnt.style.position = "absolute";

        document.body.style.cursor = "grabbing";

        elmnt.style.left =
            (e.pageX - offsetX) + "px";

        elmnt.style.top =
            (e.pageY - offsetY + 50) + "px";

        if (e.target === tsvg || e.target.matches(".leftSideSelected") || e.target.matches(".selectedCanPreview") || e.target.matches(".propertyContainer")) {
            tsvg.classList.add("dragOver")
            tsvg.classList.remove("dropArea")
        } else {
            tsvg.classList.remove("dragOver")
            tsvg.classList.add("dropArea")
        }

    }

    function closeDragElement(e) {
        // stop moving when mouse button is released:
        elmnt.style.position = "";
        elmnt.style.top = ""
        elmnt.style.left = ""
        document.onmouseup = null;
        document.onmousemove = null;
        dragging = false

        document.body.style.cursor = "";


        tsvg.classList.remove("dragOver")
        tsvg.classList.remove("dropArea")

        if (dragMode === "canvas") {
            dropCanvas(e, elmnt)
        } else {
            dropPalette(e, elmnt)
        }


    }
}


function dragElement2(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.onmousedown = dragMouseDown;


    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        selectedDataColumn = elmnt.getAttribute("datacolumn");

        const rect = elmnt.getBoundingClientRect();

        offsetX = e.clientX - rect.left
        offsetY = e.clientY - rect.top;

        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        d3.selectAll(".dataSelectContainer").style("border", "2px dashed #424242")
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // set the element's new position:
        elmnt.style.position = "absolute";

        let tcords = elmnt.parentElement.getBoundingClientRect();

        elmnt.style.left =
            ((e.pageX - offsetX) - tcords.x) + "px";

        elmnt.style.top =
            ((e.pageY - offsetY + 50) - 50) + "px";

        // elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        // elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";


        if (e.target.matches(".dataSelectContainer")) {
            d3.select(e.target).style("border", "2px dashed red")

        } else if (e.target.parentNode.matches(".dataSelectContainer")) {
            d3.select(e.target.parentNode).style("border", "2px dashed red")
        } else {
            d3.select(".dataSelectContainer").style("border", "2px dashed #424242")
        }
    }

    function closeDragElement(e) {
        // stop moving when mouse button is released:
        elmnt.style.position = "";
        elmnt.style.top = ""
        elmnt.style.left = ""
        document.onmouseup = null;
        document.onmousemove = null;
        dragging = false

        d3.selectAll(".dataSelectContainer").style("border", "none")
        let id = ""
        let type = ""
        let telm

        if (e.target.matches(".dataSelectContainer")) {
            id = e.target.getAttribute("key")
            type = e.target.getAttribute("type")
            telm = e.target

        } else if (e.target.parentElement.matches(".dataSelectContainer")) {
            id = e.target.parentElement.getAttribute("key")
            telm = e.target.parentElement
            type = e.target.parentElement.getAttribute("type")
        }

        if (id !== "") {

            elmnt.innerHTML = `<div style="display: table-cell;background-color: ${collageColScale(id)};margin-left: calc(50% - 38px);" class="colorBrand"></div>${elmnt.innerText}`

            let tsel = d3.select(telm).select("select")

            tsel.selectAll("option").attr("selected", "false")

            tsel = tsel.node()

            let n = +elmnt.getAttribute("num")

            tsel.getElementsByTagName('option')[n + 1].selected = true;

            let key = elmnt.getAttribute("key");
            console.log(type);
            let flag = false
            if (type === "shape") {
                megaGlyph[id].dataColumn = key

                dataBinding[id] = key
                updateMarksBindingDisplay(id)
            } else if (type === "color") {
                megaGlyph[id].color.dataColumn = key

                megaGlyph[id]['color'] = makeColorScale(id, key)

            } else if (type === "size") {
                megaGlyph[id]["size"] = makeSizeScale(id, key)
                flag = true
            } else if (type === "orientation") {
                megaGlyph[id]["orientation"] = makeOrrScale(id, key)
            } else if (type === "opacity") {
                megaGlyph[id]["opacity"] = makeOpScale(id, key)
            }

            updateSvg(flag)

        }

        selectedDataColumn = ""
    }
}


function makeSizeScale(id, key) {
    let data = chartDataset.data

    let scale

    if (isCont(data, key)) {
        scale = d3.scaleLinear(d3.extent(data.map(d => d[key])), [0.6, 1.5])
    } else {
        let uniques = [...new Set(data.map(d => d[key]))];

        scale = d3.scalePoint()
            .domain(uniques)
            .range([0.6, 1.5]);
    }

    return {
        dataColumn: key,
        scale: scale
    }
}

function updateSelectEncoding(palette, key) {
    console.log("dadsadas");
    let sel = document.querySelector(`.dataSelect[palette="${palette}"][encoding="${key}"]`)

    let val = sel.value

    console.log(val);
    if (key === "color") {
        megaGlyph[palette].color.dataColumn = key

        megaGlyph[palette]['color'] = makeColorScale(palette, val)

    } else if (key === "size") {
        megaGlyph[palette]["size"] = makeSizeScale(palette, val)
    } else if (key === "orientation") {
        megaGlyph[palette]["orientation"] = makeOrrScale(palette, val)
    } else if (key === "opacity") {
        megaGlyph[palette]["opacity"] = makeOpScale(palette, val)
    }

    updateSvg()


}

function makeOpScale(id, key) {
    let data = chartDataset.data

    let scale

    if (isCont(data, key)) {
        scale = d3.scaleLinear(d3.extent(data.map(d => d[key])), [0.1, 1])
    } else {
        let uniques = [...new Set(data.map(d => d[key]))];

        scale = d3.scalePoint()
            .domain(uniques)
            .range([0.1, 1]);
    }

    return {
        dataColumn: key,
        scale: scale
    }
}


function makeOrrScale(id, key) {
    let data = chartDataset.data

    let scale

    if (isCont(data, key)) {
        scale = d3.scaleLinear(d3.extent(data.map(d => d[key])), [0, 360])
    } else {
        let uniques = [...new Set(data.map(d => d[key]))];

        scale = d3.scalePoint()
            .domain(uniques)
            .range([0, 360]);
    }

    return {
        dataColumn: key,
        scale: scale
    }
}

function dropPalette(e, elmnt) {

    if (e.target.matches("#paletteCont") || e.target.matches(".paletteMark") || e.target.matches(".paletteMarks")) {

        let num = +elmnt.getAttribute("number")
        let name = elmnt.getAttribute("name")
        let tpal = allPalettes[num]


        if (megaPalettes[name] !== undefined) {
            name += Object.keys(megaPalettes[name]).length
        }
        megaPalettes[name] = tpal


        fillPalette()

        let tPalCont = document.getElementById("paletteCont")
        tPalCont.classList.remove("draggedover")

    } else if (e.target.matches("#selectedPaletteCont") || e.target.matches(".selectedPaletteRow") || e.target.matches(".leftSideSelected") || e.target.matches(".selectedCanPreview") || e.target.matches(".propertyContainer")) {

        let num = +elmnt.getAttribute("number")
        let name = elmnt.getAttribute("name")

        selectThisPalette(name, num)
    }
}

function dropCanvas(e, elmnt) {
    if (e.target.matches(".paletteMark")) {


    } else if (e.target.parentElement.matches(".paletteMark")) {

        let telem = e.target.parentElement

        let id = telem.id.split("_")[1];

        let type = telem.getAttribute("type");

        let can = e.target

        // removeColor(230, 230, 230, can, 25)
        // removeColor(230, 230, 230, elmnt, 25)
        if (type === "range") {
            let num = telem.getAttribute("number")
            // marks[id][num].source = elmnt
            megaPalette2[id].encodings.range.marks[num].source = elmnt

            drawCanvasWithScale(elmnt, can, megaPalette2[id].encodings.range.scale)
        } else if (type === "morph") {

            let num = telem.getAttribute("number")
            megaPalette2[id].encodings.morph[num].proto.canvas = elmnt
            megaPalette2[id].encodings.morph[num].proto.size = [elmnt.width, elmnt.height]
            drawCanvasWithScale(elmnt, can, 1)

        }

        updateSvg()

    }
}

function drawCanvasWithScale(elmnt, can, scale) {

    let elemW = elmnt.width
    let elemH = elmnt.height
    if (scale == null) {
        scale = 1
    }

    if (typeof elemW === "object") {
        elemW = +elmnt.getAttribute("width")
        elemH = +elmnt.getAttribute("height")
    }

    let cont = can.getContext("2d")
    cont.clearRect(0, 0, can.width, can.height)
    let x = can.width / 2
    let y = can.height / 2

    let scaledW = elemW * scale
    let scaledH = elemH * scale

    if (can.width > scaledW && can.height > scaledH) {
        x -= scaledH / 2
        y -= scaledH / 2

        cont.drawImage(elmnt, x, y, scaledW, scaledH)
    } else {
        if (can.width <= scaledW) {
            let ratio = can.width / scaledW

            let w = scaledW * ratio
            let h = scaledH * ratio
            x -= w / 2
            y -= h / 2

            cont.drawImage(elmnt, x, y, w, h)
        } else if (can.height <= scaledH) {

            let ratio = can.height / scaledH

            let w = scaledW * ratio
            let h = scaledH * ratio
            x -= w / 2
            y -= h / 2


            cont.drawImage(elmnt, x, y, w, h)
        }
    }
}


function dragstarted(event, d) {

    let elem = d3.select(this)

    elem.raise().attr("stroke", "black");


}

function dragged(event, d) {
    let elem = d3.select(this)

    console.log(elem.attr("name"));
    let type = elem.attr("type")
    let name = elem.attr("name")
    let toName = elem.attr("to")
    let fromName = elem.attr("from")
    let svg = d3.select("#composition")

    let tname = ""
    let related = ""
    if (type === "from") {
        // let node = svg.select(`circle[name='${name}'][type='from']`)

        tname += svg.select(`circle[name='${name}'][type='from']`).attr("from")


    } else if (type === "to") {
        tname += svg.select(`circle[name='${name}'][type='to']`).attr("to")
    }

    let mark = svg.select(`#collage-${tname}`)


    let tx = event.x - mark.attr("x")
    let ty = event.y - mark.attr("y")

    console.log(tx, event.x, mark.attr("x"));
    console.log(ty, event.y, mark.attr("y"));
    // console.log(ty);

    if ((tx > 0 && tx < 60) && (ty > 0 && ty < 60)) {
        elem.attr("cx", event.x).attr("cy", event.y);


        let from = svg.select(`circle[name='${name}'][from='${fromName}'][to='${toName}'][type='from']`)
        let to = svg.select(`circle[name='${name}'][from='${fromName}'][to='${toName}'][type='to']`)

        /*    console.log(from);
            console.log("----------");
            console.log(to);*/

        let link = svg.select(`path[name='${name}'][from='${fromName}'][to='${toName}']`)

        link.transition().duration(40).attr("d", makeLink(+from.attr("cx"), +from.attr("cy"), +to.attr("cx"), +to.attr("cy")))
        // megaPalettes[name].apply = tFrom.name

        if (type === "from") {
            related = from.attr("to")
        } else {
            related = to.attr("from")
        }


        let id = from.attr("nAnchor")

        let nb = elem.attr("nAnchor")


        // setAnchorOnAllMarks(tname, tx, ty, +id)

        setAnchorOnAllMarks(tname, tx, ty, +id, nb, related)
        updateDotsAndSvgs()


    }
}

function dragended(event, d) {
    // d3.select(this).attr("stroke", null);
    // let elem = d3.select(this)
    updateSvg()
}

//Reorder of pixel-mark
function dragElement3(elmnt) {

    elmnt.onmousedown = dragMouseDown;

    let placeholder = document.createElement("div");
    placeholder.classList.add("placeholder");

    let gap = document.createElement("div");
    gap.classList.add("gapHolder");

    let inserted = false

    let key = elmnt.getAttribute("key");

    function dragMouseDown(e) {
        e = e || window.event;

        const rect = elmnt.getBoundingClientRect();

        offsetX = e.clientX - rect.left
        offsetY = e.clientY - rect.top;

        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        elmnt.classList.add("dragging");
        inserted = false
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        let container = document.getElementById("list-" + key)
        console.log(inserted);
        if (!inserted) {
            console.log(inserted);
            inserted = true;
            let rect = elmnt.getBoundingClientRect();
            elmnt.style.position = "absolute";
            gap.style.height = rect.height + "px"
            gap.style.width = rect.width + "px"
            container.insertBefore(gap, elmnt);

        }


        let parentRect = elmnt.parentElement.getBoundingClientRect()

        elmnt.style.top =
            ((e.pageY - offsetY) - (parentRect.top)) + "px";

        let tt = getInsertionPoint(container, e.clientY, placeholder)


        if (tt && (tt.matches(".colorBrand") || tt.matches(".sizeDiv"))) {
            return;
        }

        if (tt) {
            container.insertBefore(placeholder, tt);
        } else {

            let moreCan = container.querySelector(".moreCan")

            container.insertBefore(placeholder, moreCan);
        }
    }


    /*        if (tt) {
                container.insertBefore(placeholder, tt);
            } else {
                container.appendChild(placeholder);
            }

        }*/

    function closeDragElement(e) {
        // stop moving when mouse button is released:
        elmnt.style.position = "";
        elmnt.style.top = ""
        elmnt.style.left = ""
        document.onmouseup = null;
        document.onmousemove = null;
        dragging = false
        let telem = placeholder.nextSibling
        elmnt.classList.remove("dragging")
        gap.remove()
        if (telem !== null) {
            let curNb = elmnt.getAttribute("number")


            let id = elmnt.getAttribute("id").split("mark_")[1].split("_mark")[0]
            let tkeys = Object.keys(megaPalettes[id].encodings.range.marks)
            let nb = tkeys[tkeys.length - 1]

            if (telem.getAttribute("id") != null) {
                nb = telem.getAttribute("number")
            }


            // console.log("from:", curNb, " to:", nb)

            let nMarks = {}
            let tid = tkeys.indexOf(nb)
            let oldid = tkeys.indexOf(curNb)
            for (let i = 0; i < tkeys.length; i++) {

                if (i === tid) {
                    nMarks[curNb] = megaPalettes[id].encodings.range.marks[curNb]
                    nMarks[nb] = megaPalettes[id].encodings.range.marks[nb]
                } else if (i === oldid) {

                } else {
                    nMarks[tkeys[i]] = megaPalettes[id].encodings.range.marks[tkeys[i]]
                }
            }
            megaPalettes[id].encodings.range.marks = nMarks

            placeholder.replaceWith(elmnt);

            updateSvg()
        }
    }
}

function getInsertionPoint(container, mouseY, placeholder) {
    const items = [...container.children].filter(
        el => !el.classList.contains("dragging")
            && !el.classList.contains("placeholder")
            && !el.classList.contains("colorBrand")
            && !el.classList.contains("sizeDiv")
            && !el.classList.contains("markAnchorSvg")
            && !el.classList.contains("dataBindingLabel")
            && !el.classList.contains("dataBindingContainer")
            && !el.classList.contains("moreCan")
            && !el.classList.contains("palettePlusMark")
    );

    const BUFFER = 8;

    for (const item of items) {
        const rect = item.getBoundingClientRect();
        const middle = rect.top + rect.height / 2;

        const placeholderIsBefore =
            !!(item.compareDocumentPosition(placeholder) & Node.DOCUMENT_POSITION_PRECEDING);

        if (placeholderIsBefore) {

            if (mouseY < middle + BUFFER) return item;
        } else {

            if (mouseY < middle - BUFFER) return item;
        }
    }

    return null;
}

/////////////////// Drag marks in composition

function markDragStarted(event, d) {
    let mark = d3.select(this)
    markOffx = event.x - mark.attr("x")
    markOffy = event.y - mark.attr("y")


    mark.style("cursor", "grabbing");
}

function markDragged(event, d) {
    let elem = d3.select(this)

    let name = elem.attr("id").replace("collage-", "")
    console.log(name);

    // console.log(event.x, "vs", drawnMarks[name].x, "with", markOffx)

    elem.attr("x", event.x - markOffx);
    elem.attr("y", event.y - markOffy);

    drawnMarks[name].x = event.x - markOffx
    drawnMarks[name].y = event.y - markOffy
    // drawnMarks[name]
    // d3.select("circles")
    drawAllCollageAnchor()
}

function markDragEnded(event, d) {
    // if (!event.active) simulation.alphaTarget(0);
    // d.fx = null;
    // d.fy = null;
    let mark = d3.select(this)
    mark.style("cursor", "grab");
    markOffx = 0
    markOffy = 0
}


function dragElement4(elmnt) {
    var offsetX, offsetY;
    var scrollParent, prevOverflow;
    var startLeft, startTop;
    var currentX = 0, currentY = 0;
    var rafId = null;
    var hasDragged = false;
    var DRAG_THRESHOLD = 3;
    var lastClientX = 0, lastClientY = 0;
    var currentHoverTarget = null;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;

        hasDragged = false;
        if (!e.target.matches("img")) {
            const rect = elmnt.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // instead of reparenting, just let the parent stop clipping for now
            scrollParent = elmnt.parentElement;
            prevOverflow = scrollParent.style.overflow;
            scrollParent.style.overflow = "visible";

            startLeft = rect.left;
            startTop = rect.top;
            // hasDragged = false;

            elmnt.style.position = "fixed";
            elmnt.style.top = startTop + "px";
            elmnt.style.left = startLeft + "px";
            elmnt.style.margin = "0";
            elmnt.style.pointerEvents = "none";
            // no appendChild — elmnt never leaves its original spot in the DOM

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            elmnt.classList.add("draggingSample");
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        currentX = e.clientX - offsetX - startLeft;
        currentY = e.clientY - offsetY - startTop;
        lastClientX = e.clientX;
        lastClientY = e.clientY;

        if (!hasDragged && (Math.abs(currentX) > DRAG_THRESHOLD || Math.abs(currentY) > DRAG_THRESHOLD)) {
            hasDragged = true;
        }

        if (rafId === null) {
            rafId = requestAnimationFrame(applyPosition);
        }

        d3.selectAll(".paletteMark").style("border", "")
        if (e.target.matches(".paletteMark")) {
            // updateSvg();
            e.target.style.border = "dashed 3px #424242"

        } else if (e.target.parentElement.matches(".paletteMark")) {
            e.target.parentElement.style.border = "dashed 3px #424242"
            // e.target.parentElement.style.boxShadow = "0 0 0 2px rgba(255, 200, 0, 0.6)"
        }
    }

    function applyPosition() {
        elmnt.style.transform = `translate(${currentX}px, ${currentY}px)`;

        const under = document.elementFromPoint(lastClientX, lastClientY);
        const target = under ? under.closest(".paletteMark") : null;

        if (target !== currentHoverTarget) {
            if (currentHoverTarget) currentHoverTarget.classList.remove("drag-hover");
            if (target) target.classList.add("drag-hover");
            currentHoverTarget = target;
        }

        rafId = null;
    }

    function closeDragElement(e) {
        document.onmouseup = null;
        document.onmousemove = null;
        elmnt.classList.remove("draggingSample");

        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (currentHoverTarget) {
            currentHoverTarget.classList.remove("drag-hover");
        }

        elmnt.style.transform = "";
        elmnt.style.pointerEvents = "";
        elmnt.style.position = "";


        scrollParent.style.overflow = prevOverflow;

        if (hasDragged) {
            elmnt.addEventListener("click", suppressClick, {capture: true, once: true});
            d3.selectAll(".paletteMark").style("border", "")

            let telem
            if (e.target.matches(".paletteMark")) {
                telem = e.target

            } else if (e.target.parentElement.matches(".paletteMark")) {
                telem = e.target.parentElement
            }

            if (telem) {
                let key = telem.getAttribute("key")
                let number = telem.getAttribute("number")
                let tcan = telem.querySelector('canvas');
                let newCan = elmnt.querySelector('canvas');

                let th = 60
                let tw = 60

                console.log(newCan.width, newCan.height)
                if (newCan.height > th) {
                    tw = (th * newCan.width) / newCan.height
                } else {
                    // th = newCan.height
                }

                if (newCan.width > tw && th > 60) {
                    th = (tw * newCan.height) / newCan.width
                } else if (tw > 60) {

                } else {
                    // tw = newCan.width
                }

                tcan.with = tw
                tcan.height = th

                let tcon = tcan.getContext("2d")

                tcon.drawImage(newCan, 0, 0, tw, th)

                megaPalettes[key].encodings.range.marks[number].proto.canvas = cloneCanvas(newCan)
                megaPalettes[key].encodings.range.marks[number].source = cloneCanvas(newCan)
                updateSvg();
            }
        } else {

            if (!e.target.matches("img")) {

                console.log(e.target);
                let newCan = elmnt.querySelector('canvas');
                currSampleEdited = newCan
                editPalette(newCan)
            }
        }
    }

    function suppressClick(e) {
        e.stopPropagation();
        e.preventDefault();
    }
}