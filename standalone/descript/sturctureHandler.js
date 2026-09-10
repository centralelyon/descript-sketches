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

function getOrder(data) {


    let tk = {}

    for (let i = 0; i < data.length; i++) {
        tk[data[i]] = ""
    }
    let order = getCollageOrder(tk)
    order.shift()
    return order
}


function getCollageOrder(drawingData) {

    let order = []

    let links = getRelationships(drawingData)

    let graph = pairsToIndex(links)

    let res = listNode(graph[""])

    return res
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

function getFromTo(key, data, value) {

    if (data.hasOwnProperty(key)) {
        if (value.apply) {
            if (typeof value.apply !== "string") //Shameless stuff to avoid to fix cat apply to mark issue
                value.apply = value.apply.key
            // return [key, value.apply]
            return [value.apply, key]
        } else {
            return ["", key]
            // return [key, ""]
        }
    }
    return false
}


function getRelationships(drawingData) {
    let res = []
    for (const [key, value] of Object.entries(megaPalettes)) {
        let t = getFromTo(key, drawingData, value)
        if (t) {
            res.push(t)
        }
    }
    return res
}

function pairsToIndex(pairs) {
    return pairs.reduce((index, pair, i, list) => {
        let [parent, child] = pair;

        let parent_exists = index.hasOwnProperty(parent);
        let child_exists = index.hasOwnProperty(child);

        if (!parent_exists) {
            index[parent] = {key: parent, children: []};
        }

        if (!child_exists) {
            index[child] = {key: child, children: []};
        }

        let rel_captured = Boolean(index[parent].children.find((c) => c.key === child));

        if (!rel_captured) {
            index[parent].children.push(index[child]);
        }

        return index;
    }, {});
}

function listNode(node) {
    return Array.prototype.concat.apply([node.key], node.children.map(listNode));

}