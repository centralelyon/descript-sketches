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

    let all = cartesian(glyphs)

    let test = cartesianProduct(glyphs)


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
                marks[allVals[i]] = pal.encodings.range.marks[markKeys[0]] //todo: set a default visual when no encoding is provided
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

function makeCollageFromData(palettes, order, marks, row) {


    let drawnMarks = {}


    let tcan = document.createElement("canvas");
    tcan.width = 400;
    tcan.height = 400;


    let tcon = tcan.getContext("2d");

    let base = [tcan.width / 2, tcan.height / 2]

    for (let j = 0; j < order.length; j++) {

        let ref = megaPalettes[order[j]]

        if (ref.displayType === "range") {

            let mark = marks[order[j]][row[dataBinding[order[j]]]];

            let sc = 1
            if (ref.encodings.range.scale) {
                sc = ref.encodings.range.scale
            }

            let sourceW = mark.source.width * sc
            let sourceH = mark.source.height * sc

            let offX = base[0]
            let offY = base[0]


            if (ref.apply) {
                let anchorId = ref.linkTo

                let to = megaPalettes[ref.apply]

                //WHERE PREVIOUS WAS DRAWN
                offX = drawnMarks[ref.apply].x
                offY = drawnMarks[ref.apply].y

                let selfAnchor = mark.proto.anchors[anchorId]

                offX += selfAnchor.rx * sourceW
                offY += selfAnchor.ry * sourceH

                if (to.displayType === "range") {
                    let instancedMark = marks[ref.apply][row[dataBinding[ref.apply]]]
                    let ToAnchor = instancedMark.proto.anchors[anchorId]
                    let tsc = 1
                    if (instancedMark.scale) {
                        tsc = instancedMark.scale
                    }
                    offX -= ToAnchor.rx * (instancedMark.source.width * tsc)
                    offY -= ToAnchor.ry * (instancedMark.source.height * tsc)

                }
            }

            drawnMarks[order[j]] = {x: offX, y: offY, w: sourceW, h: sourceH}



            tcon.drawImage(mark.source, offX - sourceW / 2, offY - sourceH / 2, sourceW, sourceH)

        }
        // console.log(drawnMarks);


    }


    // return makeCanvasFit(tcan)

    let bbox = getMinimalBoundingBox(tcan)

    return resizeWithBbox(tcan, bbox)

    // tcan

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