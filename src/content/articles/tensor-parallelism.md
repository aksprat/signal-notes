---
title: "Tensor parallelism: when one GPU is not enough"
summary: "How large models are split across GPUs, plus the metrics worth watching."
date: "Learning note"
topics: ["Infrastructure", "GPUs", "Inference"]
readTime: "4 min read"
---

Some models are too large to fit comfortably on a single GPU. Tensor parallelism divides the model’s numerical work across multiple GPUs so they can process parts of a layer together.

This is not the same as giving each request to a different GPU. The GPUs cooperate on one model, exchanging intermediate results as the model runs. It is commonly necessary for very large models, such as many 70B-class deployments.

## The benefit and the catch

More GPUs make a larger model possible and can improve capacity. But communication between GPUs adds overhead. A poorly connected cluster can spend too much time moving data instead of generating tokens.

## Benchmark the whole experience

Do not judge a deployment by one number. Watch:

- P50, P95, and P99 latency
- time to first token and tokens per second
- requests per second
- GPU utilisation, memory use, and power
- cost per million tokens

Tools such as GenAI-Perf, Locust, k6, Prometheus, Grafana, and LLMPerf can help create and observe load. The goal is not maximum GPU utilisation in isolation; it is a dependable response at a cost your product can sustain.
