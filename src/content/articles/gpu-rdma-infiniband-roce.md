---
title: "RDMA, InfiniBand, RoCE: getting data out of the GPU"
summary: "What direct GPU networking actually removes, and how to compare InfiniBand and Ethernet-based RoCE."
date: "Learning note"
topics: ["GPU Infrastructure", "Networking", "AMD", "NVIDIA", "RDMA", "RoCE", "InfiniBand"]
readTime: "3 min read"
---

Imagine a warehouse where every parcel must first visit the manager's desk. A direct loading route removes that detour. The manager still schedules deliveries; they just do not handle every box.

That is a useful starting point for **remote direct memory access**, or RDMA. It lets supported devices transfer data to or from registered memory with less CPU involvement in the data path.

## RDMA is not automatically GPU-direct

RDMA can operate on host memory. Direct transfers involving GPU memory require additional hardware and software support.

On supported NVIDIA systems, **GPUDirect RDMA** enables a NIC or another peer device to access GPU memory without staging the payload through host RAM. AMD deployments likewise need a supported ROCm GPU-memory RDMA path and compatible NIC software; having RCCL installed is not proof that this path works.

Conceptually:

```text
Host-staged transfer:
GPU -> host RAM -> NIC -> network

Supported direct transfer:
GPU memory <-> NIC <-> network
```

The CPU still handles setup and orchestration. Memory registration, synchronization, permissions, driver compatibility, and PCIe topology still exist. “Direct” means removing a data-copy detour, not removing every layer of the system.

## InfiniBand and RoCE are different choices

**InfiniBand** is a networking technology designed around high-performance communication, with its own adapters, switches, link-level flow control, and fabric-management requirements.

**RoCE** means RDMA over Converged Ethernet. RoCEv2 carries RDMA traffic over UDP/IP on Ethernet, making routed deployments possible. It requires RDMA-capable endpoints and a network engineered for the traffic; an ordinary Ethernet link does not automatically become a well-performing GPU fabric.

Congestion matters in both. RoCE designs commonly combine ECN-based congestion signaling and appropriate flow-control policies, often including priority flow control. Requirements vary with the supported NIC and fabric design. Copying settings blindly can introduce pause storms or head-of-line blocking rather than solve congestion.

## Neither protocol belongs to a GPU brand

Do not reduce the decision to “NVIDIA means InfiniBand, AMD means Ethernet.” Supported deployments can use either network technology with either GPU vendor. Validate the exact GPU, NIC, firmware, driver, communication library, and topology combination.

For a team already experienced with Ethernet, RoCE may fit existing operations. InfiniBand may fit an established HPC environment. Neither is automatically cheaper or faster once switches, optics, tuning, support, and staff time are included.

## Ask for evidence from the real path

Request GPU-buffer communication tests, not just a host-memory bandwidth result or a link-speed screenshot. Then run representative multi-node collectives and the actual workload. A healthy network benchmark is necessary evidence, but it is not an application performance guarantee.

## Sources and next steps

- [NVIDIA: GPUDirect RDMA requirements and limitations](https://docs.nvidia.com/cuda/gpudirect-rdma/)
- [NVIDIA: RoCE documentation](https://docs.nvidia.com/doca/sdk/RDMA-over-Converged-Ethernet/index.html)
- [AMD: RCCL documentation](https://rocm.docs.amd.com/projects/rccl/en/latest/)

Next: [Rail-optimized networking](/articles/gpu-network-rails). Or return to the [GPU infrastructure guide](/articles/gpu-infrastructure-guide).
