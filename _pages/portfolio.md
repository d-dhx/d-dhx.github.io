---
layout: page
title: Arts
permalink: /portfolio/
description: Drawing, graphic work, photography, and spatial studies.
nav: true
nav_order: 4
---

<div class="arts-showcase">
  {% assign art_categories = "2D,3D" | split: "," %}
  {% for category in art_categories %}
    {% assign works = site.projects | where: "category", category | sort: "importance" %}
    {% if works.size > 0 %}
      <section class="arts-section" aria-labelledby="arts-{{ category }}">
        <div class="arts-section-head">
          {% if category == "2D" %}
            <h2 id="arts-{{ category }}">Image &amp; graphic work</h2>
            <span class="arts-section-kicker">01 / 02</span>
          {% else %}
            <h2 id="arts-{{ category }}">Objects &amp; space</h2>
            <span class="arts-section-kicker">02 / 02</span>
          {% endif %}
        </div>
        <div class="arts-grid">
          {% for project in works %}
            <a class="arts-work" href="{{ project.url | relative_url }}" aria-label="View {{ project.title }}">
              <span class="arts-work-image">
                <img src="{{ project.thumb | default: project.img | relative_url }}" alt="{{ project.title | escape }} preview"{% if project.thumb_position %} style="object-position: {{ project.thumb_position }};"{% endif %} {% if category == "2D" and forloop.first %}loading="eager"{% else %}loading="lazy"{% endif %}>
              </span>
              <span class="arts-work-meta">
                <span class="arts-work-title">{{ project.title }}</span>
                <span class="arts-work-arrow" aria-hidden="true">→</span>
              </span>
              <span class="arts-work-description">{{ project.description }}</span>
            </a>
          {% endfor %}
        </div>
      </section>
    {% endif %}
  {% endfor %}
</div>
