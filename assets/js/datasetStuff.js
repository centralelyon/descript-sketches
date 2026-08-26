const DATASET_DIRECTORY = "assets/tempData/datasets/";
const DATASET_MANIFEST = `${DATASET_DIRECTORY}datasets.json`;
let dataList = []


Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)];
}


function updateAxis(elem) {

    let val = elem.value
    let axis = elem.getAttribute("id").split("-")[0]

    chartAxis[axis] = val

    tdrawRefactor(true)
}

function fillAxis() {

    let options = `<option value="none">none</option>`;

    let tkeys = Object.keys(chartDataset.data[0]);

    for (let i = 0; i < tkeys.length; i++) {


        options += `<option value="${tkeys[i]}">${tkeys[i]}</option>`;
    }


    const x = document.getElementById("x-axis");
    x.innerHTML = options;
    const y = document.getElementById("y-axis");
    y.innerHTML = options;

}

async function updateDataset() {

    // cleanSlate()
    let dataset = document.getElementById("availableData").value

    if (!dataset) {
        return
    }

    chartDataset.name = dataset
    if (dataset === "week15.csv") {
        chartDataset.data = fakeWeek15()
    } else {
        await loadDataset(`${DATASET_DIRECTORY}${dataset}`)
    }

    fillAxis()
    fillTable()
    updateShapeOptions()

    d3.selectAll(".dataBindingContainer").selectAll("*").remove()

    tdrawRefactor()
}

function fakeWeek15() {

    let dataProfile = {
        "topics": ["work", "dear-data", "looks", "personality", "specific"],
        "who": ["boyfriend", "stefanie", "friend", "acquaintance", "coworker", "family", "stranger"],
        "medium": ["twitter", "email", "text", "real-life", "phone"],
        "compliment": ["gave", "received"]
    }

    let n = 87

    let tkeys = Object.keys(dataProfile)

    const dataset = []

    for (let i = 0; i < n; i++) {

        let t = {}
        for (let j = 0; j < tkeys.length; j++) {
            t[tkeys[j]] = dataProfile[tkeys[j]].sample()

        }
        dataset.push(t)
    }

    return dataset
}

async function loadAvailableDatasets() {
    try {
        const response = await fetch(DATASET_DIRECTORY);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const csvFiles = Array.from(doc.querySelectorAll("a"))
            .map(anchor => anchor.getAttribute("href"))
            .filter(Boolean)
            .map(href => decodeURIComponent(href.split("/").pop().split("?")[0].split("#")[0]))
            .filter(filename => filename.toLowerCase().endsWith(".csv"));

        dataList = Array.from(new Set(csvFiles))
            .sort((a, b) => a.localeCompare(b))
            .map(name => ({name}));
    } catch (directoryError) {
        try {
            const manifest = await fetch(DATASET_MANIFEST).then(response => response.json());
            dataList = manifest
                .filter(entry => entry.name && entry.name.toLowerCase().endsWith(".csv"))
                .sort((a, b) => a.name.localeCompare(b.name));
        } catch (manifestError) {
            console.warn("Could not read dataset directory listing or manifest.", directoryError, manifestError);
            dataList = []
        }
    }

    return dataList
}


async function fillSidePanel() {


    let opts = ""
    let select = document.getElementById("availableData")
    select.innerHTML = ""

    if (!dataList.length) {
        await loadAvailableDatasets()
    }

    for (let i = 0; i < dataList.length; i++) {

        const dataset = dataList[i];
        const label = dataset.rows !== undefined && dataset.columns !== undefined
            ? `${dataset.name} (${dataset.rows} rows, ${dataset.columns} cols)`
            : dataset.name;

        opts += `<option value="${dataset.name}">${label}</option>`
    }

    select.innerHTML = opts

    // const container = document.getElementById("datasetInfo")
    //
    // container.innerHTML = ""
    //
    // let tkeys = Object.keys(chartDataset.data[0])
    //
    // for (let i = 0; i < tkeys.length; i++) {
    //
    //     let cont = isCont(chartDataset.data, tkeys[i])
    //     if (cont) {
    //         let trange = d3.extent(chartDataset.data.map(d => d[tkeys[i]]))
    //         container.innerHTML += `<div dataColumn="${tkeys[i]}" class="dataRow"><p  class="dataColumn">${tkeys[i]}: </p><p>  [${trange[0]}-${trange[1]}]</p></div>`
    //     } else {
    //
    //         let set = new Set(chartDataset.data.map(d => d[tkeys[i]]));
    //         container.innerHTML += `<div dataColumn="${tkeys[i]}" class="dataRow"><p class="dataColumn">${tkeys[i]}: </p><p> [${Array.from(set)}]</p></div>`
    //     }
    //
    //
    // }
    //
    // const elements = document.querySelectorAll(".dataRow")
    //
    // for (let i = 0; i < elements.length; i++) {
    //
    //
    //     dragElement2(elements[i])
    // }


}


function csvLoader(e) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const data = d3.csvParse(text);

        chartDataset.data = data

        fillAxis()
        fillTable()
        updateShapeOptions()

        d3.selectAll(".dataBindingContainer").selectAll("*").remove()

        tdrawRefactor()

    }
    reader.readAsText(e.target.files[0]);
}

async function loadCsv(url) {


    return await d3.csv(
        url,
        d3.autoType
    )
}


function fillTable() {
    let table = document.getElementById("newDataTable")
    table.innerHTML = ""
    let tkeys = Object.keys(chartDataset.data[0])
    let row = document.createElement("tr")


    for (let i = 0; i < tkeys.length; i++) {


        let cont = isCont(chartDataset.data, tkeys[i])
        let mess = ""
        if (!cont) {
            let set = new Set(chartDataset.data.map(d => d[tkeys[i]]));
            mess += `(${Array.from(set).length})`
        } else {
            let trange = d3.extent(chartDataset.data.map(d => d[tkeys[i]]))

            mess += `[${trange[0]} - ${trange[1]}]`
        }

        let th = document.createElement("th")

        th.innerHTML = ` ${tkeys[i]}  ${mess}`
        th.setAttribute("num", i)
        th.setAttribute("key", tkeys[i])
        // row.innerHTML += `<th>${tkeys[i]}</th>`
        dragElement2(th)

        row.appendChild(th)

    }
    table.appendChild(row)
    for (let i = 0; i < chartDataset.data.length; i++) {
        let row = document.createElement("tr")
        for (let j = 0; j < tkeys.length; j++) {
            row.innerHTML += `<td>${chartDataset.data[i][tkeys[j]]}</td>`
        }
        table.appendChild(row)

    }


}
