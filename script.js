/* --- Content Section Visibility Logic --- */

const treemap = document.getElementById('treemap');
const contentContainer = document.getElementById('content-container');
const contentSections = document.querySelectorAll('.content-section');
const closeButtons = document.querySelectorAll('.close-btn');

// UPDATED: 'Silence Is The Noisiest' is now split using '|'
const treemapData = [
    { name: "About Me", value: 1, id: "About-Me", medium: "Meta" },
    { name: "Decision", value: 1, id: "Decision", medium: "Game/Interactive" },
    { name: "Silence Is The|Noisiest", value: 1, id: "Silence-Is-The-Noisiest", medium: "Installation/Film" },
    { name: "The Other Side", value: 1, id: "The-Other-Side", medium: "Short Film" },
    { name: "Ngau Tau Kok Subway Murder", value: 1, id: "Ngau-Tau-Kok-Subway-Murder", medium: "Short Film" },
    { name: "Mr. Lam", value: 1, id: "Mr-Lam", medium: "Script Writing" },
    { name: "Photography", value: 1, id: "Photography", medium: "Photography" },
    { name: "Contact", value: 1, id: "Contact", medium: "Meta" }
];

// D3 Treemap initialization function (MODIFIED for multiline text)
function createTreemap(data) {
    if (!treemap) return;
    
    // Clear previous content and set dimensions
    const container = d3.select("#treemap");
    container.html("");

    const width = 600; 
    const height = 600; 

    // 1. NEST THE DATA
    const nestedData = {
        name: "Portfolio",
        children: Array.from(d3.group(data, d => d.medium), ([name, children]) => ({ name, children }))
    };

    // Get unique media names to define the color domain
    const mediaNames = Array.from(new Set(data.map(d => d.medium)));
    const color = d3.scaleOrdinal(mediaNames, d3.schemeTableau10);

    // Compute the hierarchy layout.
    const root = d3.treemap()
        .tile(d3.treemapSquarify)
        .size([width, height])
        .padding(1)
        .round(true)
    (d3.hierarchy(nestedData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));

    // Create the SVG container.
    const svg = container.append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", "100%") 
        .attr("height", "auto")
        .attr("style", "max-width: 100%; height: auto; font: 12px var(--font-main);");

    // Add a cell for each leaf of the hierarchy.
    const leaf = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .on("click", (event, d) => showContent(d.data.id));

    // Append a tooltip.
    const format = d3.format(",d");
    leaf.append("title")
        .text(d => `${d.parent.data.name}: ${d.data.name.replace(/\|/g, ' ')}`); 

    // Append a color rectangle. 
    leaf.append("rect")
        .attr("class", "leaf-rect")
        .attr("fill", d => color(d.parent.data.name)) 
        .attr("fill-opacity", 0.6)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    // Append multiline text (FIXED: Uses tspan for line breaks)
    leaf.append("text")
        .attr("class", "leaf-text")
        .attr("x", 5) 
        .attr("y", 20)
        .selectAll("tspan")
        // Split the name by the '|' delimiter. Apply width check here.
        .data(d => (d.x1 - d.x0) > 80 ? d.data.name.split('|') : [])
        .join("tspan")
        .attr("x", 5) 
        // Set line height: 0em for the first line, 1.1em for subsequent lines
        .attr("dy", (d, i) => i === 0 ? "0em" : "1.1em")
        .text(d => d);
}

function showContent(id) {
    contentSections.forEach(section => {
        section.classList.remove('visible');
    });
    document.getElementById(id).classList.add('visible');
    contentContainer.scrollIntoView({ behavior: 'smooth' });
}

closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        this.closest('.content-section').classList.remove('visible');
    });
});

// Initialize the treemap
createTreemap(treemapData);


/* --- Lightbox Gallery Logic (UNMODIFIED) --- */

const modal = document.getElementById('lightbox-modal');
const modalImg = document.getElementById('lightbox-image');
const closeBtn = document.querySelector('.lightbox-close');
const prevBtn = document.querySelector('.lightbox-prev');
const nextBtn = document.querySelector('.lightbox-next');
const photoItems = document.querySelectorAll('#Photography .photo-item img');

let currentImageIndex = 0;

// 1. Open the modal when an image is clicked
photoItems.forEach((img, index) => {
    img.addEventListener('click', function() {
        modal.style.display = "block";
        modalImg.src = this.src;
        currentImageIndex = index;
    });
});

// 2. Close the modal
closeBtn.onclick = function() {
    modal.style.display = "none";
};

// Close the modal if the user clicks the dark background
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// 3. Navigation functions
function changeSlide(n) {
    let newIndex = currentImageIndex + n;

    // Handle wrapping around the ends of the gallery
    if (newIndex >= photoItems.length) {
        newIndex = 0; // Go to the first image
    } else if (newIndex < 0) {
        newIndex = photoItems.length - 1; // Go to the last image
    }

    currentImageIndex = newIndex;
    modalImg.src = photoItems[currentImageIndex].src;
}

prevBtn.onclick = function() {
    changeSlide(-1);
};

nextBtn.onclick = function() {
    changeSlide(1);
};