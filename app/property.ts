export class PropertyMeta {
  public overwrites: PropertyMeta | undefined;
  constructor(
    public key: string,
    public value: string,
    public loader: string,
    public meta: { [name: string]: string }
  ) {}

  isPropertyMeta(): boolean {
    return true;
  }
}
