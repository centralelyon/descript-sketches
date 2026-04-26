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
    console.log(typeof order)
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
    console.log(glyphs);
    console.log(all);
    let test = cartesianProduct(glyphs)

    console.log(test);


    for (let i = 0; i < test.length; i++) {

        let tcan = document.createElement("canvas");

        tcan.width = 400;
        tcan.height = 400;
        let tcon = tcan.getContext("2d");
        let base
        for (let j = 0; j < order.length; j++) {

            let ref = megaPalettes[order[j]].encodings.get(order[j])

        }

    }
}


const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));


function cartesianProduct(a) { // a = array of array
    var i, j, l, m, a1, o = [];
    if (!a || a.length == 0) return a;

    a1 = a.splice(0, 1)[0]; // the first array of a
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