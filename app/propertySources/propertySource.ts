import { PropertyMeta } from '../property';
import { resolve } from 'dns';

export class PropertySource {
  private properties: { [name: string]: PropertyMeta } = {};

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
    let properties = this.flattenProperties(key, value);

    for (let prop of properties) {
      if (this.properties[prop.key]) {
        overwrites = this.properties[prop.key];
      }
      this.properties[prop.key] = new PropertyMeta(
        prop.key,
        prop.value.toString(),
        this.loader,
        meta
      );
      this.properties[prop.key].overwrites = overwrites;
    }
  }

  getKeys(): string[] {
    return Object.keys(this.properties);
  }

  private flattenProperties(outKey: string, obj: any): { key: string; value: string }[] {
    let rtn: { key: string; value: string }[] = [];
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
        if (Array.isArray(obj[inKey])) {
          throw new Error('Arrays are not supported values');
        } else if (typeof obj[inKey] === 'object') {
          rtn = rtn.concat(this.flattenProperties(n, obj[inKey]));
        } else {
          rtn.push({ key: n.toLowerCase(), value: obj[inKey].toString() });
        }
      }
    } else {
      throw new Error(
        `Unsupported property type in key ${outKey}: ${Array.isArray(obj) ? 'Array' : typeof obj}`
      );
    }
    return rtn;
  }
}
