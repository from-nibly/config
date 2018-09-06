import { PropertyLoader } from '../propertyLoaders/propertyLoader';
import { PropertySource } from '../propertySources/propertySource';
import { DefaultPropertySource } from './../propertySources/defaultPropertySource';

export class StaticPropertyLoader implements PropertyLoader {
  constructor(private properties: any) {}

  public async loadProperties(profiles: string[]): Promise<PropertySource[]> {
    let source = new DefaultPropertySource(`StaticProperties`);
    let flattened = this.flattenProperties('', this.properties);
    flattened.forEach((prop: { key: string; value: string }) => {
      source.setProperty(prop.key, prop.value, {});
    });
    return [source];
  }

  flattenProperties(outKey: string, obj: any): { key: string; value: string }[] {
    let rtn: { key: string; value: string }[] = [];
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
    return rtn;
  }
}
