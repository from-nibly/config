import { PropertyLoader } from '../propertyLoaders/propertyLoader';
import { PropertySource } from '../propertySources/propertySource';

export interface ConfigServerPropertySource {
  Name: string;
  Source: {[key: string]: string | number | boolean};
}

export interface ConfigServerProperties {
  PropertySources: ConfigServerPropertySource[]
}

export class StaticConfigServerPropertyLoader implements PropertyLoader {
  constructor(private properties: ConfigServerProperties) {}

  public async loadProperties(profiles: string[]): Promise<PropertySource[]> {
    let sources: PropertySource[] = [];
    for (let propertySource of this.properties.PropertySources) {
      let source = new PropertySource(propertySource.Name);
      source.setProperty('', propertySource.Source, {});
      sources.push(source);
    }
    return sources;
  }
}
