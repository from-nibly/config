import { PropertyLoader } from '../propertyLoaders/propertyLoader';
import { PropertySource } from '../propertySources/propertySource';

export class EnvironmentPropertyLoader implements PropertyLoader {
  private envVars: { [key: string]: string | undefined };

  constructor(envVars?: { [key: string]: string | undefined }) {
    this.envVars = envVars || process.env;
  }

  public async loadProperties(profiles: string[]): Promise<PropertySource[]> {
    let source = new PropertySource(`EnvironmentVariables`);
    Object.keys(this.envVars).forEach(key => {
      let splitKey = key.split('_').join('.');
      source.setProperty(splitKey, this.envVars[key], {});
    });
    return [source];
  }
}
