---
layout: page
title: Projects
permalink: /technical-projects/
description: Selected software and systems work, from distributed systems and databases to graphics and LLM systems.
nav: true
nav_order: 2
---

<div class="technical-projects">
  <ol class="technical-projects-list" aria-label="Projects, newest first">
    {% for project in site.data.technical_projects %}
      <li class="technical-project">
        <a class="technical-project-link" href="{{ project.url | relative_url }}" aria-label="Read about {{ project.title }}">
          <div class="technical-project-period">{{ project.period }}</div>
          <div class="technical-project-content">
            <p class="technical-project-area">{{ project.area }}</p>
            <h2>{{ project.title }}<span class="technical-project-arrow" aria-hidden="true">→</span></h2>
            <p class="technical-project-summary">{{ project.summary }}</p>
            <p class="technical-project-details"><span class="technical-project-language">{{ project.language }}</span>{% for topic in project.topics %}<span class="technical-project-topic">{{ topic }}</span>{% endfor %}</p>
          </div>
        </a>
      </li>
    {% endfor %}
  </ol>
</div>
