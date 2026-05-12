let drawnMarks = {}
const spiralOptions = {
    padding: 30,
    step: 16,
    maxRadius: 350,
};

let tFrom, tTo = {}

let anchoring = false

let newAnchors = []

let anchoringRef = ""

function placeMark() {

    let rects = Object.keys(drawnMarks).map(d => drawnMarks[d])
    if (Object.keys(drawnMarks).length === 0) {
        return {x: 250 - 30, y: 250 - 30, w: 60, h: 60};
    } else {
        return placeRectangleSpiral(rects,
            {w: 60, h: 60}, spiralOptions
        )
    }

}

function addPaletteInfoToCollage(palette, name) {

    let svg = d3.select("#composition")

    let show = palette.encodings.range.marks["mark0"].proto.canvas

    drawnMarks[name] = placeMark()
    console.log(drawnMarks[name]);
    svg.append("image")
        .attr("class", "collageElement")
        .attr("xlink:href", show.toDataURL("image/png"))
        .attr("id", `collage-${name}`)
        .attr("x", drawnMarks[name].x)
        .attr("y", drawnMarks[name].y)
        .attr("width", drawnMarks[name].w)
        .attr("height", drawnMarks[name].h)
        .on("click", function (e) {
            let elem = e.target
            console.log(e)
            if (!anchoring) {
                anchoring = true
                anchoringRef = name


                let imCord = {x: +elem.getAttribute("x"), y: +elem.getAttribute("y")}


                let offx = e.offsetX - imCord.x
                let offy = e.offsetY - imCord.y
                svg.append("circle")
                    .attr("cx", drawnMarks[name].x + offx)
                    .attr("cy", drawnMarks[name].y + offy)
                    .attr("r", 5)
                    .attr("fill", drawnMarks[name].x)

                tFrom = {x: drawnMarks[name].x + offx, y: drawnMarks[name].y + offy, rx: offx, ry: offy, name: name}

            } else {
                if (anchoringRef !== name) {

                    let imCord = {x: +elem.getAttribute("x"), y: +elem.getAttribute("y")}


                    let offx = e.offsetX - imCord.x
                    let offy = e.offsetY - imCord.y


                    svg.append("circle")
                        .attr("cx", drawnMarks[name].x + offx)
                        .attr("cy", drawnMarks[name].y + offy)
                        .attr("r", 5)
                        .attr("fill", drawnMarks[name].x)

                    //TODO: Add a link
                    tTo = {x: drawnMarks[name].x + offx, y: drawnMarks[name].y + offy, rx: offx, ry: offy, name: name}


                    const cx = (tFrom.x + tTo.x) / 2;
                    const curve = 2;

                    svg.append("path")
                        // .attr("d", `M ${tFrom.x} ${tFrom.y} Q ${cx} ${curve} ${tTo.x} ${tTo.y}`)
                        .attr("d", makeLink(tFrom.x, tFrom.y, tTo.x, tTo.y))
                        .attr("stroke-width", 3)
                        .attr("stroke", "red")
                        .attr("fill", "none")
                    // .attr("stroke", drawnMarks[name].x)


                } else {
                    let imCord = {x: +elem.getAttribute("x"), y: +elem.getAttribute("y")}


                    let offx = e.offsetX - imCord.x
                    let offy = e.offsetY - imCord.y
                    svg.append("circle")
                        .attr("cx", drawnMarks[name].x + offx)
                        .attr("cy", drawnMarks[name].y + offy)
                        .attr("r", 5)
                        .attr("fill", drawnMarks[name].x)

                }
            }
        })


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
    const center = {x: 250, y: 250}

    const containerWidth = 500
    const containerHeight = 500;

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

    return null;
}

