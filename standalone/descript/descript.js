
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