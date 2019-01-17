import { PropertyMeta } from '../property';

export class PropertySource {
  private properties: { [name: string]: PropertyMeta } = {};

  constructor(private loader: string) {}

  getProperty(key: string): PropertyMeta | undefined {
    return this.properties[key];
  }

  setProperty(key: string, value: any, meta: { [name: string]: string }) {
    let overwrites = undefined;
    let properties = this.flattenProperties(key, value);

    key = this.normalizeKey(key);

    for (let prop of properties) {
      let propKey = this.normalizeKey(prop.key);
      if (this.properties[propKey]) {
        overwrites = this.properties[propKey];
      }
      this.properties[propKey] = new PropertyMeta(
        propKey,
        prop.value.toString(),
        this.loader,
        meta
      );
      this.properties[propKey].overwrites = overwrites;
    }
  }

  normalizeKey(key: string): string {
    return key.toLowerCase();
  }

  getKeys(): string[] {
    return Object.keys(this.properties);
  }

  private flattenProperties(outKey: string, obj: any): { key: string; value: string }[] {
    let rtn: { key: string; value: string }[] = [];
    if (obj === undefined || obj === null) {
      return rtn;
    }
    if (typeof obj === 'string') {
      rtn.push({ key: outKey, value: obj });
    } else if (typeof obj === 'number') {
      rtn.push({ key: outKey, value: obj.toString() });
    } else if (typeof obj === 'boolean') {
      rtn.push({ key: outKey, value: obj.toString() });
    } else if (typeof obj === 'symbol') {
      rtn.push({ key: outKey, value: obj.toString() });
    } else if (typeof obj === 'object' && !Array.isArray(obj)) {
      for (let inKey of Object.keys(obj)) {
        let n = outKey ? outKey + '.' + inKey : inKey;
        rtn = rtn.concat(this.flattenProperties(n, obj[inKey]));
      }
    } else {
      throw new Error(
        `Unsupported property type in key ${outKey}: ${Array.isArray(obj) ? 'Array' : typeof obj}`
      );
    }
    return rtn;
  }
}
