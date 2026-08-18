---
title: "P50, P95, and P99: the latency numbers users actually feel"
summary: "Why an average response time can look healthy while some users are having a terrible experience."
date: "Learning note"
topics: ["Performance", "Observability", "Inference"]
readTime: "4 min read"
---

An average latency number can be comforting and misleading at the same time. Imagine nine requests take one second and one request takes ten seconds. The average is 1.9 seconds, but one person waited ten seconds.

That is why teams use percentiles.

## Read the distribution

Sort 100 request times from fastest to slowest:

- **P50** is the median: half of requests completed faster than this value.
- **P95** is the experience near the slow end: only 5% of requests were slower.
- **P99** reveals the extreme tail: only 1% were slower, but those are often the sessions people remember.

If P50 is 800 ms, P95 is 2.5 s, and P99 is 9 s, the product is not simply “2.5 seconds fast.” It is fast for many users and frustratingly slow for a small but meaningful group.

## A useful habit

Track P50 and P95 together. P50 tells you about the typical case; P95 tells you whether the system stays dependable when traffic, long prompts, or GPU queues appear. Add P99 when the cost of a badly delayed request is high.

For AI products, measure these separately for time-to-first-token and total response time. A stream that starts quickly often feels responsive even when the complete answer takes longer.
