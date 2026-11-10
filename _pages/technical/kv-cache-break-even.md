---
layout: technical_project
title: KV cache break-even
description: Exploring the cost tradeoff between reusing a KV cache and recomputing an LLM prompt prefix.
permalink: /technical-projects/kv-cache-break-even/
nav: false
---

## The question

When is it cheaper to reuse a saved KV cache than to recompute the same prefix? The answer depends on the cost of creating, storing, and retrieving the cache relative to another prefill.

## My approach

I framed the project around that break-even point, comparing the cost of cache creation and retrieval with repeated prefill.

<!-- Expand with the actual cost model, hardware/workload assumptions, measurements, plots, and conclusions. -->
