function euclidian_dist(a, b) {
    let sum = 0;

    for (let n = 0; n < a.length; n++) {
        sum += Math.pow(a[n] - b[n], 2)
    }
    return Math.sqrt(sum)
}

function toScreen(point, origin, scale) {
    const x = point.x * scale + origin.x;
    const y = point.y * scale + origin.y;
    return {x, y};
}

function toWorld(point, origin, scale) {  // convert to world coordinates
    const x = (point.x - origin.x) / scale;
    const y = (point.y - origin.y) / scale;
    return {x, y};
}

function get_orr(p1, p2) {
    let a = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;
    // a += 90;
    return a;
}

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


function getPoint(theta, dist, pt) {
    theta = toRad(theta)

    return {
        x: pt.x + (dist * Math.cos(theta)),
        y: pt.y + (dist * Math.sin(theta))

    }

}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}


function rotate_point(src, pt, angle) {
    angle = toRad(angle)

    return {
        x: Math.cos(angle) * (pt.x - src.x) - Math.sin(angle) * (pt.y - src.y) + src.x,
        y: Math.sin(angle) * (pt.x - src.x) + Math.cos(angle) * (pt.y - src.y) + src.y,
    }

}

// ----------------------------- DATA MANIPULATION STUFF ----------------------------------------------
function tempEdit() {


    for (let i = 0; i < sampleData.length; i++) {
        // sampleData[i]["data"] = {}

        sampleData[i]["data"]["stem"] = {value: sampleData[i]["data"]["stem"]}

        // delete sampleData[i]["data"]["stem "]

    }
}


async function tsave() {

    let dat = await getTData()

    loadImg(dat.background)
}

async function getTData() {
    const url = "assets/images/tempLoad/clean.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        return error
    }
}


function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


function getPointat(p1, p2, percent) {
    return {
        x: (p1.x * percent + p2.x * (100 - percent)) / 100,
        y: (p1.y * percent + p2.y * (100 - percent)) / 100,
    }
}

function cloneCanvas(oldCanvas) {

    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}

function getFirstIndexOfMaxValue(array) {
    return array.reduce((r, v, i, a) => v <= a[r] ? r : i, -1);
}


function getFirstIndexOfMinValue(array) {
    return array.reduce((r, v, i, a) => v >= a[r] ? r : i, -1);
}


async function tempRemoveProtoCan() {

    let t = await getData("assets/tempData/full.json")
    ;
    for (const [name, value] of Object.entries(t.marks)) {
        if (value.data?.anxiety?.proto) {
            delete value.data.anxiety.proto.canvas
            delete value.anxiety
        }
        //
    }
    delete t.palette
    console.log(t)
    download(JSON.stringify(t), "full.json", "text/json");

}

function imageToBase64(img, type = 'image/png') {
    const canvas = document.createElement('canvas');
    console.log(img.complete);
    canvas.width = img.width;
    canvas.height = img.height;

    console.log(canvas.width);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return canvas.toDataURL(type);
}


function dumpObject(obj) {
    return JSON.stringify(obj, (key, value) => {

        if (value instanceof HTMLCanvasElement) {
            return {
                __type: "canvas",
                data: value.toDataURL("image/png")
            };
        }

        if (value instanceof HTMLImageElement) {
            return {
                __type: "image",
                data: imageToBase64(value)
            };
        }

        return value;
    })

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


function setSelectValue(selectOrId, value) {
    const select =
        typeof selectOrId === "string"
            ? document.getElementById(selectOrId)
            : selectOrId;

    if (!select) return false;

    const exists = Array.from(select.options).some(opt => opt.value === value);
    if (!exists) return false;
    select.value = value;
    return true;
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