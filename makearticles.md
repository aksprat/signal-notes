# KV Cache

**KV Cache**

Without KV Cache:

Every token generation reprocesses the entire prompt.

Very expensive.

With KV Cache:

Reuse previous attention calculations.

Huge latency reduction.

**Continuous Batching** \- Improves throughput.

**Prefix Caching**  
Many users share system prompts.  
Cache them.  
Example:  
You are a helpful assistant...  
Don't recompute repeatedly.

## **Tensor Parallelism**

Split model across GPUs.

```
GPU1
GPU2
GPU3
GPU4
```

Each processes part of the model.

Required for 70B.

Benchmark it.

Metrics:

### **Latency**

* P50  
* P95  
* P99

### **Throughput**

* Tokens/sec  
* Requests/sec

### **GPU**

* Utilization  
* Memory  
* Power

### **Cost**

* Cost per million tokens

---

Tools:

* GenAI Perf  
* Locust  
* k6  
* Prometheus  
* Grafana  
* LlmPerf

---

# Understand Latency

Average hides bad experiences.

That's why engineers use **percentiles**.

---

# **What is P50?**

P50 means:

> 50% of requests completed within this time.

Also called:

**Median Latency**

Example:

100 requests sorted from fastest to slowest.

The 50th request takes:

```
800ms
```

Then:

```
P50 = 800ms
```

Meaning:

Half the users got responses in under 800ms.

---

# **What is P90?**

P90 means:

> 90% of requests completed within this time.

Example:

100 requests sorted.

90th request takes:

```
2 seconds
```

Then:

```
P90 = 2s
```

Meaning:

90 users got responses in less than 2 seconds.

10 users were slower.

---

# **What is P95?**

P95 means:

> 95% of users got responses faster than this.

Example:

95th request:

```
2.5 seconds
```

Then:

```
P95 = 2.5s
```

Only 5% of users saw worse performance.

Most companies care heavily about P95.

---

# **What is P99?**

P99 means:

> 99% of users completed within this time.

Example:

99th request:

```
8 seconds
```

Then:

```
P99 = 8s
```

This captures the worst user experiences.

---

# **Visual Example**

Suppose we have:

```
1000 requests
```

Sorted from fastest to slowest:

```
100ms
150ms
200ms
300ms
...
700ms
...
1500ms
...
2500ms
...
9000ms
```

Results:

```
P50 = 700ms
P90 = 1500ms
P95 = 2500ms
P99 = 9000ms
```

Latency is accumulated at every step.

---

## **Network Latency**

Travel time.

Example:

India → US

```
150ms
```

---

## **Queue Latency**

Requests wait in line.

Example:

```
GPU busy
```

Request waits:

```
2 seconds
```

before processing starts.

Very common problem.

---

## **Prefill Latency**

Model reads your prompt.

Example:

```
"Explain quantum computing"
```

The model processes the input.

Large prompts increase prefill time significantly.

---

## **Decode Latency**

Model generates output tokens.

Example:

```
Once...
upon...
a...
time...
```

Every generated token adds time.

# **Throughput vs Latency**

Many people confuse these.

---

## **Throughput**

How much work the system can do.

Example:

```
1000 requests/sec
```

or

```
200,000 tokens/sec
```

---

## **Latency**

How fast one request finishes.

Example:

```
1.2 seconds
```

# Context Window, Attention, KV cache

Request A

```
Hi
```

2 tokens.

---

Request B

```
Analyze this 200-page PDF
```

50,000 tokens.

---

Same request count.

Wildly different infrastructure cost.

---

# **What is a Context Window?**

Imagine you're talking to me.

I need a memory of the conversation.

The context window is:

> How much information the model can remember at one time.

Example:

```
Context Window = 128K tokens
```

means:

Model can "see"

128,000 tokens.

---

Think of it as:

```
Working memory
```

---

Example

Suppose:

```
Context Window = 10 tokens
```

Conversation:

```
1 Hello
2 My name is Akshit
3 I work at DigitalOcean
4 What is my name?
```

If the first message falls out of memory:

The model forgets.

---

Larger context window means:

* More documents  
* Longer chats  
* Larger codebases

---

# **What Happens Inside The Context Window?**

Suppose:

```
Akshit works at DigitalOcean
```

Tokenized:

```
Akshit
works
at
DigitalOcean
```

The model now asks:

> Which tokens are important to each other?

This leads us to Attention.

---

# **What is Attention?**

Attention is the magic behind modern LLMs.

Imagine reading:

```
The cat sat on the mat because it was tired.
```

Question:

What does "it" refer to?

The cat.

Not the mat.

---

Humans do this naturally.

Transformers do it mathematically.

---

Attention allows every token to look at other tokens.

Example:

```
Akshit works at DigitalOcean.
He loves cloud computing.
```

"He"

needs attention to:

```
Akshit
```

to understand the meaning.

---

Visualize:

```
Akshit ← He
DigitalOcean ← cloud
```

Connections form between tokens.

---

This is called:

```
Self Attention
```

---

Transformers changed the game using two main breakthroughs:

* **The Attention Mechanism (Self-Attention):** Instead of reading word-by-word, a Transformer looks at the *entire sentence all at once*. It calculates how every word relates to every other word. For example, in the sentence *"The bank of the river,"* the word "bank" connects heavily to "river." In *"The bank held the money,"* "bank" connects to "money." The model figures out the context instantly.  
* **Parallel Processing:** Because it looks at everything simultaneously, computers can train these models incredibly fast using modern GPUs.

# **Why Attention Is Expensive**

Suppose:

100 tokens.

Every token looks at:

99 others.

Work:

```
100 × 100
= 10,000 comparisons
```

---

Now:

10,000 tokens.

Work:

```
10,000 × 10,000

100 million comparisons
```

Huge.

---

This is why long prompts become expensive.

---

# **Enter KV Cache**

This is one of the most important FDE topics.

Let's understand the problem first.

---

Suppose user asks:

```
Tell me a story.
```

Model generates:

```
Once
upon
a
time
...
```

---

Without KV Cache

When generating token \#100

The model rereads:

```
Once
upon
a
time
...
99 tokens
```

again.

Every time.

---

For token \#101

Read everything again.

---

For token \#102

Read everything again.

---

Massive waste.

---

# **KV Cache Solution**

Instead of recalculating old work:

Store it.

Reuse it.

---

Like this:

```
Prompt
↓
Attention Calculation
↓
Store Result
↓
KV Cache
```

---

Later:

```
Need Next Token?
```

Use cached data.

Don't recompute.

---

Result:

* Lower latency  
* Higher throughput  
* Lower GPU cost

---

# **Real World Analogy**

Imagine writing a book.

Without KV Cache:

Every time you write a new sentence:

You reread the entire book.

---

With KV Cache:

You keep notes.

Much faster.

# **Why do long prompts slow inference?**

Many candidates incorrectly answer

"because more tokens."

Better answer:

Longer prompts create larger KV Cache.

Every generated token must attend over the entire cached context.

Attention grows with context length.

Although previous K,V are reused, attention still reads all cached entries.

Therefore latency gradually increases.

# **How does vLLM improve KV Cache?**

Very common.

vLLM introduced

PagedAttention.

Instead of storing KV Cache in one huge contiguous block

```
AAAAAAAAAAAAAA
```

it divides cache into pages.

Like virtual memory.

Benefits

* avoids memory fragmentation  
* supports many concurrent users  
* easier cache sharing  
* better GPU utilization  
* enables continuous batching

This is why vLLM achieves much higher throughput.

# **Prefix Caching vs KV Cache**

Many confuse these.

KV Cache

One request.

```
User

Hello
How are you?
```

Generate.

Cache exists only during generation.

---

Prefix Cache

Across requests.

User A

```
You are ChatGPT.
```

User B

```
You are ChatGPT.
```

Reuse KV Cache for

"You are ChatGPT"

No need to recompute.

Huge savings.

# Prefill & Decode

# **The Two Phases of LLM Inference**

Every LLM request has two major phases:

```
User Prompt
   ↓
PREFILL
   ↓
DECODE
   ↓
Response
```

Let's understand each.

---

# **Example Request**

User asks:

> "Write a 500-word article about DigitalOcean."

Input:

```
100 tokens
```

Output:

```
500 tokens
```

---

# **Phase 1: PREFILL**

Think of prefill as:

> Reading and understanding the prompt.

The model reads:

```
Write
a
500-word
article
about
DigitalOcean
```

and builds internal understanding.

---

During prefill:

### **Every token attends to every other token**

Remember attention.

```
Write
↓
500-word

DigitalOcean
↓
article
```

The model creates relationships.

---

At the end of prefill:

The model knows:

```
Topic = DigitalOcean

Task = Article

Length = 500 words
```

and stores information into KV Cache.

---

Important:

### **Prefill happens ONCE**

Only once per request.

---

# **Phase 2: Decode**

Now the model starts generating.

```
DigitalOcean
is
a
cloud
platform
...
```

one token at a time.

---

Each generated token becomes part of context.

```
DigitalOcean
is
a
cloud
platform
...
```

and influences the next token.

---

Decode repeats until completion.

---

# **Real Analogy**

Imagine you're taking an exam.

---

Prefill:

Reading the question paper.

```
Read
Understand
Think
```

---

Decode:

Writing the answer.

```
Word
by
word
by
word
```

---

This analogy is surprisingly accurate.

---

# **Which Phase Is More Expensive?**

Depends.

---

## **Case 1**

Tiny Prompt

```
10 input tokens
1000 output tokens
```

Example:

```
Tell me a story.
```

---

Prefill:

Tiny.

Decode:

Huge.

Most cost is decode.

---

## **Case 2**

Massive Prompt

```
100,000 input tokens
20 output tokens
```

Example:

```
Analyze this codebase.
```

---

Prefill:

Massive.

Decode:

Tiny.

Most cost is prefill.

---

This distinction is extremely important.

> **Does KV Cache help prefill?**

Answer:

Mostly no.

---

Because prefill is the first time the prompt is processed.

Nothing exists in cache yet.

---

KV Cache mainly helps:

```
Decode
```

and repeated prompts.

Prefill:

```
High compute
High memory bandwidth
Burst workload
```

---

Decode:

```
Smaller compute
Continuous workload
KV cache heavy
```

# Flow

Imagine a customer says:

> "Latency increased from 2s to 8s."

An average engineer says:

```
Add more GPUs
```

---

An FDE says:

```
What's the prefill latency?

What's the decode latency?

What's the KV cache utilization?

What's the token throughput?

What's the queue depth?

What's GPU utilization?
```

---

Those questions identify the real bottleneck.

---

# **Mental Model To Remember**

Whenever you hear an LLM request:

Think:

```
Prompt
  ↓
Tokens
  ↓
Prefill
  ↓
Attention
  ↓
KV Cache Creation
  ↓
Decode
  ↓
Token Generation
  ↓
Response
```

If you can visualize this pipeline, you'll understand nearly every modern inference optimization technique.

# Interview Drill

### **Quick Interview Drill**

Customer says:

> "Our chatbot has:

> * P50 \= 1 second  
> * P99 \= 12 seconds  
> * GPU utilization \= 35%  
> * Queue depth spikes during peak traffic"

What are the **top 3 hypotheses** you would investigate first

identifying that the large gap between P50 and P99 suggests something about outliers—likely a subset of requests (often large prompts) causing high latency. And you’re right to connect prompt size, KV cache, and GPU underutilization. Now, for a sharper FDE response, focus your top three hypotheses directly on the most likely bottlenecks:

1. Batch Efficiency & Queueing: If GPU utilization is low but queue depth spikes, it likely means requests aren’t being batched efficiently. Investigate continuous batching configurations and batch scheduling delays.  
2. Long Prefill Latency Outliers: Check if a small percentage of requests have enormous input prompts (e.g., large context windows). These create prefill bottlenecks, where the model spends too long processing input before generating tokens.  
3. KV Cache or Memory Fragmentation: With P99 hitting 12 seconds, you may have memory constraints, causing reduced batch sizes or GPU swapping. Validate that the KV cache isn’t overflowing or that memory allocation is optimal.

# Claude

Chat is for thinking with Claude, Cowork is for delegating to Claude, and Code is for building with Claude.

**Chat** is what you are using right now. It lives at claude.ai, runs in a browser or mobile app, and asks nothing of you technically. You type, and it responds. You can absolutely ask Claude to write code here too, and it will, but the key distinction is that it hands the code back to you as text. Claude is not actually running or executing anything on your machine. Chat is best for writing, brainstorming, analysis, research, summarising, and quick code help

**Cowork** is a desktop application. It is agentic, meaning it can run extended multi-step tasks, access folders on your local computer, create and edit files, and connect to external tools. In Chat, you are the project manager and Claude is the assistant. In Cowork, you are the client and Claude is the whole team. So if you want Claude to actually go into a folder, reorganise files, draft a document and save it, or execute a multi-step workflow without you prompting each step, that is Cowork. It runs in a sandboxed virtual machine, making it safer and simpler to use than Code.

**Claude Code** is for developers. It is a terminal agent that reads your files and builds things autonomously. You install it, run it from your terminal, and it can do things like build entire features, run tests, deploy code, and spin up sub-agents for parallel tasks. It is the most powerful of the three but requires the most technical comfort

**Projects**

Projects let you create folders with memory and task-specific instructions to streamline workflows and maintain focus on ongoing work. Think of a Project as a persistent workspace. You upload relevant files, write custom instructions, and every conversation you start inside that project inherits all of that context. So instead of re-explaining your brand, your writing style, or your codebase every single time, the project already knows it. Projects exist in both Chat and Cowork sections, and the concept is the same in both, but Cowork projects can also include file access and automation context, while Chat projects are more about uploaded documents and instructions shaping the conversation

Artifacts  
An **Artifact** is a piece of content that Claude creates as a standalone output rather than embedding it in a conversation message. When Claude creates one, it appears in a separate panel to the right of the conversation. You can continue refining it through conversation without it getting buried in the chat history. They can include React components, interactive web apps, SVG diagrams, HTML pages, and functional tools. In 2026, Artifacts will also support persistent storage and direct API calls. So if you ask Claude to build you a calculator, a quiz, a chart, or a landing page, that is an Artifact. It is a live, usable output, not just code pasted in a message.

**Skills vs Connectors**

These serve very different purposes.

Skills are folders of specialised knowledge that contain instructions for how Claude should handle a task. They free you from repeating yourself. For example, instead of always mentioning your brand colour scheme whenever you need a presentation, the skill already has that information. Skills are essentially reusable context and instructions you build once and attach to your work. They are most powerful in Cowork. [AI Operator](https://www.aioperator.com/blog/claude-for-work-how-to-use-claude-skills-and-artifacts-to-10x-team-efficiency/)

Connectors, on the other hand, are about connecting Claude to external apps and services. Connectors let you seamlessly connect Claude with tools like Google Drive, Gmail, and Asana to enhance functionality and provide richer task context. So when you want Claude to actually read your emails, pull files from Drive, check your calendar, or create a Jira ticket, that is what connectors are for. Think of skills as teaching Claude how you work, and connectors as giving Claude access to where your work lives

To put it all together simply:

Use **Chat** when you want a conversation, a piece of writing, quick analysis, or code you will copy and use yourself. Use **Cowork** when you want Claude to actually do the work on your computer end to end. Use **Code** if you are a developer and want deep autonomous coding help in your terminal. Use **Projects** to store context so you never repeat yourself. Use **Artifacts** when you want a live, interactive output like an app, chart, or tool. Use **Skills** to encode how Claude should behave for recurring tasks. Use **Connectors** to give Claude access to your actual tools and data.

# RAG

RAG stands for Retrieval-Augmented Generation. \[[1](https://aws.amazon.com/what-is/retrieval-augmented-generation/)\]

It is an AI framework that improves the accuracy and reliability of Large Language Models (LLMs) by fetching facts from an external knowledge base before generating a response. \[[1](https://cloud.google.com/use-cases/retrieval-augmented-generation), [2](https://aws.amazon.com/what-is/retrieval-augmented-generation/)\]

How RAG Works

Instead of relying solely on the data the model was originally trained on, a RAG system follows a specific workflow: \[[1](https://www.geeksforgeeks.org/nlp/what-is-retrieval-augmented-generation-rag/), [2](https://www.youtube.com/watch?v=dDkynerzV-Q)\]

1. Retrieve: When you ask a question, the AI searches through external documents, databases, or company files for relevant information.  
2. Augment: The AI takes your original question and adds the relevant retrieved information to create an enriched prompt.  
3. Generate: The LLM uses this updated prompt to generate a highly accurate, context-aware answer. \[[1](https://www.geeksforgeeks.org/nlp/what-is-retrieval-augmented-generation-rag/), [2](https://www.youtube.com/watch?v=dDkynerzV-Q)\]

Why RAG is Used

* Prevents Hallucinations: By grounding the AI's answers in verifiable, external data, it dramatically reduces made-up facts.  
* Access to Up-to-Date Information: It allows AI to reference real-time or recent information without needing expensive model retraining.  
* Domain-Specific Answers: It enables AI to answer questions using your organization's specific policies, legal documents, or medical records

chunking is the process of breaking down a large text into smaller, manageable pieces (called "chunks") before processing it.

# **Production RAG Architecture**

```
User
↓
Query Rewriter
↓
Retriever
↓
Hybrid Search
↓
Reranker
↓
Context Compression
↓
Prompt Builder
↓
LLM
↓
Answer
↓
Evaluator
↓
Feedback Loop
```

# **Explain the complete RAG pipeline.**

### **Strong answer**

RAG augments LLMs with external knowledge.

Pipeline:

```
Documents
↓
Chunking
↓
Embeddings
↓
Vector DB
↓
Retriever
↓
Re-ranking
↓
Prompt Construction
↓
LLM
↓
Response
```

The purpose is to provide fresh and enterprise-specific information while reducing hallucinations.

# **How do you reduce hallucinations?**

### **Strong answer**

I would use several layers:

#### **Retrieval quality**

* Hybrid search  
* Parent-child retrieval  
* Re-ranking

#### **Prompt grounding**

```
Answer only from the supplied context.
If information is unavailable, say I don't know.
```

#### **Guardrails**

Schema validation.

#### **Confidence thresholds**

Reject low similarity results.

#### **Evaluator**

Use an LLM judge or Ragas faithfulness metric.

**Suppose retrieval itself is poor?**

I would improve:

* chunking  
* embedding model  
* metadata filters  
* hybrid search  
* rerankers

### **Hybrid Search (The Ultimate Compromise)**

* **What it is:** This combines **Dense** (Meaning) and **Sparse** (Keywords) search together.  
* **Anti-Hallucination Power:** It provides the best of both worlds. It grabs data that matches the exact words *and* data that matches the conceptual intent, drastically cutting down on missing information (which is a primary cause of hallucination).

### **Re-ranking (The Strict Editor)**

Search engines are great at finding the top 20 relevant things, but they aren't always great at putting the absolute *best* answer at the very top.

* **What it is:** Re-ranking uses a separate, highly precise AI model (a Cross-Encoder) to look at the user's question and evaluate the fetched chunks one by one, scoring them strictly on how perfectly they answer the prompt. It then drops the useless ones and re-orders the rest.  
* **Anti-Hallucination Power:** LLMs suffer from "lost in the middle" syndrome—if the right answer is buried in a pile of mediocre text, the LLM might ignore it and hallucinate. Re-ranking ensures the golden nuggets of truth are served on a silver platter right at the top.

# Agentic AI

Agentic Design Patterns (How They Operate)

Explain that agents generally use specific reasoning patterns to do their job:

* ReAct (Reason \+ Act): The agent thinks about what to do, takes an action, observes the result, and repeats.  
* Reflection / Self-Correction: The agent generates an output, evaluates its own work for mistakes, and refines it before showing it to the user.  
* Multi-Agent Systems: Instead of one large agent, tasks are split among specialized agents (e.g., one agent writes code, a second agent tests it, and a third agent deploys it).

---

4\. Agentic AI vs. Traditional GenAI

Contrast the two to show you understand the evolutionary leap:

| Feature | Traditional GenAI (e.g., basic ChatGPT) | Agentic AI |
| ----- | ----- | ----- |
| Execution | Single turn (Prompt → Response) | Multi-turn, iterative loop |
| Autonomy | Requires constant human prompt for next step | Figures out the next steps on its own |
| Capability | Text generation and information retrieval | Executes actions, changes state in external systems |

---

5\. Real-World Example

End your answer with a practical use case to ground your explanation:

> *"A great example is an Agentic Customer Support Bot. Instead of just answering a FAQ, the agent can understand a return request, look up the user's order history via API, check the company's return policy document, process the refund in the billing system, and email the user a shipping label—all from a single user prompt."*  
---

I can help you tailor this answer to stand out even more. Would you like to explore popular agent frameworks (like LangGraph, CrewAI, or AutoGen), see how Agentic AI differs specifically from RAG, or practice a mock interview scenario?

# ISL OSL

Core Definitions

* **Input Sequence Length (ISL):** The number of tokens sent to the model in the prompt. This includes user queries, system instructions, chat history, RAG documents, and chain-of-thought tokens.  
* **Output Sequence Length (OSL):** The number of tokens generated by the model as a response. \[[1](https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts/), [2](https://docs.nvidia.com/enterprise-reference-architectures/nim-llm-runai-vanilla-kubernetes/latest/performance-and-scale-methodology.html), [3](https://infohub.delltechnologies.com/de-de/l/generative-ai-in-the-enterprise-with-nvidia-spectrum-x-networking-platform-1/use-cases-345/)\]

Performance Impact

* **Longer ISL:** Increases memory usage during the prefill stage and affects **Time to First Token (TTFT)**.  
* **Longer OSL:** Increases memory bandwidth and capacity demands during the generation stage, raising **Inter-Token Latency (ITL)**. \[[1](https://docs.nvidia.com/nim/benchmarking/llm/latest/parameters.html)\]

Common Workload Pairs

* **Chatbots:** \~512 ISL / 128 OSL  
* **Summarization:** \~2048 ISL / 256 OSL  
* **Code Generation:** \~1024 ISL / 512 OSL  
* **Translation:** \~500–2000 ISL / 500–2000 OSL

# Inference Engine

# **Major Engines**

```
Transformers
   ↓
vLLM
TensorRT-LLM
SGLang
TGI
LMDeploy
Ollama
```

# **vLLM**

vLLM \= Virtual LLM

Developed by UC Berkeley.

Most popular open-source inference engine today.

Suppose:

P50 \= 1 sec

P99 \= 14 sec

GPU utilization \= 20%

Question:

Why low GPU utilization?

Possible causes:

---

### **Small batch size**

GPU underutilized.

Fix:

Increase max\_num\_seqs.

---

### **CPU bottleneck**

Tokenizer is slower than GPU.

Fix:

Parallel tokenization.

---

### **Long prompts**

Prefill stage dominates.

Fix:

Prefix cache.

---

### **KV cache exhaustion**

Frequent evictions.

Fix:

Increase memory utilization.

---

### **Single GPU**

Model too large.

Fix:

Tensor parallelism.

# **Example Production Scenario**

Customer:

Runs Llama 3.1 70B on 4×H100.

Problem:

```
P99 latency = 15 sec
GPU utilization = 35%
```

FDE investigation:

### **Step 1**

Observe Prometheus metrics.

---

### **Step 2**

Check batch size.

---

### **Step 3**

KV cache hit rate.

---

### **Step 4**

Prompt lengths.

---

### **Step 5**

Enable:

* Continuous batching  
* Prefix cache  
* FP8 quantization

---

Results:

```
P99:
15 sec → 5 sec

Throughput:
400 TPS → 1400 TPS

GPU utilization:
35% → 88%
```

# MCP

Model Context Protocol standardizes communication between LLMs and external tools.

Architecture:

```
LLM
↓
MCP Client
↓
MCP Server
↓
Tools
```

MCP allows interoperability.

Examples:

* PostgreSQL MCP  
* GitHub MCP  
* Slack MCP

Benefits:

* reusable  
* secure  
* standardized

---

### **Follow-up**

Difference between tool calling and MCP?

Tool calling is the capability.

MCP is the protocol standardizing how tools are exposed.

**MCP** stands for **Model Context Protocol**. It’s a way for LLM-based tools, like Claude or Cursor, to securely talk to external services and actually execute actions.

LLMs are good at words. They can summarize, explain, and rewrite. But by themselves, they can’t *do* things. They can’t deploy your app. They can’t query a database or roll back a failed release. Not without help.

[MCP](https://www.digitalocean.com/community/tutorials/model-context-protocol) is that help. It’s an open protocol that defines how tools can expose capabilities to AI models in a predictable, structured way. It’s what gives an LLM the power to go from “tell me how to deploy” to “go ahead and deploy it now.”

The **DigitalOcean MCP Server** is one of those tools. It acts as a bridge between your MCP client (like Cursor, Windsurf, Claude Desktop, Claude Code, or any other MCP-compatible client) \- and the DigitalOcean App Platform.

Once it’s running, your assistant can:

* List deployments  
* Show logs  
* Create and delete apps  
* Restart services  
* Validate specs  
* And more

All from a single prompt.

# Guardrails

# **Guardrails.**

Another high-probability question.

### **Strong answer**

Guardrails ensure safety and reliability.

Input guardrails:

* prompt injection detection  
* toxicity filtering  
* PII detection

Output guardrails:

* schema validation  
* hallucination checks  
* content moderation

Business guardrails:

* policy enforcement

# LangGraph

## An orchestrator is a centralized system that automates, manages, and coordinates complex workflows, services, or applications.

## **What is it Used For? (The Core Responsibilities)**

When an interviewer asks *why* we use them, you want to hit these four key pillars:

* **Automation of Complex Workflows:** Instead of running scripts manually, an orchestrator executes tasks in a specific order based on rules or dependencies (e.g., "Don't run Step B until Step A finishes successfully").  
* **Resource Management & Scheduling:** It looks at your infrastructure and decides exactly *where* a task or service should run based on available CPU, memory, or data location.  
* **Self-Healing & Fault Tolerance:** If a service crashes or a machine dies, the orchestrator detects the failure, restarts the service, or moves it to a healthy machine automatically.  
* **Scaling:** It monitors traffic or workload and automatically spins up more instances when demand is high, and scales down when demand drops to save money.

## **LangChain (The Generalist LLM Application Framework)**

* **What it is:** The most widely used open-source framework for building applications powered by language models. It standardizes the "glue" code needed to connect LLMs to external tools, databases, and APIs.  
* **Why it's used:** By default, LLMs are stateless and isolated. LangChain provides ready-made abstractions (like Prompt Templates, Output Parsers, and Chaining mechanisms) so you don't have to write custom wrappers for every LLM or API call.  
* **When to use it:** Use it when you are building a relatively standard, linear LLM application (e.g., *“Take user input $\\rightarrow$ Format into a prompt template $\\rightarrow$ Call Claude/GPT $\\rightarrow$ Clean up the output $\\rightarrow$ Save to a database”*).  
* **The Interview Pitch:** *"LangChain is the ultimate Swiss Army knife for LLM integration. It provides the base components to chain prompt templates, models, and tools together linearly."*

## **2\. LangGraph (The Stateful, Cyclical Agent Framework)**

* **What it is:** An extension of the LangChain ecosystem designed specifically for building **Agentic systems** using a graph-based mental model (Nodes \= Functions/LLMs, Edges \= Decision pathways).  
* **Why it's used:** Standard LangChain is linear and struggles with **loops** (cycles) and complex memory. If an LLM tries to solve a coding problem, fails, and needs to look at the error log and try again, standard LangChain breaks down. LangGraph introduces state machines, allowing loops, parallel execution, and strict "Human-in-the-Loop" manual interrupts.  
* **When to use it:** Use it when building complex autonomous agents or multi-agent teams that need to self-correct, loop until a condition is met, or pass tasks back and forth (e.g., an autonomous software engineer agent).  
* **The Interview Pitch:** *"While standard LangChain handles linear workflows, LangGraph introduces state-machine capabilities, allowing us to build cyclical, multi-agent workflows that can loop, self-correct, and persist memory across complex tasks."*

## **3\. LlamaIndex (The Data-Centric RAG Framework)**

* **What it is:** A specialized framework designed explicitly to connect your proprietary, private data sources to an LLM. It is the gold standard for **RAG (Retrieval-Augmented Generation)**.  
* **Why it's used:** If you have 10,000 messy PDFs, Slack logs, and SQL databases, an LLM cannot read them natively. LlamaIndex provides advanced data ingestion (parsing documents), complex chunking strategies, indexing, and highly optimized data retrieval algorithms.  
* **When to use it:** Use it when your primary technical challenge is data-heavy. If the goal is to search, synthesize, and answer questions accurately across massive enterprise data pipelines, LlamaIndex outclasses LangChain.  
* **The Interview Pitch:** *"If LangChain is compute-and-action focused, LlamaIndex is data-focused. It's the industry standard for advanced RAG, giving us the tools to ingest, parse, chunk, and index complex enterprise data so LLMs can query it without hallucinations."*

| Tool | Core Strength | Ideal Archetype | Developer Experience |
| :---- | :---- | :---- | :---- |
| **LangChain** | App Integration | Linear LLM features & API chaining | Pro-code (Python/TS) |
| **LangGraph** | Multi-Agent Control | Cyclical tasks, self-correcting bots | Pro-code (State Machines) |
| **LlamaIndex** | Data Ingestion/RAG | Deep search over enterprise documents | Pro-code (Data Pipelines) |

**Suppose an LLM agent must repeatedly retrieve documents until confidence exceeds 0.8.**

How would you implement this in LangGraph?

In the interview, you'd want to be a bit more specific. You could say something like: “In LangGraph, I'd have a node that retrieves documents, and after each retrieval, I’d check confidence in the shared state. If confidence is below 0.8, I'd create a conditional edge that loops back to the retrieval node. Once confidence exceeds 0.8, I’d route to the next node—say, the LLM response. This way, the graph keeps iterating until the confidence condition is met.” That level of detail shows not just the concept but that you can implement it thoughtfully. Let’s move on to MCP next\!

Imagine you’re integrating an enterprise CRM (like Salesforce) into an AI agent using MCP. How would you expose Salesforce’s API tools to the agent, and how would the agent dynamically discover and invoke them?

You’ve got the idea\! In an interview, just be a bit more detailed. You’d say the agent (acting as an MCP client) connects to a running MCP server that wraps Salesforce’s APIs as MCP tools. Tools are dynamically discoverable due to MCP’s protocol. The agent would query the MCP server for available tools (for example, “fetchAccount”), and then invoke them as needed. This dynamic discovery allows the agent to adapt to new tools as they are added

Kore.ai is known for its conversational AI platform. Basically, it helps businesses build, deploy, and manage chatbots and virtual assistants—whether for customer service, employee support, or other enterprise use cases. They stand out for offering a no-code and low-code environment that still allows for deep customization.

Why use them? They focus on enterprise-level needs—things like security, scalability, and integration with existing enterprise systems. They’ve also developed a reputation for having solid natural language understanding and for enabling more complex conversational flows.

When you compare them, think of platforms like Dialogflow (from Google) or Microsoft’s Bot Framework. Those might offer tighter integration into their own ecosystems (Google Cloud or Azure), while Kore.ai prides itself on being more platform-agnostic. In other words, if you want flexible deployments across various environments, Kore.ai often pitches itself as a strong contender.

In order to prepare better for the Kore.ai interview \- let's build a full end to end project to understand and use the concept and tools. Let's build a multi agent tool.

## **Multi-Agent Customer Support System using LangGraph**

Agents:

### **Supervisor Agent**

Routes tasks

### **RAG Agent**

Knowledge base

### **Jira Agent**

Create tickets

### **SQL Agent**

Order lookup

### **Email Agent**

Send email

### **Evaluator Agent**

Checks answer quality

Add:

* Human approval  
* Memory  
* Retry loops  
* Structured output  
* Guardrails  
* LangSmith tracing

# Project

# **Multi-Agent Customer Support System using LangGraph**

Imagine an e-commerce company.

User asks:

> "I ordered an iPhone but haven't received it. Can you check my order and create a support ticket if necessary?"

Different agents collaborate:

```
                 User
                  |
                  v
          Supervisor Agent
                  |
   --------------------------------
   |          |         |         |
   v          v         v         v
RAG Agent  SQL Agent Jira Agent Email Agent
   |          |         |         |
   --------------------------------
                  |
                  v
           Evaluator Agent
                  |
          Human Approval
                  |
                  v
              Final Answer
```

# **Tech Stack**

### **LLM**

Start with:

* GPT-4o  
* Claude Sonnet 4  
* Gemini 2.5 Pro

via LangChain.

Later:

* vLLM  
* SGLang  
* OpenAI compatible APIs

# **Framework**

Main orchestration:

### **LangGraph**

Because:

* state machine  
* cycles  
* retry loops  
* human approval  
* parallel execution

# **Observability**

### **LangSmith**

Tracks:

* every node  
* prompts  
* token usage  
* latency  
* failures

Project should look like:

```
customer-support-agent

agents
graph
tools
prompts
schemas
memory
guardrails
data
tests

requirements.txt
app.py
.env
```

# New Project

We'll build a **production-grade Multi-Agent Customer Support Platform**

customer-support-ai/  
│  
├── app/  
│  
│   ├── graph/  
│   │     state.py  
│   │     builder.py  
│   │     router.py  
│   │  
│   ├── agents/  
│   │     triage\_agent.py  
│   │     faq\_agent.py  
│   │     order\_agent.py  
│   │     billing\_agent.py  
│   │     escalation\_agent.py  
│   │  
│   ├── tools/  
│   │     order\_tools.py  
│   │     billing\_tools.py  
│   │     rag\_tools.py  
│   │  
│   ├── schemas/  
│   │     outputs.py  
│   │  
│   ├── memory/  
│   │     memory.py  
│   │  
│   ├── guardrails/  
│   │     validators.py  
│   │  
│   ├── mcp/  
│   │     salesforce\_client.py  
│   │  
│   ├── prompts/  
│   │     prompts.py  
│   │  
│   ├── rag/  
│   │     vectorstore.py  
│   │     ingest.py  
│   │  
│   ├── api/  
│   │     server.py  
│   │  
│   └── config.py  
│  
├── tests/  
│     test\_graph.py  
│  
├── docs/  
│  
├── .env  
├── requirements.txt  
└── main.py

# LLM generation

## **Where Do They Fit in the LLM Generation?**

Transformers aren't just a part of the LLM generation; **they are the foundational blueprint.** When you type a prompt into an LLM (like ChatGPT, Claude, or Gemini), the generation process follows a Transformer-based pipeline:

| Step | What Happens | Role of the Transformer |
| :---- | :---- | :---- |
| **1\. Tokenization** | Your prompt is broken down into smaller pieces (tokens/words). | Prepares the data for the model. |
| **2\. Embedding** | Tokens are converted into math vectors. | The Transformer assigns positions to these vectors so it knows the order of the words. |
| **3\. Processing** | The core "thinking" stage. | The **Transformer layers** use self-attention to understand the intent, context, and nuances of your prompt. |
| **4\. Generation** | The model predicts the next token, one by one. | The Transformer outputs probabilities for the next best word, loops it back in, and repeats until the answer is finished. |

## **1\. Text-to-Text Generation**

* **The Goal:** Take a sequence of tokens (text) and predict the next most likely sequence of tokens.  
* **Core Architecture:** **Transformers (specifically Decoder-only or Encoder-Decoder models).**

### **How it Works**

Text-to-text models (like GPT-4 or Claude) treat language as a discrete sequence of tokens (words or sub-words). They rely heavily on the **Self-Attention mechanism**, which allows the model to understand the relationship between words in a sentence, no matter how far apart they are.

```
[Input Text] ---> Tokenization ---> Transformer Layers (Attention) ---> Probability Distribution ---> [Next Token]
```

The model doesn't "think" in concepts; it calculates a probability distribution over a massive vocabulary to guess what word should come next based on the context you provided.

## **2\. Text-to-Image Generation**

* **The Goal:** Translate a discrete text prompt into a continuous, high-dimensional grid of pixels.  
* **Core Architecture:** **Diffusion Models (often paired with Latent Diffusion and CLIP).**

### **How it Works**

Images contain way too much data to generate pixel-by-pixel like text. Instead, modern image generators use a process called **Diffusion**.

1. **Text Embedding:** A model like CLIP takes your text prompt and converts it into a mathematical vector that captures the *meaning* of the words.  
2. **Reverse Diffusion:** The model starts with a canvas of pure random Gaussian noise. Guided by the text vector, a neural network (typically a **U-Net**) iteratively subtracts noise over 20–50 steps, slowly sharpening the random static into a coherent image.  
3. **Latent Space:** To save computing power, this noise-clearing happens in a compressed "latent space" rather than on the actual high-resolution pixels, and a final decoder blows it back up to a viewable image.

## **3\. Text-to-Speech (TTS) Generation**

* **The Goal:** Convert text into a natural-sounding human voice reading that exact text.  
* **Core Architecture:** **An acoustic model (like a Transformer or Tacotron) \+ a Vocoder (like WaveNet or HiFi-GAN).**

### **How it Works**

TTS is a highly structured, deterministic pipeline because the output must strictly match the phonetic layout of the input text.

* **Step 1 (Text to Phonemes):** The text is normalized (e.g., converting "Dr." to "Doctor") and translated into phonemes (the basic units of sound).  
* **Step 2 (Acoustic Modeling):** The model maps these phonemes to an intermediate acoustic representation, usually a **Mel-spectrogram** (a visual representation of frequencies over time).  
* **Step 3 (The Vocoder):** A specialized neural network called a Vocoder takes that spectrogram and translates it into actual, continuous audio waveforms (the final .mp3 or .wav file).

## **4\. Text-to-Audio Generation**

* **The Goal:** Create general audio (sound effects, ambient noise, or music) based on a description (e.g., *"A thunderstorm in a dense forest with chirping birds"*).  
* **Core Architecture:** **Audio Diffusion or Audio Language Models (AudioLMs).**

### **How it Works**

While TTS focuses strictly on human speech matching a script, text-to-audio is much more creative and open-ended. It is generally approached in two ways:

* **Audio Diffusion:** Much like image generation, models like AudioCraft or Stable Audio start with pure audio static (white noise) and use a diffusion process to shape that noise into sound waves or spectrograms guided by a text prompt.  
* **Audio Information Bottlenecks:** Models convert audio into discrete "audio tokens" (using tools like EnCodec). They can then use a standard **Transformer** (just like text-to-text) to predict the next audio token based on the text prompt.

## **Summary Comparison**

| Modality | Primary Architecture | Output Nature | How Concept is Bound to Output |
| :---- | :---- | :---- | :---- |
| **Text-to-Text** | Decoder-only Transformers | Discrete Tokens | **Autoregressive:** Predicts the next word token sequentially based on previous context. |
| **Text-to-Image** | Latent Diffusion / U-Net | Continuous Pixels | **Cross-Attention:** Text embeddings guide the gradual removal of noise from a random canvas. |
| **Text-to-Speech** | Acoustic Model \+ Vocoder | Linear Audio Waveform | **Phonetic Mapping:** Strictly translates text into phonemes, then spectrograms, then sound. |
| **Text-to-Audio** | Audio Diffusion / Audio Transformers | Complex Audio Waveform | **Semantic Matching:** Translates descriptive text into acoustic textures, rhythms, and ambient noise. |

# vllm vs sglang

# **What is vLLM?**

vLLM is an **open-source high-performance LLM inference engine** developed originally by UC Berkeley.

Its primary goal is:

> Serve LLMs with maximum GPU efficiency.

Imagine serving hundreds of ChatGPT users simultaneously.

Without optimization:

```
Request A
Request B
Request C

GPU memory fills quickly

OOM
Slow
Poor throughput
```

vLLM solves this.

---

## **Main features**

### **1\. PagedAttention (its biggest innovation)**

Traditional attention stores KV Cache like this:

```
████████████████
████████████████
████████████████
```

Large unused gaps appear.

Memory becomes fragmented.

GPU utilization drops.

---

PagedAttention stores memory like operating systems store RAM.

```
Block 1
Block 8
Block 14
Block 22
```

Instead of needing one huge continuous memory block, it stores pages.

Benefits:

* less fragmentation  
* higher GPU utilization  
* more concurrent users  
* longer context windows

This is why vLLM became popular.

---

### **2\. Continuous batching**

Normally:

```
Request 1 finishes

↓

Request 2 starts

↓

Request 3 starts
```

GPU sits idle.

vLLM instead does

```
GPU

Request A
Request B
Request C
Request D

all mixed together
```

New requests join while old ones are still generating.

GPU remains busy.

Huge throughput improvement.

---

### **3\. OpenAI-compatible API**

Most applications already call

```
POST /v1/chat/completions
```

vLLM exposes the same API.

Applications barely need changes.

---

### **4\. Tensor Parallelism**

If your model is too large:

```
70B model

↓

GPU 1
GPU 2
GPU 3
GPU 4
```

vLLM automatically distributes tensors.

---

### **5\. Quantization support**

Supports

* FP16  
* BF16  
* INT8  
* AWQ  
* GPTQ

Smaller memory footprint.

---

### **6\. Multi-model serving**

Serve

* Llama  
* Qwen  
* Gemma  
* Mistral  
* DeepSeek

using the same framework.

---

# **What is SGLang?**

SGLang is newer.

It was also created by researchers at UC Berkeley.

It is **not just an inference engine.**

It is an **LLM runtime \+ programming framework.**

Think:

vLLM focuses on

> Fast inference

SGLang focuses on

> Fast inference \+ complex LLM applications.

---

Imagine building

```
Agent

↓

Call LLM

↓

Call Tool

↓

LLM again

↓

Structured JSON

↓

Another LLM

↓

Verification

↓

Final answer
```

Managing all this manually is hard.

SGLang provides a language/runtime for orchestrating these workflows efficiently.

---

# **Why was SGLang created?**

Modern AI applications aren't just

```
Question

↓

Answer
```

They're often

```
Reason

↓

Call tool

↓

Read database

↓

Generate JSON

↓

Generate SQL

↓

Generate explanation
```

This involves many inference calls.

SGLang optimizes the entire execution graph.

---

# **Features of SGLang**

## **Structured generation**

Instead of

```
Return text
```

It can generate

```
{
"name":"",
"age":0
}
```

while enforcing valid JSON.

Useful for agents.

---

## **Tool calling**

Supports efficient execution when models invoke tools.

---

## **RadixAttention**

SGLang introduces another optimization.

Suppose users ask:

```
Summarize this PDF

Question 1

Question 2

Question 3

Question 4
```

All questions share the same PDF.

Instead of recomputing the prompt every time,

RadixAttention shares the KV cache across requests.

Huge speed improvement.

---

## **Prefix caching**

```
System prompt

1000 tokens

↓

Reuse
```

instead of recomputing.

Excellent for RAG.

---

## **Speculative decoding**

Use

Small model

↓

Predict tokens

↓

Large model verifies

↓

Faster generation

---

## **Better agent execution**

Designed around

* multi-step reasoning  
* tool use  
* structured outputs  
* workflows

---

# **vLLM vs SGLang**

| Feature | vLLM | SGLang |
| ----- | ----- | ----- |
| Primary goal | High-performance inference | High-performance inference \+ LLM programming |
| Main innovation | PagedAttention | RadixAttention \+ execution runtime |
| Continuous batching | ✅ | ✅ |
| Prefix caching | Limited | Excellent |
| Tool calling | Basic | Advanced |
| Agent workflows | External frameworks | Built in |
| Structured generation | Limited | Excellent |
| OpenAI API | ✅ | ✅ |
| Throughput | Excellent | Excellent |
| Multi-turn optimization | Good | Better |
| Best for | API serving | Complex AI agents |

---

# **Which is faster?**

There is no universal winner.

Depends on workload.

### **Pure chatbot**

```
User

↓

LLM

↓

Answer
```

vLLM is often an excellent choice.

---

### **Agent**

```
LLM

↓

Tool

↓

LLM

↓

JSON

↓

Verifier

↓

Answer
```

SGLang often performs better because it optimizes the workflow.

---

# **When would a company choose each?**

### **vLLM**

Use when serving:

* Chat applications  
* Internal APIs  
* Customer-facing inference endpoints  
* Large-scale LLM hosting  
* OpenAI-compatible endpoints

Examples:

* Chatbot API  
* Customer support assistant  
* Llama API  
* Mistral endpoint

---

### **SGLang**

Use when building:

* AI agents  
* Coding assistants  
* Research assistants  
* SQL agents  
* RAG systems with long shared prompts  
* Tool-calling pipelines  
* Structured JSON generation

---

# **How they compare to other tools**

| Tool | Purpose |
| ----- | ----- |
| PyTorch | Train models |
| Transformers | Load models |
| TensorRT-LLM | NVIDIA-optimized inference |
| Ollama | Easy local model serving |
| vLLM | High-performance inference server |
| SGLang | Inference server \+ runtime for agentic workflows |
| Ray Serve | General model serving/orchestration |
| Kubernetes | Infrastructure orchestration |

---

# **Interview Questions**

### **Q1. Why not just use Hugging Face Transformers?**

Because the `transformers` library is optimized for model development and experimentation rather than high-throughput production serving. Frameworks like vLLM and SGLang add capabilities such as continuous batching, KV cache optimizations, efficient memory management, and scalable APIs, allowing many concurrent users to share GPU resources efficiently.

---

### **Q2. Why is vLLM so popular?**

The biggest reasons are:

* PagedAttention for efficient KV cache management  
* Continuous batching for high GPU utilization  
* OpenAI-compatible API  
* Strong support for many open-source models  
* Excellent throughput on modern GPUs

---

### **Q3. What problem does SGLang solve?**

SGLang addresses workloads where applications involve more than a single prompt-response cycle. It optimizes repeated prompts, tool use, structured outputs, and multi-step execution, making it well suited for agentic AI systems and retrieval-augmented generation (RAG) applications with shared context.

---

### **Q4. Can SGLang use vLLM?**

Yes. SGLang can use vLLM as its underlying inference backend, combining vLLM's optimized token generation with SGLang's higher-level runtime for agent execution and structured generation. This is a common deployment pattern.

---

### **Q5. If you were designing an AI platform, which would you choose?**

A balanced answer is:

* For a straightforward chat or completion API with many concurrent users, I'd choose **vLLM** because of its mature, high-performance serving capabilities.  
* For an AI agent platform with tool calling, structured outputs, and complex multi-step workflows, I'd choose **SGLang**, often configured to use **vLLM** underneath to get the benefits of both.

---

## **One-minute interview summary**

> **vLLM** is a high-performance LLM inference engine focused on maximizing GPU utilization through innovations like **PagedAttention** and **continuous batching**, making it ideal for serving chat and completion APIs at scale. **SGLang** builds on efficient inference by adding a runtime for agentic applications, with features such as **RadixAttention**, **prefix caching**, structured generation, and optimized tool-calling workflows. In many real-world deployments, SGLang can use vLLM as its inference backend, so they are often complementary rather than competing technologies.

# Data types

### **Why They Matter for GPU Usage**

Modern LLMs have **billions of parameters**. Storing and computing everything in full **FP32** (32-bit floating point) is very expensive. Lower-precision formats reduce the **bits per value**, which:

* Halves or quarters **VRAM usage** → fit larger models or bigger batches.  
* Increases **throughput** (tokens/second) because GPUs (especially NVIDIA Tensor Cores) perform many more low-precision operations per cycle.  
* Lowers **memory bandwidth** pressure and power use.  
* Introduces a **trade-off** with numerical accuracy (some quality loss is common but often acceptable).

### **Common Formats Compared (per value)**

| Format | Bits | Bytes | Memory vs FP32 | Speed Potential (vs FP32) | Best For | Dynamic Range / Precision | Hardware Support | Accuracy Impact |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **FP32** | 32 | 4 | 1x | Baseline | Training (reference) | Highest | All GPUs | Best (baseline) |
| **BF16** | 16 | 2 | 0.5x | \~10-16x (Tensor Cores) | Training | Wide range (like FP32) | Ampere+ (strong) | Very good |
| **FP16** | 16 | 2 | 0.5x | \~10-16x | Training \+ Inference | Good precision, limited range | Almost all modern GPUs | Good |
| **FP8** | 8 | 1 | 0.25x | \~20-30x+ (esp. Hopper+) | Inference (+ some training) | Good for transformers | Hopper (H100), Blackwell+ | Minor loss |
| **INT8** | 8 | 1 | 0.25x | Very high (integer math) | Inference (quantization) | Fixed range | All modern GPUs | Small-moderate loss |
| **INT4** | 4 | 0.5 | 0.125x | Highest | Extreme inference | Very limited | Good on newer hardware | Noticeable loss |

### **Quick Breakdown**

* **FP32 (Full Precision)**: The "gold standard." Highest accuracy but uses the most memory and is slowest. Rarely used for full inference on big models.  
* **FP16 (Half Precision)**: Halves memory vs FP32. Very popular for **mixed-precision training** (often keep critical parts like optimizer in FP32). Fast on Tensor Cores. Can suffer from overflow/underflow (needs "loss scaling").  
* **BF16 (Brain Float 16\)**: Like FP16 but with more bits for the **exponent** (wider range, similar to FP32) and fewer for precision. Better numerical stability for training large models. Preferred over FP16 for training on Google TPUs and many NVIDIA setups.  
* **FP8**: 8-bit **floating point**. Newer format (E4M3 and E5M2 variants). Excellent balance for transformers — keeps floating-point dynamic range, so better than INT8 for activations/gradients in many cases. Roughly **2x faster and half the memory** of FP16/BF16 on supported hardware (H100+). Great for both training and inference.  
* **INT8 / INT4**: **Integer quantization**. Model weights (and sometimes activations) are mapped to 256 (INT8) or 16 (INT4) discrete levels. Requires calibration. Extremely memory-efficient and fast for **inference only**. INT8 is very mature; INT4 (and lower) is used for running huge models on consumer GPUs. Quality loss is higher than FP8 but manageable with good quantization techniques.

### **Real-World GPU Impact (Examples)**

* A 70B model in **FP16/BF16** might need \~140 GB VRAM.  
* In **FP8** → \~70 GB.  
* In **INT4** → \~35-40 GB.  
* Speed: FP8 can deliver \~1.5–2x throughput vs FP16 on H100. INT8/lower can be even faster on memory-bound workloads.

### **Key Trade-offs**

* **Lower precision \= smaller \+ faster** but **risk of quality drop** (especially on sensitive tasks).  
* **Floating-point** (FP16, BF16, FP8) generally better for training and activations (dynamic range).  
* **Integer** (INT8/4) best for pure inference after quantization.  
* Newer GPUs (Hopper/Blackwell) have native hardware acceleration for FP8 → biggest gains there. Older GPUs (Ampere) rely more on INT8.

These formats (especially via **quantization** tools like bitsandbytes, GPTQ, AWQ, or frameworks like vLLM/Hugging Face) are why people can run massive models locally or serve them cheaply in production. Let me know if you want details on a specific model or quantization method\!

# Nvidia vs AMD

# **NVIDIA Software Stack**

```
Application

↓

vLLM

↓

PyTorch

↓

CUDA

↓

cuBLAS

↓

cuDNN

↓

TensorRT

↓

GPU Driver

↓

NVIDIA GPU
```

Purpose of each:

* **CUDA**: Programming platform and runtime for NVIDIA GPUs.  
* **cuBLAS**: Optimized linear algebra (matrix multiplication, GEMM).  
* **cuDNN**: Optimized deep learning primitives (convolutions, normalization, activations).  
* **TensorRT**: Inference optimizer that fuses operations, optimizes kernels, and leverages Tensor Cores for maximum throughput.  
* **NCCL**: Multi-GPU communication library used for distributed inference and training.

---

# **AMD Software Stack**

```
Application

↓

vLLM

↓

PyTorch

↓

ROCm

↓

hipBLAS

↓

MIOpen

↓

RCCL

↓

AMD Driver

↓

AMD GPU
```

Purpose:

* **ROCm**: AMD's GPU compute platform, analogous to CUDA.  
* **HIP**: Portability layer allowing CUDA-like code to target AMD GPUs.  
* **hipBLAS**: AMD's BLAS implementation.  
* **MIOpen**: Deep learning library similar to cuDNN.  
* **RCCL**: AMD's collective communication library, analogous to NCCL.

---

# **NVIDIA vs AMD Comparison**

| Feature | NVIDIA | AMD |
| ----- | ----- | ----- |
| GPU compute platform | CUDA | ROCm |
| GPU execution unit | SM | CU |
| Basic compute cores | CUDA Cores | Stream Processors |
| AI acceleration | Tensor Cores | Matrix Cores / AI Accelerators |
| Thread execution group | Warp (32) | Wavefront (64) |
| Collective communication | NCCL | RCCL |
| Linear algebra library | cuBLAS | hipBLAS |
| Deep learning primitives | cuDNN | MIOpen |
| Inference optimizer | TensorRT | MIGraphX (less widely adopted) |
| GPU interconnect | NVLink | Infinity Fabric |
| GPU partitioning | MIG | Limited partitioning support (varies by generation) |

---

# **What DigitalOcean FDE interviewers are likely to ask**

Given the FDE charter and your role, expect practical systems questions such as:

* Why does inference become memory-bandwidth bound?  
* When would you choose an H100 over an L40S?  
* What is the difference between HBM capacity and HBM bandwidth?  
* Why are Tensor Cores essential for FP8 inference?  
* How does NVLink improve tensor-parallel inference?  
* When would you recommend AMD GPUs over NVIDIA GPUs?  
* Why does vLLM require CUDA on NVIDIA but ROCm on AMD?  
* How would you diagnose low GPU utilization?  
* What happens when KV cache exceeds available HBM?  
* How do NCCL and RCCL affect multi-GPU scaling?

These questions align closely with the emphasis on GPU efficiency tuning, benchmarking, distributed inference, and production optimization described in the FDE operating charter. 

This foundation will make the next topics—**CUDA execution model, GPU occupancy, TensorRT-LLM, vLLM, SGLang, quantization, KV cache, and multi-GPU inference**—much easier to understand.

# Q\&A scenarios

Suppose a customer says:

> "Everything works fine with 20 users, but at 200 users, responses become very slow."

As an FDE, I'd investigate:

### **Step 1: Check Queue Depth**

Is the GPU overloaded with pending requests?

---

### **Step 2: Check KV Cache Utilization**

Is GPU memory nearly full because of many active or long-running conversations?

---

### **Step 3: Check Context Length**

Are users sending 50,000-token prompts that consume large amounts of KV cache?

---

### **Step 4: Check Continuous Batching**

Can the inference engine schedule requests efficiently, or are long requests blocking shorter ones?

---

### **Step 5: Decide on a Mitigation**

Possible actions include:

* Increase GPU memory (larger GPU or more GPUs)  
* Reduce the maximum context length  
* Enable KV cache quantization  
* Improve batching and scheduling  
* Scale horizontally by adding more inference replicas

# **How would you diagnose low GPU utilization?**

This is a classic troubleshooting scenario.

First question:

Is the GPU actually the bottleneck?

---

## **Step 1**

Check utilization.

```
nvidia-smi
```

or

```
rocm-smi
```

---

Suppose:

```
GPU Util

20%
```

Very low.

---

Possible reasons

### **CPU bottleneck**

CPU can't prepare requests fast enough.

GPU waits.

---

### **Small batch size**

Only a few requests.

Tensor Cores idle.

---

### **Memory bottleneck**

GPU waiting for HBM.

---

### **Data loading bottleneck**

Tokenizer is too slow.

Disk too slow.

---

### **KV cache fragmentation**

Memory allocations become inefficient.

---

### **Synchronization**

Too many CPU-GPU synchronizations.

---

### **Communication bottleneck**

Multi-GPU.

Waiting on NCCL/RCCL.

---

### **Wrong precision**

Running FP32 instead of FP16 or FP8.

---

### **Tiny model**

GPU is oversized.

Llama-7B on an H100 won't fully utilize it with low traffic.

---

Interview answer

I would first check GPU utilization, memory utilization, CPU usage, batch size, PCIe/NVLink traffic, communication overhead, and inference logs. Low utilization often indicates that the GPU is waiting on data, communication, or insufficient workload rather than lacking compute capability.

---

# **9\. What happens when KV cache exceeds available HBM?**

Very important.

Suppose:

```
HBM

80 GB
```

Model weights occupy

```
60 GB
```

KV cache grows to

```
25 GB
```

Now:

```
85 GB needed
```

Impossible.

---

Then one of several things happens depending on the serving engine:

### **Requests rejected**

Out of memory.

---

### **CPU offloading**

KV cache moved to RAM.

Very slow.

---

### **Eviction**

Old conversations removed.

---

### **Swapping**

Performance drops significantly.

---

### **Crash**

CUDA OOM.

---

Interview answer

When KV cache exceeds HBM capacity, inference engines may reject requests, evict cache entries, offload data to CPU memory, or trigger out-of-memory errors. Throughput and latency degrade significantly because HBM is much faster than system RAM.

---

# **10\. How do NCCL and RCCL affect multi-GPU scaling?**

Think of NCCL as:

```
GPU Messenger
```

When GPU1 needs to send data to GPU2:

Who does it?

NCCL.

---

AMD equivalent

RCCL.

---

Operations include

```
Broadcast

Reduce

AllReduce

AllGather

Scatter
```

These are collective communication primitives used heavily in distributed inference and training.

---

Without NCCL

GPUs communicate inefficiently.

Scaling becomes poor.

---

Interview answer

NCCL (for NVIDIA) and RCCL (for AMD) optimize collective communication across GPUs. Efficient implementations reduce synchronization overhead, allowing tensor-parallel and pipeline-parallel inference to scale with lower latency and higher throughput.

---

# Evaluation Metrics

These evaluation metrics are commonly used to measure the quality, safety, and reliability of LLM (Large Language Model) outputs. They answer different questions about a model's response.

# **1\. Correctness**

### **What it measures**

Whether the answer is **factually accurate**.

Think of it as:

> "Is the answer right?"

### **Example**

**Question**

> What is the capital of Australia?

**Answer 1**

> Sydney ❌

Incorrect.

**Answer 2**

> Canberra ✅

Correct.

---

### **AI Example**

Question:

> What does Docker do?

Answer:

> Docker is a containerization platform that packages applications with their dependencies.

Correct.

---

### **Why it matters**

Imagine an AI assistant for doctors.

If it gives the wrong dosage,

everything else becomes irrelevant.

Correctness is usually the most important metric.

---

# **2\. Completeness**

### **What it measures**

Whether the response covers **all important aspects** of the question.

Think of it as

> "Did the model answer everything?"

---

### **Example**

Question

> Explain Docker and Kubernetes.

Answer

> Docker packages applications into containers.

This is correct.

But...

It never explained Kubernetes.

So:

Correctness ✅

Completeness ❌

---

Another example

Question

> What are the benefits of Kubernetes?

Answer

* Scaling  
* Self-healing  
* Load balancing  
* Rolling updates

Much more complete.

---

### **Why it matters**

Enterprise customers hate partial answers.

If they ask

> "Explain pricing, deployment and monitoring"

they expect all three.

---

# **3\. Faithfulness**

This one is often misunderstood.

### **What it measures**

Whether the answer is **supported by the provided context or documents.**

Think of it as

> "Did the model stay faithful to the source?"

---

Suppose you're using RAG.

Retrieved document says

> DigitalOcean supports NVIDIA H100 and L40S GPUs.

Model answers

> DigitalOcean supports NVIDIA H100, L40S and AMD MI300X.

The model added AMD.

Maybe true.

Maybe false.

But...

The document never mentioned AMD.

That's **not faithful**.

---

Another example

Context:

> Company policy allows 20 vacation days.

Answer:

> Employees receive 25 vacation days.

Incorrect AND unfaithful.

---

### **Why faithfulness matters**

In RAG systems,

hallucinations often happen because the model invents information not present in retrieved documents.

Faithfulness measures hallucination.

---

# **Difference between Correctness and Faithfulness**

These are **not the same.**

Example:

Context

> Paris has 2.1 million people.

Question

> What is the population?

Answer

> Around 2.2 million.

Suppose that's the latest census.

Answer is:

Correct ✅

Not faithful ❌

because it ignored the provided context.

---

Opposite example

Context

> Paris has 1 million people.

Model says

> Paris has 1 million people.

Faithful ✅

But factually wrong ❌

because the document itself is outdated.

---

# **4\. PII (Personally Identifiable Information)**

### **What it measures**

Whether the model leaks or exposes private information.

Examples include

* Aadhaar number  
* Passport  
* Credit card  
* Phone number  
* Email  
* Home address  
* Social Security Number  
* Medical record

---

### **Example**

Prompt

> Tell me about John.

Response

> John's SSN is 123-45-6789.

Huge problem.

PII violation.

---

### **Why important**

For enterprise AI,

privacy regulations include

* GDPR  
* HIPAA  
* SOC2  
* ISO 27001

A chatbot leaking customer data is unacceptable.

---

# **5\. Toxicity**

Measures whether the response contains

* abusive language  
* hate speech  
* harassment  
* insults  
* threats  
* offensive language

---

Example

Prompt

> I hate my coworker.

Good response

> I'm sorry you're dealing with a difficult situation.

Low toxicity.

---

Bad response

> They're an idiot. Punch them.

High toxicity.

---

### **Why important**

Companies cannot deploy AI that generates offensive responses.

Especially

* customer support  
* healthcare  
* education  
* banking

---

# **6\. Bias**

Measures whether the model unfairly favors or discriminates against groups.

---

Example

Prompt

> Recommend a CEO.

Response

> CEOs are usually men.

Biased.

---

Another

Prompt

> Who makes better engineers?

Response

> Men are naturally better.

Highly biased.

---

### **Why important**

Bias creates

* legal risk  
* ethical issues  
* poor user experience

Modern AI evaluations include fairness testing.

---

# **Comparison Table**

| Metric | Question it Answers | Checks | Example Failure |
| ----- | ----- | ----- | ----- |
| Correctness | Is it factually right? | Accuracy | Wrong capital city |
| Completeness | Did it answer everything? | Coverage | Misses half the question |
| Faithfulness | Did it stay grounded in the provided context? | Hallucination | Invents facts not in the retrieved documents |
| PII | Did it expose private data? | Privacy | Reveals phone number or SSN |
| Toxicity | Is the language harmful? | Safety | Hate speech, insults, threats |
| Bias | Is it fair across people/groups? | Fairness | Gender or racial stereotypes |

---

# **Visual Relationship**

```
                    Model Response
                          │
          ┌───────────────┼───────────────┐
          │               │               │
   Quality Metrics   Safety Metrics   Privacy Metrics
          │               │               │
 ┌────────┼─────────┐   ┌──┴────┐         │
 │        │         │   │       │         │
Correct Completeness Faithfulness Toxicity Bias      PII
```

---

# **Real Example (DigitalOcean Documentation Chatbot)**

Imagine you build a RAG chatbot over the DigitalOcean docs.

**Question**

> Does DigitalOcean support H100 GPUs?

Retrieved docs say:

> H100 GPUs are available in NYC3 and TOR1.

Now consider different responses:

| Response | Correctness | Completeness | Faithfulness | PII | Toxicity | Bias |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| "Yes, H100 GPUs are available in NYC3 and TOR1." | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| "Yes." | ✅ | ❌ (missing locations) | ✅ | ✅ | ✅ | ✅ |
| "Yes, in NYC3, TOR1, and Bangalore." | ❓ (depends on reality) | ✅ | ❌ (Bangalore wasn't in the context) | ✅ | ✅ | ✅ |
| "Your API key is abc123..." | ❌ | ❌ | ❌ | ❌ (PII/secret leak) | ✅ | ✅ |
| "Only inexperienced users need H100s." | ❌ | ❌ | ❌ | ✅ | ❌ (toxic) | ❌ (biased/derogatory) |

# Nvidia Dyanmo

```
                 AI Application
                       │
               API Gateway / Router
                       │
        ┌──────────────┴──────────────┐
        │                             │
  NVIDIA Dynamo                 Other Routers
        │
        ├───────────────┐
        │               │
    vLLM Server     SGLang Server
        │               │
        └──── CUDA / TensorRT / NCCL ────┐
                                         │
                                      GPU Hardware
```

Notice something important:

**vLLM and SGLang are model serving engines.**

**Dynamo sits above them.**

---

# **What is NVIDIA Dynamo?**

NVIDIA Dynamo is a **distributed inference orchestration platform**.

Its job is **not** to execute transformer layers.

Its job is to coordinate thousands of inference requests across many GPUs and many inference servers.

Think of it as:

> Kubernetes \+ Envoy \+ Smart Scheduler \+ AI-aware Router for LLM inference.

---

## **Imagine this scenario**

You have

* 500 H100 GPUs  
* Llama 70B  
* 10,000 users

Questions arrive continuously.

```
User 1
User 2
User 3
...
User 10000
```

Now the system has to answer

* Which GPU should receive this request?  
* Which GPU already has this conversation's KV cache?  
* Should this request wait?  
* Should it use speculative decoding?  
* Which inference engine should execute it?  
* Is one node overloaded?  
* Is another node idle?

This is exactly what Dynamo does.

---

# **Dynamo Responsibilities**

It performs things like:

### **Request routing**

Instead of randomly sending requests,

it sends them intelligently.

```
Users

 ↓

Router

 ↓

GPU A

GPU B

GPU C
```

---

### **KV Cache-aware routing**

Suppose you have ChatGPT.

Conversation

```
Hello

↓

Tell me about Docker

↓

Explain Kubernetes

↓

Compare with ECS
```

GPU A already has the KV cache.

Without Dynamo:

The next request may go to GPU B.

GPU B has no cache.

Everything starts over.

Very expensive.

---

Dynamo instead routes

```
Conversation 17

↓

GPU A

↓

Reuse KV cache

↓

Much faster
```

Huge latency reduction.

---

### **Load balancing**

Suppose

GPU A

```
95% busy
```

GPU B

```
15% busy
```

Dynamo sends new traffic to GPU B.

---

### **Scheduling**

Suppose

One request needs

```
100 tokens
```

Another

```
20,000 tokens
```

Running both together hurts latency.

Dynamo schedules intelligently.

---

### **Multi-node inference**

Imagine

Llama 405B

cannot fit onto one GPU.

It spans

```
GPU1

GPU2

GPU3

GPU4
```

Dynamo coordinates the inference workers.

---

### **Autoscaling**

Suppose traffic spikes.

```
500 RPS

↓

5000 RPS
```

Dynamo can coordinate adding more inference workers.

---

# **Where does vLLM fit?**

vLLM is **an inference engine**.

Its job is

```
Take one request

↓

Run transformer layers

↓

Generate tokens
```

Internally it performs

* PagedAttention  
* KV cache management  
* Continuous batching  
* Prefix caching  
* Tensor Parallelism  
* Speculative decoding (newer versions)  
* Quantization support

But it does **not** manage an entire AI cluster like Dynamo.

---

Example

```
Request

↓

vLLM

↓

GPU

↓

Output
```

---

# **Where does SGLang fit?**

SGLang is also an inference engine.

But it focuses on

**programming complex LLM workflows efficiently.**

It provides

* structured generation  
* tool calling  
* agent execution  
* reasoning workflows  
* prefix sharing  
* efficient batching

Think of it as

> vLLM \+ AI workflow execution.

---

Example

Instead of

```
Generate answer
```

you can define

```
Call tool

↓

Generate

↓

Call another tool

↓

Generate

↓

Return JSON
```

Very useful for agents.

---

# **Example**

Suppose you're building a customer support agent.

Without SGLang

```
Python

↓

LLM

↓

Python

↓

LLM

↓

Python

↓

LLM
```

Lots of overhead.

---

With SGLang

```
Entire workflow

↓

Single optimized execution
```

Much faster.

---

# **Comparing Them**

| Feature | NVIDIA Dynamo | vLLM | SGLang |
| ----- | ----- | ----- | ----- |
| Primary role | Distributed inference orchestration | High-performance inference engine | Inference engine \+ workflow runtime |
| Runs transformer layers | ❌ No | ✅ Yes | ✅ Yes |
| GPU scheduling | ✅ | ❌ | ❌ |
| Request routing | ✅ | ❌ | ❌ |
| KV-cache-aware routing | ✅ | Internal cache only | Internal cache only |
| Continuous batching | ❌ (relies on backend) | ✅ | ✅ |
| PagedAttention | ❌ | ✅ | Similar memory optimizations |
| Structured generation | ❌ | Limited | ✅ Excellent |
| Tool calling workflows | ❌ | Limited | ✅ Native |
| Multi-node orchestration | ✅ | Limited | Limited |
| Uses CUDA | Indirectly | ✅ | ✅ |

---

# **Another Important NVIDIA Project: TensorRT-LLM**

People often confuse TensorRT-LLM with Dynamo.

TensorRT-LLM is **another inference backend**, optimized specifically for NVIDIA GPUs.

It performs optimizations such as:

* FP8 kernels  
* INT8/INT4 quantization  
* Kernel fusion  
* FlashAttention integration  
* CUDA graph optimization  
* Optimized GEMM implementations

Think of it as a highly optimized "engine" that can sit underneath or alongside higher-level serving systems.

```
Request

↓

TensorRT-LLM

↓

GPU

↓

Fast inference
```

---

# **How They Can Work Together**

A production deployment might look like this:

```
                    Users
                      │
              NVIDIA Dynamo
        (routing, scheduling,
         load balancing)
                      │
          ┌───────────┴───────────┐
          │                       │
     vLLM Instance          vLLM Instance
          │                       │
     TensorRT-LLM           TensorRT-LLM
          │                       │
        H100 GPU               H100 GPU
```

Or, if your application uses complex agent workflows:

```
                    Users
                      │
              NVIDIA Dynamo
                      │
          ┌───────────┴───────────┐
          │                       │
   SGLang Instance         SGLang Instance
          │                       │
     TensorRT-LLM           TensorRT-LLM
          │                       │
        H100 GPU               H100 GPU
```

In these architectures:

* **Dynamo** decides *where* a request should go and balances work across the cluster.  
* **vLLM** or **SGLang** decides *how* to execute the model efficiently on the assigned GPU.  
* **TensorRT-LLM** provides highly optimized GPU kernels and execution for NVIDIA hardware.

# Compare FP16 with BF16 and FP4 with MXFP4

Compare FP16 with BF16 and FP4 with MXFP4.

The basic idea behind any floating point format  
Every floating point number has three parts: a sign bit, exponent bits (these decide the range, meaning how large or small a number can get), and mantissa bits (these decide the precision, meaning how many fine grained values you can represent within that range).  
Think of it like a ruler. Exponent bits decide how long the ruler is. Mantissa bits decide how many tick marks are on it. A long ruler with few tick marks can measure big distances but roughly. A short ruler with lots of tick marks measures small distances very precisely.

FP16 vs BF16  
FP16 (half precision) uses 1 sign bit, 5 exponent bits, and 10 mantissa bits. That gives good precision but a small range. Numbers that get too big or too small during training can overflow or underflow to zero, which is a real problem when you are computing gradients that can vary wildly in magnitude.  
BF16 (brain float 16\) uses 1 sign bit, 8 exponent bits, and only 7 mantissa bits. It sacrifices precision but keeps the same exponent range as full FP32. So it can represent the same huge or tiny numbers that FP32 can, just less precisely.  
In interview terms you can say it like this: FP16 gives you a short but finely marked ruler, BF16 gives you a long ruler with fewer tick marks. Since deep learning training often produces numbers with a huge dynamic range, having the long ruler matters more than having super fine tick marks. That is why BF16 became the standard for training large models, while FP16 sometimes needs extra tricks like loss scaling to avoid overflow.

FP4 vs MXFP4  
FP4 is a 4 bit floating point format, extremely compressed, usually something like 1 sign bit, 2 exponent bits, and 1 mantissa bit. With so few bits, both the range and the precision are tiny. A single scale has to cover the entire tensor, so many values either clip at the top or collapse to zero at the bottom. It is like trying to measure everything in a room, from a grain of rice to the size of a table, using the same tiny ruler with only a few tick marks. Most things will not fit well.  
MXFP4 (microscaling FP4) fixes this using a technique called block scaling. Instead of one scale for an entire tensor, the values are split into small blocks (commonly 32 numbers), and each block gets its own shared scale factor stored separately. Within a block, every number is stored in FP4 relative to that shared scale.  
This is like handing out a different ruler to each small group of items in the room. The grains of rice get a ruler suited for tiny things, the table gets a ruler suited for bigger things. Each group measures accurately relative to its own scale, even though every individual measurement still only uses 4 bits.  
One line summary you can say in an interview  
FP16 versus BF16 is a tradeoff between precision and range at 16 bits, and BF16 wins for training stability because it matches FP32 range. FP4 versus MXFP4 is about how to make an extremely low bit format usable at all, and **MXFP4 solves this by adding shared block level scaling so that a 4 bit number is not stuck using a single global scale for wildly different magnitude values.**  
If you want, I can also cover how these formats map to specific hardware, like which GPUs support MXFP4 natively, since that sometimes comes up as a follow up question in interviews.

# GPU Architecture

A CPU is built for low latency on a small number of complex, sequential tasks. It has few cores, each very powerful, with lots of control logic and cache dedicated to making a single thread run as fast as possible.

A GPU is built for high throughput on a massive number of simple, parallel tasks. It has thousands of small, simpler cores optimized to do the same operation on many pieces of data at once. This is the SIMT model, single instruction multiple threads.

CPUs are optimized to finish one task quickly. GPUs are optimized to finish thousands of similar tasks at the same time. That tradeoff, fewer powerful cores versus many simple cores, is the entire reason GPUs are good at deep learning, since operations like matrix multiplication and convolution are just the same instruction repeated across huge amounts of data.

**Architecture and execution model**  
 Explain that a GPU is organized into Streaming Multiprocessors, SMs. Each SM contains many small cores, plus registers and shared memory. Threads are grouped into warps, usually 32 threads, and a warp executes the same instruction together in lockstep. Threads are further organized into blocks, and blocks into a grid, which is the CUDA programming model.  
**Memory hierarchy**  
 This is often the part candidates skip, and it is usually the most important part for an FDE role since performance issues are almost always memory bound, not compute bound. Mention registers, being fastest and per thread. Shared memory, being fast and shared within a block. L1 and L2 cache. Global memory, HBM on modern GPUs, which is large but has much higher latency compared to registers or shared memory. The key insight to mention is that GPU performance is very often limited by memory bandwidth and how well memory accesses are coalesced, not by raw compute power.  
Why this maps well to deep learning  
 Matrix multiplication and convolutions are highly parallel and reused across many elements, so they map naturally onto the SIMT model. Mention tensor cores specifically, since almost every modern GPU used for ML has dedicated hardware for fused multiply add operations at lower precision, like fp16 or bf16, which is what actually gives most of the speed up in training and inference, not just having more cores.  
Multi GPU and scaling  
 Since this is an AI infra role, briefly mention how training scales across GPUs. Data parallelism, splitting batches across GPUs. Model parallelism, splitting the model itself across GPUs when it does not fit in memory. Mention interconnects like NVLink and PCIe, and why bandwidth between GPUs becomes the bottleneck at scale, which is a very real problem in distributed training.  
Practical FDE angle  
 Since this role is client facing, you should also tie this back to real debugging scenarios. For example, if a customer says training is slow, the first questions you would ask are whether the GPU is compute bound or memory bound, what the utilization numbers look like, whether data loading is the actual bottleneck rather than the GPU itself, and whether batch size is set correctly to keep the GPU saturated. Interviewers at ML infra companies love when candidates connect architecture knowledge to real world debugging instinct, since that is literally the job.

## **1\. CPU vs GPU**

This is almost always the starting point.

| CPU | GPU |
| ----- | ----- |
| Few powerful cores | Thousands of lightweight cores |
| Sequential processing | Parallel processing |
| Low latency | High throughput |
| Good for OS and control logic | Good for matrix math |

> The GPU is organized into Streaming Multiprocessors. Each SM contains CUDA cores, Tensor Cores, registers, cache, and schedulers."

This sounds much more knowledgeable.

Example:

```
GPU
 ├── SM
 │    ├── CUDA Cores
 │    ├── Tensor Cores
 │    ├── Registers
 │    └── Shared Memory
 ├── SM
 ├── SM
 └── SM
```

## **4\. CUDA Cores**

CUDA cores perform general arithmetic.

They execute

```
+
-
*
/
```

and other floating-point operations.

Good for

* physics  
* graphics  
* vector operations

---

## **5\. Tensor Cores**

This is what interviewers want to hear.

Tensor Cores perform

```
Matrix × Matrix
```

extremely fast.

Example

```
A (16×16)

×

B (16×16)

=
C
```

Instead of many CUDA operations,

Tensor Cores perform the whole matrix multiply in specialized hardware.

LLMs spend most of their time doing exactly this.

---

## **6\. Memory Hierarchy**

A GPU is useless without feeding it data.

Explain the hierarchy:

```
HBM (GPU Memory)

↓

L2 Cache

↓

Shared Memory

↓

Registers

↓

Tensor Cores
```

The closer the data is to the compute unit, the faster the computation.

---

## **7\. Why HBM Matters**

Many interviewers ask this.

Weights are huge.

Example:

```
70B parameters

≈140 GB FP16
```

Those weights must constantly be read.

If memory is slow

Tensor Cores wait.

No work gets done.

This is why inference is often **memory-bandwidth bound**.

---

## **8\. GPU Execution Model**

Mention one key term:

> SIMT (Single Instruction, Multiple Threads)

Meaning:

Thousands of threads execute the same instruction on different pieces of data simultaneously.

Example:

```
Thread 1

2 × 5

Thread 2

8 × 3

Thread 3

10 × 7

...

All execute simultaneously.
```

---

## **9\. AI Inference Flow**

This impresses AI infrastructure interviewers.

```
Prompt

↓

Tokenizer

↓

Embeddings

↓

GPU

↓

Attention

↓

MLP

↓

Attention

↓

MLP

↓

Next Token

↓

Repeat
```

---

## **10\. Why GPUs are Ideal for Transformers**

Transformers mainly perform

```
Q × Kᵀ

Attention

Softmax

Matrix Multiply

MLP

Matrix Multiply
```

These are all matrix operations.

GPUs are purpose-built for matrix operations.

---

## **11\. What Determines GPU Performance?**

Many people incorrectly say:

> "More CUDA cores \= Faster."

A stronger answer is:

Performance depends on:

* Tensor Core throughput  
* Memory bandwidth  
* HBM capacity  
* GPU utilization  
* Batch size  
* KV cache efficiency  
* Precision (FP16, BF16, FP8, INT8, INT4)  
* Scheduling efficiency

---

# **A Great Closing Statement**

Finish with something like:

> "For modern LLM inference, the challenge isn't just having a fast GPU—it's keeping it fully utilized. Frameworks like vLLM and SGLang optimize batching, KV-cache management, request scheduling, and memory movement so Tensor Cores stay busy. That's why GPU optimization today is as much about software and memory efficiency as it is about hardware."

# Attention

Attention mechanisms actually split into two very different buckets, and mixing them up is common. One bucket is about the mathematical pattern of attention, meaning what tokens are allowed to look at what. The other bucket is about how that computation is implemented and stored on the hardware, without changing the math at all. PagedAttention and self attention actually belong to different buckets, which is worth pointing out before going through the list.

Bucket one: architectural attention patterns

1. Self attention  
    Every token in a sequence attends to every other token in the same sequence, including itself. This is the core mechanism inside every transformer layer.  
2. Cross attention  
    Queries come from one sequence while keys and values come from a different sequence. Used in encoder decoder setups such as machine translation, Whisper for speech to text, or diffusion models where the image generation process attends to a text prompt.  
3. Causal or masked attention  
    A variant of self attention where each token can only attend to tokens that came before it, not future ones. This is what makes GPT style models autoregressive, since the model cannot peek ahead during generation.  
4. Bidirectional attention  
    Tokens attend to both earlier and later tokens in the sequence. Used in encoder only models like BERT, where the whole input is visible at once and there is no generation happening left to right.  
5. Multi head attention  
    Not a different attention pattern by itself, but a way of running several attention computations in parallel, each with its own learned projections, then combining the results. This lets the model capture different types of relationships (syntax, position, meaning) at the same time. It is standard in almost every transformer.  
6. Multi query attention (MQA)  
    All heads share a single set of key and value projections, only the queries differ per head. This shrinks the memory needed to store keys and values during inference, at some cost to quality.  
7. Grouped query attention (GQA)  
    A middle ground between full multi head attention and multi query attention. Heads are split into groups, and each group shares one key value projection. Used in models like Llama 2 and 3 and Mistral, since it keeps most of the quality of full multi head attention while cutting memory use close to MQA levels.  
8. Sparse attention  
    Each token attends to only a subset of other tokens using some fixed pattern (strided, block based, and so on) instead of attending to everything. Cuts the quadratic cost of standard attention for long sequences.  
9. Local or sliding window attention  
    A token only attends to nearby tokens within a fixed window around it. Used in models built for long documents, like Longformer, and in parts of Mistral's design.  
10. Linear attention  
     Reformulates the attention computation so cost grows linearly with sequence length instead of quadratically. Used in models like Performer and Linear Transformer, aimed at very long sequences or streaming settings.

Bucket two: computation and memory level optimizations

These do not change what gets attended to. They compute the exact same self attention or causal attention result, just faster or with less memory.

1. FlashAttention (and FlashAttention 2, 3\)  
    An IO aware algorithm that avoids ever building the full attention score matrix in slow GPU memory. It computes attention in small blocks using the GPU's fast on chip memory, which speeds up both training and inference and reduces memory use, all while producing mathematically identical results to standard attention. This has basically become the default way attention is computed now.  
2. PagedAttention  
    A memory management technique used for serving large language models, most notably in vLLM. It borrows the idea of paging from operating systems. Instead of storing each sequence's key value cache in one contiguous block of memory, it stores it in fixed size, non contiguous blocks that can be allocated, shared, and reused flexibly across requests. This reduces memory fragmentation and waste, which means a server can handle many more concurrent requests with the same GPU memory. It does not change the attention formula at all, it changes how the key value cache is stored and managed during serving.

So to directly answer your question, PagedAttention and self attention are not really comparable in the same sense as self attention versus cross attention. Self attention describes what the model computes, PagedAttention describes how the system stores and manages the intermediate results (the KV cache) when serving requests efficiently.

When each is typically used, roughly:

Self attention and multi head attention are used in essentially every transformer layer, that is just the base building block.  
 Causal attention is used for generation tasks, anything GPT style.  
 Cross attention is used whenever one sequence needs to condition on another, translation, captioning, text to image.  
 MQA and GQA are used when serving large models at scale and KV cache memory is the bottleneck.  
 Sparse, local, and linear attention are used when the input sequences get very long and standard quadratic attention becomes too expensive.  
 FlashAttention is used almost everywhere now, both training and inference, since it just makes standard attention faster and cheaper with no downside.  
 PagedAttention is used specifically in inference serving systems that need to handle many simultaneous requests efficiently, such as vLLM.

# MoE

### **The core idea**

A regular large neural network is dense. Every single parameter in the model gets used for every single input you give it. If the model has 100 billion parameters, all 100 billion do some work on every token you send in, whether that token is simple or complex.

Mixture of Experts changes this. Instead of one giant network, you build many smaller sub networks called experts, plus a small router (also called a gating network) that looks at each input and decides which experts should handle it. Only a small subset of experts (commonly 1 or 2 out of possibly dozens) actually get activated for any given input. The rest sit idle.

So the total model can be enormous in parameter count, but the actual computation done for any single input stays small, because most of the network is skipped.

![][image1]

That is the whole mechanism in one picture. The token goes into the gating network, the gate scores all six experts, but only the two highest scoring ones (shown in teal) actually run. The other four (gray, dashed lines) are skipped entirely for this token, no computation happens there. Their outputs are combined, weighted by how confident the gate was in each one, and that becomes the final result.

### **A real world analogy**

Think of a large hospital. The hospital as a whole has a cardiologist, a neurologist, a dermatologist, an orthopedist, and so on, dozens of specialists in total. When you walk in with a symptom, you do not see every single doctor in the building. A triage nurse (the router) looks at your symptom and sends you to the one or two specialists who are actually relevant. If you came in with a broken arm, the orthopedist and maybe a radiologist see you. The cardiologist never gets involved, even though they are on staff and available.

The hospital as a whole has enormous total expertise, but for any single patient, only a small relevant slice of that expertise gets used. That is exactly how Mixture of Experts models work. Total capacity is huge, active computation per input is small.

### **Why this matters, the actual benefit**

In a dense model, if you want the model to know more or handle more nuance, you have to make it bigger, and every input then costs more compute because everything gets used every time. Cost and capability are tied together.

Mixture of Experts breaks that link. You can have a model with, say, 50 experts and hundreds of billions of total parameters, but if only 2 experts activate per token, the actual compute cost per token stays close to that of a much smaller dense model. You get the knowledge capacity of a huge model at close to the inference cost of a small one.

This is why it became popular for large language models. Mistral released a well known open model called Mixtral that uses 8 experts with 2 active per token. Google used it in Switch Transformer and later Gemini related work. It lets these companies scale total parameters into the hundreds of billions while keeping inference fast and affordable enough to actually serve to users.

Beyond language models, it also shows up in recommendation systems, where different experts specialize in different user segments or content types, and in multi task setups, where some experts specialize in one task and others in another, with the gate learning which expert combination suits which kind of input.

### **Where it does not help**

It is not free. You still need to store all the experts in memory even though only a couple activate per input, so memory footprint is close to a dense model of the same total size. Training is trickier too, the gate needs to learn to spread load evenly across experts, otherwise a few experts get overused and others barely get trained at all, which people call the load balancing problem. So the benefit is squarely on computation cost per input, not on memory or training simplicity.

### **Now let us place it next to similar sounding ideas so you never mix them up**

**Ensemble learning (bagging, boosting, random forests, stacking)**  
 This is the one people confuse with Mixture of Experts most often, because both involve multiple models contributing to one answer. The key difference is that in a classic ensemble, every model in the ensemble runs on every input, and their outputs are averaged or voted on afterward. Nothing is skipped. In Mixture of Experts, most of the experts are never even computed for a given input, a router decides in advance who gets to participate. So ensembles trade extra compute for better accuracy and stability. Mixture of Experts trades routing complexity for scale without extra compute.

**Dense model scaling**  
 This is simply making one network bigger, more layers, more width. Every parameter is used on every input, always. It is the simplest way to scale but compute cost grows directly with model size. Mixture of Experts is essentially a way to scale total parameters without that same compute growth, by making the growth conditional rather than universal.

**Model parallelism and sharding**  
 This is not really a different modeling technique at all, it is an engineering method. When a single dense model becomes too large to fit on one GPU, you split its layers or its parameters across multiple devices. All parameters are still used for every input, they are just physically distributed. This solves a memory placement problem, not a computation cost problem, so it answers a different question than Mixture of Experts does.

**Boosting (like XGBoost or AdaBoost)**  
 Here experts, called weak learners, are trained one after another, and each new one is trained specifically to fix the mistakes of the previous ones. They are sequential and each one sees the whole dataset. In Mixture of Experts, experts train in parallel and specialize by input type rather than by correcting each other sequential error.

**Knowledge distillation**  
 This is about taking one large trained model, called the teacher, and training a smaller model, called the student, to imitate its outputs. It is a technique for compressing an already trained model into something cheaper to run. Mixture of Experts is about how a single model is structured internally from the start, it has nothing to do with teacher student compression, though the two can technically be combined, for example distilling a Mixture of Experts model into a smaller dense one.

**Multi task learning with shared and task specific layers**  
 In multi task learning you usually have shared layers everyone uses, plus small task specific heads at the end for each task, and you generally know at training time which head serves which task. Mixture of Experts is more general, the routing is learned rather than manually assigned by task, and it can specialize on much subtler patterns than just task identity, sometimes even on syntax or topic within the same task.

**Quantization and pruning**  
 These are efficiency techniques that reduce a model after training, by using lower precision numbers or removing unneeded weights. They shrink an existing dense model. Mixture of Experts is an architectural choice made before training even starts, aimed at conditional computation rather than compression.

To summarize the whole map in one line each: ensembles run everything and average results, dense scaling makes one network bigger and always fully used, model parallelism just splits an existing model across hardware, boosting corrects errors sequentially, distillation compresses a trained model into a smaller one, multi task learning assigns fixed heads per task, quantization and pruning shrink an existing model after training, and Mixture of Experts routes each input to only a few specialized sub networks out of many, giving you the knowledge of a giant model at the compute cost of a small one.

**Heavyweight models that do use MoE, with real numbers**

DeepSeek-V4, released in April 2026, has 1.6 trillion total parameters with 49 billion active in its Pro variant, and a smaller Flash variant with 284 billion total and 13 billion active, trained on more than 32 trillion tokens with native 1 million token context. Qwen3-235B-A22B has 235 billion total parameters with about 22 billion active, activating 8 experts per token out of a pool of 128\. Llama 4 Maverick was Meta's first major MoE flagship, at roughly 400 billion total and 17 billion active parameters, using 128 routed experts plus 1 shared expert per MoE layer, with dense and MoE layers interleaved. Mistral Large 3 has 675 billion total parameters with 41 billion active, and can be deployed on a single 8 GPU node. Zhipu AI's GLM 5.2, released in June 2026, is a 744 billion parameter MoE model with about 40 billion active parameters per token, and currently ranks as the top open weight model on a major benchmark index.

**So why would anyone still choose dense**

The honest answer is that dense held on longest at the smaller end of the spectrum, and in a handful of specific labs for specific reasons.

Meta's own Llama line is a clean example of the transition itself. Llama 2 and Llama 3 were dense, standard transformers, no routing at all. Meta only introduced MoE with Llama 4\. The reason earlier Llama models stayed dense was largely about simplicity. Dense models are far easier to train stably, there is no gating network that can collapse onto a handful of favorite experts, no need to balance load across experts during training, and no complexity in how experts are sharded across GPUs during distributed training, which requires expensive all to all communication between devices. For a lab still tuning its training pipeline, dense is the safer starting point, and Meta only moved to MoE once it needed to compete at the very largest total parameter scale.

Small and edge oriented models tend to stay dense on purpose, for a different reason entirely, which is memory. A MoE model has to keep every expert loaded in memory even though only a couple activate per token, so its memory footprint is close to its full total parameter count, not its active parameter count. That tradeoff makes sense when you are running on a data center cluster with plenty of GPU memory to spare, and want the added intelligence. It makes much less sense on a phone or a laptop, where memory is the actual bottleneck, not compute. That is exactly why families like Microsoft Phi, and the smaller Gemma variants, mostly stay dense. Notably, Google's Gemma 4 ships mostly as dense models at 2 billion, 4 billion, and 31 billion parameters, with only one 26 billion parameter version using a mixture of experts architecture with 4 billion active parameters. Google clearly judged that MoE only pays off once the model crosses a certain size, below that the routing overhead and memory cost are not worth it. [Zapier](https://zapier.com/blog/best-llm/)

Serving and latency predictability is another real reason. In a dense model, every request takes roughly the same amount of compute, which makes capacity planning and batching straightforward for the people running the servers. In a MoE model, which experts get activated can vary token by token, so batching many different requests together and predicting latency gets more complicated, since different tokens in the same batch can be routed to different experts and creating uneven load across GPUs. For companies that value simple, predictable serving infrastructure over squeezing out maximum capability per compute dollar, dense remains attractive.

Anthropic has not publicly disclosed Claude's architecture, so I cannot tell you with confidence whether Claude models use MoE or stay dense, and I would rather say that plainly than guess.

**The short version of the tradeoff**

Choose MoE when you want to push total knowledge and capability as high as possible while keeping inference cost per token low, and you have the engineering resources to handle routing stability and the memory budget to hold all the experts. Choose dense when the model is small enough that the extra routing complexity is not worth it, when memory rather than compute is your actual constraint, such as on device or edge deployment, or when you want simpler, more predictable training and serving behavior, which matters a lot in the early stages of building a model family.

# Fine tuning: LoRA, QLoRA

When you want a large language model to get good at a specific task, the traditional approach is full fine tuning. You take every single weight in the model, maybe seventy billion of them, and update all of them using your training data. Think of it like renovating an entire house every time you want to repaint one room. It works, but it costs an enormous amount of memory and compute, because you need to store gradients and optimizer states for every single parameter.

LoRA, which stands for Low Rank Adaptation, was invented to avoid this. Let me show you the core idea visually before explaining it in words.

![][image2]

Here is what that picture is showing. Every layer in a transformer has a big weight matrix W. Normally, fine tuning means directly changing every number inside W. LoRA does something clever instead. It freezes W completely and never touches it. Then it adds two very small matrices, called A and B, next to it. When multiplied together, A and B produce a small correction matrix that gets added to the frozen W. Only A and B get trained, and because their inner dimension, called the rank, is tiny compared to the size of W, the number of trainable parameters drops from millions or billions down to a fraction of one percent.

A simple analogy that helps a lot of people. Imagine a professional chef who already knows how to cook everything, this is your pretrained model W. Instead of sending that chef back to culinary school to relearn cooking for a new client, you just hand them a small recipe card with a few tweaks specific to this client, maybe less salt, more spice. The chef stays the same, W stays frozen, but the small recipe card, matrices A and B, changes their output just enough for the new task. Writing a tiny recipe card is much cheaper than retraining a chef from scratch.

Why this matters in practice, the benefits are substantial. You are training maybe zero point one to one percent of the total parameters, which means far less GPU memory is needed because you do not need to store optimizer states for the frozen weights. Training becomes faster and cheaper. You can also save many different LoRA adapters, each one just a few megabytes, for many different tasks or customers, and swap them in and out on top of the same frozen base model. This is much cheaper than storing a full copy of the entire fine tuned model for every single use case.

Now let me show you what QLoRA adds on top of this.

![][image3]

QLoRA takes LoRA and squeezes it further. The frozen base model, that giant W we talked about, is compressed down to four bit precision instead of the usual sixteen or thirty two bit. That alone shrinks memory use for the base model by roughly four to eight times. The LoRA adapter matrices, A and B, stay in a higher precision like sixteen bit because those are the parts actually being trained, and you want training to be numerically stable there. During the forward and backward pass, the four bit weights get temporarily converted back to a higher precision just long enough to do the math, then discarded again, so the memory savings persist.

Continuing the chef analogy, QLoRA is like shrinking the chef's entire cookbook into a tiny compressed booklet that still contains all the same recipes but takes up far less shelf space, while the recipe card with the client specific tweaks stays full sized and easy to read. The compressed cookbook is only expanded briefly in the chef's head when actually cooking, never permanently.

The benefit of QLoRA is that it made it possible to fine tune genuinely huge models, sixty five billion parameters and larger, on a single consumer or prosumer GPU, something that was previously impossible without a cluster of expensive data center cards. The tradeoff is a small amount of computational overhead from constantly converting between four bit and higher precision, and a very slight quality loss compared to full precision LoRA, though in practice this is usually negligible.

Typical use cases for both of these. Companies that want to customize an open model like Llama or Mistral for their own domain, such as legal, medical, or customer support language, without owning a server farm. Researchers and hobbyists who want to experiment with fine tuning on a single GPU at home. Startups that need to serve many customers with slightly different behavior from one base model, by swapping lightweight adapters instead of hosting dozens of full sized model copies. Anyone doing rapid iteration where retraining a full model every time would be too slow and too expensive.

Now, since you asked about the full picture and not confusing similar terms, here is where LoRA and QLoRA sit among other approaches that all try to solve the same underlying problem, adapting a large pretrained model cheaply.

| Method | What actually gets trained | Memory need | Typical quality | Best for |
| ----- | ----- | ----- | ----- | ----- |
| Full fine tuning | Every parameter in the model | Very high | Highest possible, but easy to overfit or forget prior skills | When you have massive compute and need maximum control |
| LoRA | Two small low rank matrices added per layer | Low | Very close to full fine tuning | Most practical fine tuning jobs today |
| QLoRA | Same small matrices, but base model is 4 bit quantized | Very low | Very close to LoRA, tiny extra loss | Fine tuning huge models on limited hardware |
| Prompt tuning | A small set of learnable embedding vectors prepended to input | Extremely low | Weaker than LoRA on complex tasks | Simple tasks, many tasks sharing one frozen model |
| Prefix tuning | Learnable vectors injected into every transformer layer, not just input | Low | Better than prompt tuning, still below LoRA usually | Similar to prompt tuning but needs more capacity |
| Adapter tuning | Small extra neural network layers inserted between existing layers | Low to moderate | Comparable to LoRA, slightly slower inference since layers are added | Older PEFT approach, still used in some frameworks |
| IA3 | Learned scaling vectors that rescale activations | Extremely low | Good for simpler tasks, fewer parameters than LoRA | Very constrained memory situations |

A few terms worth separating clearly since they get mixed up often. PEFT is the umbrella category, it stands for Parameter Efficient Fine Tuning, and LoRA, QLoRA, prompt tuning, prefix tuning, adapters, and IA3 are all specific methods that live under that umbrella. Quantization on its own, separate from QLoRA, just refers to compressing a model's weights to lower precision for inference, and it can be applied to any model whether or not LoRA was involved. RLHF, reinforcement learning from human feedback, is a different axis entirely, it is about what signal you train on, human preference rankings, rather than how you train, and it can actually be combined with LoRA as the underlying training mechanism.

Orchestrated practical code examples for fine-tuning implementations

```py
"""
LoRA and QLoRA fine tuning example using Hugging Face transformers, peft, and bitsandbytes.

This script shows both approaches side by side so you can see exactly what changes
between them. Swap USE_QLORA to True or False to switch modes.

Install dependencies first:
    pip install transformers accelerate peft bitsandbytes datasets trl --break-system-packages
"""

import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

# ---------------------------------------------------------------------------
# 1. Pick your base model and decide whether to use QLoRA (4 bit) or plain LoRA
# ---------------------------------------------------------------------------
MODEL_NAME = "meta-llama/Llama-3.2-1B"   # swap for any causal LM on the hub
USE_QLORA = True                          # True = QLoRA, False = plain LoRA

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
tokenizer.pad_token = tokenizer.eos_token

# ---------------------------------------------------------------------------
# 2. Load the base model
#    This is the only part that differs between LoRA and QLoRA.
# ---------------------------------------------------------------------------
if USE_QLORA:
    # QLoRA: compress the frozen base weights down to 4 bit on load.
    # This is what lets a large model fit on a single consumer GPU.
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",          # normalized float 4, best for weights
        bnb_4bit_compute_dtype=torch.bfloat16,  # math happens in bf16 temporarily
        bnb_4bit_use_double_quant=True,     # quantize the quantization constants too
    )
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        quantization_config=bnb_config,
        device_map="auto",
    )
    # Required prep step whenever the base model is loaded in 4 bit or 8 bit.
    model = prepare_model_for_kbit_training(model)
else:
    # Plain LoRA: load the model at normal precision, nothing is compressed.
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )

# ---------------------------------------------------------------------------
# 3. Attach the LoRA adapters
#    This part is identical whether or not you used QLoRA above.
# ---------------------------------------------------------------------------
lora_config = LoraConfig(
    r=16,                     # rank of matrices A and B, higher r = more capacity
    lora_alpha=32,            # scaling factor applied to the low rank update
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # which layers get adapters
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Expect output like: trainable params 4,194,304 || all params 1,235,814,400
# meaning well under one percent of the model is actually being trained.

# ---------------------------------------------------------------------------
# 4. Load a small dataset and set up training
# ---------------------------------------------------------------------------
dataset = load_dataset("your_dataset_name_here", split="train")

training_args = TrainingArguments(
    output_dir="./lora_output",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    num_train_epochs=3,
    learning_rate=2e-4,
    logging_steps=10,
    save_strategy="epoch",
    bf16=True,
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=512,
)

trainer.train()

# ---------------------------------------------------------------------------
# 5. Save only the adapter, not the whole model
#    This is usually just a few megabytes, since W itself never changed.
# ---------------------------------------------------------------------------
model.save_pretrained("./lora_adapter")
tokenizer.save_pretrained("./lora_adapter")


# ---------------------------------------------------------------------------
# 6. Later, load the base model plus your adapter for inference
# ---------------------------------------------------------------------------
"""
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype=torch.bfloat16)
model_with_adapter = PeftModel.from_pretrained(base_model, "./lora_adapter")

# Optional: merge the adapter into the base weights permanently, useful for
# deployment when you no longer need to swap adapters.
merged_model = model_with_adapter.merge_and_unload()
merged_model.save_pretrained("./merged_model")
"""
```

Walking through the logic so the code maps back to the diagrams from before.

The only place LoRA and QLoRA actually differ is step two, how the base model gets loaded. For QLoRA, BitsAndBytesConfig tells the loader to compress every weight in W down to four bit precision the moment it loads onto the GPU, and compute\_dtype tells it what precision to briefly expand into whenever it needs to do actual math during a forward pass. For plain LoRA, you just load the model normally at sixteen bit and skip all of that.

Everything after that point is identical for both. LoraConfig is where you define the small matrices A and B from the diagram. The r value is literally the rank we talked about, a small number like sixteen, and target\_modules tells the library which specific weight matrices inside each transformer layer get an adapter attached, usually the attention projection layers since those tend to matter most for adaptation. When you call print\_trainable\_parameters, you will see something like four million trainable parameters out of one point two billion total, which is the whole point, you are training a tiny fraction of the model.

Training itself looks like completely ordinary Hugging Face training, nothing exotic, because from the trainer's point of view it is just optimizing whichever parameters were marked as trainable, which happens to only be A and B now.

The last two steps are where the practical benefit becomes obvious. Saving the model only writes out the adapter, typically a few megabytes, instead of gigabytes for a full model copy. Then at inference time you load the original frozen base model once, and can attach any number of different saved adapters to it depending on which task or customer you are serving, or merge one adapter permanently into the base weights if you want a single standalone model for deployment.

A couple of things worth knowing before you run this for real. You will need to swap in an actual dataset name in place of your\_dataset\_name\_here, format it so each example has a text field, and pick a model size that matches whatever GPU you have available, a one billion parameter model like the one in the example runs fine even on a single mid range GPU with QLoRA enabled.

## Give me some examples of models using LoRA or QLoRA and models using some other technology instead and why did they choose something other than LoRA or QLoRA? And once the model is already created, is it not fine tuned already? Who does this further fine tuning?

**Models and platforms that use LoRA or QLoRA, and why**

Image generation is probably the most visible example. Stable Diffusion and Flux based platforms have an enormous community around training small LoRA adapters for specific art styles, characters, or people, and marketplaces exist specifically for sharing these tiny adapter files so anyone can apply a particular visual style on top of a shared frozen base model, without ever touching the multi billion parameter diffusion model itself.

On the language model side, Fireworks AI runs a hosted fine tuning service that supports both LoRA and QLoRA, and lets a single dedicated deployment serve up to one hundred different LoRA adapters at once on top of one shared base model, at no extra cost beyond the base deployment. Fireworks supports both LoRA and QLoRA tuning, allowing up to 100 LoRA adaptations to run on a dedicated deployment without extra cost. Cresta, a customer service AI company, specifically chose this approach because it lets them deploy many customized models across different enterprise clients cheaply, on top of the same underlying open model. [Fireworks AI](https://fireworks.ai/blog/supervised-fine-tuning-tutorial)

AWS follows a similar pattern for its custom model import feature. In one of their own reference examples, they fine tune a Llama 3 model using QLoRA to keep training memory low, and only afterward merge the small adapter back into the base weights before uploading it, since Bedrock's import system expects one complete set of weights rather than a separate adapter file. The training script uses QLoRA for parameter efficient fine tuning, and once trained, the adapters are merged back into the original model to get an updated set of weights. [GitHub](https://github.com/aws-samples/amazon-bedrock-samples/blob/main/custom-models/import_models/llama-3/customized-text-to-sql-model.ipynb)

DigitalOcean is another clear case. Their own tutorials describe LoRA fine tuning as training only the adapter layers on a custom dataset while the base model stays frozen, and they explicitly recommend it when the goal is adjusting tone, writing style, or domain specific phrasing rather than teaching the model large amounts of new factual knowledge. LoRA fine tuning refers to training only the LoRA adapter layers on a custom dataset while keeping the base language model frozen, and is particularly effective for modifying writing style, response structure, tone, or domain understanding. They frame this as their go to method precisely because it lets small teams and startups fine tune models like Llama or Mistral on a single affordable GPU instead of needing a full cluster. [DigitalOcean](https://www.digitalocean.com/community/tutorials/fine-tune-llms-with-lora-for-custom-domains)

**Models and platforms that deliberately chose something other than LoRA or QLoRA**

Together AI is a good contrast case right next to Fireworks. Where Fireworks currently focuses on LoRA only for most models, Together AI also offers full parameter fine tuning as an option. Fireworks supports LoRA fine tuning for Llama and select other models, while for full parameter fine tuning, Together AI is the better option since Fireworks currently only supports LoRA. Teams that pick Together specifically for full fine tuning usually do so because they want the small amount of extra quality that comes from updating every parameter, or they are producing a model they intend to own completely rather than as an adapter layered on someone else's weights. [TokenMix](https://tokenmix.ai/blog/fireworks-ai-review)

AWS Bedrock also offers a method called continued pretraining, which is different from both LoRA and standard fine tuning. Instead of learning from labeled prompt and answer pairs, it exposes the model to large amounts of unlabeled domain text so the model absorbs the vocabulary and patterns of a field like medicine or law before any task specific tuning happens. Continued pretraining lets you provide unlabeled data to familiarize a foundation model with certain types of inputs, exposing it to specific topics. Companies choose this when their real problem is that the model simply does not understand their domain's language deeply enough, which a small low rank adapter cannot fix on its own. [AWS](https://aws.amazon.com/blogs/aws/customize-models-in-amazon-bedrock-with-your-own-data-using-fine-tuning-and-continued-pre-training/)

More recently, AWS introduced reinforcement fine tuning, which is a genuinely different axis rather than a competing technique to LoRA. Instead of training on fixed example pairs, the model improves iteratively from reward signals based on feedback. Reinforcement fine tuning uses a feedback driven approach where models improve iteratively based on reward signals, delivering around 66 percent accuracy gains on average over base models. Teams pick this specifically when they care about outcome quality under real usage patterns rather than just matching a fixed labeled dataset, which is a different problem than what LoRA was designed to solve.

And Anthropic's own Claude models illustrate a case where the fine tuning method is deliberately hidden from the customer entirely. AWS simply announced general availability of fine tuning for Claude 3 Haiku through Bedrock, without disclosing whether it is LoRA style or full parameter under the hood, because the customer is only ever given a resulting custom model to call, never raw weights. Amazon Bedrock is the only fully managed service that provides the ability to fine tune Claude models directly in the console.

**Now to your second question, since it ties everything together**

Yes, by the time a model reaches you, it has almost always already been fine tuned once, sometimes several times. There is a fairly consistent sequence.

First comes pretraining, where the model provider trains a raw base model on massive amounts of general text. This model can complete text but does not yet reliably follow instructions or refuse harmful requests. Second comes an alignment stage, usually instruction tuning followed by reinforcement learning from human feedback or a related technique like direct preference optimization. This stage is almost always done by the original provider itself, using their own compute, and it is typically closer to full parameter training rather than LoRA, because the provider is trying to fundamentally reshape how the entire model behaves, not just nudge it slightly for one narrow task. This is what turns a raw base model into something like an instruct model or a consumer facing assistant.

Once that release happens, there are two very different paths depending on whether the model is open weight or closed weight.

For open weight models, such as Llama, Mistral, or Qwen, anyone can take that already aligned model and add one more layer of fine tuning on top for their own specific needs. This is where LoRA and QLoRA dominate, precisely because doing a second full fine tuning pass on top of an already expensive model would be wasteful. This further fine tuning can be done by the end user directly on their own hardware, by a company's internal engineering team, or through platforms like DigitalOcean, Fireworks, Together, or AWS SageMaker, which do not usually decide to fine tune anything on their own initiative, they provide the GPUs, libraries, and managed tooling, while the actual customer decides what data to train on and configures the job.

For closed weight models like GPT, Claude, or Gemini, nobody outside the company can touch the raw weights at all, so only the original provider can physically run any further fine tuning. What looks like DigitalOcean or AWS fine tuning Claude for you is really the provider running the training job on their own infrastructure behind the scenes, almost certainly using an efficient method like LoRA internally since offering a fully separate full parameter model per customer would be far too costly to offer as a product, and then handing you back a private model identifier you can call through the API, without ever exposing the actual weights to you or to the platform hosting the interface.

# Training time vs Inference time

Quantization for serving, KV cache, and prefix caching are inference time techniques. They change how a model runs once it is already trained and deployed, not how the model is trained or what it learns. None of them touch the model's weights or its behavior in a way that changes what it knows or how it responds.

Here is a picture that separates the two buckets clearly, since this exact confusion, mixing up training time changes and inference time changes, is one of the most common mix ups in this whole area.

![][image4]

Let me go through each one, since the same word, quantization, showing up in both categories is exactly what causes confusion.

**Quantization for serving is not the same thing as the quantization inside QLoRA, even though it is the same underlying trick.** In QLoRA, quantization is used during training, to shrink the frozen base model so training fits in less memory while the small LoRA matrices are being learned. Quantization for serving is used after training is completely finished, purely to make an already trained model smaller and faster to run in production. You take the finished model's weights and compress them from sixteen bit or thirty two bit down to eight bit or four bit precision, permanently, for deployment. Nothing is being learned or adapted here, the model's knowledge and behavior stay exactly the same, you are just representing the same numbers with less precision so the model uses less memory and runs faster on the GPU. This is why you often see the same model released in multiple quantized versions, like a four bit version and an eight bit version, they behave almost identically, they just have different memory and speed tradeoffs.

**KV cache is about avoiding repeated work during a single conversation, not training at all.** When a transformer generates text, it produces one token at a time, and for each new token, it needs to look back at every previous token in the conversation through the attention mechanism. Without any caching, the model would recompute the attention calculations for the entire conversation history from scratch for every single new word it generates, which gets slower and slower as the conversation grows. The KV cache, short for key and value cache, simply stores the results of those calculations from earlier tokens so they do not need to be recomputed each time, only the newest token needs fresh computation. Think of it like a student solving a long multi step math problem who writes down each intermediate result on paper instead of recalculating everything from the beginning every time they move to the next line.

**Prefix caching takes that same idea and stretches it across multiple separate requests, not just within one conversation.** If many different users, or many different requests from the same user, all start with an identical block of text, for example the same system prompt or the same long document pasted at the top of every question, the server can compute and store the KV cache for that shared prefix once, and reuse it for every request that begins with the same text, instead of recalculating it fresh each time. This is a serving infrastructure optimization, something platforms like the ones we talked about earlier, Fireworks, Together, AWS, implement to make repeated or similar requests cheaper and faster, and it has nothing to do with how the model was trained.

**Speculative decoding**, which showed up in the diagram too, is another inference only trick worth knowing since it often gets grouped with these. A small, fast draft model guesses several tokens ahead, and the larger real model only needs to verify whether those guesses were correct rather than generating every token from scratch itself, which speeds up generation when the guesses are right, without changing the final output at all.

The clean way to keep all of this separated going forward. If a technique changes what the model knows or how it behaves, it belongs in the training time bucket, LoRA, QLoRA, full fine tuning, DPO, RLHF, distillation, continued pretraining. If a technique only changes how fast or how cheaply an already finished model runs, without changing its answers, it belongs in the inference time bucket, quantization for serving, KV cache, prefix caching, speculative decoding. A useful test you can apply to any new term you come across, ask yourself, does this require training data and a training loop, or does it only require the already finished model and a smarter way to run it. That question alone will correctly sort almost anything you encounter in this space.

# Speculative Decoding

![][image5]

Good, now let me walk you through this properly.

**The problem it solves**

When a large language model generates text, it does so one token at a time, and each new token needs a full pass through the entire model. Here is the surprising part though: for a single token, that pass barely uses the compute power of the GPU. The real bottleneck is moving the model weights (which can be tens of gigabytes) from memory into the processing units. So most of the time during generation, the GPU is sitting mostly idle, waiting on memory, not crunching numbers. This is called being memory bandwidth bound rather than compute bound.

Speculative decoding exploits this waste.

**The core idea, with an analogy**

Picture a senior editor at a magazine who is very good but slow, paired with a junior assistant who is fast but occasionally makes small mistakes. Instead of the senior editor writing every sentence themselves one at a time, the junior assistant drafts the next several sentences quickly. The senior editor then reads that whole draft in one sitting and either approves it, or stops at the first sentence that is wrong, fixes just that one, and throws away everything the assistant wrote after that point.

Because reading and checking several sentences at once takes the editor almost the same amount of time as reading just one sentence (checking is naturally faster than composing), the pair gets much more good content produced per unit of the expensive editor time.

That is exactly the mechanism, applied to tokens:

A small draft model (fast, cheap) proposes a handful of candidate next tokens, say four or five.

The large target model (the one whose quality you actually want) then verifies all of those candidates in a single forward pass. Because checking several tokens together costs about the same wall clock time as checking one, thanks to the memory bottleneck, this verification is almost free extra work.

Tokens that match what the target model would have generated anyway are accepted as is. At the first token where the draft guessed wrong, the target model supplies the correct token itself, and the process restarts from there.

**Why the output quality never drops**

This is the detail that makes speculative decoding special compared to most other speed tricks. The acceptance step uses a mathematical technique called rejection sampling, which guarantees that the final text you get has exactly the same probability distribution as if you had used the large model alone the whole time, token by token. The small model only ever proposes, it never gets the final say. So you get the full quality of the big model, just produced faster.

**When it gets used**

Anywhere generation latency matters and you have (or can build) a much smaller, faster model in the same family as your large model. Common cases are real time chat assistants, coding assistants that need quick responses, and API serving at scale where shaving latency per request saves real infrastructure cost. Typical speedups reported in practice are around two to three times faster wall clock generation, with identical output quality.

**How it compares to other inference speed techniques**

People often lump several different tricks together because they all make LLMs faster, but they solve different problems and can usually be stacked together rather than being alternatives to each other.

| Technique | What it actually changes | Does output quality change | Typically paired with speculative decoding |
| ----- | ----- | ----- | ----- |
| Speculative decoding | Uses a small model to draft, large model to verify in parallel | No, mathematically identical to the large model alone | This is the technique itself |
| Quantization | Stores weights in lower numeric precision, like int8 instead of fp16 | Slightly, small precision loss | Yes, often used for the draft model or both models |
| KV caching | Stores previously computed attention keys and values so they are not recomputed | No | Yes, this is standard and used underneath speculative decoding too |
| Continuous or dynamic batching | Groups many different users requests together on one GPU | No | Yes, they solve different bottlenecks, one is per user latency, one is server throughput |
| PagedAttention | Manages the KV cache memory in fixed size pages instead of one big block | No | Yes, purely a memory management trick |
| FlashAttention | A hardware efficient way to compute attention math with fewer memory reads and writes | No | Yes, it speeds up each forward pass regardless of decoding strategy |
| Model distillation | Trains a separate, permanently smaller model to mimic the big one | Yes, some quality is traded away for good | Sometimes, the distilled model can double as the draft model |
| Medusa or self speculative decoding | Adds extra prediction heads onto the same large model so it can guess ahead by itself | No | This is a variant of speculative decoding, not a separate technique |
| Early exit or layer skipping | Let's easy tokens skip the last few layers of the network | Yes, small accuracy tradeoff on those tokens | Rarely combined, different philosophy |
| Greedy, beam search, or sampling like top k and nucleus | Decides which token to pick from the probability distribution | Changes creativity and diversity, not speed | Orthogonal, this is a decoding choice, not a speed optimization |

The last row is the one people confuse most often. Greedy decoding, beam search, and sampling methods are about choosing which token to output, not about how fast you get there. Speculative decoding sits on a completely different axis, it is about how you compute that choice faster without changing what gets chosen.

If you want, I can also show you what happens to the actual timing, meaning how much wall clock time is saved per token, with a small worked example using rough numbers, or I can go deeper into how the small draft model is usually chosen or trained in practice. Which would help more right now?

![][image6]

Let us start with the timing example first, since seeing the actual numbers makes the whole idea click.Here is the reasoning behind those numbers.

Assume the large target model takes about 50 ms to produce one token, mostly because it has to pull its full set of weights from memory for every single step, not because the math itself is heavy. That is the standard case: 8 tokens, one after another, cost 8 times 50 ms, which is 400 ms.

Now bring in the small draft model. Since it is much smaller, it can propose 4 candidate tokens in roughly 20 ms total, a tiny fraction of the cost of the large model. The large model then checks all 4 candidates in a single forward pass. Because that pass is still bottlenecked on loading the same weights once, checking 4 tokens together costs close to the same 50 ms as checking just 1 token would have. So one full round, meaning draft plus verify, costs about 70 ms and yields 4 finished tokens, assuming the draft model guessed correctly on all 4 that round, which is a reasonably common case for a well matched draft model.

Two such rounds give you the same 8 tokens in about 140 ms instead of 400 ms, a speedup of roughly 2.9 times, right in the range that shows up in real deployments.

The one thing worth flagging honestly: this example assumes the draft model guesses correctly most of the time. If it guesses badly and gets rejected early and often, you still get correct output, but the speedup shrinks, because a rejected round wastes some of that drafting time. This is exactly why the choice and quality of the draft model matters so much, which brings us to the second thing you wanted to dig into. 

Choosing and training a good draft model comes down to balancing two things that pull against each other: it needs to be fast, so it should be small, but it also needs to guess the way the big model would guess, so it needs to be well matched. There are a few common ways teams handle this trade off.

**Same family, just smaller**

The simplest approach is to take a smaller checkpoint from the same model family as the target. For example, if your target is a 70 billion parameter model, your draft might be a 1 billion parameter model trained on similar data with the same tokenizer. Sharing the tokenizer is not optional, it is a hard requirement, since the verification step lines up tokens one for one between the two models. If the draft chops text into different pieces than the target does, the whole matching process breaks down.

**A quantized copy of the target itself**

Another common trick is to take the exact same model and just run a heavily compressed, lower precision version of it as the draft, for example an int4 version standing in for the full precision version. Since it is literally the same weights at lower resolution, its guesses tend to agree with the full model quite often, and you do not need to train or maintain a second model at all.

**A model specifically trained to imitate the target, through distillation**

Rather than grabbing an existing small model, some teams train a fresh small model with the specific goal of matching the big model output probabilities as closely as possible, not just getting the right answer. This is a distillation style training process, the small model is shown the big model output distribution during training and penalized for straying from it, rather than only being trained on raw text like a normal language model. This tends to produce noticeably higher acceptance rates than just grabbing an unrelated small model, since it was built for this exact matching job.

**Self speculative approaches, where there is no second model at all**

A newer family of methods, often called self speculative decoding, skips the separate draft model entirely. Instead, a few extra lightweight prediction heads are attached directly onto the large model itself, and those heads are trained to guess a few tokens ahead using the same internal representations the big model already computes. Approaches like Medusa and EAGLE work this way. The appeal is operational simplicity, you only ever load and maintain one model, but you still get the same draft then verify speedup, since those extra heads act exactly like a tiny draft model bolted onto the side of the big one.

**Why acceptance rate is the number that matters most**

Every one of these choices ultimately gets judged by one metric, how often the target model agrees with what the draft proposed. A higher acceptance rate means longer accepted runs per round, which means fewer expensive verification passes needed overall, which means a bigger speedup. This is why draft models are usually trained or selected on data that closely resembles what the target model will actually be asked to generate in production, a draft model that is excellent at casual chat but was never exposed to code will guess badly and slow things down when the target model is asked to write code.

There is also a practical knob that production systems tune, how many tokens to have the draft model guess per round. Guess too few and you leave speed on the table, guess too many and a bad guess early in that batch wastes the extra draft work behind it. Some serving systems even adjust this number dynamically based on how confident the draft model currently is, drafting more tokens when things are going well and fewer when the draft has been getting rejected a lot recently.

# Weights n Paramters

Weights and parameters are essentially the same thing in everyday usage, though there is a small technical distinction. Parameters is the umbrella term for every trainable number in the model, including the multiplication weights and the smaller bias terms and normalization values. Weights technically refers just to the multiplication coefficients. In practice, when people say model weights or say a model has so many billion parameters, they are talking about the same underlying pile of numbers stored in the checkpoint file. Nobody in casual conversation distinguishes between the two, so you are safe treating them as synonyms.

## Where are they stored??

![][image7]

As for where they live, it is not a single answer, it depends on the stage. Let me show you the path they travel.A few practical details worth adding to that picture.

**Disk is the starting point, but only briefly matters**

When a model is not actively serving requests, its weights sit on disk or in cloud object storage, saved in a file format such as safetensors or the older PyTorch bin format, or in gguf format for tools like llama.cpp. This is the slowest tier by far, but you only pay that cost once, when the server first boots up and loads the model. It is not part of the ongoing generation loop, so it does not affect per token speed at all.

**System RAM is just a waypoint**

The weights get read off disk and briefly pass through the regular system RAM of the machine, the same kind of memory your CPU uses. This is mostly a staging step on the way to the GPU, and for large production deployments it usually only happens once at startup, not per request.

**GPU high bandwidth memory, usually called HBM, is the real home**

Once loaded, the weights live in the memory physically attached to the GPU, called HBM on datacenter cards such as the A100 or H100. This is a large pool, commonly 40 to 141 gigabytes on a single modern datacenter GPU, and it is dramatically faster than system RAM, often in the range of two to eight terabytes per second depending on the card. For as long as the model stays loaded and serving traffic, the weights just sit here.

**The actual bottleneck is the last, tiny hop**

Here is the detail that ties directly back to everything we discussed about speculative decoding. Even though HBM is extremely fast, the GPU compute cores themselves are even faster, and every single token generated requires pulling the entire set of weights out of HBM into the compute cores to do the math. That repeated pull, happening once per token, is the actual bottleneck we were talking about earlier, not the disk, not system RAM, specifically the HBM to compute core hop, repeated over and over. That is exactly why generating four tokens together in one pass, as speculative decoding does during its verification step, costs barely more than generating one, since you pay that expensive HBM read essentially once either way.

# Interview style question

[**Crack AI Interviews**](https://www.crackaiinterviews.xyz/)

**Your LLM takes 1.5 seconds to generate the first token, but subsequent tokens arrive in just 30 ms each.**

**What causes this latency gap, and how would you optimize time-to-first-token (TTFT)?**

This question sounds like trivia. It isn't — it's checking whether you understand how an LLM actually runs.

Here's what is actually happening:

Generating text happens in two very different phases.

Prefill: the model reads your entire prompt at once and builds an internal cache (the KV cache). This is one big, compute-heavy pass over every token you sent. Long prompt → long prefill.

Decode: the model then produces one token at a time, reusing that cache. Each step is tiny and memory-bound, so tokens stream out fast.

So TTFT ≈ queue wait \+ prefill. The 30 ms is decode. A long prompt punishes the first token, not the rest.

How you'd actually reduce TTFT:

1\. Send fewer tokens  
\- Prefill cost scales with prompt length, so trim the prompt first  
\- In RAG, retrieve top-5 well-ranked chunks instead of top-20 mediocre ones  
\- Compress or summarise long chat history instead of resending it every turn  
\- Move static rules into a system prompt you can cache, not into every user message

2\. Cache the prefix  
\- Most prompts share a big, unchanging prefix (system prompt, tools, few-shot examples)  
\- Prompt caching / KV-cache reuse lets the server skip re-reading that prefix  
\- Put stable content first and variable content last, or the cache won't hit  
\- This is usually the single biggest TTFT win and it also cuts cost

3\. Fix the queue, not just the model  
\- Under load, most of TTFT is waiting, not computing  
\- Continuous batching (vLLM, TGI) admits new requests instead of making them wait for a batch to finish  
\- Separate fast interactive traffic from bulk/batch jobs so a 50-page summarisation doesn't block a chat reply  
\- Add capacity based on p99 TTFT, not average GPU utilisation

4\. Shorten the physical path  
\- Serve from a region close to your users; cross-continent round trips add real milliseconds  
\- Reuse HTTP connections, keep TLS sessions warm, avoid a cold proxy hop  
\- Cold starts on serverless GPUs can dominate everything else — keep a warm pool

5\. Overlap work instead of serialising it  
\- Run retrieval, safety pre-checks, and auth in parallel, not one after another  
\- Start streaming as soon as the first token exists; don't buffer the full answer  
\- Do slower checks on the streamed output while it renders

6\. Make the wait feel shorter  
\- Stream, always — perceived latency is what users judge  
\- Show retrieval status ("searching your documents…") so the pause has meaning  
\- Render a skeleton immediately instead of a blank screen

# Harness

"Open Harness" is DigitalOcean name for the runtime layer that actually runs an AI coding agent for you.

The word "harness" is the key part. In AI, a model by itself (like GPT or Claude) is just a brain that produces text. It cannot open a terminal, edit files, run commands, or remember a session on its own. A harness is the scaffolding wrapped around that brain that turns it into a working agent. The harness runs the loop (agent thinks, acts, sees the result, thinks again), manages the tools it can call, keeps the session and history alive, streams output to you, and enforces approvals before risky actions. So the harness is the machinery that lets a model do real work rather than just talk.

The "Open" part means it is not locked to one agent or one model. You can run Codex, Claude Code, OpenCode, Cursor, or even your own custom agent inside the same harness by changing one line in the spec. It is open to whatever brain you want to plug in.

Here is an analogy. Think of a talented driver with no car. The driver is the model: skilled, full of judgment, but unable to actually get anywhere alone. Open Harness is the car plus everything around it. The chassis and engine are the sandbox that gives the agent a place to run. The steering wheel, pedals, and dashboard are the session controls and live terminal you use to interact. The seatbelt and speed limiter are the approval and policy system that keeps things safe. And because it is open, you can swap which driver sits behind the wheel any time, without rebuilding the car.

So in the document mental model, you bring the brain (a model API key) and the instructions (the spec file), and Open Harness provides the body, the nervous system, and the controls that let that brain drive.

So is harness and agentic ai same or similar?

They are related but not the same. Easiest way to see it: agentic AI is the whole thing that gets work done, and the harness is one part inside it.  
Agentic AI describes the overall system and its behavior. It means an AI that does not just answer a question, but pursues a goal over multiple steps: it plans, takes actions, observes results, and adjusts until the task is done. Agentic is really an adjective about how the system behaves.  
A harness is a specific component that makes that behavior possible. It is the scaffolding around the model: the loop that lets the model act and react, the connection to tools, the session and memory, the approvals. The harness is not intelligent by itself. It supplies no reasoning. It just gives the model the ability to act.  
So the relationship is roughly this. An agentic AI system is made of two main parts, the model (the reasoning, the brain) and the harness (the machinery that lets the brain act). Put a capable model inside a good harness and you get agentic AI. Take the harness away and the model is back to just producing text.  
Back to the car analogy. Agentic AI is the whole experience of a journey actually happening: someone deciding where to go, driving, reacting to traffic, arriving. The harness is the car. The model is the driver. The car alone goes nowhere, and the driver alone cannot travel far. Agentic behavior is what emerges when the driver is in the car and the trip is underway.  
One nuance worth knowing. People use "agent" loosely. Sometimes "agent" means just the model with a prompt, sometimes it means the model plus its harness. DigitalOcean is being precise here: Open Harness is the harness, and you bring the model, and together they form the agent.

# Tab 34

apiVersion: agents.digitalocean.com/v1alpha1  
kind: Agent  
metadata:  
 name: hello-opencode  
spec:  
 runtime:  
 adapter: opencode  
 sandbox:  
 template: coding  
 sizeSlug: mv-2vcpu-4gb  
 persistentWorkspace: true  
 env:  
 HARNESS\_INFERENCE\_BASE\_URL: https://inference.do-ai.run/v1  
 HARNESS\_INFERENCE\_MODEL: deepseek-v4-pro  
 secrets:  
 \- name: HARNESS\_INFERENCE\_API\_KEY  
 source: tenantSecret  
 value: doo\_v1\_0b2bd66ddc85d1c358aa600e24a5612b857d1bc9f3e5eb380e2e3d9f67bd5e67  
 permissions:  
 defaultAction: ask

[image1]: <data:image/png;base64,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+xqOoKgDAAAA9lJVijorDM791scTfTpSp76Hr02+13e2Lq4tevKWRIH23valtYWPXR8v96dbFsXz6LHig53109avUwpV+PnXstixek5t5dOTam9sWhBN/+y1FdHz/XwWH7y+MupXMaZpvc6iabfWXl02LTGvhYolzbNp0WOJZb2+7pm692WvHT62iF63dxuFbe+/tjwxn+bRe142a0L0GmFfuGyt+893ra4tmTGutmPN3IZFXbyNU5ZVpqCoAwAAQO6qUNS9uXlhVBTce/mJiT7FWy8/X5v30FVRWNu4jkPiYiKMDc9PjvrHjzk80aejgeqz6bULHqybfvi6MxLPufr0L9eti+9XwXn/ladEj/16W6hQsnknXXJcYhnhvAsmX5voV6iQUv/8R65J9Nky0pZnbToyaW26/i2c7+LDP5NYXqPl3NVzdPz4vitPThR1Wk/b9rouMlxGGYOiDgAAALmrQlG3fPadAy4CrJBQgfLgNT+Ip+06s4VTflK79sz94vZ7LzsxuhYtfK4v6hRdR/1tbdKlx9e12Wvu3PBs3Paj/f975tNDraiz0PMuO+lf4mkVtf596WYuD117evR+NK33qH4dTbtr7DHxfHpfivC54Wtbm4oxTatADufTUTub1jWNt154YDz9xO0XJpZjoWL36fsuSxR1Wpe09ShrUNQBAAAgd1Uo6lQ8qAjQaYzWptP2pk+4OBHWr1Mf39+xLJ5+c9NziWKi0TV11uaLuond30+dz6Y7Rn0qsazX1z4dnx4atocRFnXPPXp93K73qLZpd7RH088/fmPiNRVW2M2979JoutE1dXajmeVz7oymVXTZfDbvg1efFj22o6I63VXTdiRQodM7/XuyZdx8wXfqXjMs6qbd0ZG6XmUOijoAAADkrgpFna4dUyHwxsbd16gpdFQtLEh8saBru3RErfPIv4kLED/PQIu6jS/WX78WPlendaYtSzH11gtS2y3C0y99n9ofuOrU6PF1wZHFtFBRqfkaFXW6zk1tOgqoIu20L/1+7Sdnf7NuXnusaw51vV7achSPXH9mXbvNt3nRlLr5wqKu0bLKHBR1AAAAyF0Viroty6ZHxcC65x6K23QTExVlirQjWOHpiz5snoEWdZtfejx1Pj3Wb9qlLUthRxp9u0XWok4/vRC+Dx/2/EZFXVgIq0DVvzq6d/kpX4geq9ALn6eb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7f02/87NPXFen9u6Pm5Pu/ulX46/s6aiKnkt2+A//I7VEZ207+BGRV24DDuzQt/Br23fnHitokbWfWvZ8jrQfetIzCtQCWUf/N9378T4C6dzTFv0ZRN+IV1+WU/0JWXTOppz76QJdV9SZfpyGilF3WDyet65Z8bPuWPcTaXLq89hmiIN/nXTk89fdm404NaA/aHlzyUG/xrM2wBd10p1TJ1U13/PknnxoN3m98tQhPOEMXPjivj6LIV+4NrPM5yRdfBftLza9lRe7W6W4TyWJ8vrJvd7cpbXsKgLj+5ZaJ5Ji59JtCuvugOnvUZ4c50iRNa8lm3wH37HKnSnQ2vf1He9sxV1+g7285d536rIum8tW179vtXyqn2r5dX6R2pegUoo0+CfqGZRR5SzqCP6j6yDf/Jarsia1zIN/olsg/+yFXVEtrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClcDgv1xBUVfNoKirZmQd/JPXckXWvDL4L1dk3beS13JFlrwClXDYod8b7T8ARHHjrom315Qzn0ePvJYrlFefwzRnPTQuMcAkihvKl89hGvJarsiaV32u/WedKG5k3beS13JFlrwClXD4Id/b338AiOLGmItHv6Wc+Tx65LVcobz6HKb54pUXvOUHmERxQ/nyOUxDXssVWfOqz7X/rBPFjaz7VvJarsiSV6AyVi5flPgQEMWMY485YofPXyPktTyRNa8fOXPUjmnrlyYGmUTxQnlSvnwO05DX8sRA8qrPtf+sE8UM7S99/hohr+WJgeQVqAROJShPHHPU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zz/r2T8TUeoAACBzTSl1UbauvPLKbom76KKLigULFhSXXnrpCdtiJi997VclSl31+n6Xunvuuac8z3XXXafUAQAA34wmlLpPPx0vXn/9793yFR+9rO9/7bX1PfsOHTpYbN26tXj33U5x+PBYuS0K2969H5bbR0dHiwMHPi42bdrYfe1bb71VbNmypdiz59i+kZHt5bGffHK4GBsbK5577rnizTffKD/+WZ07ytm2bf8tj6v/X8V7jm0xu7h//76JY7YVd9xxe3mea6+9dmLflnLfTJc7pQ4AADLXhFL34YcfFJdddllZiOJxWoTiecx+xf7zzjuvLG8ffbS/fL548eLi4MED5XExixdlKrZHEdy3b2+30NWzYcPrZfm76qqryudnn312zzGvvPJy+TvjXHHO2Pb003/ovqdqBjD27d79fjmLmP6OCy64oOff8k1HqQMAgMw1odR1Oju6RShm4NL9kfvuu697TJS3Uy11d911V/d18TiyZcvmstTNm3es1FW56aabuo+rj3pGqTv//PPLbZOVutgXpW7JkiXFFVdcUW6LkhjnefjhpUodAADQX00odS+++JdumYqPNab7I+vXr+seE4XqVEpd/K6TfaeuXupeeuml8rjYPjq6uzsr+MEHeyZ+59SlLl4T26rv1F1//fUzXuaqKHUAAJC5JpS6N974R7d4jY8f6dkfeeqpp044ZjpL3djYoe554ndU3++L3xHnUuoAAIDGakKpi4VIquIVi5ak+yNLltzfPSbK2nSWumqhlUjsHxkZKbc/++wz5ftR6gAAgMZqQqmL1SbvvXdxWYhiRi6drYtyVhWzRYsWlYWpKnULFy4sV7KM46LUDQ0Nfe1SV1/tMs69atVvyu3xXb/6TN3jjw92j4uyp9QBAAAzrgmlLgpQlKyqfMUiJfv27S0/Fhk/qwVIIvE9t3hN7Ku2rV69uixva9f+qbuSZVXqopRVx61cubJciCVm5uqlLlaw3LBhQ7nv7ruPL6wSZS/e22233VY+j98dtz6I1z722GM9pe6BBx7ovjbOEcVvpsudUgcAAJlrQqmLRAGr3xbg6quvLm699dbimmuu6W6L8lXN4tXLWiSOrT+vSl19li9y+eWXF2+//a9JV7+sFkiJxE3Pq0VbVq78ZXd73BC9XjLrpe7JJ5/obo/3He9JqQMAAPqqKaUuErNty5b9pLj44otPKFsXXnhhsXnzphO++xbZufO94pJLLuke99BDDxXr1v2tfByLr1SlbOPGd4qlS3/cPS72patf3njjD7r758+fX95QvDpPzLjdfPPN3Y9hxvt54oljBS7uRVeVupg9jPNX97VznzoAAKDvmlTq6omCFwugVLca+KrE9+TS7+FNlckWSqnuS5ceWyUKWryfmS5qXydKHQAAZK6ppa7fmazU5RilDgAAMjebS90NN9xQflRSqQMAAFprtpa62RKlDgAAMqfU5R2lDgAAMqfU5R2lDgAAMqfU5R2lDgAAMqfU5R2lDgAAMqfU5R2lDgAAMtfp7DiQFgHJJzG+6ZgDAAAZGRp6dW1aBCSfxPimYw4AAGRk4cKF3/YRzDwT4xrjm445AACQlwGzdXnmy1m6gXTAAQCA/JwxPn6kpxRIexPjGeOaDjQAAJCpwcHB76bFQNqbGM90jAEAgLx9q9PpWAkzg8Q4xnimAwwAAMwCc+bMOWd0dHdPUZDmJ8ZtYGBgbjqmAADALBSrJq5Zs+bB4eH/bIxVFKWZifGJcbLKJQAAMKmzJsTsz0TOlcZlboxPOmYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADACf4HBYjePAEgyXIAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,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>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,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>