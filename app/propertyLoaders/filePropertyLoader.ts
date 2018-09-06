import * as fs from 'fs';
import * as path from 'path';
import * as propReader from 'properties-reader';
import * as readdir from 'recursive-readdir';
import * as yamljs from 'yamljs';
import { PropertySource } from './../propertySources/propertySource';
import { PropertyLoader } from './propertyLoader';

export class FilePropertyLoader implements PropertyLoader {
  private fileRegex = /application(-.+)?\.(yaml|yml|json|properties)/;

  constructor(private configRoot: string) {}

  public async loadProperties(profiles: string[]): Promise<PropertySource[]> {
    let ignoreFunc = (file: string, stats: fs.Stats): boolean => {
      return !stats.isDirectory() && !this.fileRegex.exec(file);
    };
    let files = (await readdir(path.join(process.cwd(), this.configRoot), [ignoreFunc]))
      .filter(file => {
        let profile = this.getProfile(file);
        return profile == '' || profiles.indexOf(profile) !== -1;
      })
      .sort((a, b) => {
        //TODO: document this
        let aProfile = this.getProfile(a);
        let bProfile = this.getProfile(b);
        if (!aProfile && !bProfile) {
          //longer file name = lower precedence
          return a.length - b.length;
        }
        //no profile is lower precedence
        if (!aProfile && bProfile) {
          return 1;
        }
        if (aProfile && !bProfile) {
          return -1;
        }
        let aIndex = profiles.indexOf(aProfile);
        let bIndex = profiles.indexOf(bProfile);
        if (aIndex === bIndex) {
          //same index longer file name = lower precedence
          return b.length - a.length;
        }
        //later profile overwrites earlier profile
        return aIndex - bIndex;
      });
    let rtn: PropertySource[] = [];
    for (let file of files) {
      let source = new PropertySource(`File:${file}`);
      let props: any = this.loadFile(file);
      if (props) {
        source.setProperty('', props, {});
        rtn.push(source);
      }
    }
    return rtn;
  }

  getProfile(fileName: string) {
    let match = this.fileRegex.exec(fileName);
    if (match) {
      if (!match[1]) {
        return '';
      }
      return match[1].slice(1);
    } else {
      return '';
    }
  }

  loadFile(file: string): any {
    if (/.*\.json/.exec(file)) {
      return require(file);
    } else if (/.*\.(yaml|yml)/.exec(file)) {
      return yamljs.load(file);
    } else if (/.*\.properties/.exec(file)) {
      return propReader(file);
    }
  }
}
