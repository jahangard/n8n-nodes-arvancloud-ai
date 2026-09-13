# n8n-nodes-arvan-ai
Community nodes for **ArvanCloud AIaaS** in n8n.

**Author:** Mehdi Jahangard ([mehdi.jahangard@gmail.com](mailto:mehdi.jahangard@gmail.com))

The package contains two nodes:

- **Arvan AI** — regular n8n action node for Chat Completions.
- **Arvan Chat Model** — AI language-model sub-node that connects directly to **AI Agent**, chains, and other n8n AI nodes.

## Why two nodes?

Use **Arvan AI** when you want a normal workflow step that receives items and outputs JSON.

Use **Arvan Chat Model** when ArvanCloud should be the actual language model behind an n8n **AI Agent** or LLM chain.

## Requirements

- A recent n8n version that includes `@n8n/ai-node-sdk`.
- Node.js 20.15+; Node.js 22 is recommended for current n8n development tooling.
- An ArvanCloud AIaaS endpoint.
- An ArvanCloud access key for that endpoint.

## Create the ArvanCloud credential

In ArvanCloud AIaaS:

1. Choose/deploy a model and create an Endpoint.
2. Copy the Endpoint base URL. It should look similar to:

   ```text
   https://arvancloudai.ir/gateway/models/<model>/<endpoint-id>/v1
   ```

3. Create/copy the endpoint access key.
4. In n8n create an **ArvanCloud AIaaS API** credential.
5. Enter:
   - **Endpoint URL**: the URL ending in `/v1`.
   - **API Key**: the complete value shown by ArvanCloud, including the `apikey ` prefix when present.

Do not append `/chat/completions` to the credential URL. The node does that automatically.

## Arvan AI node

### Prompt mode

Configure:

- Model
- Optional System Prompt
- Prompt
- Temperature
- Maximum Number of Tokens

Typical output:

```json
{
  "text": "...model response...",
  "model": "Qwen3-30B-A3B",
  "finishReason": "stop",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 80,
    "total_tokens": 100
  }
}
```

### Messages mode

Use **Messages** when you want to send an existing conversation:

- system
- user
- assistant

This is useful for workflows where you construct history yourself.

### Additional Body JSON

The node exposes `Additional Body JSON` for model/provider-specific OpenAI-compatible fields without requiring a code update.

The following fields cannot be overwritten there because they are controlled by the node:

- `model`
- `messages`
- `stream`
- `temperature`
- `max_tokens`

## Arvan Chat Model

Connect it to the **Chat Model** input of an n8n AI Agent:

```text
Chat Trigger
     |
 AI Agent  <---- Arvan Chat Model
     |
  Response
```

Configure only:

- ArvanCloud credential
- Model
- Temperature

The node uses n8n's official `@n8n/ai-node-sdk` OpenAI-compatible provider adapter.

## RAG / Knowledge Base

ArvanCloud can attach its Knowledge Base/RAG service directly to an AIaaS endpoint. Once it is attached in the ArvanCloud panel, calls through these n8n nodes use that configured endpoint. You do not need to duplicate ArvanCloud's RAG implementation inside this community node.

You can still build a separate n8n-native RAG pipeline if you prefer to manage embeddings/vector retrieval inside n8n.

## Guardrails

ArvanCloud Guardrail configuration is endpoint-side. Configure sensitive-data protection, prompt-injection/jailbreak protection, and content moderation in the ArvanCloud panel. Changes apply to requests reaching that endpoint.

## Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Local installation after build

From the package directory:

```bash
npm pack
```

Then install the generated package in the environment hosting n8n, or publish it to npm and install it from **Settings -> Community Nodes**.

Package names intended for n8n Community Nodes should keep the `n8n-nodes-` prefix and the `n8n-community-node-package` keyword.

## Publishing checklist

Before publishing:

1. Replace the placeholder GitHub repository URL in `package.json`.
2. Run `npm install`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Test both nodes against a real ArvanCloud AIaaS endpoint.
6. Test **Arvan Chat Model** with AI Agent tool-calling if your selected Arvan model supports tools.
7. Publish to npm.

## API references

- ArvanCloud AIaaS API usage: https://docs.arvancloud.ir/fa/aiaas/api-usage/
- ArvanCloud OpenAI SDK example: https://docs.arvancloud.ir/fa/aiaas/examples/openai/
- ArvanCloud LangChain example: https://docs.arvancloud.ir/fa/aiaas/examples/langchain/
- n8n node starter: https://github.com/n8n-io/n8n-nodes-starter

## Notes

ArvanCloud's endpoint is OpenAI-compatible, but supported capabilities can vary by the model deployed behind the endpoint. Chat completion is the baseline implemented here. Model-specific capabilities such as tool calling, JSON/structured output, vision, or reasoning should be tested with the exact Arvan model you deploy.
