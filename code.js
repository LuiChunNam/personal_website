document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- D3.js Radar Plot ---
    const radarData = [
        {
            name: "Silence Is The Noiseiest (Installation)",
            skills: {
                'Direction': 3, // Group work, involved in idea/concept
                'Scriptwriting': 2, // Concept development
                'Cinematography': 0,
                'Editing': 0,
                'Colorist': 0,
                'Acting': 0,
                'Installation Art': 5, // Core involvement
                'Photography': 0
            }
        },
        {
            name: "Silence Is The Noiseiest (Moving Image)",
            skills: {
                'Direction': 5,
                'Scriptwriting': 4,
                'Cinematography': 4,
                'Editing': 4,
                'Colorist': 4,
                'Acting': 0,
                'Installation Art': 0,
                'Photography': 0
            }
        },
        {
            name: "The Other Side",
            skills: {
                'Direction': 3, // Assistant Director role
                'Scriptwriting': 0,
                'Cinematography': 5,
                'Editing': 0,
                'Colorist': 0,
                'Acting': 0,
                'Installation Art': 0,
                'Photography': 0
            }
        },
        {
            name: "Ngau Tau Kok Subway Murder",
            skills: {
                'Direction': 5,
                'Scriptwriting': 5,
                'Cinematography': 5,
                'Editing': 4,
                'Colorist': 0, // Not explicitly mentioned, assume basic
                'Acting': 5, // Leading Actor
                'Installation Art': 0,
                'Photography': 0
            }
        },
        {
            name: "Mr. Lam",
            skills: {
                'Direction': 0,
                'Scriptwriting': 5, // Script Writing
                'Cinematography': 0,
                'Editing': 0,
                'Colorist': 0,
                'Acting': 0,
                'Installation Art': 0,
                'Photography': 0
            }
        },
        {
            name: "Photography Portfolio",
            skills: {
                'Direction': 0,
                'Scriptwriting': 0,
                'Cinematography': 0,
                'Editing': 0,
                'Colorist': 0,
                'Acting': 0,
                'Installation Art': 0,
                'Photography': 5
            }
        }
    ];

    const allSkills = Array.from(new Set(radarData.flatMap(d => Object.keys(d.skills))));
    const maxSkillValue = 5; // Max value for radar chart scale

    const radarColors = d3.scaleOrdinal(d3.schemeCategory10); // D3's built-in color scheme

    function drawRadarChart() {
        const container = d3.select("#radar-chart");
        container.html(''); // Clear previous chart
        const width = container.node().clientWidth;
        const height = 400; // Fixed height from CSS
        const radius = Math.min(width, height) / 2 - 40; // Adjust for labels
        const centerX = width / 2;
        const centerY = height / 2;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        const angleSlice = Math.PI * 2 / allSkills.length;

        // Scale for the radius
        const rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxSkillValue]);

        // Draw the circles (grid)
        svg.selectAll(".grid-circle")
            .data(d3.range(1, maxSkillValue + 1).reverse())
            .enter().append("circle")
            .attr("class", "grid-circle")
            .attr("r", d => rScale(d))
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", 0.1);

        // Draw the axes
        const axis = svg.selectAll(".axis")
            .data(allSkills)
            .enter().append("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(maxSkillValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => rScale(maxSkillValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .style("stroke", "white")
            .style("stroke-width", "1px");

        // Add labels to the axes
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", (d, i) => rScale(maxSkillValue * 1.2) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(maxSkillValue * 1.2) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => d)
            .attr("fill", "#333");

        // Function to convert skill data to radar coordinates
        const radarLine = d3.lineRadial()
            .curve(d3.curveCardinalClosed)
            .radius(d => rScale(d.value))
            .angle((d, i) => i * angleSlice);

        // Draw the radar areas
        const blobWrapper = svg.selectAll(".radarWrapper")
            .data(radarData)
            .enter().append("g")
            .attr("class", "radarWrapper");

        blobWrapper.append("path")
            .attr("class", d => `radarArea radarArea-${d.name.replace(/\s/g, '-')}`)
            .attr("d", d => radarLine(allSkills.map(skill => ({ value: d.skills[skill] || 0 }))))
            .style("fill", (d, i) => radarColors(i))
            .style("fill-opacity", 0.7)
            .style("stroke-width", "2px")
            .style("stroke", (d, i) => radarColors(i))
            .style("opacity", 0) // Start hidden
            .transition().duration(1000)
            .style("opacity", 1); // Fade in

        // Create legend
        const legendContainer = d3.select(".radar-legend");
        legendContainer.html(''); // Clear previous legend

        radarData.forEach((d, i) => {
            const legendItem = legendContainer.append("div")
                .attr("class", "radar-legend-item")
                .on("click", function() {
                    const isHidden = d3.select(this).classed("hidden");
                    d3.select(this).classed("hidden", !isHidden);
                    svg.select(`.radarArea-${d.name.replace(/\s/g, '-')}`)
                        .transition().duration(300)
                        .style("opacity", isHidden ? 1 : 0.1); // Toggle visibility
                });

            legendItem.append("div")
                .attr("class", "radar-legend-color")
                .style("background-color", radarColors(i));

            legendItem.append("span")
                .text(d.name);
        });

        // Tooltip for radar chart
        const tooltip = d3.select("body").append("div")
            .attr("class", "radar-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "rgba(0,0,0,0.8)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("pointer-events", "none");

        blobWrapper.on("mouseover", function(event, d) {
            d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", 0.1);
            d3.select(this).select(".radarArea").transition().duration(200).style("fill-opacity", 0.8);

            let tooltipHtml = `<strong>${d.name}</strong><br>`;
            allSkills.forEach(skill => {
                tooltipHtml += `${skill}: ${d.skills[skill] || 0}<br>`;
            });

            tooltip.html(tooltipHtml)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .transition().duration(200)
                .style("opacity", 1);
        })
        .on("mouseout", function() {
            d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", 0.7);
            tooltip.transition().duration(500).style("opacity", 0);
        });
    }

    // --- D3.js Node-Link Diagram ---
    const graphData = {
        nodes: [
            // Projects
            { id: "Silence Is The Noiseiest (Installation)", group: "project", type: "Installation Art", year: 2023, url: "#project-silence-installation" },
            { id: "Silence Is The Noiseiest (Moving Image)", group: "project", type: "Moving Image", year: 2023, url: "#project-silence-movingimage" },
            { id: "The Other Side", group: "project", type: "Short Film", year: 2023, url: "#project-theotherside" },
            { id: "Ngau Tau Kok Subway Murder", group: "project", type: "Short Film", year: 2022, url: "#project-ngautaukok" },
            { id: "Mr. Lam", group: "project", type: "Script Writing", year: 2023, url: "#project-mrlam" },
            { id: "Photography Portfolio", group: "project", type: "Photography", year: 2022, url: "#photography" },

            // Roles (unique list)
            { id: "Director", group: "role" },
            { id: "Screenwriter", group: "role" },
            { id: "Videographer", group: "role" },
            { id: "Editor", group: "role" },
            { id: "Colorist", group: "role" },
            { id: "Assistant Director", group: "role" },
            { id: "Cinematographer", group: "role" },
            { id: "Leading Actor", group: "role" },
            { id: "Script Writer", group: "role" },

            // Work Types (unique list)
            { id: "Installation Art", group: "type" },
            { id: "Moving Image", group: "type" },
            { id: "Short Film", group: "type" },
            { id: "Script Writing", group: "type" },
            { id: "Photography", group: "type" }
        ],
        links: [
            // Project to Roles
            { source: "Silence Is The Noiseiest (Installation)", target: "Director", value: 1 },
            { source: "Silence Is The Noiseiest (Installation)", target: "Screenwriter", value: 1 },
            { source: "Silence Is The Noiseiest (Installation)", target: "Videographer", value: 1 },
            { source: "Silence Is The Noiseiest (Installation)", target: "Editor", value: 1 },
            { source: "Silence Is The Noiseiest (Installation)", target: "Colorist", value: 1 },

            { source: "Silence Is The Noiseiest (Moving Image)", target: "Director", value: 1 },
            { source: "Silence Is The Noiseiest (Moving Image)", target: "Screenwriter", value: 1 },
            { source: "Silence Is The Noiseiest (Moving Image)", target: "Videographer", value: 1 },
            { source: "Silence Is The Noiseiest (Moving Image)", target: "Editor", value: 1 },
            { source: "Silence Is The Noiseiest (Moving Image)", target: "Colorist", value: 1 },

            { source: "The Other Side", target: "Assistant Director", value: 1 },
            { source: "The Other Side", target: "Cinematographer", value: 1 },

            { source: "Ngau Tau Kok Subway Murder", target: "Director", value: 1 },
            { source: "Ngau Tau Kok Subway Murder", target: "Script Writer", value: 1 },
            { source: "Ngau Tau Kok Subway Murder", target: "Cinematographer", value: 1 },
            { source: "Ngau Tau Kok Subway Murder", target: "Leading Actor", value: 1 },
            { source: "Ngau Tau Kok Subway Murder", target: "Editor", value: 1 },

            { source: "Mr. Lam", target: "Script Writer", value: 1 },

            // Project to Work Types
            { source: "Silence Is The Noiseiest (Installation)", target: "Installation Art", value: 2 },
            { source: "Silence Is The Noiseiest (Moving Image)", target: "Moving Image", value: 2 },
            { source: "The Other Side", target: "Short Film", value: 2 },
            { source: "Ngau Tau Kok Subway Murder", target: "Short Film", value: 2 },
            { source: "Mr. Lam", target: "Script Writing", value: 2 },
            { source: "Photography Portfolio", target: "Photography", value: 2 }
        ]
    };

    const nodeLinkColors = d3.scaleOrdinal()
        .domain(["project", "role", "type"])
        .range(["#3498db", "#2ecc71", "#9b59b6"]); // Project, Role, Type colors

    function drawNodeLinkDiagram() {
        const container = d3.select("#node-link-chart");
        container.html(''); // Clear previous chart
        const width = container.node().clientWidth;
        const height = 400; // Fixed height from CSS

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const simulation = d3.forceSimulation(graphData.nodes)
            .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(graphData.links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(graphData.nodes)
            .join("circle")
            .attr("r", 8)
            .attr("fill", d => nodeLinkColors(d.group))
            .call(drag(simulation));

        node.append("title")
            .text(d => d.id);

        const labels = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(graphData.nodes)
            .enter().append("text")
            .attr("class", "node-label")
            .attr("font-size", "10px")
            .attr("pointer-events", "none") // Make labels unclickable for interaction
            .text(d => d.id);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            labels
                .attr("x", d => d.x + 12)
                .attr("y", d => d.y + 4);
        });

        // Add zoom and pan functionality
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                svg.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Drag functionality
        function drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    }

    // Initial draw of charts
    drawRadarChart();
    drawNodeLinkDiagram();

    // Redraw charts on window resize to make them responsive
    window.addEventListener('resize', () => {
        drawRadarChart();
        drawNodeLinkDiagram();
    });
});