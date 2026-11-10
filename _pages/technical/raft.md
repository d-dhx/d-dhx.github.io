---
layout: technical_project
title: Raft consensus
description: Leader election and majority-backed log replication in Go.
permalink: /technical-projects/raft/
nav: false
---

## Motivation

Replicated services need to agree on the order of operations even when peers disconnect or messages are lost. Raft uses a leader and a majority-backed log to keep the service's non-faulty replicas consistent. I implemented the protocol to work through what happens when leadership changes and replicas fall behind.

## Implementation

I built an in-memory Raft peer in Go, with replicas communicating through RPC. Randomized election timers move peers between follower, candidate, and leader roles. Vote requests carry the candidate's last log term and index, allowing a peer to reject a candidate with an out-of-date log.

Leaders send heartbeats and log entries through `AppendEntries`. They track each follower's `nextIndex` and `matchIndex`, back off after a log-consistency rejection, and advance `commitIndex` when a current-term entry has reached a majority. Followers replace conflicting log suffixes and deliver committed commands to the application through `applyCh`.

## Verification

In a local run, all eight election and log-agreement tests passed with Go's race detector. The tests cover leader replacement, agreement with a disconnected follower, refusal to commit without a majority, reconnection, and concurrent command proposals.

## Summary

The implemented scope runs from leader election through majority commit and application delivery. Persistence, snapshotting, and membership changes were outside this project's scope.
