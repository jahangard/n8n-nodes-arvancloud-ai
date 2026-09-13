import { supplyModel } from '@n8n/ai-node-sdk';
import type {
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	SupplyData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

function normalizeEndpoint(url: string): string {
	return url.trim().replace(/\/+$/, '').replace(/\/chat\/completions$/i, '');
}

export class ArvanChatModel implements INodeType {
	description: INodeTypeDescription = {
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
		outputs: [NodeConnectionTypes.AiLanguageModel],
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
				description:
					'The exact model ID configured for your ArvanCloud AIaaS endpoint. For example Qwen3-30B-A3B.',
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

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('arvanAiApi');
		const model = this.getNodeParameter('model', itemIndex) as string;
		const temperature = this.getNodeParameter('temperature', itemIndex) as number;

		return supplyModel(this, {
			type: 'openai',
			baseUrl: normalizeEndpoint(credentials.endpointUrl as string),
			apiKey: credentials.apiKey as string,
			model,
			temperature,
		});
	}
}
