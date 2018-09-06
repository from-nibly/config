import { PropertyLoader } from '../propertyLoaders/propertyLoader';
import { PropertySource } from '../propertySources/propertySource';
import { DefaultPropertySource } from './../propertySources/defaultPropertySource';

export class EnvironmentPropertyLoader implements PropertyLoader {
  constructor(private envVars: { [key: string]: string | undefined }) {}

  public async loadProperties(profiles: string[]): Promise<PropertySource[]> {
    let source = new DefaultPropertySource(`EnvironmentVariables`);
    Object.keys(this.envVars).forEach(key => {
      source.setProperty(key, this.envVars[key], {});
    });
    return [source];
  }
}
