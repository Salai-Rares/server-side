import { TextContent } from "./text-content.value-object";

export class ShortProductDescriptionVO extends TextContent {
    protected getMinLength(): number { return 10; }
    protected getMaxLength(): number { return 2000; }
    
    public toTeaser(){
        return this.value.slice(0, 30) + (this.value.length > 30 ? "..." : "");
    }
  }