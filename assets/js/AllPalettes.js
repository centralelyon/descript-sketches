let allPalettes = []

let palSources = [
    "sudoku_time",
    "sudoku_level",
    "sudoku_hint",
    "sudoku_mistake",
    "week26_circle"

]

const prevW = 160
const prevH = 60

const subW = 30
const subH = 30


async function initAllPalette() {


    for (let i = 0; i < palSources.length; i++) {

        await loadSavedPalette(`assets/tempData/palettes/${palSources[i]}.json`);
    }


    const container = document.getElementById("AllPaletteCont");

    container.innerHTML = "";

    for (let i = 0; i < allPalettes.length; i++) {
        let tdiv = document.createElement("div");
        tdiv.className = "allPaletteRow";
        tdiv.setAttribute("number", i)
        tdiv.setAttribute("name", palSources[i])

        let canContainer = document.createElement("div");
        tdiv.innerHTML = `<p>${palSources[i]}</p>`;
        canContainer.className = "canPreview";

        tdiv.appendChild(canContainer);
        container.appendChild(tdiv);

        dragElement(tdiv)
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

            let tcan = cloneCanvas(allMarks[MarkNames[j]].source)
            tcan.style.width = `${subW}px`
            tcan.style.height = `${subH}px`

            tcan.style.left = `${offx + (j * offx)}px`
            tcan.style.top = `${(prevH - subH) - (j * offy)}px`


            canContainer.appendChild(tcan);
        }


    }

    let tPalCont = document.getElementById("paletteCont")


    tPalCont.onmouseover= function (e) {
        if (dragging) {

        this.classList.add("draggedover");
        }
    }

    tPalCont.onmouseleave= function (e) {
        if (dragging) {
            this.classList.remove("draggedover");
        }
    }



}


async function loadSavedPalette(url) {


    const palette = await d3.json(url)


    for (const [key, value] of Object.entries(palette.encodings.range.marks)) {
        if (value.proto) {
            value.proto.canvas = await convertToCanvas(value.proto.canvas)
        }

        if (value.source) {
            value.source = await convertToCanvas(value.source)
        }
    }


    let n = Object.keys(megaPalettes).length


    allPalettes.push(palette)

    // megaPalettes[`temp${n}`] = jsonObj


}


let flipSide = false
let containerWidth = 250
let offsetWidth = 15

let sideOffset = containerWidth - offsetWidth / 2
let placeHolderBool = true


function openNav() {
    let container = document.getElementById("sidebar")
    let containerImg = document.getElementById("sideArrow")


    flipSide = !flipSide

    let img = document.getElementById("sideImg");

    if (flipSide) {
        img.style.transform = "";
        container.style.width = `${containerWidth}px`

        // containerImg.style.right = `${sideOffset}px`

        container.style.border = "solid 1px #333"
        container.style.height = `${80.5}vh`
        container.style.top = `${6}%`

        document.querySelectorAll(".sideContent").forEach(el => {
            el.style.display = "inline-block";
        })
    } else {
        img.style.transform = "scaleX(-1)";
        container.style.width = `${offsetWidth}px`
        containerImg.style.right = "-22px";

        container.style.height = `${35}vh`
        container.style.top = `${30}%`

        document.querySelectorAll(".sideContent").forEach(el => {
            el.style.display = "none";
        })
    }


}