# fromnibly/config

A precedence ordered config management library with configurable inputs.

## Install

No need to install typescript types. They are included in this repository.

```sh
npm install --save @fromnibly/config
```

## Getting Started

To start you need to create a PropertyDatabase. The PropertyDatabase is the main object you will
interact with.

```ts
import { PropertyDatabase } from '@fromnibly/config';

let config = new PropertyDatabase();
```

By default the property database is not configured with any PropertyLoaders. @fromnibly/config
includes a couple of default property loaders you can configure your property database with.

```ts
import { EnvironmentPropertyLoader, FilePropertyLoader } from '@fromnibly/config';

config
  .withPropertyLoader(new EnvironmentPropertyLoader(process.env))
  .whichOverrides(new FilePropertyLoader('./config'));
```

You can make your own PropertyLoaders as well. the EnvironmentPropertyLoader is a good example to
get you started.

Once you have configured your property loaders you need to load the properties. Since property
loaders can be async the `loadProperties()` call is also async.

```ts
config.loadProperties()
  .then(() => /* start your app */)
  .catch((err) => /* something went wrong */);

// or

await config.loadProperties();
```

## Getting A Configuration Property

Once your properties are loaded the property sources will be merged, flattened, lowercased and dot
delimited. As an example the following property sources...

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

## Default values

Calling `asString()`, `asNumber()` or `asObject()` will throw an exception if the property is not
set. This is to prevent your app from starting without all of the properties set. Although defaults
can often be packged with your app in something like an `application.yml` file you can also call any
of these with a default value like so.

```ts
let httpsPort = config.get('server.https.port').asNumber(8080);
let logLevel = config.get('logger.level').asString('debug');
// Because this call normally returns string leaf nodes
// you should return strings and cast to numbers later.
let httpConfig = config.get('server.http').asObject({ port: '8080' });
```

## isSet

You can also check if the property is set before trying to cast it.

```ts
let cert = config.get('server.https.cert');
if (cert.isSet()) {
  // start https server
} else {
  // start http server
}
```

## Advanced Deserialization

You can add property mappers to customize how properties are inflated.

Either on the fly like this:

```ts
let convertToNumberObject = obj => {
  if (obj.port) {
    return { port: parseInt(obj.port) };
  } else {
    return {};
  }
};
let httpConfig = config.get('server.http').asMapped(convertToNumberObject);
console.log(httpConfig);
// { port: 8080 }
```

or set at load time like this:

```ts
config.registerMapper('server.http', convertToNumberObject);

config.get('server.http').asMapped();
```

You can also convert maps to arrays with asMappedArray.

```yml
backups:
  disk:
    type: file
    filePath: /mnt/backup
  cloud:
    type: google-drive
    url: https://drive.google.com
    secret: '*****'
```

```ts
let backups = config.get('backups').asMappedArray((name: string, obj: any) => {
  return {
    name,
    ...obj,
  };
});
console.log(backups);
// [ { name: 'disk', type: 'file', ...}, { name: 'cloud', type: 'google-drive', ...}]
```

## Profiles

Profiles allow you to scope different properties. Profiles must be supported by the individual
PropertyLoader. For instance the FilePropertyLoader loads properties to a profile based on the name
of the file ie. `application-dev.yml` would be given the `dev` profile. Using profiles limits when
properties from certain sources become available. You set which properties should be loaded when
creating the PropertyDatabase.

```ts
let config = new PropertyDatabase(['dev', 'local']);
```

However it is not really useful to hard code the profiles. Something like this is usually a good
idea.

```ts
let config = new PropertyDatabase(process.env['CONFIG_PROFILES'].split(','));
```

Properties in profiles specified later in the array will overwrite properties in profiles specified
earlier in the array.

## Included PropertyLoaders

### EnvironmentPropertyLoaders

The EnvironmentPropertyLoader turns environment vaiables into properties by lowercasing, and dot
delimiting them.

### FilePropertyLoader

The FilePropertyLoader supports json, yaml, and java properties files. It looks for files
recursively in the root folder configured that are named application-<profile>.<ext>, or
application.<ext> for profile-less files.
