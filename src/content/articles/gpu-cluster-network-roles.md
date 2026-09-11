---
title: "A GPU cluster has more than one network job"
summary: "Compute, storage, in-band management, and out-of-band access serve different needs—even in the same rack."
date: "Learning note"
topics: ["GPU Infrastructure", "Networking", "Storage", "Operations", "AMD", "NVIDIA"]
readTime: "3 min read"
---

A restaurant separates the dining room, delivery entrance, staff corridor, and emergency access. They serve the same building, but sending everything through one doorway creates predictable problems.

A GPU cluster also has several kinds of traffic. NVIDIA's DGX SuperPOD reference architecture explicitly distinguishes four network roles. The same questions are useful when designing an AMD-based cluster, even if its implementation differs.

## Compute: GPUs coordinating work

The compute fabric carries inter-node communication such as gradients and intermediate tensors. It needs the bandwidth and latency characteristics required by the workload's collectives.

A slow path can hold up many GPUs at a synchronization point. This is why topology, congestion, and rank placement matter as much as individual port speeds.

## Storage: feeding and saving the job

The storage network brings in datasets and model weights and carries checkpoints back to durable storage. It can use Ethernet or InfiniBand, depending on the storage system and deployment.

Its traffic pattern differs from compute traffic. Model loading may create a startup burst; checkpointing can create large coordinated writes. Even a perfect compute fabric cannot help if every GPU is waiting for the next training batch.

A useful diagnostic question: do step-time spikes line up with checkpoint activity or input-pipeline stalls?

## In-band management: ordinary administration

In-band access uses the running host's network stack. It supports activities such as SSH, software distribution, orchestration, logging, and monitoring.

It needs reliability and appropriate access controls, but usually does not need the same bandwidth per server as GPU collective traffic. If the host operating system or its network configuration breaks, this access may disappear too.

## Out-of-band: when the host is not cooperating

Out-of-band management reaches interfaces such as a server's baseboard management controller, or BMC, rather than relying on the host OS. It can support remote console access, hardware inspection, and authorized power operations when the host is unresponsive.

This path requires its own security treatment. Keep management controllers off the public internet, restrict administrative access, and maintain firmware and credentials. “Out-of-band” does not mean invulnerable or available during a complete power failure.

## Four roles need not mean four physical fabrics

Some designs use dedicated switches and cabling; others share parts of the network with logical segmentation and traffic policies. VLANs separate traffic logically but do not reserve physical bandwidth by themselves.

Sharing may reduce cost. It also creates common capacity and failure risks. Physical separation reduces some shared dependencies but does not guarantee complete independence: power, control systems, or upstream equipment may still overlap.

When reviewing a diagram, use four colors for these four roles. Then ask what a dataset burst, failed host, or management mistake would affect. That exercise often reveals more than another page of switch specifications.

## Sources and next steps

- [NVIDIA: SuperPOD compute, storage, and management networks](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-h100/latest/network-fabrics.html)

Next: [Before you add more GPUs](/articles/gpu-cluster-checklist). Or return to the [GPU infrastructure guide](/articles/gpu-infrastructure-guide).
