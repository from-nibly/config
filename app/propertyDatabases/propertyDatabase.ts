import { PropertyLoader } from '../propertyLoaders/propertyLoader';

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
}

export interface PropertyDatabase {
  loadProperties(): Promise<void>;
  withPropertyLoader(loader: PropertyLoader): LoaderContext;
  get(key: string): PropertyContext;
  // getProperties(key: string): { [name: string]: any } | string | undefined;
}
