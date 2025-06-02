import { ValidationError, ValidationField } from "@/shared/errors/ValidationError";
import slugify from "slugify";

export class SlugVO{
    constructor(private readonly _value:string){
        this.validate();
    }

    private validate(): void {
       const errors: Array<ValidationField> = [];
        if (!this.value || this.value.length < 3) {
          errors.push({
          field:"slug",
          rule:"slug_length",
          message:`slug must be greater than ${this.value.length} `,
          value:this.value.length
        })
        }
    
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(this.value)) {
          errors.push({
          field:"slug",
          rule:"slug_format",
          message:'Slug must be all letter and number with "-" between them',
          value:this.value
        })
        }
         if(errors.length > 0){
              throw ValidationError.domainRules("Invalid price configurations",errors)
            }
      }
  // Factory method for creation from raw names
  static fromName(name: string): SlugVO {
    const slugified = slugify(name, { 
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    return new SlugVO(slugified);
  }
    get value():string{
        return this._value;
    }
}