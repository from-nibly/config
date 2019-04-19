import { PropertyMeta } from '../property';
import { Mapper, ArrayMapper } from './mapper';

type MapOf = { [key: string]: any };

export class PropertyContext {
  constructor(
    private key: string,
    private properties: { [name: string]: PropertyMeta },
    private mapper: Mapper<any> | undefined,
    private arrayMapper: ArrayMapper<any> | undefined
  ) {}

  asString(def?: string): string {
    if (!this.properties[this.key] && def === undefined) {
      throw new Error(`property ${this.key} does not exist as a string`);
    } else if (!this.properties[this.key] && def !== undefined) {
      return def;
    } else {
      return this.properties[this.key].value;
    }
  }

  asNumber(def?: number): number {
    if (!this.properties[this.key] && def === undefined) {
      throw new Error(`property ${this.key} does not exist as a number`);
    } else if (!this.properties[this.key] && def !== undefined) {
      return def;
    } else {
      return parseFloat(this.properties[this.key].value);
    }
  }

  asBoolean(def?: boolean): boolean {
    if (!this.properties[this.key] && def === undefined) {
      throw new Error(`property ${this.key} does not exist as a boolean`);
    } else if (!this.properties[this.key] && def !== undefined) {
      return def;
    } else {
      return this.properties[this.key].value.toLowerCase() === 'true';
    }
  }

  asObject(def?: MapOf): MapOf {
    if (!this.hasPropertyRoot(this.key) && def === undefined) {
      throw new Error(`property ${this.key} is not set`);
    } else if (!this.hasPropertyRoot(this.key) && def !== undefined) {
      return def;
    } else {
      return this.unrefPropertyAsObject(this.key);
    }
  }

  asMapped<T>(mapper?: Mapper<T>, def?: T): T {
    if (!this.hasPropertyRoot(this.key) && def === undefined) {
      throw new Error(`property ${this.key} is not set`);
    } else if (!this.hasPropertyRoot(this.key) && def !== undefined) {
      return def;
    } else {
      let map: Mapper<T>;
      if (mapper !== undefined && mapper !== null) {
        map = mapper;
      } else if (this.mapper !== undefined && this.mapper !== null) {
        map = this.mapper;
      } else {
        throw new Error(`Registered mapper for key ${this.key} not found and no mapper passed.`);
      }
      return map(this.unrefPropertyAsObject(this.key));
    }
  }

  isSet(): boolean {
    return this.properties[this.key] !== undefined || this.hasPropertyRoot(this.key);
  }

  asMappedArray<T>(arrayMapper?: (key: string, obj: any) => T, def?: T[]): T[] {
    if (!this.hasPropertyRoot(this.key) && def === undefined) {
      throw new Error(`property ${this.key} is not set`);
    } else if (!this.hasPropertyRoot(this.key) && def !== undefined) {
      return def;
    } else {
      let map: ArrayMapper<T>;
      if (arrayMapper !== undefined && arrayMapper !== null) {
        map = arrayMapper;
      } else if (this.arrayMapper !== undefined && this.arrayMapper !== null) {
        map = this.arrayMapper;
      } else {
        throw new Error(`Registered mapper for key ${this.key} not found and no mapper passed.`);
      }
      let obj = this.unrefPropertyAsObject(this.key);
      return Object.keys(obj).map(key => map(key, obj[key]));
    }
  }

  private hasPropertyRoot(key: string): boolean {
    return Object.keys(this.properties).find(k => k.startsWith(key + '.')) !== undefined;
  }

  private unrefPropertyAsObject(key: string): any {
    let value: any = {};
    let relevant = Object.keys(this.properties)
      .filter(propKey => propKey.startsWith(key + '.'))
      .map(propKey => this.properties[propKey]);

    relevant.forEach(property =>
      this.addProperty(value, this.stripPrefix(key, property.key).split('.'), property.value)
    );
    return value;
  }

  private addProperty(obj: any, path: string[], value: any) {
    if (path.length === 1) {
      obj[path[0]] = value;
      return;
    }
    obj[path[0]] = obj[path[0]] || {};
    this.addProperty(obj[path[0]], path.slice(1), value);
  }

  private stripPrefix(prefix: string, key: string) {
    return key.slice(prefix.length + 1);
  }
}
