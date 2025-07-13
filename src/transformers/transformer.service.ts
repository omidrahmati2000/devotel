import { Injectable } from '@nestjs/common';
import { Provider1Transformer } from './provider1.transformer';
import { Provider2Transformer } from './provider2.transformer';
import { UnifiedJob } from '../job-offers/interfaces/unified-job.interface';
import {ITransformer} from "./interfaces/transformer.interface";

// Define provider types as an enum
export enum ProviderType {
    PROVIDER1 = 'provider1',
    PROVIDER2 = 'provider2',
}

@Injectable()
export class TransformerService {
    private readonly transformers: Map<ProviderType, ITransformer<any, UnifiedJob>>;

    constructor(
        private readonly provider1Transformer: Provider1Transformer,
        private readonly provider2Transformer: Provider2Transformer,
    ) {
        // Initialize transformers map with proper typing
        this.transformers = new Map<ProviderType, ITransformer<any, UnifiedJob>>();
        this.transformers.set(ProviderType.PROVIDER1, this.provider1Transformer);
        this.transformers.set(ProviderType.PROVIDER2, this.provider2Transformer);
    }

    transform(provider: ProviderType, data: any): UnifiedJob[] {
        const transformer = this.transformers.get(provider);

        if (!transformer) {
            throw new Error(`No transformer found for provider: ${provider}`);
        }

        try {
            // Ensure we always return an array
            const result = transformer.transform(data);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error(`Error transforming data for provider ${provider}:`, error);
            return [];
        }
    }

    // Helper method to check if a provider is supported
    isProviderSupported(provider: string): provider is ProviderType {
        return Object.values(ProviderType).includes(provider as ProviderType);
    }

    // Get all supported providers
    getSupportedProviders(): ProviderType[] {
        return Array.from(this.transformers.keys());
    }
}