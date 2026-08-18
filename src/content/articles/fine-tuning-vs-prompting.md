---
title: "Fine-tuning versus prompting: change the instructions or teach a habit?"
summary: "A practical way to choose between better prompts, retrieval, and fine-tuning."
date: "TechByte"
topics: ["Fine-tuning", "Prompting", "LLMs"]
readTime: "4 min read"
---

Prompting and fine-tuning solve different problems.

## A useful analogy

A prompt is a detailed brief given to a capable freelancer before each assignment. Fine-tuning is more like training a new team member over time to follow a particular style or workflow.

Start with prompts. They are fast to change, cheap to test, and easy to inspect. Add RAG when the answer needs current or private information.

Consider fine-tuning when you have many good examples of a stable behaviour: a consistent output format, a specialised writing style, or a narrow classification task. It can make that behaviour more reliable and reduce the size of every prompt.

Do not fine-tune just to make a model remember a changing knowledge base. Updating the source documents and retrieving them is usually a better fit. A good rule: use prompts for instructions, RAG for knowledge, and fine-tuning for repeatable behaviour.
