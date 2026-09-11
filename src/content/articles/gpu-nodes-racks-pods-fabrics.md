---
title: "Nodes, racks, pods, fabrics: a map, not a Russian doll"
summary: "Separate physical GPU capacity from network connectivity, and avoid misleading rack and pod sizing rules."
date: "Learning note"
topics: ["GPU Infrastructure", "GPUs", "AMD", "NVIDIA", "Capacity planning"]
readTime: "3 min read"
---

An address tells you where a house is. A road map tells you how to reach it. GPU infrastructure needs both views, but architecture diagrams often mix them together.

“Node → rack → pod → fabric” is a handy introduction. It becomes misleading when it suggests every term is simply a larger physical container.

## Node: the machine you schedule work on

A GPU node is a server with host resources and accelerators. Eight GPUs is a common configuration in high-end training systems, not a definition. Smaller servers and rack-scale designs exist too.

Use this term when asking whether a model fits, how many GPUs a job requests, or which host has failed. A node's CPU, RAM, GPU memory, and I/O paths all affect usable capacity.

## Rack: the physical constraint

A rack holds equipment and brings power, cooling, space, and cabling constraints into the picture.

There is no universal “four to eight GPU servers per rack” rule. Server size, rack power limits, cooling design, switches, and service clearance determine what is practical. An NVIDIA DGX deployment and an AMD Instinct deployment both need that facilities calculation; a GPU brand does not answer it.

For a deliberately hypothetical example, six 10 kW nodes already represent 60 kW of server load, before switches and other equipment. That is arithmetic for planning, not a specification for any named product.

## Pod: the repeatable deployment unit

Operators often call a collection of racks a pod: a unit they can build, validate, and expand repeatedly. Vendors may instead specify a scalable unit or another named block.

Ask what the term means in that design. Does it define network capacity, a power footprint, a scheduler boundary, or all three? It is not automatically a tenant-security boundary. This infrastructure pod is also different from a Kubernetes Pod.

## Fabric: the connectivity view

A fabric is the interconnected communication system. A compute fabric may span one pod or several; a storage fabric can cover the same physical racks while serving a different purpose.

```text
Physical:      node -> rack -> group of racks
Connectivity:  compute fabric across those nodes
               storage network across those nodes
```

Neither “fabric” nor “pod” guarantees full bandwidth between every pair. Oversubscription, routing, competing jobs, endpoint limits, and failures determine what applications actually receive. Remote GPU communication also has real latency; it is not equivalent to a local memory access.

## Turn labels into questions

For a capacity proposal, ask: how many usable GPUs, under which power limit, connected by which topology, with what measured scaling? Then ask which resources and failure domains are shared.

That is more useful than arguing whether a collection of racks is “really” a pod.

## Sources and next steps

- [NVIDIA: DGX SuperPOD H100 reference architecture](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-h100/latest/)
- [AMD: MI300 architecture](https://rocm.docs.amd.com/en/latest/reference/gpu-arch/mi300.html)

Next: [Leaf, spine, and super-spine](/articles/gpu-leaf-spine-networks). Or return to the [GPU infrastructure guide](/articles/gpu-infrastructure-guide).
