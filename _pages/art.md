---
layout: page
title: Museum Atlas
permalink: /museum_network/
description: An interactive graph of museums I visited
nav: false
nav_order: 7
---

<!-- Graph Container with Bounding Box -->
<div id="museum-graph" style="width: 100%; height: 600px; position: relative; border: 2px solid #333; border-radius: 8px; margin-bottom: 2rem;"></div>

<!-- Tooltip -->
<div id="tooltip" style="position: absolute; pointer-events: none; display: none; z-index: 10;">
  <div id="tooltip-content" style="
    width: 220px;
    background: white;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 6px;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    text-align: center;
    font-family: sans-serif;
  ">
    <img id="tooltip-img" src="" style="
      width: 100%;
      max-height: 120px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 8px;
      display: block;
    ">
    <div id="tooltip-text" style="
      font-size: 13px;
      color: #333;
      line-height: 1.3;
      word-wrap: break-word;
    "></div>
  </div>
</div>

<script src="https://d3js.org/d3.v7.min.js"></script>

<script>
// Museum data
const data = {
  nodes: [
    // North America - East
    {
      id: "MoMA",
      url: "https://www.moma.org/",
      img: "{{ site.baseurl }}/assets/img/museums/moma.JPG",
      desc: "Museum of Modern Art, New York",
      region: "North America"
    },
    {
      id: "The Met",
      url: "https://www.metmuseum.org/",
      img: "{{ site.baseurl }}/assets/img/museums/met.JPG",
      desc: "The Met, NYC",
      region: "North America"
    },
    {
    id: "Whitney Museum",
    url: "https://whitney.org/",
    img: "{{ site.baseurl }}/assets/img/museums/whitney.JPG",
    desc: "Whitney Museum of American Art, NYC",
    region: "USA"
    },
    {
    id: "American Museum of Natural History",
    url: "https://www.amnh.org/",
    img: "{{ site.baseurl }}/assets/img/museums/anhm.JPG",
    desc: "American Museum of Natural History, NYC",
    region: "USA"
    },
    {
      id: "MFA Boston",
      url: "https://www.mfa.org/",
      img: "{{ site.baseurl }}/assets/img/museums/mfa_boston.JPG",
      desc: "Museum of Fine Arts, Boston",
      region: "North America"
    },
    {
      id: "Art Institute Chicago",
      url: "https://www.artic.edu/",
      img: "{{ site.baseurl }}/assets/img/museums/chicago.jpg",
      desc: "Art Institute of Chicago",
      region: "North America"
    },
    {
      id: "Phillips Collection",
      url: "https://www.phillipscollection.org/",
      img: "{{ site.baseurl }}/assets/img/museums/phillips.jpg",
      desc: "America’s first modern art museum, Washington DC",
      region: "North America"
    },
    {
      id: "Hirshhorn Museum",
      url: "https://hirshhorn.si.edu/",
      img: "{{ site.baseurl }}/assets/img/museums/hirshhorn.JPG",
      desc: "Hirshhorn Museum, Washington DC",
      region: "North America"
    },
    {
      id: "NGA DC",
      url: "https://www.nga.gov/",
      img: "{{ site.baseurl }}/assets/img/museums/nga_dc.jpg",
      desc: "National Gallery of Art, Washington DC",
      region: "North America"
    },
    {
    id: "Andy Warhol Museum",
    url: "https://www.warhol.org/",
    img: "{{ site.baseurl }}/assets/img/museums/wharol.jpg",
    desc: "The Andy Warhol Museum, Pittsburgh",
    region: "USA"
    },
    {
    id: "Carnegie Museum of Natural History",
    url: "https://carnegiemnh.org/",
    img: "{{ site.baseurl }}/assets/img/museums/carnegie_nhm.JPG",
    desc: "Carnegie Museum of Natural History, Pittsburgh",
    region: "USA"
    },
    {
      id: "Frost Science",
      url: "https://www.frostscience.org/",
      img: "{{ site.baseurl }}/assets/img/museums/frost.jpg",
      desc: "Science & planetarium museum, Miami",
      region: "North America"
    },
    {
      id: "Pérez Art Museum",
      url: "https://www.pamm.org/",
      img: "{{ site.baseurl }}/assets/img/museums/perez.jpg",
      desc: "Contemporary art museum, Miami",
      region: "North America"
    },
    {
      id: "Vizcaya Museum",
      url: "https://vizcaya.org/",
      img: "{{ site.baseurl }}/assets/img/museums/vizcaya.JPG",
      desc: "Vizcaya Museum & Gardens, Miami",
      region: "North America"
    },
    {
    id: "National WWII Museum",
    url: "https://www.nationalww2museum.org/",
    img: "{{ site.baseurl }}/assets/img/museums/national_wwii.JPG",
    desc: "National World War II Museum, New Orleans",
    region: "North America"
    },

    {
    id: "Art Gallery of Ontario",
    url: "https://ago.ca/",
    img: "{{ site.baseurl }}/assets/img/museums/ago.jpg",
    desc: "Art Gallery of Ontario, Toronto",
    region: "North America"
    },

    // UK
    {
      id: "British Museum",
      url: "https://www.britishmuseum.org/",
      img: "{{ site.baseurl }}/assets/img/museums/british.JPG",
      desc: "The British Museum, London",
      region: "UK"
    },
    {
      id: "NGA London",
      url: "https://www.nationalgallery.org.uk/",
      img: "{{ site.baseurl }}/assets/img/museums/nga-london.jpg",
      desc: "National Gallery, London",
      region: "UK"
    },
    {
      id: "Churchill War Rooms",
      url: "https://www.iwm.org.uk/visits/churchill-war-rooms",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Imperial_War_Museums_logo.svg/320px-Imperial_War_Museums_logo.svg.png",
      desc: "Churchill War Rooms, London",
      region: "UK"
    },
    {
      id: "Oxford NHM",
      url: "https://www.oumnh.ox.ac.uk/",
      img: "{{ site.baseurl }}/assets/img/museums/ox.JPG",
      desc: "Oxford Museum of Natural History",
      region: "UK"
    },

    // Hong Kong
    {
      id: "M+ Museum",
      url: "https://www.mplus.org.hk/en/",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/WKCD_M%2B%2C_2021.11.jpg/320px-WKCD_M%2B%2C_2021.11.jpg",
      desc: "Contemporary visual culture museum, Hong Kong",
      region: "Asia"
    },
    {
    id: "Hong Kong Palace Museum",
    url: "https://www.hkpm.org.hk/",
    img: "{{ site.baseurl }}/assets/img/museums/hkpm.JPG",
    desc: "Hong Kong Palace Museum",
    region: "Asia"
    },
    {
      id: "Hong Kong Museum of Art",
      url: "https://hk.art.museum/en_US/web/ma/home.html",
      img: "{{ site.baseurl }}/assets/img/museums/hkmoa.JPG",
      desc: "Hong Kong Museum of Art",
      region: "Asia"
    },

    //mainland China
    {
    id: "West Bund Museum",
    url: "https://www.westbund.com/en/",
    img: "{{ site.baseurl }}/assets/img/museums/west_bund.jpg",
    desc: "West Bund Museum, Shanghai",
    region: "Asia"
    }
  ],
  links: [
    { source: "MoMA", target: "The Met" },
    { source: "MoMA", target: "MFA Boston" },
    { source: "MoMA", target: "Phillips Collection" },
    { source: "Art Institute Chicago", target: "The Met" },
    { source: "Pérez Art Museum", target: "Frost Science" },
    { source: "Pérez Art Museum", target: "Vizcaya Museum" },
    { source: "Frost Science", target: "National WWII Museum" },
    { source: "Phillips Collection", target: "Hirshhorn Museum" },
    { source: "Hirshhorn Museum", target: "NGA DC" },
    { source: "NGA DC", target: "The Met" },
    { source: "NGA DC", target: "Art Gallery of Ontario" },
    { source: "NGA DC", target: "NGA London" },
    { source: "NGA London", target: "British Museum" },
    { source: "Churchill War Rooms", target: "British Museum" },
    { source: "Oxford NHM", target: "NGA London" },
    { source: "Hong Kong Museum of Art", target: "M+ Museum" },
    { source: "M+ Museum", target: "West Bund Museum" }, 
    { source: "MoMA", target: "Andy Warhol Museum" }, 
    { source: "MoMA", target: "Whitney Museum" },
    { source: "The Met", target: "American Museum of Natural History" },
    { source: "Andy Warhol Museum", target: "Carnegie Museum of Natural History" },
    { source: "Hong Kong Museum of Art", target: "Hong Kong Palace Museum" },
    { source: "M+ Museum", target: "Hong Kong Palace Museum" }
  ]
};

// Sizing
const width = document.getElementById("museum-graph").clientWidth;
const height = 500;
const centerX = width / 2;
const centerY = height / 2;

// SVG inside container
const svg = d3.select("#museum-graph").append("svg")
  .attr("width", width)
  .attr("height", height);

// Tooltip
const tooltip = d3.select("#tooltip");
const tooltipImg = document.getElementById("tooltip-img");
const tooltipText = document.getElementById("tooltip-text");

// Initialize node positions near center
data.nodes.forEach(d => {
  d.x = centerX + (Math.random() - 0.5) * 50;
  d.y = centerY + (Math.random() - 0.5) * 50;
});

// Force simulation
function forceCircle(radius, centerX, centerY) {
  return function (alpha) {
    for (let i = 0; i < data.nodes.length; ++i) {
      const node = data.nodes[i];
      const angle = (2 * Math.PI * i) / data.nodes.length;
      const targetX = centerX + radius * Math.cos(angle);
      const targetY = centerY + radius * Math.sin(angle);
      node.vx += (targetX - node.x) * 0.1 * alpha;
      node.vy += (targetY - node.y) * 0.1 * alpha;
    }
  };
}

const simulation = d3.forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links).id(d => d.id).distance(120))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center",null)
  .force("circle", forceCircle(250, width / 2, height / 2))
  .alpha(1)
  .alphaDecay(0.05);

// Edges
const link = svg.append("g")
  .attr("stroke", "#aaa")
  .attr("stroke-opacity", 0.6)
  .selectAll("line")
  .data(data.links)
  .join("line")
  .attr("stroke-width", 2);

// Nodes
const color = d3.scaleOrdinal()
  .domain(["North America", "UK", "Asia"])
  .range(["#444444", "#666666", "#999999"]);

const hoverColor = "#fff";

const node = svg.append("g")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .selectAll("circle")
  .data(data.nodes)
  .join("circle")
  .attr("r", 10)
  .attr("fill", d => color(d.region))
  .style("cursor", "pointer")
  .on("click", (event, d) => {
    window.open(d.url, "_blank");
  })
  .on("mouseover", (event, d) => {
    tooltipImg.src = d.img;
    d3.select(this)
      .transition()
      .duration(150)
      .attr("fill", hoverColor);
    tooltipText.innerText = d.desc;
    tooltip.style("display", "block");
  })
  .on("mousemove", (event) => {
    tooltip.style("left", (event.pageX + 15) + "px");
    tooltip.style("top", (event.pageY - 30) + "px");
  })
  .on("mouseout", () => {
    tooltip.style("display", "none");
    d3.select(this)
      .transition()
      .duration(150)
      .attr("fill", color(d.region)); 
  })
  .call(drag(simulation));

// Tick updates
function clamp(x, min, max) {
  return Math.max(min, Math.min(x, max));
}

simulation.on("tick", () => {
  link
    .attr("x1", d => clamp(d.source.x, 30, width))
    .attr("y1", d => clamp(d.source.y, 30, height))
    .attr("x2", d => clamp(d.target.x, 30, width))
    .attr("y2", d => clamp(d.target.y, 30, height));

  node
    .attr("cx", d => d.x = clamp(d.x, 30, width - 30))  // 10px padding
    .attr("cy", d => d.y = clamp(d.y, 30, height - 30));
});

// Drag helpers
function drag(simulation) {
  return d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}
</script>
