# Agents

Learn how to build, deploy, and optimize agent workflows with AgentKit.

Agents are systems that intelligently accomplish tasks—from simple goals to complex, open-ended workflows. OpenAI provides models with agentic strengths, a toolkit for agent creation and deploys, and dashboard features for monitoring and optimizing agents.

## AgentKit

AgentKit is a modular toolkit for building, deploying, and optimizing agents.

[

![Build](https://cdn.openai.com/API/docs/images/build.png)

Build

Create workflows with Agent Builder, a visual canvas with starter templates

](/docs/guides/agent-builder)[

![Deploy](https://cdn.openai.com/API/docs/images/chatkit-1.png)

Deploy

Use ChatKit to embed your agent workflows in your frontend

](/docs/guides/chatkit)[

![Optimize](https://cdn.openai.com/API/docs/images/deploy.png)

Optimize

Build robust evals to observe and improve agent performance

](/docs/guides/agent-evals)

## How to build an agent

Building an agent is a process of designing workflows and connecting pieces of the OpenAI platform to meet your goals. Agent Builder brings all these primitives into one UI.

| Goal                         | What to use                            | Description                                                                                                        |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Build an agent workflow      | Agent Builder                          | Visual canvas for creating agent workflows. Brings models, tools, knowledge, and logic all into one place.         |
| Connect to LLMs              | OpenAI models                          | Core intelligence capable of reasoning, making decisions, and processing data. Select your model in Agent Builder. |
| Equip your agent             | Tools, guardrails                      | Access to third-party services with connectors and MCP, search vector stores, and prevent misuse.                  |
| Provide knowledge and memory | Vector stores, file search, embeddings | External and persistent knowledge for more relevant information for your use case, hosted by OpenAI.               |
| Add control-flow logic       | Logic nodes                            | Custom logic for how agents work together, handle conditions, and route to other agents.                           |

To build a voice agent that understands audio and responds in natural language, see the [voice agents docs](/docs/guides/voice-agents). Voice agents are not supported in Agent Builder.

## Deploy agents in your product

When you're ready to bring your agent to production, use ChatKit to embed the agent workflow into your product UI, or copy Agents SDK code.

| Goal                | What to use | Description                                                                                     |
| ------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| Embed your agent    | ChatKit     | Customizable UI component. Paste your workflow ID to embed your agent workflow in your product. |
| Write your own code | Agents SDK  | Copy Python or TypeScript code from Agent Builder for use with the Agents SDK.                  |

## Optimize agent performance

Use the OpenAI platform to evaluate agent performance and automate improvements.

| Goal                       | What to use      | Description                                                                        |
| -------------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| Evaluate agent performance | Evals features   | Full evaluation platform, including support for external model evaluation.         |
| Automate trace grading     | Trace grading    | Develop, deploy, monitor, and improve agents.                                      |
| Build and track evals      | Datasets         | A collaborative interface to build agent-level evals in a test environment.        |
| Optimize prompts           | Prompt optimizer | Measure agent performance, identify areas for improvement, and refine your agents. |

## Get started

Design an agent workflow with [Agent Builder](/docs/guides/agent-builder) →
