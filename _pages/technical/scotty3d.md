---
layout: technical_project
title: Scotty3D
description: A graphics pipeline built through rasterization, mesh editing, and path tracing.
permalink: /technical-projects/scotty3d/
nav: false
---

## Motivation

Scotty3D is a CMU graphics project that connects interactive geometry tools with offline rendering. I worked through three parts of the pipeline, moving from pixels to mesh structure to light transport.

## Software rasterizer

I built a CPU rasterizer to turn 3D triangles into 2D images for the preview window. The pipeline transforms vertices into screen space, assembles and clips triangles, and uses edge equations and barycentric coordinates to decide which pixels they cover. Fragment shading, depth testing, alpha blending, texture sampling, and mipmaps complete the image.

{% include figure.liquid path="assets/img/projects/graphics/A1T3.png" alt="Wireframe and shaded views of a rasterized cube" caption="Rasterization stages, from a wireframe to shaded surfaces." %}

## Half-edge mesh editing

I implemented mesh operations for face splitting, edge flipping, edge collapsing, Loop subdivision, and simplification. The main challenge was keeping the half-edge structure consistent as each operation changed connectivity.

## Path tracing

I developed a Monte Carlo path tracer using BSDF sampling, importance sampling, Russian roulette termination, and a bounding volume hierarchy for acceleration. This stage connected the geometry work to physically based lighting.

<div class="technical-figure-grid">
  {% include figure.liquid path="assets/img/projects/graphics/cornell_box.png" alt="Two spheres in a red and blue Cornell box, rendered with path tracing" caption="A Cornell box render with indirect light." %}
  {% include figure.liquid path="assets/img/projects/graphics/render_cow.png" alt="Cow model rendered with rainbow surface normals on a black background" caption="A surface-normal visualization of a cow model." %}
</div>
