import { PropertySource } from '../propertySources/propertySource';

export interface PropertyLoader {
  loadProperties(profiles: string[]): Promise<PropertySource[]>;
}
