---
title: "Attention: how models connect words—and why long prompts cost more"
summary: "A beginner’s mental model for self-attention and the price of asking every token to look around."
date: "Learning note"
topics: ["LLMs", "Attention", "Foundations"]
readTime: "5 min read"
---

Consider the sentence: “The cat sat on the mat because it was tired.” To understand “it,” you connect it to “cat,” not “mat.” Language models need a mathematical version of that skill.

## Self-attention in plain language

Self-attention lets each token weigh the relevance of other tokens in the same context. In “Akshit works at DigitalOcean. He likes cloud computing,” the token “He” can place more weight on “Akshit.”

Transformers made this powerful because many of those relationships can be calculated in parallel on GPUs. That is a major reason modern LLMs work so well with language and code.

## The scaling problem

There is a cost. With 100 tokens, comparing every token with every other token means roughly 10,000 possible relationships. At 10,000 tokens, that grows toward 100 million.

The exact implementation varies, and modern systems use many optimisations, but the design lesson stays the same: long context is computationally significant. Send relevant material, clearly structured, rather than using a context window as an unfiltered filing cabinet.
