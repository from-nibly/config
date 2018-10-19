import { PropertyDatabase } from '../propertyDatabase';
import { EnvironmentPropertyLoader } from '../../propertyLoaders/environmentPropertyLoader';
import { StaticPropertyLoader } from '../../propertyLoaders/staticPropertyLoader';

test('single property can be retrieved', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: 'bar' }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('bar');
});

test('single number property can be retrieved', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: 5 }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('5');
  expect(config.get('foo').asNumber()).toBe(5);
});

test('non-missing property will not use default', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: { bar: '5' } }));
  await config.loadProperties();
  expect(config.get('foo').isSet()).toBe(true);
  expect(config.get('foo.bar').isSet()).toBe(true);
  expect(config.get('foo.bar').asString('default')).toBe('5');
  expect(config.get('foo.bar').asNumber(10)).toBe(5);
  expect(config.get('foo').asObject({ bazz: '10' })).toEqual({ bar: '5' });
  expect(config.get('foo').asMapped(obj => parseInt(obj.bar), '10')).toBe(5);
  expect(config.get('foo').mapToArray((key, obj) => obj, ['10'])).toEqual(['5']);
});

test('missing property can be defaulted', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: 'test' }));
  await config.loadProperties();
  expect(config.get('bar').isSet()).toBe(false);
  expect(config.get('bar').asString('default')).toBe('default');
  expect(config.get('bar').asNumber(5)).toBe(5);
  expect(config.get('bar').asObject({ bar: '5' })).toEqual({ bar: '5' });
  expect(config.get('bar').asMapped(echo => echo, '5')).toBe('5');
  expect(config.get('bar').mapToArray((key, obj) => obj, ['5'])).toEqual(['5']);
});

test('missing property with no default throws error', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: 5 }));
  await config.loadProperties();
  expect(config.get('bar').isSet()).toBe(false);
  expect(() => config.get('bar').asString()).toThrow();
  expect(() => config.get('bar').asNumber()).toThrow();
  expect(() => config.get('bar').asObject()).toThrow();
  expect(() => config.get('bar').asMapped(echo => echo)).toThrow();
  expect(() => config.get('bar').mapToArray((key, obj) => obj)).toThrow();
});

test('multiple properties dont collide', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: 5, bar: 'bang' }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('5');
  expect(config.get('foo').asNumber()).toBe(5);
  expect(config.get('bar').asString()).toBe('bang');
});

test('multiple property sources dont collide', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: 5 }))
    .whichOverrides(new StaticPropertyLoader({ bar: 'bang' }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('5');
  expect(config.get('foo').asNumber()).toBe(5);
  expect(config.get('bar').asString()).toBe('bang');
});

test('overriding property source overrides property', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: 5, bar: 'test' }))
    .whichOverrides(new StaticPropertyLoader({ bar: 'bang' }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('5');
  expect(config.get('foo').asNumber()).toBe(5);
  expect(config.get('bar').asString()).toBe('test');
});

test('nested property can be retrieved', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 'test' } }));
  await config.loadProperties();
  expect(config.get('foo.bar').asString()).toBe('test');
});

test('nested property can be overridden', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 'test' } }))
    .whichOverrides(new StaticPropertyLoader({ foo: { bar: 'bang' } }));
  await config.loadProperties();
  expect(config.get('foo.bar').asString()).toBe('test');
});

test('env vars can override other vars', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config
    .withPropertyLoader(new EnvironmentPropertyLoader({ FOO_BAR: 'thing' }))
    .whichOverrides(new StaticPropertyLoader({ foo: { bar: 'test' } }));
  await config.loadProperties();
  expect(config.get('foo.bar').asString()).toBe('thing');
});

test('env vars wont override others if it is lower precedence', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 'test' } }))
    .whichOverrides(new EnvironmentPropertyLoader({ FOO_BAR: 'thing' }));
  await config.loadProperties();
  expect(config.get('foo.bar').asString()).toBe('test');
});

test('getting object works', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 'test' } }))
    .whichOverrides(new EnvironmentPropertyLoader({ FOO_BAR: 'thing' }));
  await config.loadProperties();
  expect(config.get('foo').asObject()).toEqual({ bar: 'test' });
});

test('get as mapped works', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 5 } }));
  await config.loadProperties();
  expect(
    config.get('foo').asMapped((obj: any) => {
      obj.bar = parseInt(obj.bar);
      return obj;
    })
  ).toEqual({ bar: 5 });
});
