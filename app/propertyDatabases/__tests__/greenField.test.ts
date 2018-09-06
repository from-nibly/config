import { DefaultPropertyDatabase } from '../defaultPropertyDatabase';
import { PropertyDatabase } from '../propertyDatabase';
import { EnvironmentPropertyLoader } from '../../propertyLoaders/environmentPropertyLoader';
import { StaticPropertyLoader } from '../../propertyLoaders/staticPropertyLoader';

test('single property can be retrieved', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: 'bar' }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('bar');
});

test('single number property can be retrieved', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: 5 }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('5');
  expect(config.get('foo').asNumber()).toBe(5);
});

test('multiple properties dont collide', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: 5, bar: 'bang' }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('5');
  expect(config.get('foo').asNumber()).toBe(5);
  expect(config.get('bar').asString()).toBe('bang');
});

test('multiple property sources dont collide', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: 5 }))
    .whichOverrides(new StaticPropertyLoader({ bar: 'bang' }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('5');
  expect(config.get('foo').asNumber()).toBe(5);
  expect(config.get('bar').asString()).toBe('bang');
});

test('overriding property source overrides property', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: 5, bar: 'test' }))
    .whichOverrides(new StaticPropertyLoader({ bar: 'bang' }));
  await config.loadProperties();
  expect(config.get('foo').asString()).toBe('5');
  expect(config.get('foo').asNumber()).toBe(5);
  expect(config.get('bar').asString()).toBe('test');
});

test('nested property can be retrieved', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 'test' } }));
  await config.loadProperties();
  expect(config.get('foo.bar').asString()).toBe('test');
});

test('nested property can be overridden', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 'test' } }))
    .whichOverrides(new StaticPropertyLoader({ foo: { bar: 'bang' } }));
  await config.loadProperties();
  expect(config.get('foo.bar').asString()).toBe('test');
});

test('env vars can override other vars', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config
    .withPropertyLoader(new EnvironmentPropertyLoader({ FOO_BAR: 'thing' }))
    .whichOverrides(new StaticPropertyLoader({ foo: { bar: 'test' } }));
  await config.loadProperties();
  expect(config.get('foo.bar').asString()).toBe('thing');
});

test('env vars wont override others if it is lower precedence', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 'test' } }))
    .whichOverrides(new EnvironmentPropertyLoader({ FOO_BAR: 'thing' }));
  await config.loadProperties();
  expect(config.get('foo.bar').asString()).toBe('test');
});

test('getting object works', async () => {
  let config: PropertyDatabase = new DefaultPropertyDatabase([]);
  config
    .withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 'test' } }))
    .whichOverrides(new EnvironmentPropertyLoader({ FOO_BAR: 'thing' }));
  await config.loadProperties();
  expect(config.get('foo').asObject()).toEqual({ bar: 'test' });
});
