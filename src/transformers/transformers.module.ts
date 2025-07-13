import { Module } from '@nestjs/common';
import { TransformerService } from './transformer.service';
import { Provider1Transformer } from './provider1.transformer';
import { Provider2Transformer } from './provider2.transformer';

@Module({
    providers: [
        TransformerService,
        Provider1Transformer,
        Provider2Transformer,
    ],
    exports: [TransformerService],
})
export class TransformersModule {}