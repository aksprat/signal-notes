---
title: "NCCL and RCCL: how GPUs agree on an answer"
summary: "AllReduce, AllGather, and ReduceScatter in plain English, plus what collective benchmarks really tell you."
date: "Learning note"
topics: ["GPU Infrastructure", "AMD", "NVIDIA", "NCCL", "RCCL", "Distributed training"]
readTime: "3 min read"
---

Eight colleagues each calculate part of a budget. Before anyone can publish the total, they need to combine their numbers and distribute the result. More calculators do not help if that coordination takes most of the meeting.

Distributed GPU workloads face the same challenge. **Collectives** are communication operations involving a group of participants, called ranks.

## Three operations worth knowing

**AllReduce:** combine values from all ranks using an operation such as sum, then give every rank the result. If three ranks contribute 2, 3, and 5, a sum AllReduce gives each rank 10. Real jobs operate on arrays, not just one number.

**AllGather:** assemble everyone's pieces into the complete collection on every rank. Think of collecting all the pages of a document without adding their contents together.

**ReduceScatter:** combine values across ranks, then distribute different portions of the reduced result to different ranks. Everyone contributes, but each rank keeps only its assigned portion.

Data-parallel training often uses gradient reductions; sharded training and tensor-parallel workloads use combinations of collectives. The exact sequence depends on the framework and parallelism strategy.

## Two libraries, similar jobs

**NCCL**, NVIDIA Collective Communications Library, provides optimized communication for NVIDIA GPUs. **RCCL**, ROCm Communication Collectives Library, serves AMD GPUs with a closely related programming interface.

The libraries coordinate movement over supported local links and network transports. Local options include NVIDIA NVLink or AMD xGMI, as well as PCIe. Multi-node communication depends on the networking stack and installed support.

Similar APIs do not make software binaries, performance, or every tuning option interchangeable. Check the documentation for the installed version and platform.

## Why the algorithm changes the outcome

A ring passes chunks through an ordered set of ranks. A tree combines or distributes data through branches. Libraries may choose different algorithms and protocols for different message sizes and topologies.

Small transfers can be dominated by latency. Large transfers need sustained bandwidth. The best setup for one message size may not be best for another, and a rank's position in a group is not its permanent GPU index.

This is why [rail alignment](/articles/gpu-network-rails) can help without dictating every communication pattern.

## Benchmark the conversation, then the work

Use NCCL Tests for NVIDIA or RCCL Tests for AMD, built for the deployed stack. Sweep relevant message sizes and compare one node with multiple nodes under consistent placement.

Record the GPU count, software versions, selected transport, and correctness results. Test-reported algorithm bandwidth and bus bandwidth are different metrics; neither should be compared blindly with a NIC's advertised bit rate.

Finally, measure the real job. Collectives may overlap with computation, and storage or uneven work can dominate runtime. The goal is faster training or better [inference latency](/articles/where-llm-latency-comes-from), not merely a larger benchmark number.

## Sources and next steps

- [NVIDIA: collective operations](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html)
- [AMD: RCCL documentation](https://rocm.docs.amd.com/projects/rccl/en/latest/)
- [NVIDIA: NCCL Tests](https://github.com/NVIDIA/nccl-tests)
- [AMD: RCCL Tests](https://github.com/ROCm/rccl-tests)

Next: [The four network roles](/articles/gpu-cluster-network-roles). Or return to the [GPU infrastructure guide](/articles/gpu-infrastructure-guide).
