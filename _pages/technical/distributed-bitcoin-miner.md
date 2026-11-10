---
layout: technical_project
title: Distributed Bitcoin miner
description: Scheduling distributed hash searches and recovering work after miner failures.
permalink: /technical-projects/distributed-bitcoin-miner/
nav: false
---

## Motivation

Searching a large nonce range for the smallest hash is straightforward on one machine, but a long request can monopolize that machine and a worker failure can lose its progress. This project distributes the search across miners while sharing capacity among clients and recovering unfinished work.

## Implementation

In a two-person team, I implemented the miner and request client and contributed to the coordinator's disconnect handling. A client submits a message and a maximum nonce. Each miner searches its assigned range, computes the hash for every nonce, and returns the smallest hash and its nonce.

The coordinator divides each request into 10,000-nonce chunks and assigns them to available miners. It rotates among pending client requests so a large search does not hold every worker until it finishes. As results arrive, it tracks the best hash and replies only after every chunk is complete. If a miner disconnects, its unfinished chunk goes back into the queue; if a client disconnects, the coordinator drops its pending work and ignores later results for that client.

The components exchange messages over LSP, the assignment's reliable, ordered protocol over UDP. I also worked on the team's earlier LSP implementation, including client-side sequencing, acknowledgments, and connection timeouts.

## Testing

I ran two simultaneous requests across three miners and checked their returned hash and nonce against an independent exhaustive search over 25,001 and 5,001 nonces; both matched. In a separate run, I terminated a miner during a 500,001-nonce request, started a replacement, and verified that the completed result still matched the exhaustive search.

## Summary

The service combines chunked work assignment, fair scheduling across requests, and recovery from a lost worker to complete a simplified proof-of-work search across multiple machines.
