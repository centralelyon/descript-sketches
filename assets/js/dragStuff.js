let dragMode = "canvas"

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {

        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {

        elmnt.onmousedown = dragMouseDown;
    }

    // let bbox= elmnt.getBoundingClientRect()

    // elmnt.width = bbox.width;
    // elmnt.style.width = bbox.width+"px";


    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        dragging = true
        let bbox = elmnt.getBoundingClientRect()
        if (elmnt.className === "allPaletteRow") {
            dragMode = "palette"
            console.log(e);
            pos1 = e.pageX - e.layerX + 10;
            pos2 = e.pageY - -e.layerY + 10;
            elmnt.style.width = bbox.width + "px";
        } else {
            dragMode = "canvas"
            pos1 = e.pageX - bbox.left + 10;
            pos2 = e.pageY - bbox.top + 10;
        }

        console.log(bbox);

        // pos3 = e.offsetX
        // pos4 = e.offsetY

        elmnt.style.position = "absolute";

        // elmnt.style.top = pos4 + "px";
        // elmnt.style.left = pos3 + "px";

        console.log(e)
        // if (dragMode === "palette") {

        /*        if (dragMode === "palette") {
                    pos4 = e.layerY;
                    pos3 = e.layerX
                } else {
                    pos3 = e.clientX - e.layerX
                    pos4 = e.pageY;
                }*/

        document.onmouseup = closeDragElement;

        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // pos1 = pos3 - e.clientX;
        // pos2 = pos4 - e.clientY;

        pos3 = e.pageX - pos1;
        pos4 = e.pageY - pos2;


        // console.log(pos4);
        // set the element's new position:
        elmnt.style.position = "absolute";
        // elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.top = pos4 + "px";
        elmnt.style.left = pos3 + "px";
        // elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        // let bbox= elmnt.getBoundingClientRect()

        // elmnt.width = bbox.width;
        // elmnt.style.width = bbox.width+"px";
    }

    function closeDragElement(e) {
        // stop moving when mouse button is released:
        elmnt.style.position = "";
        elmnt.style.top = ""
        elmnt.style.left = ""
        document.onmouseup = null;
        document.onmousemove = null;

        if (dragMode === "canvas") {
            dropCanvas(e, elmnt)
        } else {
            dropPalette(e, elmnt)
        }


    }
}


function dropPalette(e, elmnt) {

    if (e.target.matches("#paletteCont")) {

        let num = +elmnt.getAttribute("number")
        let name = elmnt.getAttribute("name")
        console.log(num);
        let tpal = allPalettes[num]

        megaPalettes[name] = tpal

        fillPalette()


    }
}

function dropCanvas(e, elmnt) {
    if (e.target.matches(".paletteMark")) {

        console.log(e.target.getAttribute("number"));

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
            megaPalettes[id].encodings.range.marks[num].source = elmnt

            drawCanvasWithScale(elmnt, can, megaPalettes[id].encodings.range.scale)
        } else if (type === "morph") {

            let num = telem.getAttribute("number")
            megaPalettes[id].encodings.morph[num].proto.canvas = elmnt
            megaPalettes[id].encodings.morph[num].proto.size = [elmnt.width, elmnt.height]
            drawCanvasWithScale(elmnt, can, 1)

        }

        drawSvg()

    }
}

function drawCanvasWithScale(elmnt, can, scale) {

    if (scale == null) {
        scale = 1
    }


    let cont = can.getContext("2d")
    cont.clearRect(0, 0, can.width, can.height)
    let x = can.width / 2
    let y = can.height / 2

    let scaledW = elmnt.width * scale
    let scaledH = elmnt.height * scale

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


