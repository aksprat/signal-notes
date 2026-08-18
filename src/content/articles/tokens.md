---
title: "Tokens: the small pieces an LLM reads and writes"
summary: "Why token count, not word count, shapes AI cost, context, and response length."
date: "TechByte"
topics: ["Tokens", "LLMs", "Cost"]
readTime: "3 min read"
---

Language models do not read text exactly one word at a time. They split it into **tokens**: small pieces that might be a word, part of a word, punctuation, or code symbols.

## Think of tokens as LEGO pieces

Words are the finished objects. Tokens are the LEGO pieces the model uses to build and understand them. A short familiar word may be one piece; an unusual name or dense code snippet may need several.

Tokens matter because model limits and pricing are normally measured in tokens. The input prompt, retrieved documents, conversation history, and generated answer all count.

This is why a request to “read this 200-page PDF” costs much more than “summarise this paragraph,” even if both are one request. When estimating an AI feature, count the information being sent and produced—not only the number of clicks or conversations.
