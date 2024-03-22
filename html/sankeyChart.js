
let showDenyInRed = false; // Global variable to track toggle state

// Specify the dimensions of the chart.
const width = 2000;
const height = 8000;

let svg; // Global variable for the SVG element
let data; // Global variable for the data

// Function to initialize the SVG container
function initSvg() {
    svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [10, 10, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
}

function initDropdown() {
    let sourceNodes = Array.from(new Set(data.map(d => d.sourceName))).sort();
    let dropdownContent = document.getElementById("dropdownContent");

    sourceNodes.forEach((node, index) => {
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "source" + index;
        checkbox.value = node;
        checkbox.onchange = () => drawSankey();

        let label = document.createElement("label");
        label.htmlFor = "source" + index;
        label.appendChild(document.createTextNode(node));

        dropdownContent.appendChild(checkbox);
        dropdownContent.appendChild(label);
        dropdownContent.appendChild(document.createElement("br"));
    });
}
// Function to get the selected source nodes
function getSelectedSources() {
    let checkboxes = document.querySelectorAll("#dropdownContent input[type='checkbox']:not(#selectAll)");
    return Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
}

function selectAllSources(source) {
    let checkboxes = document.querySelectorAll("#dropdownContent input[type='checkbox']:not(#selectAll)");
    checkboxes.forEach(checkbox => checkbox.checked = source.checked);
    drawSankey();
}

function toggleDropdown() {
    document.getElementById("dropdownContent").classList.toggle("show");
}

// Function to draw the Sankey diagram
function drawSankey() {
    // Clear the existing SVG content
    svg.selectAll("*").remove();

    let selectedSources = getSelectedSources();

    let filteredLinks = data.filter(d => selectedSources.length === 0 || selectedSources.includes(d["sourceName"]))
        .map((d, i) => ({
            source: d["sourceName"],
            target: d["target"],
            value: d["value"],
            action: d["action"],
            id: i
        }));

    const nodes = Array.from(
        new Set(filteredLinks.flatMap((d) => [d.source, d.target])),
        (name, id) => ({ name, id, colorId: Math.floor(Math.random() * 10) + 1 })
    );

    filteredLinks.forEach((d) => {
        d.source = nodes.find((e) => e.name === d.source).id;
        d.target = nodes.find((e) => e.name === d.target).id;
    });

    let data_final = { nodes, links: filteredLinks }; // Corrected to { nodes, links: filteredLinks }

    const sankey = d3.sankey()
        .nodeSort((a, b) => a.id - b.id)
        .nodeAlign(d3.sankeyLeft)
        .nodeId((d) => d.id)
        .linkSort(null)
        .nodeWidth(20)
        .nodePadding(20)
        .extent([[1, 50], [width - 1, height - 5]]);

    const color = d3.scaleOrdinal(d3.schemeSet3);

    // Drawing nodes
    const rect = svg.append("g")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(sankey(data_final).nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0 >= 3 ? d.y1 - d.y0 : 3)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => color(d.colorId));

    rect.append("title")
        .text(d => `${d.name}\n${d.targetLinks.length > 0 ? d.targetLinks.map(o => o.source.name).join("\n") : ""}`);

    // Creating gradients for links
    const defs = svg.append("defs");
    sankey(data_final).links.forEach((link, i) => {
        const gradient = defs.append("linearGradient")
            .attr("id", "gradient" + i)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", link.source.x1)
            .attr("x2", link.target.x0);

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", color(link.source.colorId));

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", color(link.target.colorId));
    });

    // Drawing links with gradient or red color based on 'showDenyInRed' and link's action
    svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll("path")
        .data(sankey(data_final).links)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", (d, i) => showDenyInRed && d.action === "Deny" ? "red" : `url(#gradient${i})`)
        .attr("stroke-width", d => Math.max(1, d.width))
        .append("title")
        .text(d => `${d.source.name} → ${d.target.name}`);

    // Drawing labels for the nodes
    svg.append("g")
        .selectAll("text")
        .data(sankey(data_final).nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name);
}




// Load the data only once and store it in the global 'data' variable
d3.csv("sankeyDataSet.csv", d3.autoType).then(function (loadedData) {
    data = loadedData;
    initSvg(); // Initialize the SVG container
    initDropdown(); // Initialize the dropdown
    drawSankey(); // Draw the Sankey diagram for the first time
});

// Event listener for the dropdown
document.getElementById('sourceNodeSelect').addEventListener('change', function () {
    drawSankey(); // Redraw the Sankey diagram with the new selection
});

// Event listener for the checkbox
document.getElementById('colorSwitch').addEventListener('change', function (event) {
    showDenyInRed = event.target.checked;
    drawSankey(); // Redraw the Sankey diagram with the new setting
});

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        let dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            // Check if the clicked element is inside the dropdown
            if (openDropdown.classList.contains('show') && !openDropdown.contains(event.target)) {
                openDropdown.classList.remove('show');
            }
        }
    }
};