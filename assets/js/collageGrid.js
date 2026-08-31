/*
function makeCartesian() {


    let toBeDrawn = new Set()

    for (const [key, value] of Object.entries(megaPalettes)) {
        if (value.apply !== undefined) {
            toBeDrawn.add(key)
            toBeDrawn.add(value.apply)
        }
    }
    let keyAr = Array.from(toBeDrawn)

    let tk = {}

    for (let i = 0; i < keyAr.length; i++) {
        tk[keyAr[i]] = "mark0"
    }


    let order = getCollageOrder(tk)

    console.log(order);
    order.shift()
    let glyphs = []

    for (let i = 0; i < order.length; i++) {
        let type = megaPalettes[order[i]].displayType

        if (type === "range") {

            let tmarks = Object.keys(megaPalettes[order[i]].encodings.range.marks)

            glyphs.push([...tmarks])

        }


    }

    // let all = cartesian(glyphs)

    let test = cartesianProduct(glyphs)

    console.log(test);


    let drawnMarks = {}
    let container = document.getElementById("AllPaletteCont")
    for (let i = 0; i < test.length; i++) {

        let tcan = document.createElement("canvas");

        tcan.width = 400;
        tcan.height = 400;
        let tcon = tcan.getContext("2d");
        let base = [tcan.width / 2, tcan.height / 2]
        for (let j = 0; j < order.length; j++) {

            let ref = megaPalettes[order[j]]

            if (ref.displayType === "range") {


                let mark = ref.encodings.range.marks[test[i][j]]

                let sc = 1
                if (ref.encodings.range.scale) {
                    sc = ref.encodings.range.scale
                }

                let sourceW = mark.source.width * sc
                let sourceH = mark.source.height * sc

                let offX = 0
                let offY = 0
                if (j === 0) {
                    offX = base[0]
                    offY = base[0]
                }

                if (ref.apply) {
                    let anchorId = ref.linkTo

                    let to = megaPalettes[ref.apply]

                    offX = drawnMarks[ref.apply].x
                    offY = drawnMarks[ref.apply].y

                    let selfAnchor = mark.proto.anchors[anchorId]

                    offX += selfAnchor.x
                    offY += selfAnchor.y

                    if (to.displayType === "range") {

                        let instancedMark = getMarkId(ref.apply, order, test[i])
                        let ToAnchor = to.encodings.range.marks[instancedMark].proto.anchors[anchorId]

                        offX -= ToAnchor.x
                        offY -= ToAnchor.y

                    }


                }


                // console.log(fr, to)
                console.log(offX, offY)

                drawnMarks[order[j]] = {x: offX, y: offY}

                tcon.drawImage(mark.source, offX - sourceW / 2, offY - sourceH / 2, sourceW, sourceH)

            }

            console.log(drawnMarks);


        }
        container.appendChild(tcan)

    }
}
*/

function getOrder(data) {


    let tk = {}

    for (let i = 0; i < data.length; i++) {
        tk[data[i]] = ""
    }
    let order = getCollageOrder(tk)
    order.shift()
    return order
}

function makeRange(palette, data, column) {

    let pal = megaPalettes[palette]
    let markKeys = Object.keys(pal.encodings.range.marks)

    let marks = pal.encodings.range.marks

    if (markKeys[0].match(/mark[0-9]/)) {

        let allVals = [...new Set(data.map(d => d[column]))]

        marks = {}

        for (let i = 0; i < allVals.length; i++) {

            if (i < markKeys.length) {
                marks[allVals[i]] = pal.encodings.range.marks[markKeys[i]]
            } else {

                let tcan = document.createElement("canvas");
                tcan.width = 60;
                tcan.height = 60;
                marks[allVals[i]] = deepClone(pal.encodings.range.marks[markKeys[0]])
                marks[allVals[i]].proto.canvas = tcan


                //todo: set a default visual when no encoding is provided

            }

        }


    }
    return marks
}

function makeMarks(encodings, dataset) {
    let marks = {}


    for (let i = 0; i < encodings.length; i++) {

        if (megaPalettes[encodings[i]].displayType === "range") {
            marks[encodings[i]] = makeRange(encodings[i], dataset, dataBinding[encodings[i]])
        } else if (megaPalettes[encodings[i]].displayType === "morph") {
            marks[encodings[i]] = makeMorph(encodings[i], dataset, dataBinding[encodings[i]])
        }

    }

    return marks
}

function makeMorph(palette, data, column) {
    let pal = megaPalettes[palette]
    let sizeScale = d3.scaleLinear(d3.extent(data.map(d => d[column])), [pal.encodings.morph.min.proto.size[0], pal.encodings.morph.max.proto.size[0]])

    return {scale: sizeScale, can: pal.encodings.morph.max.proto.canvas}
}


// function makeCollageFromData(palettes, order, marks, row, gridMark = undefined) {
//
//     let drawnMarks = {}
//
//     let tcan = document.createElement("canvas");
//     tcan.width = 400;
//     tcan.height = 400;
//
//
//     let tcon = tcan.getContext("2d");
//
//     let base = [tcan.width / 2, tcan.height / 2]
//
//     for (let j = 0; j < order.length; j++) {
//
//
//         let ref = megaPalettes[order[j]]
//         if (ref.displayType === "range") {
//
//             let mark = marks[order[j]][row[dataBinding[order[j]]]];
//             if (gridMark !== undefined) {
//                 mark =  megaPalettes[order[j]].encodings.range.marks[gridMark[order[j]]]
//
//             }
//
//             let can = mark.proto.canvas
//             let cl = 1
//
//             if (megaGlyph[order[j]].color.dataColumn !== "" && megaGlyph[order[j]].color.dataColumn !== "none") {
//                 if (megaGlyph[order[j]].color.isLinear) {
//                     let tcol = megaGlyph[order[j]].color.colorScale(megaGlyph[order[j]].color.linearScale(row[megaGlyph[order[j]].color.dataColumn])).replace("rgb(", "").replace(")", "").split(",")
//                     can = toColor(can, +tcol[0] * cl, +tcol[1] * cl, +tcol[2] * cl, 210)
//                 } else {
//                     let tcol = hexToRgb(megaGlyph[order[j]].color.colors["default"])
//                     if (megaGlyph[order[j]].color.colors[row[megaGlyph[order[j]].color.dataColumn]]) {
//                         tcol = hexToRgb(megaGlyph[order[j]].color.colors[row[megaGlyph[order[j]].color.dataColumn]])
//                     }
//
//                     can = toColor(can, tcol.r * cl, tcol.g * cl, tcol.b * cl, 210)
//                 }
//                 removeColor(230, 230, 230, can, 25)
//
//             }
//
//
//             let sc = ref.scale
//             if (megaGlyph[order[j]].size.dataColumn !== "" && megaGlyph[order[j]].size.dataColumn !== "none") {
//                 sc *= megaGlyph[order[j]].size.scale(row[megaGlyph[order[j]].size.dataColumn])
//             }
//
//             let orient = 0;
//             if (megaGlyph[order[j]].orientation.dataColumn !== "" && megaGlyph[order[j]].orientation.dataColumn !== "none") {
//                 orient = megaGlyph[order[j]].orientation.scale(row[megaGlyph[order[j]].orientation.dataColumn])
//             }
//
//
//             let sourceW = mark.proto.canvas.width * sc
//             let sourceH = mark.proto.canvas.height * sc
//
//             let offX = base[0]
//             let offY = base[0]
//
//             let toOffX = 0
//             let toOffY = 0
//             let drawX, drawY
//
//             if (ref.apply) {
//                 let anchorId = ref.linkTo
//
//                 let to = megaPalettes[ref.apply]
//
//                 //WHERE PREVIOUS WAS DRAWN
//                 offX = drawnMarks[ref.apply].x - (drawnMarks[ref.apply].w / 2)
//                 offY = drawnMarks[ref.apply].y - (drawnMarks[ref.apply].h / 2)
//
//                 if (to.displayType === "range") {
//                     let instancedMark = marks[ref.apply][row[dataBinding[ref.apply]]]
//
//                     if (gridMark !== undefined) {
//
//                         instancedMark =  megaPalettes[ref.apply].encodings.range.marks[gridMark[ref.apply]]
//
//                     }
//
//                     let ToAnchor = instancedMark.proto.anchors[anchorId]
//
//                     offX += ToAnchor.rx * drawnMarks[ref.apply].w
//                     offY += ToAnchor.ry * drawnMarks[ref.apply].h
//
//                 }
//
//                 let selfAnchor = mark.proto.anchors[anchorId]
//
//                 toOffX = selfAnchor.rx * sourceW
//                 toOffY = selfAnchor.ry * sourceH
//
//
//                 drawX = offX - toOffX
//                 drawY = offY - toOffY
//
//                 tcon.drawImage(can,
//                     drawX,
//                     drawY,
//                     sourceW,
//                     sourceH)
//
//             } else {
//                 drawX = offX - (sourceW / 2 + toOffX)
//                 drawY = offY - (sourceH / 2 + toOffY)
//
//                 tcon.drawImage(can,
//                     drawX,
//                     drawY,
//                     sourceW,
//                     sourceH)
//             }
//
//             drawnMarks[order[j]] = {x: drawX + sourceW / 2, y: drawY + sourceH / 2, w: sourceW, h: sourceH}
//
//
//         }
//
//     }
//
//
//     // return makeCanvasFit(tcan)
//
//     let bbox = getMinimalBoundingBox(tcan)
//
//     return resizeWithBbox(tcan, bbox)
//
//     // tcan
//
// }


function makeCollageFromData(palettes, order, marks, row, gridMark = undefined) {

    let drawnMarks = {}

    let tcan = document.createElement("canvas");
    tcan.width = 400;
    tcan.height = 400;


    let tcon = tcan.getContext("2d");

    let base = [tcan.width / 2, tcan.height / 2]
    let colScales = {}

    for (let j = 0; j < order.length; j++) {


        let ref = megaPalettes[order[j]]


        if (ref.displayType === "range") {

            let mark = marks[order[j]][row[dataBinding[order[j]]]];
            if (gridMark !== undefined) {
                mark =  megaPalettes[order[j]].encodings.range.marks[gridMark[order[j]]]
            }

            let can = mark.proto.canvas
            let cl = 1

            if (megaGlyph[order[j]].color.dataColumn !== "" && megaGlyph[order[j]].color.dataColumn !== "none") {
                if (megaGlyph[order[j]].color.isLinear) {
                    let tcol = megaGlyph[order[j]].color.colorScale(megaGlyph[order[j]].color.linearScale(row[megaGlyph[order[j]].color.dataColumn])).replace("rgb(", "").replace(")", "").split(",")
                    can = toColor(can, +tcol[0] * cl, +tcol[1] * cl, +tcol[2] * cl, 210)
                } else {
                    let tcol = hexToRgb(megaGlyph[order[j]].color.colors["default"])
                    if (megaGlyph[order[j]].color.colors[row[megaGlyph[order[j]].color.dataColumn]]) {
                        tcol = hexToRgb(megaGlyph[order[j]].color.colors[row[megaGlyph[order[j]].color.dataColumn]])

                    }

                    can = toColor(can, tcol[0] * cl, tcol[1] * cl, tcol[2] * cl, 210)
                }
                removeColor(230, 230, 230, can, 25)

            }


            let sc = ref.scale
            if (megaGlyph[order[j]].size.dataColumn !== "" && megaGlyph[order[j]].size.dataColumn !== "none") {
                sc *= megaGlyph[order[j]].size.scale(row[megaGlyph[order[j]].size.dataColumn])
            }


            let t = constrainWidth(mark.proto.canvas.width, mark.proto.canvas.height,75)
            let sourceW =  t.width* sc
            let sourceH = t.height* sc

            let opacity = 1

            if (megaGlyph[order[j]].opacity.dataColumn !== "" && megaGlyph[order[j]].opacity.dataColumn !== "none") {
                opacity = megaGlyph[order[j]].opacity.scale(row[megaGlyph[order[j]].opacity.dataColumn])
            }

            let rotDeg = ref.rotation || 0
            if (megaGlyph[order[j]].orientation &&
                megaGlyph[order[j]].orientation.dataColumn !== "" &&
                megaGlyph[order[j]].orientation.dataColumn !== "none") {
                rotDeg += megaGlyph[order[j]].orientation.scale(row[megaGlyph[order[j]].orientation.dataColumn])
            }
            let rotSelf = rotDeg * Math.PI / 180

            let pivotX, pivotY, pivotRx, pivotRy, cumRot

            if (ref.apply) {
                let anchorId = ref.linkTo

                let to = megaPalettes[ref.apply]
                let parent = drawnMarks[ref.apply]


                let localX = 0
                let localY = 0

                if (to.displayType === "range") {
                    let instancedMark = marks[ref.apply][row[dataBinding[ref.apply]]]

                    if (gridMark !== undefined) {

                        instancedMark =  megaPalettes[ref.apply].encodings.range.marks[gridMark[ref.apply]]

                    }

                    let ToAnchor = instancedMark.proto.anchors[anchorId]

                    localX = (ToAnchor.rx - parent.pivotRx) * parent.w
                    localY = (ToAnchor.ry - parent.pivotRy) * parent.h
                }


                let pCos = Math.cos(parent.rot)
                let pSin = Math.sin(parent.rot)

                let anchorX = parent.pivot.x + (localX * pCos - localY * pSin)
                let anchorY = parent.pivot.y + (localX * pSin + localY * pCos)

                let selfAnchor = mark.proto.anchors[anchorId]

                cumRot = parent.rot + rotSelf
                pivotX = anchorX
                pivotY = anchorY
                pivotRx = selfAnchor.rx
                pivotRy = selfAnchor.ry

                tcon.save()
                tcon.globalAlpha = opacity
                tcon.translate(pivotX, pivotY)
                tcon.rotate(cumRot)
                tcon.drawImage(can,
                    -selfAnchor.rx * sourceW,
                    -selfAnchor.ry * sourceH,
                    sourceW,
                    sourceH)
                tcon.restore()

            } else {
                cumRot = rotSelf
                pivotX = base[0]
                pivotY = base[1]
                pivotRx = 0.5
                pivotRy = 0.5

                tcon.save()
                tcon.globalAlpha = opacity
                tcon.translate(pivotX, pivotY)
                tcon.rotate(cumRot)
                tcon.drawImage(can,
                    -sourceW / 2,
                    -sourceH / 2,
                    sourceW,
                    sourceH)
                tcon.restore()
            }

            drawnMarks[order[j]] = {
                pivot: {x: pivotX, y: pivotY},
                rot: cumRot,
                w: sourceW,
                h: sourceH,
                pivotRx: pivotRx,
                pivotRy: pivotRy
            }


        }

    }


    // return makeCanvasFit(tcan)

    let bbox = getMinimalBoundingBox(tcan)

    return resizeWithBbox(tcan, bbox)

    // tcan

}


function getMarkId(name, order, test) {

    return test[order.indexOf(name)]

}



function getMarkId(name, order, test) {

    return test[order.indexOf(name)]

}

function cartesianProduct(a) {
    let i, j, l, m, a1, o = [];
    if (!a || a.length == 0) return a;

    a = cartesianProduct(a);
    for (i = 0, l = a1.length; i < l; i++) {
        if (a && a.length)
            for (j = 0, m = a.length; j < m; j++)
                o.push([a1[i]].concat(a[j]));
        else
            o.push([a1[i]]);
    }
    return o;
}