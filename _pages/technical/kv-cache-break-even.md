---
layout: technical_project
title: "BreakEven: Cost-Aware KV Cache Retention"
description: Measuring when a paused LLM request should keep, evict, or offload its KV cache.
permalink: /technical-projects/break-even-kv-cache/
nav: false
---

## Motivation

Tool-using agents can spend long periods waiting for external actions. Keeping a paused request's KV cache on the GPU makes its next turn faster, but that memory could serve other requests. BreakEven investigates when to keep the cache, evict and recompute it, or offload it to CPU memory.

## Implementation

I built the keep-versus-evict benchmark using PyTorch and Hugging Face's `DynamicCache`. Both paths preserve the original token IDs: Keep retains the KV tensors on the GPU, while Evict releases them and recomputes the prefix on resume. I measured GPU memory released, rebuild time, and time to first token (TTFT), synchronizing CUDA before timing and checking generated token IDs and first-step logits against Keep. My teammates measured CPU offload and restore costs, and the effect of cache retention on a competing request under a limited KV budget. We used controlled, synthetic pauses to isolate these costs.

## Measured results

In the keep-versus-evict experiment, the following values are medians of 10 measured runs per setting with Qwen3-0.6B on an NVIDIA L40S:

| Context    | GPU memory freed | Resume TTFT (Keep → Evict) |
| ---------- | ---------------: | -------------------------: |
| 2K tokens  |          224 MiB |                 30 → 57 ms |
| 8K tokens  |          896 MiB |                30 → 162 ms |
| 16K tokens |         1.75 GiB |                42 → 431 ms |

At 16K tokens, rebuilding the evicted prefix itself took 388 ms. The memory benefit and the recovery cost both grow as the context gets longer.

## Summary

These measurements put a concrete price on freeing GPU memory during an agent's pause. Our next step is to combine recomputation, offload, and competing-request costs into a break-even model; an online serving policy remains future work.
