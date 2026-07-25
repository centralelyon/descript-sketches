function testEdge() {
    let src = opencv.imread('inVis');

    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 0);
    let ksize = new opencv.Size(5, 5);

    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);
//17, 16
    opencv.adaptiveThreshold(src, src, 200, opencv.ADAPTIVE_THRESH_GAUSSIAN_C, opencv.THRESH_BINARY, 17, 16);

    let contours = new opencv.MatVector();
    let hierarchy = new opencv.Mat();

    let contours2 = new opencv.MatVector();
    let hierarchy2 = new opencv.Mat();

// You can try more different parameters
    opencv.findContours(src, contours, hierarchy, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);


    for (let i = 0; i < contours.size(); ++i) {

        // let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
        //     Math.round(Math.random() * 255));

        let color = new opencv.Scalar(255, 255, 255);

        opencv.drawContours(temp, contours, i, color, 5, opencv.LINE_8, hierarchy, 100);
    }
    opencv.cvtColor(temp, temp, opencv.COLOR_RGBA2GRAY, 0);
    opencv.findContours(temp, contours2, hierarchy2, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);

    const points = []
    for (let i = 0; i < contours2.size(); ++i) {


        if ((hierarchy2.intPtr(0, i)[0] !== -1 || hierarchy2.intPtr(0, i)[1] !== -1) && hierarchy2.intPtr(0, i)[3] == 1) {
            // if (hierarchy2.intPtr(0, i)[3] == 1) {
            // console.log(hierarchy2.intPtr(0, i));
            let tt = opencv.contourArea(contours.get(i), false)
            // console.log(tt)
            if (tt > 1) {
                const ci = contours2.get(i)
                let temp = []

                for (let j = 0; j < ci.data32S.length; j += 2) {
                    let p = {}
                    p.x = ci.data32S[j]
                    p.y = ci.data32S[j + 1]
                    temp.push(p)
                }
                points.push([...temp])


                // let color = new opencv.Scalar(255, 255, 255);
                let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                    Math.round(Math.random() * 255));
                // opencv.drawContours(dst, contours2, i, color, 1, opencv.LINE_8, hierarchy2, 100);
            }

        }

    }
    contours2Marks(points)


    /*    let square_point_data = new Int32Array(contours.get(0));
        let npts = x_arr.length
        let square_points = opencv.matFromArray(npts, 1, opencv.CV_32SC2, square_point_data);
        let pts = new opencv.MatVector()
        pts.push_back (square_points);
        let color = [160, 32, 240, 0.7]
        opencv.fillPoly(tmp_mat, pts, color)

        const markersVector = new opencv.MatVector();
        markersVector.push_back(contours.get(0));

        for (let i = 0; i < contours.size(); ++i) {
            opencv.fillPoly(dst, pts=markersVector, color=0)
        }*/
    // opencv.imshow('inVis', dst);
    src.delete();
    dst.delete();
    temp.delete();

    contours.delete();
    hierarchy.delete();
    contours2.delete();
    hierarchy2.delete();

}


function contours2Marks(conts) {


    let can = document.getElementById("inVis")
    let trec = can.getBoundingClientRect()
    let tx = trec.width
    let ty = trec.height

    let tpoints = conts[0].map(d => ([d.x, d.y]))
    const tcorners = getRect(tpoints)

    // console.log(tcorners);
    // console.log(tpoints);

    for (let i = 0; i < conts.length; i++) {


        let tcan = document.createElement('canvas');
        let tcont = tcan.getContext('2d');
        const points = conts[i].map(d => ([d.x, d.y]))
        const corners = getRect(points)


        // console.log(points);

        tcan.width = corners[1][0] - corners[0][0]
        tcan.height = corners[1][1] - corners[0][1]

        tcan.style.border = "solid " + categories[selectedCategory].color + " 2px"


        let tw = corners[1][0] - corners[0][0]
        let th = corners[1][1] - corners[0][1]
        let tcat = {}

        tcat[selectedCategory] = categories[selectedCategory]

        const vectors = PCA.getEigenVectors(points)

        const angle = get_orr(vectors[0].vector, vectors[1].vector)


        let tres = {
            x: corners[0][0],
            y: corners[0][1],
            width: tw,
            height: th,
            type: "contour",
            // orr: angle,
            perimeter: [...points],
            canvas: tcan,
            // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
            rx: corners[0][0] / tx,
            ry: corners[0][1] / ty,
            rWidth: tw / tx,
            rHeight: th / ty,
            categories: tcat,
            data: {
                orientation: {value: Math.round(angle * 100) / 100}
            }
        }

        tcont.strokeStyle = "rgba(255,255,255,0)"

        tcont.beginPath();
        tcont.moveTo(points[0][0] - corners[0][0], points[0][1] - corners[0][1]);
        for (let i = 1; i < points.length; i++) {
            tcont.lineTo(points[i][0] - corners[0][0], points[i][1] - corners[0][1]);
        }
        tcont.stroke()
        tcont.closePath();
        tcont.clip()


        tcont.drawImage(currImg,
            tres.rx * currImg.width,
            tres.ry * currImg.height,
            tres.rWidth * currImg.width,
            tres.rHeight * currImg.height,
            0,
            0,
            tw,
            th
        )


        let marks = document.getElementById("marks")

        marks.append(tcan)

        sampleData.push(tres)
    }
    fillSvg(sampleData)
}

function morphCountours(src, counts) {
    for (let i = 0; i < counts.size(); ++i) {
        opencv.fillPoly(src, pts = [counts.get(i)], color = 0)

    }
}

async function onOpenCvReady(e) {
    opencv = await cv
    // console.log(t);
}

function testClean() {
    let src = opencv.imread('modalCanvas');
    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let ksize = new opencv.Size(5, 5);

    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);
    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 0);


    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);
    opencv.adaptiveThreshold(src, src, 120, opencv.ADAPTIVE_THRESH_GAUSSIAN_C, opencv.THRESH_BINARY, 13, 12);
    let contours = new opencv.MatVector();
    let hierarchy = new opencv.Mat();


    opencv.findContours(src, contours, hierarchy, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); ++i) {

        let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
            Math.round(Math.random() * 255));

        if (hierarchy.intPtr(0, i)[0] < 1) {
            opencv.drawContours(temp, contours, i, color, 1, opencv.LINE_8, hierarchy, 100);
        }
    }

    opencv.imshow('modalCanvas', temp);


    src.delete();
    dst.delete();
    temp.delete();

    contours.delete();
    hierarchy.delete();

}

function removeColor(r, g, b, can, range = 15) {
    let lower = [inBound(b - range), inBound(g - range), inBound(r - range), 0];
    let higher = [inBound(b + range), inBound(g + range), inBound(r + range), 255];
    let src = opencv.imread(can);
    let dst = new opencv.Mat();
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let low = new opencv.Mat(src.rows, src.cols, src.type(), lower);
    let high = new opencv.Mat(src.rows, src.cols, src.type(), higher);
    opencv.inRange(src, low, high, temp);

    opencv.bitwise_not(temp, temp)
    opencv.bitwise_and(src, src, dst, mask = temp)

    // opencv.imshow('modalCanvas', src);
    opencv.imshow(can, dst);


    src.delete();
    dst.delete();
    low.delete();
    temp.delete();
    high.delete();
}

function inBound(pixel) {
    return Math.max(Math.min(pixel, 255), 0)
}

function getnDominant(n = 5) {
    let src = opencv.imread('modalCanvas');
    let criteria = (opencv.TERM_CRITERIA_EPS + opencv.TERM_CRITERIA_MAX_ITER, n, 1.0)
    opencv.KMEANS_RANDOM_CENTERS
    var labels = new opencv.Mat();
    var centers = new opencv.Mat();

    let t = opencv.kmeans(src, n, labels, criteria, n, centers)

    console.log(t);
}

//Use of  Brensenham line Algo
function getPixelsOnLine(ctx, startX, startY, endX, endY) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const pixelCols = [];

    const getPixel = (x, y) => {
        if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
            return "rgba(0,0,0,0)";
        }
        let ind = (x + y * imageData.width) * 4;
        return [data[ind++], data[ind++], data[ind++], data[ind++] / 255];
    }

    var x = Math.floor(startX);
    var y = Math.floor(startY);
    const xx = Math.floor(endX);
    const yy = Math.floor(endY);
    const dx = Math.abs(xx - x);
    const sx = x < xx ? 1 : -1;
    const dy = -Math.abs(yy - y);
    const sy = y < yy ? 1 : -1;
    var err = dx + dy;
    var e2;
    var end = false;
    while (!end) {
        pixelCols.push(getPixel(x, y));
        if ((x === xx && y === yy)) {
            end = true;
        } else {
            e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y += sy;
            }
        }
    }
    return pixelCols;
}

function testCount() {
    let can = marks["anxiety"][6].proto.canvas

    let cont = can.getContext("2d")

    let pixels = getPixelsOnLine(cont, 0, can.height, can.width, 0)


    let colors = []
    let range = 20

    let taboo = [[0, 0, 0, 0], [250, 250, 250, 1]]

    console.log(pixels.length);

    let setcol = {}
    pixels = pixels.map(pixel => {
        if (typeof pixel === 'string') {
            let r = parseInt(pixel[5]);
            let g = parseInt(pixel[7]);
            let b = parseInt(pixel[9]);

            return [r, g, b]
        } else {
            return pixel;
        }
    }).splice(1, pixels.length - 1)

    if (pixels.length > 0) {

        setcol[pixels[0].join()] = 0
        colors.push(pixels[0]);
    }

    let tkeys = Object.keys(setcol);

    for (let i = 1; i < pixels.length; i++) {

        // if (!taboo.includes(pixels[i])) {

        if (!tkeys.includes(pixels[i].join())) {
            let breaked = false
            for (let j = 0; j < colors.length; j++) {
                if (deltaE(pixels[i], colors[j]) < 12) {

                    setcol[colors[j].join()]++
                    tkeys = Object.keys(setcol);
                    breaked = true
                    break
                }
            }
            if (!breaked) {
                setcol[pixels[i].join()] = 0
                tkeys = Object.keys(setcol);
                colors.push(pixels[i]);
            }
        } else {
            setcol[pixels[i].join()]++
        }


    }

    delete setcol["0,0,0,0"]
    delete setcol["0,0,0"]

    console.log(colors);
    console.log(setcol);

}


function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);

    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb) {
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

// c1 in c2+range
function pixelInRange(c1, c2, range) {

    let res = [false, false, false]
    //skip alpha stuff
    for (let i = 0; i < c1.length - 1; i++) {
        if (c1[i] > c2[i] - range && c1[i] < c2[i] + range) {
            res[i] = true;
        } else {
            return false;
        }

    }
    return true
}


function getBBox(canvas) {
    let src = opencv.imread(canvas);

    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 0);
    let ksize = new opencv.Size(5, 5);

    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);

    opencv.adaptiveThreshold(src, src, 200, opencv.ADAPTIVE_THRESH_GAUSSIAN_C, opencv.THRESH_BINARY, 17, 16);

    let contours = new opencv.MatVector();
    let hierarchy = new opencv.Mat();

    let contours2 = new opencv.MatVector();
    let hierarchy2 = new opencv.Mat();

// TODO: fine-tune parameters
    opencv.findContours(src, contours, hierarchy, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);


    for (let i = 0; i < contours.size(); ++i) {

        // let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
        //     Math.round(Math.random() * 255));

        let color = new opencv.Scalar(255, 255, 255);

        opencv.drawContours(temp, contours, i, color, 14, opencv.LINE_8, hierarchy, 100);
    }
    opencv.cvtColor(temp, temp, opencv.COLOR_RGBA2GRAY, 0);
    opencv.findContours(temp, contours2, hierarchy2, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);

    const points = []
    for (let i = 0; i < contours2.size(); ++i) {
        hierarchy2
        if (hierarchy2.intPtr(0, i)[3] > 0) {
            let tt = 0

            if (i < contours.size()) {
                tt = opencv.contourArea(contours.get(i), false)
            }

            if (tt > 1) {
                const ci = contours2.get(i)
                let temp = []

                for (let j = 0; j < ci.data32S.length; j += 2) {
                    let p = {}
                    p.x = ci.data32S[j]
                    p.y = ci.data32S[j + 1]
                    temp.push(p)
                }
                points.push([...temp])


                // let color = new opencv.Scalar(255, 255, 255);
                let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                    Math.round(Math.random() * 255));
                opencv.drawContours(dst, contours2, i, color, 1, opencv.LINE_8, hierarchy2, 100);
            }

        }

    }

    src.delete();
    dst.delete();
    temp.delete();

    contours.delete();
    hierarchy.delete();
    contours2.delete();
    hierarchy2.delete();

    let corners = [[undefined, undefined], [undefined, undefined]]
    for (let i = 0; i < points.length; i++) {
        const tpoints = points[i].map(d => ([d.x, d.y]))
        const tcorners = getRect(tpoints)

        for (let j = 0; j < corners.length; j++) {
            for (let k = 0; k < corners.length; k++) {

                if (corners[j][k] === undefined) {
                    corners[j][k] = tcorners[j][k]
                } else if (j === 0) {
                    if (corners[j][k] > tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                    if (corners[j][k] > tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                } else if (j === 1) {
                    if (corners[j][k] < tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                    if (corners[j][k] < tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                }
            }
        }
    }
    return corners
}



// function toColor(canvas, r, g, b, threshold) {
//
//     let src = opencv.imread(canvas);
//     let temp2 = opencv.Mat.ones(src.rows, src.cols, opencv.CV_8UC3);
//
//     let res = document.createElement("canvas")
//     res.width = canvas.width
//     res.height = canvas.height
//
//
//     let color = new opencv.Scalar(r, g, b, 255)
//     let white = new opencv.Scalar(255, 255, 255, 255)
//
//
//     temp2.setTo(white)
//
//     let lower = [10, 10, 10, 255]
//     let higher = [threshold, threshold, threshold, threshold]
//
//     opencv.cvtColor(src, src, opencv.COLOR_RGBA2RGB, 3);
//     opencv.cvtColor(src, src, opencv.COLOR_RGB2GRAY, 3);
//
//
//     let low = new opencv.Mat(src.rows, src.cols, src.type(), lower);
//     let high = new opencv.Mat(src.rows, src.cols, src.type(), higher);
//
//     opencv.inRange(src, low, high, src);
//
//     opencv.cvtColor(temp2, temp2, opencv.COLOR_RGB2RGBA, 4);
//
//     // let M = opencv.Mat.ones(2, 2, opencv.CV_8U);
//     // let p = new opencv.Point(-1, -1)
//     // opencv.dilate(src, src, M, p, 1, opencv.BORDER_CONSTANT, opencv.morphologyDefaultBorderValue());
//
//     temp2.setTo(color, src)
//
//     opencv.imshow(res, temp2);
//
//     src.delete();
//     // M.delete();
//     temp2.delete();
//     // color.delete();
//     // low.delete();
//     // high.delete();
//
//     return res
//
// }

function toColor(canvas, r, g, b, threshold) {
    let src = opencv.imread(canvas);

    let gray = new opencv.Mat();
    opencv.cvtColor(src, gray, opencv.COLOR_RGBA2GRAY);

    let lowScalar = new opencv.Scalar(10);
    let highScalar = new opencv.Scalar(threshold);

    let low = new opencv.Mat(gray.rows, gray.cols, gray.type(), lowScalar);
    let high = new opencv.Mat(gray.rows, gray.cols, gray.type(), highScalar);

    let mask = new opencv.Mat();
    opencv.inRange(gray, low, high, mask);

    let white = new opencv.Scalar(255, 255, 255, 255);
    let dst = new opencv.Mat(src.rows, src.cols, opencv.CV_8UC4, white);


    let targetColor = new opencv.Scalar(r, g, b, 255);
    dst.setTo(targetColor, mask);

    let res = document.createElement("canvas");
    res.width = canvas.width;
    res.height = canvas.height;
    opencv.imshow(res, dst);


    src.delete();
    gray.delete();
    low.delete();
    high.delete();
    mask.delete();
    dst.delete();

    return res;
}

function otherGrab(can, coords, featherAmount = 5) {
    let src = opencv.imread(can);
    opencv.cvtColor(src, src, opencv.COLOR_RGBA2RGB, 0);

    let mask = new opencv.Mat();
    let bgdModel = new opencv.Mat();
    let fgdModel = new opencv.Mat();

    const x = Math.max(0, Math.min(coords.x, src.cols - 1));
    const y = Math.max(0, Math.min(coords.y, src.rows - 1));
    const w = Math.max(1, Math.min(coords.w, src.cols - x));
    const h = Math.max(1, Math.min(coords.h, src.rows - y));
    let rect = new opencv.Rect(x, y, w, h);

    opencv.grabCut(src, mask, rect, bgdModel, fgdModel, 5, opencv.GC_INIT_WITH_RECT);

    let alpha = new opencv.Mat(mask.rows, mask.cols, opencv.CV_8UC1, new opencv.Scalar(0));
    const maskData = mask.data;
    const alphaData = alpha.data;
    for (let i = 0; i < maskData.length; i++) {

        alphaData[i] = (maskData[i] & 1) ? 255 : 0;
    }

    if (featherAmount > 0) {
        const k = featherAmount * 2 + 1; // kernel size must be odd
        opencv.GaussianBlur(alpha, alpha, new opencv.Size(k, k), 0, 0, opencv.BORDER_DEFAULT);
    }

    let dst = new opencv.Mat();
    opencv.cvtColor(src, dst, opencv.COLOR_RGB2RGBA, 0);
    const dstData = dst.data;
    for (let i = 0; i < alphaData.length; i++) {
        dstData[i * 4 + 3] = alphaData[i];
    }

    opencv.imshow(can, dst);

    src.delete();
    mask.delete();
    bgdModel.delete();
    fgdModel.delete();
    alpha.delete();
    dst.delete();

    return can;
}


function makeCanvasFit(canvas, can = undefined) {
    let bbox = getBBox(canvas)

    //small opti to prevent the re-creation of cans in mass calling
    if (can === undefined) {
        can = document.createElement("canvas")
    }

    let context = can.getContext("2d")
    can.width = bbox[1][0] - bbox[0][0]
    can.height = bbox[1][1] - bbox[0][1]
    context.drawImage(canvas, bbox[0][0], bbox[0][1], can.width, can.height, 0, 0, can.width, can.height)

    return can
}


function resizeWithBbox(canvas, bbox) {
    let can = document.createElement("canvas")
    let context = can.getContext("2d")
    if (Array.isArray(bbox)) {

        can.width = bbox[1][0] - bbox[0][0]
        can.height = bbox[1][1] - bbox[0][1]
        context.drawImage(canvas, bbox[0][0], bbox[0][1], can.width, can.height, 0, 0, can.width, can.height)
    } else {
        can.width = bbox.width
        can.height = bbox.height
        context.drawImage(canvas, bbox.x, bbox.y, can.width, can.height, 0, 0, can.width, can.height)
    }
    return can
}

function getMinimalBoundingBox(canvas, step = 4) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const {data} = ctx.getImageData(0, 0, w, h);

    let top = 0, bottom = h - 1;
    let left = 0, right = w - 1;

    if (right < left || bottom < top) {
        return null;
    }

    outerTop:
        for (; top < h; top += step) {
            for (let x = 0; x < w; x += step) {
                if (data[((top * w + x) << 2) + 3] !== 0) break outerTop;
            }
        }
    outerBottom:
        for (; bottom >= top; bottom -= step) {
            for (let x = 0; x < w; x += step) {
                if (data[((bottom * w + x) << 2) + 3] !== 0) break outerBottom;
            }
        }

    outerLeft:
        for (; left < w; left += step) {
            for (let y = top; y <= bottom; y += step) {
                if (data[((y * w + left) << 2) + 3] !== 0) break outerLeft;
            }
        }

    outerRight:
        for (; right >= left; right -= step) {
            for (let y = top; y <= bottom; y += step) {
                if (data[((y * w + right) << 2) + 3] !== 0) break outerRight;
            }
        }

    if (step > 1) {
        // top
        for (let y = Math.max(0, top - step); y < top; y++) {
            for (let x = left; x <= right; x++) {
                if (data[((y * w + x) << 2) + 3] !== 0) {
                    top = y;
                    break;
                }
            }
        }

        // bottom
        for (let y = Math.min(h - 1, bottom + step); y > bottom; y--) {
            for (let x = left; x <= right; x++) {
                if (data[((y * w + x) << 2) + 3] !== 0) {
                    bottom = y;
                    break;
                }
            }
        }

        // left
        for (let x = Math.max(0, left - step); x < left; x++) {
            for (let y = top; y <= bottom; y++) {
                if (data[((y * w + x) << 2) + 3] !== 0) {
                    left = x;
                    break;
                }
            }
        }

        // right
        for (let x = Math.min(w - 1, right + step); x > right; x--) {
            for (let y = top; y <= bottom; y++) {
                if (data[((y * w + x) << 2) + 3] !== 0) {
                    right = x;
                    break;
                }
            }
        }
    }

    return {
        x: left,
        y: top,
        width: right - left + 7,
        height: bottom - top + 7
    };
}

function recolorCanvasLAB(canvas, targetRGB, strength = 1.0) {

    const [targetR, targetG, targetB] = targetRGB;


    let src = opencv.imread(canvas);



    let originalLab = new opencv.Mat();

    opencv.cvtColor(src, originalLab, opencv.COLOR_RGBA2Lab);

    let originalChannels = new opencv.MatVector();
    opencv.split(originalLab, originalChannels);

    let originalL = originalChannels.get(0);
    let alpha = originalChannels.get(3);



    let gray = new opencv.Mat();

    opencv.cvtColor(src, gray, opencv.COLOR_RGBA2GRAY);

    let grayRGBA = new opencv.Mat();

    opencv.cvtColor(gray, grayRGBA, opencv.COLOR_GRAY2RGBA);

    // restore original alpha
    let grayChannels = new opencv.MatVector();
    opencv.split(grayRGBA, grayChannels);

    grayChannels.set(3, alpha);

    opencv.merge(grayChannels, grayRGBA);



    let lab = new opencv.Mat();

    opencv.cvtColor(grayRGBA, lab, opencv.COLOR_RGBA2Lab);

    let channels = new opencv.MatVector();
    opencv.split(lab, channels);

    // preserve original luminance
    let L = originalL;

    let A = channels.get(1);
    let B = channels.get(2);


    let visibleMask = new opencv.Mat();

    opencv.threshold(
        alpha,
        visibleMask,
        0,
        255,
        opencv.THRESH_BINARY
    );



    let targetMat = new opencv.Mat(
        src.rows,
        src.cols,
        opencv.CV_8UC4,
        new opencv.Scalar(targetR, targetG, targetB, 255)
    );

    let targetLab = new opencv.Mat();

    opencv.cvtColor(targetMat, targetLab, opencv.COLOR_RGBA2Lab);

    let targetChannels = new opencv.MatVector();
    opencv.split(targetLab, targetChannels);

    let targetA = targetChannels.get(1);
    let targetBChannel = targetChannels.get(2);

    let mixedA = new opencv.Mat();
    let mixedB = new opencv.Mat();

    opencv.addWeighted(
        A,
        1.0 - strength,
        targetA,
        strength,
        0,
        mixedA
    );

    opencv.addWeighted(
        B,
        1.0 - strength,
        targetBChannel,
        strength,
        0,
        mixedB
    );



    let luminanceMask = new opencv.Mat();


    opencv.bitwise_not(L, luminanceMask);


    opencv.GaussianBlur(
        luminanceMask,
        luminanceMask,
        new opencv.Size(0, 0),
        5
    );

    let darkA = new opencv.Mat();
    let darkB = new opencv.Mat();


    opencv.addWeighted(
        mixedA,
        0.6,
        targetA,
        0.4,
        0,
        darkA
    );

    opencv.addWeighted(
        mixedB,
        0.6,
        targetBChannel,
        0.4,
        0,
        darkB
    );


    darkA.copyTo(mixedA, luminanceMask);
    darkB.copyTo(mixedB, luminanceMask);


    mixedA.copyTo(A, visibleMask);
    mixedB.copyTo(B, visibleMask);



    let merged = new opencv.Mat();
    let mergedChannels = new opencv.MatVector();

    mergedChannels.push_back(L);
    mergedChannels.push_back(A);
    mergedChannels.push_back(B);
    mergedChannels.push_back(alpha);

    opencv.merge(mergedChannels, merged);

    let result = new opencv.Mat();

    opencv.cvtColor(merged, result, opencv.COLOR_Lab2RGBA);



    opencv.imshow(canvas, result);

    src.delete();

    originalLab.delete();
    originalChannels.delete();

    gray.delete();
    grayRGBA.delete();
    grayChannels.delete();

    lab.delete();
    channels.delete();

    visibleMask.delete();
    luminanceMask.delete();

    targetMat.delete();
    targetLab.delete();
    targetChannels.delete();

    mixedA.delete();
    mixedB.delete();

    darkA.delete();
    darkB.delete();

    merged.delete();
    mergedChannels.delete();

    result.delete();

    A.delete();
    B.delete();

    alpha.delete();

    targetA.delete();
    targetBChannel.delete();
}


async function grabCutFromSelection(imageElement, polygonPoints, iterations = 5) {
    const src = opencv.imread(imageElement);

    // Create mask initialized as "probable background"
    const mask = new opencv.Mat(src.rows, src.cols, opencv.CV_8UC1);
    mask.setTo(new opencv.Scalar(opencv.GC_BGD));

    // Convert polygon to OpenCV format
    const pts = polygonPoints.flatMap(p => [p.x, p.y]);
    const contour = opencv.matFromArray(
        polygonPoints.length,
        1,
        opencv.CV_32SC2,
        pts
    );

    const contours = new opencv.MatVector();
    contours.push_back(contour);

    // Mark selected region as probable foreground
    opencv.fillPoly(mask, contours, new opencv.Scalar(cv.GC_PR_FGD));

    const bgdModel = new opencv.Mat();
    const fgdModel = new opencv.Mat();

    // Run GrabCut using the mask
    opencv.grabCut(
        src,
        mask,
        new opencv.Rect(),
        bgdModel,
        fgdModel,
        iterations,
        opencv.GC_INIT_WITH_MASK
    );

    // Build binary foreground mask
    const fgMask = new cv.Mat();
    const prFgMask = new cv.Mat();

    opencv.compare(mask, opencv.GC_FGD, fgMask, opencv.CMP_EQ);
    opencv.compare(mask, opencv.GC_PR_FGD, prFgMask, opencv.CMP_EQ);
    opencv.bitwise_or(fgMask, prFgMask, fgMask);

    // Apply mask to image
    const result = new opencv.Mat();
    src.copyTo(result, fgMask);

    // Output canvas
    const canvas = document.createElement("canvas");
    canvas.width = src.cols;
    canvas.height = src.rows;
    opencv.imshow(canvas, result);

    // Cleanup
    src.delete();
    mask.delete();
    contour.delete();
    contours.delete();
    bgdModel.delete();
    fgdModel.delete();
    fgMask.delete();
    prFgMask.delete();
    result.delete();

    return canvas;
}