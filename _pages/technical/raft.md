---
layout: technical_project
title: Raft consensus
description: Implementing consensus for a replicated state machine.
permalink: /technical-projects/raft/
nav: false
---

## The problem

A group of replicas needs to agree on a sequence of operations even when nodes or network connections fail. Raft addresses this through a leader and a replicated log.

## My approach

I implemented the leader election and log replication parts of the protocol.

<!-- Expand with implementation details, persistence/snapshot scope if applicable, fault tests, and lessons. -->
