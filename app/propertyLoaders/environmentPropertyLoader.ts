import { PropertyLoader } from '../propertyLoaders/propertyLoader';
import { PropertySource } from '../propertySources/propertySource';

export class EnvironmentPropertyLoader implements PropertyLoader {
  constructor(private envVars: { [key: string]: string | undefined }) {}

  public async loadProperties(profiles: string[]): Promise<PropertySource[]> {
    let source = new PropertySource(`EnvironmentVariables`);
    Object.keys(this.envVars).forEach(key => {
      source.setProperty(key, this.envVars[key], {});
    });
    return [source];
  }
}
