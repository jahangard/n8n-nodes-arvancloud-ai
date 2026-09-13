"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArvanChatModel = void 0;
const ai_node_sdk_1 = require("@n8n/ai-node-sdk");
const n8n_workflow_1 = require("n8n-workflow");
function normalizeEndpoint(url) {
    return url.trim().replace(/\/+$/, '').replace(/\/chat\/completions$/i, '');
}
class ArvanChatModel {
    constructor() {
        this.description = {
            displayName: 'Arvan Chat Model',
            name: 'arvanChatModel',
            icon: 'fa:cloud',
            group: ['transform'],
            version: 1,
            description: 'Use an ArvanCloud AIaaS endpoint as the language model for AI Agent and chains',
            defaults: {
                name: 'Arvan Chat Model',
            },
            inputs: [],
            outputs: [n8n_workflow_1.NodeConnectionTypes.AiLanguageModel],
            outputNames: ['Model'],
            credentials: [
                {
                    name: 'arvanAiApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Model',
                    name: 'model',
                    type: 'string',
                    default: '',
                    placeholder: 'Qwen3-30B-A3B',
                    description: 'The exact model ID configured for your ArvanCloud AIaaS endpoint. For example Qwen3-30B-A3B.',
                    required: true,
                },
                {
                    displayName: 'Temperature',
                    name: 'temperature',
                    type: 'number',
                    typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 2 },
                    default: 0.7,
                    description: 'Controls randomness. Lower values produce more deterministic output.',
                },
            ],
        };
    }
    async supplyData(itemIndex) {
        const credentials = await this.getCredentials('arvanAiApi');
        const model = this.getNodeParameter('model', itemIndex);
        const temperature = this.getNodeParameter('temperature', itemIndex);
        return (0, ai_node_sdk_1.supplyModel)(this, {
            type: 'openai',
            baseUrl: normalizeEndpoint(credentials.endpointUrl),
            apiKey: credentials.apiKey,
            model,
            temperature,
        });
    }
}
exports.ArvanChatModel = ArvanChatModel;
