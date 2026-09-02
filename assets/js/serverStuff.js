const serverBaseUrl = "https://randou.liris.cnrs.fr/vizapi/descript-sketches/"

let username = ""
let password = ""
let credentials = ""
let useServer = true
let imgList

async function getPaletteList() {

    let palettes = await d3.json(serverBaseUrl + "palettes")


    for (const [key, value] of Object.entries(palettes)) {
        let t
        if (paletteType === "eval1" && (value.name.startsWith("week15") || value.name.startsWith("week47") || value.name.startsWith("week05")|| value.name.startsWith(participant))) {
            t = await loadStateFromJson(serverBaseUrl + "palettes/" + value.name)


        } else if (paletteType === "eval2") {
            if (value.name.startsWith("week")) {
                t = await loadStateFromJson(serverBaseUrl + "palettes/" + value.name)
            }

        } else if (paletteType === "all") {
            t = await loadStateFromJson(serverBaseUrl + "palettes/" + value.name)
        }

        if (t !== undefined) {

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

            if (tfileName !== "") {

                if (!imgList.map(d => d.name).includes(tfileName)) {
                    await pushImage(palette.originImg, tfileName)

                }
                tt.originImg = serverBaseUrl + "images/" + tfileName
            }
        } else {
            console.log(tt.originImg);
            // await pushImage(palette.originImg, name)
            tt.originImg = currImg.src
        }
    }

    const blob = new Blob([JSON.stringify(tt)], {type: "application/json"})
    const data = new FormData();

    data.append(
        "file",
        blob,
        participant+'_'+name + ".json"
    );


    fetch(serverBaseUrl + "palettes", {
        method: 'POST',
        headers: {
            "Authorization": `Basic ${credentials}`,
        },
        body: data
    })
}

async function pushImage(img, name) {
    if (credentials === "") {
        await login();
    }
    img.crossOrigin = "anonymous";


    const MAX_SIZE = 1024;

    let width = img.naturalWidth;
    let height = img.naturalHeight;

    if (width > MAX_SIZE || height > MAX_SIZE) {
        const scale = Math.min(
            MAX_SIZE / width,
            MAX_SIZE / height
        );

        width = Math.round(width * scale);
        height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);


    const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
    );

    const data = new FormData();
    data.append("file", blob, name + ".png");

    await fetch(serverBaseUrl + "images", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
        },
        body: data
    });
}


/*
async function pushImage(img, name) {

    if (credentials === "") {
        login()
    }

    const data = new FormData();


    const blob = new Blob([img], {type: 'image/png'})


    data.append(
        "file",
        blob,
        name + ".png"
    );

    await fetch(serverBaseUrl + "images", {
        method: 'POST',
        headers: {
            "Authorization": `Basic ${credentials}`,
        },
        body: data
    })


}*/
