---
layout: technical_project
title: "BusTub: Database System Implementation"
description: Building a concurrent buffer pool and B+ tree index in C++.
permalink: /technical-projects/bustub/
nav: false
---

## Motivation

A database engine has to keep frequently used pages in memory while making indexed records available to concurrent readers and writers. I built BusTub's storage and indexing layers to explore how page replacement, latching, and tree structure work together under that load.

## Implementation

**Buffer pool.** I implemented an adaptive replacement cache (ARC) with separate lists for recent and frequent pages. Its ghost lists remember recently evicted page IDs, so a later access can shift the balance between the two. The buffer pool fetches pages from disk on a miss, reuses unpinned frames, and uses read and write page guards to manage latches and pin counts automatically. I also implemented the disk scheduler that handles page I/O in a background worker.

**B+ tree index.** I implemented point lookup, insertion, deletion, and an iterator over leaf pages. Insertions split full nodes and propagate separator keys upward; deletions use bounded tombstone buffers to defer physical removal, then redistribute or merge nodes when needed. The iterator skips deleted entries while moving through the leaf chain.

For concurrent updates, I use an optimistic path that read-latches the descent and write-latches the target leaf. If the leaf may split or shrink, the operation retries with write latches down the path and releases ancestors once they are no longer needed. Page latches follow a consistent order across tree levels and siblings.

## Testing

In local runs, 18 tests passed across ARC replacement, buffer-pool behavior, basic tree insertion, tombstones, and concurrent insertion. In a 30-second benchmark with concurrent reads, scans, and writes over 100K keys, the system achieved approximately 87K read queries per second and 58K write queries per second while staying under a 21.6 MB memory budget.

## Summary

The project currently connects a concurrent buffer pool to a B+ tree index with lazy deletion. The main design challenge was keeping page and tree state consistent while allowing common operations to finish with fewer latches.
