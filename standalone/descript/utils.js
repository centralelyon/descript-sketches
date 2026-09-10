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

function inBound(pixel) {
    return Math.max(Math.min(pixel, 255), 0)
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

async function onOpenCvReady(e) {
    opencv = await cv
    // console.log(t);
}

function constrainWidth(width, height, maxWidth = 100) {
    if (width <= maxWidth) return { width, height };
    const ratio = maxWidth / width;
    return { width: maxWidth, height: height * ratio };
}

function revive(value) {
    if (value?.__type === "canvas") {
        const img = new Image(); // TODO change to canvas
        img.src = value.data;
        return img;
    }

    if (value?.__type === "image") {
        const img = new Image();
        img.src = value.data;
        return img;
    }

    return value;
}


function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
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

function docReady(fn) {

    if (document.readyState === "complete" || document.readyState === "interactive") {

        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


function deepClone(value, seen = new WeakMap()) {
    // Primitives and functions
    if (value === null || typeof value !== "object") {
        return value;
    }

    // Handle circular references
    if (seen.has(value)) {
        return seen.get(value);
    }

    // Date
    if (value instanceof Date) {
        return new Date(value);
    }

    // RegExp
    if (value instanceof RegExp) {
        return new RegExp(value.source, value.flags);
    }

    // Image
    if (value instanceof HTMLImageElement) {
        const img = new Image();
        img.src = value.src;
        img.width = value.width;
        img.height = value.height;
        img.alt = value.alt;
        return img;
    }

    // Canvas
    if (value instanceof HTMLCanvasElement) {
        const canvas = document.createElement("canvas");
        canvas.width = value.width;
        canvas.height = value.height;
        canvas.getContext("2d").drawImage(value, 0, 0);
        return canvas;
    }

    // Array
    if (Array.isArray(value)) {
        const arr = [];
        seen.set(value, arr);
        for (const item of value) {
            arr.push(deepClone(item, seen));
        }
        return arr;
    }

    // Map
    if (value instanceof Map) {
        const map = new Map();
        seen.set(value, map);
        for (const [k, v] of value) {
            map.set(deepClone(k, seen), deepClone(v, seen));
        }
        return map;
    }

    // Set
    if (value instanceof Set) {
        const set = new Set();
        seen.set(value, set);
        for (const item of value) {
            set.add(deepClone(item, seen));
        }
        return set;
    }

    // Generic object
    const clone = Object.create(Object.getPrototypeOf(value));
    seen.set(value, clone);

    for (const key of Reflect.ownKeys(value)) {
        clone[key] = deepClone(value[key], seen);
    }

    return clone;
}