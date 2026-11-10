---
layout: technical_project
title: Distributed Bitcoin miner
description: Coordinating parallel proof-of-work searches across workers.
permalink: /technical-projects/distributed-bitcoin-miner/
nav: false
---

## The problem

Proof-of-work search is easy to divide but requires coordination: workers need distinct ranges to search, and the system needs to collect their results.

## My approach

I built the project around a coordinator and workers that search separate nonce ranges.

<!-- Expand with the actual protocol, work assignment, recovery behavior, tests, and results. -->
