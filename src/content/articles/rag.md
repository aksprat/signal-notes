---
title: "RAG: letting an LLM open the right book first"
summary: "A simple mental model for retrieval-augmented generation and what it does not solve."
date: "TechByte"
topics: ["RAG", "LLMs", "Embeddings"]
readTime: "4 min read"
---

RAG stands for **retrieval-augmented generation**. Before asking a model to answer, a RAG system searches a trusted knowledge source and adds the most relevant material to the prompt.

## Think of it like an open-book exam

Without RAG, you ask the model to answer from what it learned during training and the current conversation. With RAG, you first hand it the most relevant pages from a reference book.

The model is still writing the answer, but it has better evidence in front of it.

## A typical RAG flow

1. Split documents into useful chunks.
2. Create embeddings for those chunks.
3. Search for the chunks closest in meaning to a question.
4. Give the retrieved text and question to the model.
5. Ask the model to cite or stay within those sources.

RAG is excellent for information that changes: internal documentation, product policies, support material, or research notes. It is not magic. Bad source documents, poor retrieval, or an overly broad question can still produce a bad answer. Treat it as a research assistant that needs a good library and clear instructions.
