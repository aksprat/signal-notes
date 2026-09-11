---
title: "Leaf and spine: where GPU bandwidth gets stuck"
summary: "Follow traffic through a GPU network and use a simple bandwidth budget to spot oversubscription."
date: "Learning note"
topics: ["GPU Infrastructure", "Networking", "AMD", "NVIDIA", "Leaf-spine"]
readTime: "3 min read"
---

An office can have fast elevators and still create a queue if everyone exits through one narrow door. GPU networks have the same problem: fast server ports do not guarantee enough capacity further along the path.

## Follow one transfer

A **leaf** switch connects endpoints such as server NICs. “Top-of-rack,” or ToR, describes a common placement, not a requirement that every rack has exactly one local leaf.

In a typical two-tier leaf-spine design, each leaf connects to every spine. A transfer between endpoints on different leaves follows this conceptual route:

```text
Server A NIC
     |
   Leaf A
     |
   Spine
     |
   Leaf B
     |
Server B NIC
```

Endpoints on the same leaf can communicate without going through a spine. Routing selects among available paths; the diagram shows one path, not the whole redundant topology.

## Count bandwidth, not just ports

Suppose a hypothetical leaf has:

- 32 server-facing ports at 400 Gb/s: **12.8 Tb/s** of potential incoming traffic.
- 16 spine-facing ports at 400 Gb/s: **6.4 Tb/s** of outgoing uplink capacity.

For traffic that must leave this leaf, that is **2:1 oversubscription**. If all server ports transmit off-leaf at line rate simultaneously, the uplinks cannot carry it all.

This calculation compares one direction consistently. Do not double-count full-duplex bandwidth on one side. Also distinguish bits from bytes: 400 Gb/s is 50 GB/s before protocol and other overhead, not 400 GB/s of application throughput.

Matching downlink and uplink capacity removes this particular bottleneck. It does not prove the entire fabric is non-blocking under every traffic pattern. Switch capacity, paths, routing, congestion, and endpoints still matter.

## When does a super-spine appear?

A larger design may need another tier to connect groups of switches when port counts limit expansion. This is often called a **super-spine**. It adds reach and capacity, but also equipment, cabling, and paths to operate.

Not every pod needs this third tier, and a fabric already exists without one. Larger fabrics need not have identical latency for every source and destination.

## Roles are not product names

NVIDIA Quantum is an InfiniBand switch family; NVIDIA Spectrum and other vendors' switches serve Ethernet designs. Depending on the design, similar switch hardware may act as a leaf or a spine. AMD GPUs do not require an “AMD spine switch”; compatibility is a whole-system question involving NICs and software too.

Before approving a diagram, trace the busiest workload's traffic across it. The important question is not “Are these 400G switches?” It is “How much simultaneous traffic can this path sustain?”

## Sources and next steps

- [NVIDIA: SuperPOD network fabric layouts and port ratios](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-h100/latest/network-fabrics.html)

Next: [RDMA, InfiniBand, and RoCE](/articles/gpu-rdma-infiniband-roce). Or return to the [GPU infrastructure guide](/articles/gpu-infrastructure-guide).
