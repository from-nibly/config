import { PropertyMeta } from '../property';
import { PropertyLoader } from '../propertyLoaders/propertyLoader';
import { PropertySource } from '../propertySources/propertySource';

export interface DatabaseOptions {
  logger?: DatabaseLogger;
}

export interface DatabaseLogger {
  log(...args: any[]): void;
  error(...args: any[]): void;
}

export interface LoaderContext {
  whichOverrides(loader: PropertyLoader): LoaderContext;
}

export interface PropertyContext {
  asString(): string;
  asNumber(): number;
  asObject(): any;
  asMapped<T>(mapper: (obj: any) => T): T;
}

export class PropertyDatabase {
  private loaders: PropertyLoader[];
  private properties: { [name: string]: PropertyMeta };
  private propertySources: PropertySource[];
  private hasLoaded: boolean = false;
  private logger: DatabaseLogger;
  private profiles: string[];

  constructor(profiles?: string[], private options?: DatabaseOptions) {
    this.logger = {
      log: () => {},
      error: () => {},
    };
    if (options) {
      this.logger = options.logger || this.logger;
    }
    this.profiles = profiles || [];
    this.loaders = [];
  }

  use(loader: PropertyLoader): void {
    this.loaders.push(loader);
  }

  private whichOverrides(loader: PropertyLoader): LoaderContext {
    this.loaders.push(loader);
    return {
      whichOverrides: this.whichOverrides.bind(this),
    };
  }

  public withPropertyLoader(loader: PropertyLoader): LoaderContext {
    return this.whichOverrides(loader);
  }

  async loadProperties(): Promise<void> {
    let sourceArrays: PropertySource[][] = [];
    try {
      sourceArrays = await Promise.all(
        this.loaders.map(loader => loader.loadProperties(this.profiles))
      );
    } catch (err) {
      this.logger.error('failed to load one or more property sources', err.stack);
      throw err;
    }
    this.propertySources = sourceArrays.reduce(
      //load highest precedence sources at the beginning of the array
      (prev: PropertySource[], curr: PropertySource[]) => prev.concat(curr),
      []
    );
    this.propertySources = this.propertySources.reverse();
    this.mergeSources();
    // load properties in reverse order for ease of searching
    this.hasLoaded = true;
  }

  mergeSources(): void {
    this.properties = {};
    for (let source of this.propertySources) {
      for (let key of source.getKeys()) {
        let property = source.getProperty(key);
        if (property === undefined) {
          continue;
        }
        if (this.properties[property.key] !== undefined) {
          property.overwrites = this.properties[property.key];
        }
        this.properties[property.key] = property;
      }
    }
  }

  private traverseAndSet(obj: any, property: PropertyMeta) {
    let nameParts: string[] = property.key.split('_');
    let lastPart: string | undefined = nameParts.pop();
    if (lastPart === undefined) {
      return;
    }
    let currPart = nameParts.shift();
    let currObj = obj;
    while (currPart !== undefined) {
      currObj[currPart] = currObj[currPart] || {};
      currObj = currObj[currPart];
      currPart = nameParts.shift();
    }
    currObj[lastPart] = property;
  }

  get(key: string): PropertyContext {
    if (!this.hasLoaded) {
      throw new Error(
        'Property database has not loaded properties. To fix this call loadProperties()'
      );
    }
    if (!Object.keys(this.properties).find(k => k.startsWith(key))) {
      throw new Error(`property ${key} is not set`);
    }

    return {
      asString: () => {
        if (!this.properties[key]) {
          throw new Error(`property ${key} does not exist as a string`);
        }
        return this.properties[key].value;
      },
      asNumber: () => {
        if (!this.properties[key]) {
          throw new Error(`property ${key} does not exist as a number`);
        }
        return parseFloat(this.properties[key].value);
      },
      asObject: () => this.unrefPropertyAsObject(key),
      asMapped: <T>(mapper: (obj: any) => T) => {
        return mapper(this.unrefPropertyAsObject(key));
      },
    };
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

  //TODO allow for property name rewriting

  //TODO allow for adding property metdata
}
