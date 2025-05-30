import { TextContent } from "./text-content.value-object";

export class ProductDescriptionVO extends TextContent {
    protected getMinLength(): number { return 1; }
    protected getMaxLength(): number { return 2000; }
  }