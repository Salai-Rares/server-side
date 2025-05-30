import slugify from "slugify";

export class SlugVO{
    constructor(private readonly _value:string){
        this.validate();
    }

    private validate(): void {
        if (!this.value || this.value.length < 3) {
          throw new Error("Slug must be at least 3 characters long.");
        }
    
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(this.value)) {
          throw new Error("Slug format is invalid.");
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