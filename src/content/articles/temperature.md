---
title: "Temperature: the creativity dial on an LLM"
summary: "Why lower temperature is usually better for facts, while higher temperature can help generate options."
date: "TechByte"
topics: ["Prompting", "LLMs", "Foundations"]
readTime: "3 min read"
---

Temperature controls how much randomness a language model uses when choosing its next token.

## Think of it like choosing from a playlist

At a low temperature, the model repeatedly picks the most likely next song. The result is predictable and consistent. At a higher temperature, it is more willing to try less likely choices. The result can be fresher, stranger, or less reliable.

For tasks such as extracting fields, generating code in a strict format, or answering from a policy document, start low. You usually want the same careful answer each time.

For brainstorming names, story concepts, campaign angles, or alternative approaches, raise it a little. You are inviting variety.

Temperature does not make a model more knowledgeable. It changes how boldly it explores the possibilities it already assigns probability to. A creative answer can still be wrong, so do not turn up temperature when the real need is better source material.
