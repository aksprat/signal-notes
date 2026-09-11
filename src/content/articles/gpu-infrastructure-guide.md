---
title: "GPU infrastructure: from one server to a cluster"
summary: "A practical reading path through NVIDIA and AMD GPU servers, fabrics, rails, and the bottlenecks between them."
date: "Learning guide"
topics: ["GPU Infrastructure", "GPUs", "AMD", "NVIDIA"]
readTime: "3 min read"
---

Buying more GPUs is a little like hiring more cooks. It helps only if the kitchen has enough workspace, ingredients arrive on time, and nobody spends the evening waiting for someone else's pan.

GPU infrastructure is that kitchen: accelerators, local interconnects, networks, storage, power, and software working together. This series explains how the pieces fit, using NVIDIA and AMD examples without treating their architectures as interchangeable.

## Start with the map

There are two useful views of a cluster:

- **Physical:** GPUs live in servers; servers live in racks; operators may group racks into pods.
- **Communication:** scale-up links connect closely cooperating GPUs; scale-out networks connect nodes. A network rail is a connectivity pattern, not another physical box in the hierarchy.

A fabric describes connectivity. It does not promise unlimited bandwidth, zero latency, or one automatically shared pool of GPU memory.

## Read the series in order

1. [Inside a GPU server](/articles/inside-a-gpu-server): distinguish PCIe, NVIDIA NVLink/NVSwitch, AMD Infinity Fabric, and the path to a NIC.
2. [Nodes, racks, pods, and fabrics](/articles/gpu-nodes-racks-pods-fabrics): separate the physical building blocks from the logical network.
3. [Leaf, spine, and super-spine](/articles/gpu-leaf-spine-networks): follow a packet and calculate where oversubscription appears.
4. [RDMA, InfiniBand, and RoCE](/articles/gpu-rdma-infiniband-roce): understand how data moves between servers without unnecessary host-memory staging.
5. [Rail-optimized networking](/articles/gpu-network-rails): see why NIC placement matters, and why eight rails are not eight independent jobs.
6. [NCCL and RCCL](/articles/gpu-nccl-rccl-collectives): meet the libraries that coordinate GPU communication.
7. [The four network roles](/articles/gpu-cluster-network-roles): separate training traffic, datasets, everyday administration, and emergency access.
8. [Before you add more GPUs](/articles/gpu-cluster-checklist): work through a practical acceptance and troubleshooting checklist.

Each is a standalone learning note. The diagrams are conceptual, not cabling instructions for a particular machine.

## Pick the problem you have today

**“The model does not fit.”** Start with [tensor parallelism](/articles/tensor-parallelism), then the server note. Memory capacity and communication cost belong in the same conversation.

**“One server is fast; four are disappointing.”** Read the topology, rails, and collectives notes. More accelerators cannot fix a saturated path between them.

**“I am comparing AMD and NVIDIA proposals.”** Read the server, RDMA, and checklist notes. Ask for the exact platform topology and supported software stack, not just a GPU model and a port-speed headline.

**“Training stalls whenever checkpoints run.”** Start with the four network roles. The bottleneck may be storage traffic rather than the compute fabric.

## Keep one question in mind

For every arrow in an architecture diagram, ask: **what moves here, how much, and what happens when it slows down?** That question turns a wall of hardware names into a system you can reason about.
