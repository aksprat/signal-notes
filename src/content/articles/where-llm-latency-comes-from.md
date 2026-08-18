---
title: "Where LLM latency actually comes from"
summary: "A practical map of network, queue, prefill, and decode time."
date: "Learning note"
topics: ["LLMs", "Performance", "Infrastructure"]
readTime: "5 min read"
---

“The model is slow” is rarely a complete diagnosis. An AI response is a sequence of stages, and each stage can become the bottleneck.

## Four places time disappears

1. **Network latency** is travel time between the user, your application, and the model endpoint. Physical distance still matters.
2. **Queue latency** is time spent waiting for a GPU or worker. It often rises suddenly during traffic spikes.
3. **Prefill latency** is the time needed to read and process the input prompt. A large document or long chat history makes this stage expensive.
4. **Decode latency** is the token-by-token generation of the answer. A longer answer means more decode work.

These stages are additive. A quick model can still feel slow if requests wait two seconds in a queue. A nearby endpoint can still be slow if a 50,000-token document needs to be read first.

## Diagnose before optimising

Instrument the stages separately. If time-to-first-token is high, look first at queueing, network, and prefill. If the response begins quickly but drags on, inspect decode speed and output length.

This gives you more useful options than simply choosing a larger model: shorten context, move closer to users, set output limits, add capacity, or improve batching. Good performance work starts by naming the wait correctly.
