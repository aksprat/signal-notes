---
title: "Inside a GPU server: two conversations, two interconnects"
summary: "Understand scale-up and scale-out, with NVIDIA NVLink/NVSwitch and AMD MI300X Infinity Fabric examples."
date: "Learning note"
topics: ["GPU Infrastructure", "GPUs", "AMD", "NVIDIA", "NVLink", "Infinity Fabric"]
readTime: "3 min read"
---

Imagine eight people working around one table. Passing a document across the table is different from sending it to another office. GPU servers have the same distinction: communication among nearby GPUs, and communication with GPUs in other machines.

## What is actually in the box?

An eight-GPU server contains more than eight accelerators. Host CPUs run the operating system and coordinate work. System RAM holds host data. Each discrete GPU has its own high-bandwidth memory, or HBM. PCIe connects devices to the host, and network interface cards, or NICs, provide paths outside the machine.

The exact GPU-to-NIC layout matters. Two devices that look adjacent on the rear panel may sit behind different PCIe switches or CPU sockets.

## The local conversation: scale-up

In a DGX H100/H200-class system, **NVLink** is the GPU interconnect and **NVSwitch** switches that traffic between GPUs. Think of the links as roads and the switches as intersections designed for those roads.

AMD's documented eight-GPU **MI300X** platform uses **Infinity Fabric** links to form a fully connected GPU topology: each GPU has links to the other seven. ROCm documentation also uses **xGMI** when discussing these GPU interconnects. This is not an AMD-branded NVSwitch; the topology and implementation differ.

PCIe can also carry GPU peer-to-peer traffic on supported platforms, but it is not equivalent to a dedicated scale-up interconnect. Access and performance depend on the platform and software configuration.

## The remote conversation: scale-out

Conceptually, the two paths look like this:

```text
Within a node:
GPU <-> local GPU interconnect <-> GPU

Between nodes:
GPU <-> NIC <-> network <-> NIC <-> GPU
```

The external network may be InfiniBand or Ethernet with RoCE. GPU-to-NIC transfers still depend on a supported local I/O path. Eight GPUs do not automatically mean eight dedicated NIC cards, or an exclusive physical GPU/NIC pairing.

“Scale-up means inside one server” is a useful starting point, not a universal rule. NVIDIA's GB200 NVL72 extends an NVLink domain across a rack-scale system.

## Connected memory is not pooled memory

Fast peer access does not magically turn eight discrete GPUs into one GPU with eight times the transparently usable memory. Frameworks still decide where tensors live and how they move. [Tensor parallelism](/articles/tensor-parallelism) is one way to divide model work and memory across devices.

When comparing systems, ask for the GPU interconnect diagram, GPU-to-NIC topology, and measured communication performance. “Eight GPUs” tells you the headcount, not how well the team can work together.

## Sources and next steps

- [AMD: MI300 node-level architecture](https://rocm.docs.amd.com/en/latest/reference/gpu-arch/mi300.html#node-level-architecture)
- [NVIDIA: DGX H100/H200 user guide](https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html)
- [NVIDIA: GB200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/)

Next: [Nodes, racks, pods, and fabrics](/articles/gpu-nodes-racks-pods-fabrics). Or return to the [GPU infrastructure guide](/articles/gpu-infrastructure-guide).
