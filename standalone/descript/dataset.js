async function loadStateFromJson(source) {
    let json;

    if (source instanceof File) {
        json = await source.text();
    } else if (typeof source === "string") {
        let response = await fetch(source);

        if (!response.ok) {
            throw new Error(`Failed to load state: ${response.statusText}`);
        }
        json = await response.text();
    } else {
        throw new Error("source must be a File or a URL string");
    }
    // console.log(json);
    const pending = [];

    const state = JSON.parse(json, (key, value) => {

        if (value?.__type === "image") {
            const img = new Image();
            img.src = value.data;
            const p = img.decode().catch(() => {
            });
            pending.push(p);

            return img;
        }


        if (value?.__type === "canvas") {

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const img = new Image();

            pending.push(new Promise((resolve, reject) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    resolve();
                };
                img.onerror = reject;
            }));

            img.src = value.data;

            return canvas;
        } else if (key === "canvas") {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const img = new Image();

            pending.push(new Promise((resolve, reject) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    resolve();
                };
                img.onerror = reject;
            }));

            img.src = value;

            return canvas;
        }

        return value;
    });

    await Promise.all(pending);

    return state;
}

function initState(state) {


    megaPalettes = state.megaPalettes
    megaGlyph = state.megaGlyph
    dataBinding = state.dataBinding
    chartDataset = state.chartDataset

}