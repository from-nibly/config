import { ConfigServerProperties, StaticConfigServerPropertyLoader } from '../staticConfigServerPropertyLoader';

test('can load config server config', async () => {
  let config: ConfigServerProperties = {
    "PropertySources": [
      {
        "Name": "firstSource",
        "Source": {
          "app.config.load": true
        }
      },
      {
        "Name": "secondSource",
        "Source": {
          "app.config.value": 12345,
          "app.config.name": "foo"
        }
      }
    ]
  }
  let loader = new StaticConfigServerPropertyLoader(config);
  let propertySources = await loader.loadProperties([]);
  expect(propertySources[0].getProperty('app.config.load')!.value).toBe("true");
  expect(propertySources[1].getProperty('app.config.value')!.value).toBe("12345");
  expect(propertySources[1].getProperty('app.config.name')!.value).toBe("foo");
});
