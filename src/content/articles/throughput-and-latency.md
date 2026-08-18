---
title: "Throughput versus latency: two different promises"
summary: "A system can process a lot of work and still make an individual user wait."
date: "Learning note"
topics: ["Performance", "Scaling", "Inference"]
readTime: "3 min read"
---

Throughput and latency are often discussed together, but they answer different questions.

- **Latency** asks: how long did this request take?
- **Throughput** asks: how much work can the system finish over time?

An inference service might process 200,000 tokens per second overall while a single request still waits several seconds. That can happen because the service is busy, batching work, or handling many users at once.

## The tension

Batching requests is great for GPU efficiency and throughput. But holding a request briefly to build a better batch can add latency for that person. Serving every request immediately may reduce waiting but leave the GPU underused.

There is no universally correct setting. A real-time assistant needs low time-to-first-token. An overnight document-processing job may care far more about total throughput and cost.

## Choose the user-facing promise

Before tuning, write down what the product is promising: a live conversation, a fast single answer, or a high-volume background workflow. Then measure the metric that matches that promise. Optimising the wrong one can make dashboards look better while the product gets worse.
