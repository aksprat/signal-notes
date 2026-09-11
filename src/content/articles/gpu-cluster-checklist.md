---
title: "Before you add more GPUs: a cluster sanity checklist"
summary: "A vendor-aware way to validate GPU servers, communication paths, and workload scaling before buying more capacity."
date: "Learning note"
topics: ["GPU Infrastructure", "AMD", "NVIDIA", "Performance", "Operations"]
readTime: "4 min read"
---

Your job runs on one server. On four servers, it is faster—but nowhere near four times faster. Before ordering more GPUs, find out what the existing ones are waiting for.

Work outward from one device to the application. Change one variable at a time and record the baseline. The following checks apply to NVIDIA and AMD clusters, using the tools and support matrix appropriate to each platform.

## 1. Define success before testing

For training, choose a consistent workload and measure step time or samples per second. Record batch-size changes: strong scaling and weak scaling answer different questions.

For inference, measure throughput while meeting a latency target, including time to first token and tail latency. A larger batch that misses the service target is not an improvement for your users.

Also record model precision, sequence length, parallelism strategy, and software versions. Otherwise two “same model” runs may not be comparable.

## 2. Check the node first

- Confirm GPU count and usable memory. Model weights are only part of the memory budget; activations, workspaces, and the [KV cache](/articles/kv-cache) matter too.
- Inspect GPU health, temperatures, power limits, and throttling using NVIDIA's management tools or AMD SMI, as appropriate.
- Compare the discovered GPU interconnect and GPU-to-NIC topology with the server's documented layout.
- Check CPU/NUMA placement and the supported driver, firmware, CUDA or ROCm, and framework combination.

An unexpected local bottleneck becomes more expensive when repeated across a cluster.

## 3. Validate the external path

Verify negotiated NIC speeds, link health, and switch errors. Look at congestion indicators and per-interface traffic, not just whether a link is up.

Confirm the communication library selected the intended interfaces and transport. A job can run successfully through an unintended socket path while leaving the planned RDMA fabric underused.

On rail-aligned systems, compare equivalent paths across nodes. One incorrectly mapped or degraded interface can distort a whole-job benchmark.

## 4. Separate communication from application behavior

Run supported NCCL Tests or RCCL Tests, starting within one node and then expanding. Include correctness checks and message sizes relevant to the workload. Schedule load tests in an approved window rather than saturating a shared production fabric unexpectedly.

If collectives are healthy but the application is slow, inspect data loading, storage, CPU work, and synchronization imbalance. Communication benchmarks narrow the search; they do not clear the entire system.

## 5. Calculate scaling honestly

Suppose a hypothetical one-node job processes 100 samples/s and the comparable four-node job processes 320 samples/s:

```text
Speedup = 320 / 100 = 3.2x
Scaling efficiency = 3.2 / 4 = 80%
```

This is an illustrative calculation, not an AMD or NVIDIA benchmark. Keep workload conditions explicit and evaluate the extra cost alongside the speedup. “Only 80%” may be acceptable—or uneconomic—for your goal.

## 6. Check the things outside the benchmark

Observe dataset access, checkpoint duration, rack power, cooling capacity, and management access. Test checkpoint recovery in a controlled environment; redundant links alone do not guarantee job recovery.

The final acceptance result should be a repeatable workload run with its configuration and measurements attached. More GPUs should solve a measured capacity problem, not hide an unexplained waiting problem.

## Sources and next steps

- [NVIDIA: NCCL troubleshooting](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/troubleshooting.html)
- [AMD: AMD SMI documentation](https://rocm.docs.amd.com/projects/amdsmi/en/latest/)
- [NVIDIA: NCCL Tests](https://github.com/NVIDIA/nccl-tests)
- [AMD: RCCL Tests](https://github.com/ROCm/rccl-tests)

Continue with [tensor parallelism](/articles/tensor-parallelism), or revisit the [GPU infrastructure guide](/articles/gpu-infrastructure-guide).
