---
title: "KV cache: why the second token is cheaper"
summary: "How LLMs avoid re-reading the entire conversation every time they generate a word."
date: "Learning note"
topics: ["LLMs", "Inference", "Performance"]
readTime: "4 min read"
featured: true
---

When an LLM answers a prompt, it does not produce the whole answer in one go. It generates one token, then the next, then the next. Without a cache, each new token would require the model to reprocess every token that came before it.

That is wasteful. If a conversation is 2,000 tokens long, the model has already done most of the attention work needed to understand those 2,000 tokens.

## What gets cached

In a Transformer, each layer produces **key** and **value** representations for every token. Together, they are the model's working notes about what has been read so far. A KV cache stores those representations so the model can reuse them during the next decode step.

The result is simple: the model calculates the new token's relationship to the cached history instead of rebuilding the history from scratch.

## Why it matters in practice

KV caching is one of the reasons streaming responses can feel fast after the first token appears. It also changes capacity planning: long chats consume GPU memory because their cached history must stay resident.

Two useful extensions are worth knowing:

- **Prefix caching** reuses a shared beginning, such as a long system prompt or common document set, across requests.
- **Continuous batching** lets an inference server keep adding and removing requests as they finish, rather than waiting for one fixed batch to complete.

The takeaway: caching trades memory for speed. When you design an AI application, that is usually a very good trade—but it is still a trade.
