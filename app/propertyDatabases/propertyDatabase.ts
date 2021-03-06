import { PropertyMeta } from '../property';
import { PropertyLoader } from '../propertyLoaders/propertyLoader';
import { PropertySource } from '../propertySources/propertySource';
import { ArrayMapper, Mapper } from './mapper';
import { PropertyContext } from './propertyContext';

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

export class PropertyDatabase {
  private loaders: PropertyLoader[];
  private properties: { [name: string]: PropertyMeta };
  private propertySources: PropertySource[];
  private hasLoaded: boolean = false;
  private logger: DatabaseLogger;
  private profiles: string[];
  private mappers: { [key: string]: Mapper<any> };
  private rootMapper: Mapper<any>;
  private arrayMappers: { [key: string]: ArrayMapper<any> };
  private rootArrayMapper: ArrayMapper<any>;

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
    this.mappers = {};
    this.arrayMappers = {};
  }

  use(loader: PropertyLoader): void {
    this.loaders.push(loader);
  }

  private getMapper<T>(key?: string): Mapper<T> {
    if (!key) {
      return this.rootMapper;
    }
    return this.mappers[key];
  }

  private getArrayMapper<T>(key?: string): ArrayMapper<T> {
    if (!key) {
      return this.rootArrayMapper;
    }
    return this.arrayMappers[key];
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

  get(key?: string): PropertyContext {
    if (!this.hasLoaded) {
      throw new Error(
        'Property database has not loaded properties. To fix this call loadProperties()'
      );
    }

    return new PropertyContext(key, this.properties, this.getMapper(key), this.getArrayMapper(key));
  }

  registerMapper<T>(key: string, mapper: Mapper<T>) {
    this.mappers[key] = mapper;
  }

  registerArrayMapper<T>(key: string, mapper: ArrayMapper<T>) {
    this.arrayMappers[key] = mapper;
  }

  //TODO allow for property name rewriting

  //TODO allow for adding property metdata
}
