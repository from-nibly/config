import { PropertyDatabase } from '../propertyDatabase';
import { StaticPropertyLoader } from '../../propertyLoaders/staticPropertyLoader';

test('properties can be changed and reloaded', async () => {
  let config = new PropertyDatabase([]);
  let cfgObj = { foo: { bar: 5 } };
  config.withPropertyLoader(new StaticPropertyLoader(cfgObj));
  await config.loadProperties();
  expect(config.get('foo.bar').asNumber()).toBe(5);
  cfgObj.foo.bar = 6;
  await config.loadProperties();
  expect(config.get('foo.bar').asNumber()).toBe(6);
});
