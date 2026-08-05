const serverBaseUrl = "https://randou.liris.cnrs.fr/vizapi/descript-sketches/"

let username = ""
let password = ""
let credentials = ""
let useServer = true
let imgList

async function getPaletteList() {

    let palettes = await d3.json(serverBaseUrl + "palettes")


    for (const [key, value] of Object.entries(palettes)) {

        let t = await loadStateFromJson(serverBaseUrl + "palettes/" + value.name)

        console.log(t);

        if (!t.preloadName) {
            t.originImg = await getImage(t.originImg)
        } else {
            if (t.preloadName !== "") {
                t.originImg = preload[t.preloadName];

            }
        }


        appendSingle(t, value.name)
    }

}


function login() {
    username = prompt("Username:");
    password = prompt("Password:");

    credentials = btoa(`${username}:${password}`);
}


function switchUseServer(val) {

    useServer = val;
}

async function uploadPalette(palette, name) {

    if (imgList === undefined) {
        imgList = await d3.json(serverBaseUrl + "images")
        console.log(imgList);
    }


    if (credentials === "") {
        login()
    }
    let tsrc = palette.originImg.src

    let tt = JSON.parse(dumpObject(palette))
    if (tt.preloadName) {
        tt.originImg = ""
    } else {

        if (tsrc.includes("data:image")) {
            pushImage(palette.originImg, name)
        }

        tt.originImg = serverBaseUrl + "images/" + name + ".png"
    }


    const blob = new Blob([JSON.stringify(tt)], {type: "application/json"})
    const data = new FormData();

    data.append(
        "file",
        blob,
        name + ".json"
    );


    fetch(serverBaseUrl + "palettes", {
        method: 'POST',
        headers: {
            "Authorization": `Basic ${credentials}`,
        },
        body: data
    })
}


function pushImage(img, name) {

    if (credentials === "") {
        login()
    }

    const data = new FormData();


    data.append('file', {
        uri: img.src,
        name: name,
        type: 'image/png',
    })


    fetch(serverBaseUrl + "images", {
        method: 'POST',
        headers: {
            "Authorization": `Basic ${credentials}`,
        },
        body: data
    })
}