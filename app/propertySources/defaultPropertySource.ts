import { PropertyMeta } from './../property';
import { PropertySource } from './propertySource';

export class DefaultPropertySource implements PropertySource {
  private properties: { [name: string]: PropertyMeta } = {};
  private sourceName: string = 'DefaultPropertySource';

  constructor(private loader: string) {}

  getProperty(key: string): PropertyMeta | undefined {
    return this.properties[key];
  }

  setProperty(key: string, value: any, meta: { [name: string]: string }) {
    let overwrites = undefined;
    key = key
      .toLowerCase()
      .split('_')
      .join('.');
    if (this.properties[key]) {
      overwrites = this.properties[key];
    }
    this.properties[key] = new PropertyMeta(
      key,
      value.toString(),
      this.loader,
      this.sourceName,
      meta
    );
    this.properties[key].overwrites = overwrites;
  }

  getKeys(): string[] {
    return Object.keys(this.properties);
  }
}
