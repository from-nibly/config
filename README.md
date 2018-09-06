# fromnibly/config

A precedence ordered config with configurable inputs.

## Install

No need to install typescript types. They are included in this repository.

```sh
npm install --save @fromnibly/config
```

## Getting Started

To start you need to create a PropertyDatabase. The PropertyDatabase is the main object you will interact with.

```ts
import { PropertyDatabase } from '@fromnibly/config';

let config = new PropertyDatabase();
```

By default the property database is not configured with any PropertyLoaders. @fromnibly/config includes a couple of default property loaders you can configure your property database with.

```ts
import { EnvironmentPropertyLoader, FilePropertyLoader } from '@fromnibly/config';

config
  .withPropertyLoader(new EnvironmentPropertyLoader(process.env))
  .whichOverrides(new FilePropertyLoader('./config'));
```

You can make your own PropertyLoaders as well. the EnvironmentPropertyLoader is a good example to get you started.

Once you have configured your property loaders you need to load the properties. Since property loaders can be async the `loadProperties()` call is also async.

```ts
config.loadProperties()
  .then(() => /* start your app */)
  .catch((err) => /* something went wrong */);

// or

await config.loadProperties();
```

## Getting A Configuration Property

Once your properties are loaded the property sources will be merged, flattened, lowercased and dot delimited. As an example the following property sources...

```yaml
server:
  http.port: 8080
  https:
    port: 443
logger:
  level: 'info'
```

```sh
export SERVER_HTTP_HOST=localhost
```

...will result in the following properties being set

```properties
server.http.port=8080
server.http.host=localhost
server.https.port=443
logger.level=info
```

and can be retrieved in the following ways.

```ts
let httpsPort = config.get('server.https.port').asNumber();
let logLevel = config.get('logger.level').asString();
let httpConfig = config.get('server.http').asObject();
```

#### NOTE

currently all leaf properties returned by `.asObject()` will be strings.

## Profiles

Profiles allow you to scope different properties. Profiles must be supported by the individual PropertyLoader. For instance the FilePropertyLoader loads properties to a profile based on the name of the file ie. `application-dev.yml` would be given the `dev` profile. Using profiles limits when properties from certain sources become available. You set which properties should be loaded when creating the PropertyDatabase

```ts
let config = new PropertyDatabase(['dev', 'local']);
```

Properties in profiles specified later in the array will overwrite properties in profiles specified earlier in the array.

## Included PropertyLoaders

### EnvironmentPropertyLoaders

The EnvironmentPropertyLoader turns environment vaiables into properties by lowercasing, and dot delimiting them.

### FilePropertyLoader

The FilePropertyLoader supports json, yaml, and java properties files. It looks for files recursively in the root folder configured that are named application-<profile>.<ext>, or application.<ext> for profile-less files.
