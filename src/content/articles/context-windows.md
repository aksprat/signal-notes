---
title: "Context windows are working memory, not understanding"
summary: "What a context window lets an LLM see, and why more context is not automatically better."
date: "Learning note"
topics: ["LLMs", "Context", "Foundations"]
readTime: "4 min read"
---

A context window is the amount of information an LLM can consider at one time. It includes the system instructions, the current conversation, documents you attach, and the tokens it is generating.

Think of it as working memory. If a conversation becomes longer than the window, something must be removed, summarized, or compressed. The model cannot attend to what is no longer present.

## Why larger is useful

A larger window can hold longer chats, more source material, or a bigger codebase. That enables useful experiences, such as asking questions across a long report without splitting it manually.

## Why larger is not free

More context increases prefill work, GPU memory usage, and often cost. It can also make the model less reliable if important facts are buried in a huge, noisy prompt.

The better question is not “What is the largest context window available?” It is “What is the smallest, cleanest set of information needed for this answer?” Retrieval, summaries, and good prompt structure are often more valuable than simply sending everything.
