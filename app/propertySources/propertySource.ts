import { PropertyMeta } from '../property';

export interface PropertySource {
  getProperty(key: string): PropertyMeta | undefined;

  setProperty(key: string, value: any, meta: { [name: string]: string }): void;

  getKeys(): string[];
}
