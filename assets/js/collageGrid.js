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


    let order =  getCollageOrder(tk)

    console.log(order);

}


