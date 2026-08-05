let reducedDim = [0, 0]
let tfileName = ""

function loadImg(src) {

    let im = new Image();
    im.crossOrigin = "Anonymous";

    im.onload = function () {
        currImg = im
        im.crossOrigin = "anonymous";
        let can = document.getElementById("inVis")

        let cont = can.getContext('2d');
        fitCanvas(can, im)

        // enableZoomPan(can, im)

        // let rate = fixRatio2([im.width, im.height], [can.getBoundingClientRect().width, 9999])


        // cont.drawImage(im, 0, 0, rate[0], rate[1])


        let th = Math.min(im.height, viewDim[1])
        // let tw = Math.min(im.width, th * tRatio)

        let tw = Math.min((im.width * th) / im.height, viewDim[0])


        reducedDim = [tw, th]

        cont.drawImage(im, 0, 0, tw, th);

        // fillSvg(sampleData)
        // addAPalette()

    };

    im.src = src
    im.decode()
    // addAPalette()

}


function fitCanvas(canvas, image) {
    let trect = document.getElementById("inVisHolder").getBoundingClientRect()
    let tScreenHeight = window.innerHeight;


    console.log(image.width);

    let tRatio = image.width / image.height;

    // let tw =
    // let th = Math.min(image.height, tScreenHeight * 0.72)
    // let tw = Math.min(image.width, th * tRatio)
    let t = Math.min(Math.round((image.height * trect.width) / image.width), tScreenHeight * 0.71)
    viewDim = [trect.width, t]

    let th = Math.min(image.height, viewDim[1])
    // let tw = Math.min(im.width, th * tRatio)

    let tw = Math.min((image.width * th) / image.height, viewDim[0])


    reducedDim = [tw, th]

    canvas.width = viewDim[0]
    canvas.style.width = viewDim[0] + 'px';
    canvas.style.height = viewDim[1] + "px"
    canvas.height = viewDim[1]
    enableZoomPan(canvas, image)
}


function drawSamples(samples) {

    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');

    // cont.strokeStyle = "#fff";
    cont.clearRect(0, 0, can.width, can.height);
    cont.rect(0, 0, can.width, can.height);
    cont.fillStyle = "#000";
    cont.fill()
    cont.globalAlpha = 0.6
    cont.drawImage(currImg, 0, 0, can.width, can.height);
    cont.globalAlpha = 1

    for (let i = 0; i < samples.length; i++) {

        const sample = samples[i];

        // if (sample["data"]) {
        //     if (sample.data["orientation"]) {
        //         const tx = sample.rx * can.width
        //         const ty = sample.ry * can.height;
        //         const tw = sample.rWidth * can.width
        //         const th = sample.rHeight * can.height
        //
        //         cont.save()
        //         cont.translate(tx, ty);
        //         cont.rotate(sample.orientation * Math.PI / 180);
        //
        //         cont.drawImage(sample.canvas, -tw/ 2, -th / 2, tw, th);
        //         cont.restore();
        //     } else {
        cont.drawImage(
            sample.canvas,
            sample.rx * can.width,
            sample.ry * can.height,
            sample.rWidth * can.width,
            sample.rHeight * can.height
        );
        // }
        // }


    }

}


function resetImg() {

    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');


    cont.drawImage(currImg, 0, 0, ...viewDim);
}

function importImg(e) {
    const reader = new FileReader();

    clearExamples()
    reader.onload = function (e) {

        // currImg = e.target.result;

        purge()
        loadImg(e.target.result);
        // console.log(currImg);
        switchMode("rect")

    }

    let split = e.target.files[0].name.split(".")

    split.pop()
    tfileName = split.join(".")
    reader.readAsDataURL(e.target.files[0]);
}

