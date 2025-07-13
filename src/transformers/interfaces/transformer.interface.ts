export interface ITransformer<TInput = any, TOutput = any> {
  transform(input: TInput): TOutput | TOutput[];
  validate?(input: TInput): boolean;
}
