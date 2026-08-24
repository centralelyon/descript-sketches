let zoom = 1;
let x0 = 0;
let y0 = 0;
let isDragging = false;

function resetView(canvas,image) {
    zoom = 1;
    x0 = 0;
    y0 = 0;
    fitCanvas(canvas,image);
    redraw(canvas,image);
}

function redraw(canvas,image) {



    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currImg = image
    ctx.setTransform(
        zoom, 0,
        0, zoom,
        -x0 * zoom,
        -y0 * zoom
    );




    // ctx.drawImage(currImg, 0, 0,trect.width, trect.height);
    ctx.drawImage(currImg, 0, 0, reducedDim[0], reducedDim[1]);
}

function enableZoomPan(canvas, image) {
    // const ctx = canvas.getContext("2d");

    let lastX = 0;
    let lastY = 0;



    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();

        const factor = e.deltaY < 0 ? 1.03 : 1 / 1.03;

        const rect = canvas.getBoundingClientRect();

        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        // world coordinate under cursor
        const wx = x0 + sx / zoom;
        const wy = y0 + sy / zoom;

        zoom *= factor;

        // keep same world point under cursor
        x0 = wx - sx / zoom;
        y0 = wy - sy / zoom;

        redraw(canvas,image);
    });

    canvas.addEventListener("mousedown", (e) => {
        if (!e.shiftKey) return;
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        sampling = false
    });


    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        sampling = false;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const dx = (e.clientX - lastX) * scaleX;
        const dy = (e.clientY - lastY) * scaleY;

        x0 -= dx / zoom;
        y0 -= dy / zoom;

        lastX = e.clientX;
        lastY = e.clientY;

        redraw(canvas, image);
    });

    window.addEventListener("mouseup", () => {

        isDragging = false;
        // sampling = true

    });

    // redraw();
}


function screenRectToWorld(rect) {
    const [x, y, width, height] = rect;

    return [
        x0 + x / zoom,
        y0 + y / zoom,
        width / zoom,
        height / zoom
    ];
}