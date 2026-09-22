---
layout: page
title: Portfolio
permalink: /portfolio/
description: A growing collection of my inspirations
nav: true
nav_order: 3
display_categories: [1D, 2D, 3D]
horizontal: false
---

<!-- pages/projects.md -->
<div class="projects">
{% if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized projects -->
  {% for category in page.display_categories %}
  <a id="{{ category }}" href=".#{{ category }}">
    <h2 class="category">{{ category }}</h2>
  </a>
  {% assign categorized_projects = site.projects | where: "category", category %}
  {% assign sorted_projects = categorized_projects | sort: "importance" %}
  <!-- Generate cards for each project -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <!-- A category scrolls sideways rather than wrapping, so adding a project
       never leaves a lone card stranded on a second row. -->
  <div class="scroller-wrap">
    <button class="scroller-btn scroller-prev" type="button" aria-label="Scroll {{ category }} projects left" hidden>&#8249;</button>
    <div class="scroller" tabindex="0" role="region" aria-label="{{ category }} projects">
      {% for project in sorted_projects %}
        {% include projects.liquid %}
      {% endfor %}
    </div>
    <button class="scroller-btn scroller-next" type="button" aria-label="Scroll {{ category }} projects right" hidden>&#8250;</button>
  </div>
  {% endif %}
  {% endfor %}

{% else %}

<!-- row row-cols-1 row-cols-md-3 -->
<!-- Display projects without categories -->

{% assign sorted_projects = site.projects | sort: "importance" %}

  <!-- Generate cards for each project -->

{% if page.horizontal %}

  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
{% endif %}
</div>

<script src="{{ '/assets/js/project-scroller.js' | relative_url }}"></script>
