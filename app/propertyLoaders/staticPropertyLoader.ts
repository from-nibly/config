import { PropertyLoader } from '../propertyLoaders/propertyLoader';
import { PropertySource } from '../propertySources/propertySource';

export class StaticPropertyLoader implements PropertyLoader {
  constructor(private properties: any) {}

  public async loadProperties(profiles: string[]): Promise<PropertySource[]> {
    let source = new PropertySource(`StaticProperties`);
    source.setProperty('', this.properties, {});
    return [source];
  }
}
