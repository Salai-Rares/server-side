import { SeoMeta } from "@/shared/types";
import { ShortProductDescriptionVO } from "./description/short-description.value-object";
import { ValidationError } from "@/shared/errors/ValidationError";
export interface SeoMetaProps {
  title: string;
  description: string;
  keywords: string[];
  cannonicalUrl: string;
}

export class SeoMetaVO {
  private readonly _title: string;
  private readonly _description: ShortProductDescriptionVO;
  private readonly _keywords: string[];
  private readonly _cannonicalUrl: string;
  constructor(seo: SeoMetaProps) {
    this._title = seo.title;
    this._description = new ShortProductDescriptionVO(seo.description);
    this._keywords = seo.keywords;
    this._cannonicalUrl = seo.cannonicalUrl;
    this.validate();
  }
  get title() {
    return this._title;
  }
  get description() {
    return this._description;
  }
  get keywords() {
    return this._keywords;
  }
  get cannonicalUrl() {
    return this._cannonicalUrl;
  }

  private validate() {
    if (this.title.length < 3) throw ValidationError.domainRule('title','length',`title must have a length equal or greater than ${this.title.length}`,this.title.length);
  }
}
