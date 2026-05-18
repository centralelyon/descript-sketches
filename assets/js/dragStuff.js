let dragMode = "canvas"

let dragging = false;

let offsetX = 0;
let offsetY = 0;


function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.onmousedown = dragMouseDown;


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


        elmnt.style.left =
            (e.pageX - offsetX) + "px";

        elmnt.style.top =
            (e.pageY - offsetY) + "px";

        // elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        // elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

    }

    function closeDragElement(e) {
        // stop moving when mouse button is released:
        elmnt.style.position = "";
        elmnt.style.top = ""
        elmnt.style.left = ""
        document.onmouseup = null;
        document.onmousemove = null;
        dragging = false

        console.log(e.target);
        if (dragMode === "canvas") {
            dropCanvas(e, elmnt)
        } else {
            dropPalette(e, elmnt)
        }


    }
}


function dropPalette(e, elmnt) {

    if (e.target.matches("#paletteCont") || e.target.matches(".paletteMark") || e.target.matches(".paletteMarks")) {

        let num = +elmnt.getAttribute("number")
        let name = elmnt.getAttribute("name")
        console.log(num);
        let tpal = allPalettes[num]

        megaPalettes[name] = tpal

        fillPalette()

        let tPalCont = document.getElementById("paletteCont")
        tPalCont.classList.remove("draggedover")
    } else if (e.target.matches("#composition")) {


        let num = +elmnt.getAttribute("number")
        let name = elmnt.getAttribute("name")
        addPaletteInfoToCollage(allPalettes[num],name)
        megaPalettes[name] = allPalettes[num]

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
        makeMarkTree()
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


