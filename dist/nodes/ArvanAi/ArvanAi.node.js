"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArvanAi = void 0;
const n8n_workflow_1 = require("n8n-workflow");
function normalizeEndpoint(url) {
    return url.trim().replace(/\/+$/, '').replace(/\/chat\/completions$/i, '');
}
class ArvanAi {
    constructor() {
        this.description = {
            displayName: 'Arvan AI',
            name: 'arvanAi',
            icon: 'fa:cloud',
            group: ['transform'],
            version: 1,
            description: 'Use ArvanCloud AIaaS Chat Completions in an n8n workflow',
            defaults: {
                name: 'Arvan AI',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            usableAsTool: true,
            credentials: [
                {
                    name: 'arvanAiApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [{ name: 'Chat', value: 'chat' }],
                    default: 'chat',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['chat'] } },
                    options: [
                        {
                            name: 'Create Completion',
                            value: 'createCompletion',
                            description: 'Generate a response using the selected ArvanCloud model endpoint',
                            action: 'Create a chat completion',
                        },
                    ],
                    default: 'createCompletion',
                },
                {
                    displayName: 'Model',
                    name: 'model',
                    type: 'string',
                    default: '',
                    placeholder: 'Qwen3-30B-A3B',
                    description: 'The model name associated with the ArvanCloud endpoint. Use the exact model ID shown in the AIaaS panel.',
                    required: true,
                },
                {
                    displayName: 'Input Mode',
                    name: 'inputMode',
                    type: 'options',
                    options: [
                        { name: 'Prompt', value: 'prompt' },
                        { name: 'Messages', value: 'messages' },
                    ],
                    default: 'prompt',
                },
                {
                    displayName: 'System Prompt',
                    name: 'systemPrompt',
                    type: 'string',
                    typeOptions: { rows: 3 },
                    default: '',
                    displayOptions: { show: { inputMode: ['prompt'] } },
                    description: 'Optional system instruction sent before the user prompt',
                },
                {
                    displayName: 'Prompt',
                    name: 'prompt',
                    type: 'string',
                    typeOptions: { rows: 5 },
                    default: '',
                    displayOptions: { show: { inputMode: ['prompt'] } },
                    required: true,
                },
                {
                    displayName: 'Messages',
                    name: 'messages',
                    type: 'fixedCollection',
                    default: {},
                    typeOptions: { multipleValues: true },
                    displayOptions: { show: { inputMode: ['messages'] } },
                    options: [
                        {
                            name: 'values',
                            displayName: 'Message',
                            values: [
                                {
                                    displayName: 'Role',
                                    name: 'role',
                                    type: 'options',
                                    options: [
                                        { name: 'System', value: 'system' },
                                        { name: 'User', value: 'user' },
                                        { name: 'Assistant', value: 'assistant' },
                                    ],
                                    default: 'user',
                                },
                                {
                                    displayName: 'Content',
                                    name: 'content',
                                    type: 'string',
                                    typeOptions: { rows: 3 },
                                    default: '',
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    options: [
                        {
                            displayName: 'Temperature',
                            name: 'temperature',
                            type: 'number',
                            typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 2 },
                            default: 0.7,
                            description: 'Controls randomness. Lower values are more deterministic.',
                        },
                        {
                            displayName: 'Maximum Number of Tokens',
                            name: 'maxTokens',
                            type: 'number',
                            typeOptions: { minValue: 1 },
                            default: 3000,
                            description: 'Maximum number of tokens to generate',
                        },
                        {
                            displayName: 'Additional Body JSON',
                            name: 'additionalBody',
                            type: 'json',
                            default: '{}',
                            description: 'Optional extra OpenAI-compatible request fields. Core fields model, messages, stream, temperature, and max_tokens are protected.',
                        },
                        {
                            displayName: 'Include Raw Response',
                            name: 'includeRawResponse',
                            type: 'boolean',
                            default: false,
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e, _f, _g;
        const items = this.getInputData();
        const returnItems = [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const credentials = await this.getCredentials('arvanAiApi');
                const endpointUrl = normalizeEndpoint(credentials.endpointUrl);
                const model = this.getNodeParameter('model', itemIndex);
                const inputMode = this.getNodeParameter('inputMode', itemIndex);
                const options = this.getNodeParameter('options', itemIndex, {});
                const messages = [];
                if (inputMode === 'prompt') {
                    const systemPrompt = this.getNodeParameter('systemPrompt', itemIndex, '');
                    const prompt = this.getNodeParameter('prompt', itemIndex, '');
                    if (systemPrompt.trim()) {
                        messages.push({ role: 'system', content: systemPrompt });
                    }
                    messages.push({ role: 'user', content: prompt });
                }
                else {
                    const messageCollection = this.getNodeParameter('messages', itemIndex, {});
                    messages.push(...((_a = messageCollection.values) !== null && _a !== void 0 ? _a : []));
                }
                if (messages.length === 0) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one chat message is required', {
                        itemIndex,
                    });
                }
                let additionalBody = {};
                if (typeof options.additionalBody === 'string' && options.additionalBody.trim()) {
                    try {
                        additionalBody = JSON.parse(options.additionalBody);
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Additional Body JSON is invalid JSON', {
                            itemIndex,
                            description: error instanceof Error ? error.message : undefined,
                        });
                    }
                }
                else if (options.additionalBody && typeof options.additionalBody === 'object') {
                    additionalBody = options.additionalBody;
                }
                for (const protectedField of ['model', 'messages', 'stream', 'temperature', 'max_tokens']) {
                    delete additionalBody[protectedField];
                }
                const body = {
                    ...additionalBody,
                    model,
                    messages,
                    stream: false,
                };
                if (options.temperature !== undefined)
                    body.temperature = options.temperature;
                if (options.maxTokens !== undefined)
                    body.max_tokens = options.maxTokens;
                const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'arvanAiApi', {
                    method: 'POST',
                    url: `${endpointUrl}/chat/completions`,
                    body,
                    json: true,
                }));
                const firstChoice = (_b = response.choices) === null || _b === void 0 ? void 0 : _b[0];
                const output = {
                    text: (_d = (_c = firstChoice === null || firstChoice === void 0 ? void 0 : firstChoice.message) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : '',
                    model: (_e = response.model) !== null && _e !== void 0 ? _e : model,
                    finishReason: (_f = firstChoice === null || firstChoice === void 0 ? void 0 : firstChoice.finish_reason) !== null && _f !== void 0 ? _f : null,
                    usage: ((_g = response.usage) !== null && _g !== void 0 ? _g : {}),
                };
                if (options.includeRawResponse) {
                    output.raw = response;
                }
                returnItems.push({ json: output, pairedItem: itemIndex });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnItems.push({
                        json: { error: error instanceof Error ? error.message : String(error) },
                        pairedItem: itemIndex,
                    });
                    continue;
                }
                if (error instanceof n8n_workflow_1.NodeOperationError)
                    throw error;
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, { itemIndex });
            }
        }
        return [returnItems];
    }
}
exports.ArvanAi = ArvanAi;
