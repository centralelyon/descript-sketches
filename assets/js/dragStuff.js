function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {

        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {

        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        dragging = true


        pos3 = e.clientX - e.layerX
        pos4 = e.pageY;
        document.onmouseup = closeDragElement;

        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.pageY;
        pos3 = e.clientX;
        pos4 = e.pageY;

        // set the element's new position:
        elmnt.style.position = "absolute";
        // elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.top = pos4 + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement(e) {
        // stop moving when mouse button is released:
        elmnt.style.position = "";
        elmnt.style.top = ""
        elmnt.style.left = ""
        document.onmouseup = null;
        document.onmousemove = null;


        if (e.target.matches(".paletteMark")) {

            console.log(e.target.getAttribute("number"));

        } else if (e.target.parentElement.matches(".paletteMark")) {

            let telem = e.target.parentElement


            let id = telem.id.split("_")[1];


            let num = telem.getAttribute("number")
            marks[id][num].source = elmnt
            let can = e.target

            drawCanvasWithScale(elmnt, can, marks[id].scale)


        }
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


