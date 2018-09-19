import 'jest';
import { PropertySource } from '../propertySource';
import { PropertyMeta } from '../../property';

test('should normalize keys that arent normal', () => {
  let ps = new PropertySource('test');
  expect(ps.normalizeKey('FOO_BAR')).toEqual('foo.bar');
});

test('setting number results in a string being set', () => {
  let ps = new PropertySource('test');

  ps.setProperty('foo', 4, {});

  let propertyMeta = ps.getProperty('foo');

  expect(propertyMeta).toEqual(new PropertyMeta('foo', '4', 'test', {}));
});

test('setting string results in a string being set', () => {
  let ps = new PropertySource('test');

  ps.setProperty('foo', 'bar', {});

  let propertyMeta = ps.getProperty('foo');

  expect(propertyMeta).toEqual(new PropertyMeta('foo', 'bar', 'test', {}));
});

test('setting the same property twice results in the value of the second', () => {
  let ps = new PropertySource('test');

  ps.setProperty('foo', 'bar', {});
  ps.setProperty('foo', 'bang', {});

  let propertyMeta = ps.getProperty('foo');

  expect(propertyMeta).toEqual(
    expect.objectContaining(new PropertyMeta('foo', 'bang', 'test', {}))
  );
});

test('setting the same property twice retains overwritten property', () => {
  let ps = new PropertySource('test');

  ps.setProperty('foo', 'bar', {});
  ps.setProperty('foo', 'bang', {});

  let propertyMeta = ps.getProperty('foo');

  if (!propertyMeta) {
    throw new Error('Property foo was not set');
  }

  expect(propertyMeta.overwrites).toEqual(
    expect.objectContaining(new PropertyMeta('foo', 'bar', 'test', {}))
  );
});

test('setting object with single key results in a single property being set', () => {
  let ps = new PropertySource('test');

  ps.setProperty('', { foo: 4 }, {});

  let propertyMeta = ps.getProperty('foo');

  expect(propertyMeta).toEqual(new PropertyMeta('foo', '4', 'test', {}));
});

test('setting namespaced object with single key results in a single property being set', () => {
  let ps = new PropertySource('test');

  ps.setProperty('foo', { bar: 4 }, {});

  let keys = ps.getKeys();
  let propertyMeta = ps.getProperty('foo.bar');

  expect(propertyMeta).toEqual(new PropertyMeta('foo.bar', '4', 'test', {}));
  expect(keys).toEqual(['foo.bar']);
});

test('setting namespaced object with many keys results in many properties being set', () => {
  let ps = new PropertySource('test');

  ps.setProperty('foo', { bar: 4, bang: 'bazz' }, {});
  let keys = ps.getKeys();
  keys.sort();

  let propertyMeta = ps.getProperty('foo.bar');
  let propertyMeta2 = ps.getProperty('foo.bang');
  expect(propertyMeta).toEqual(new PropertyMeta('foo.bar', '4', 'test', {}));
  expect(propertyMeta2).toEqual(new PropertyMeta('foo.bang', 'bazz', 'test', {}));
  expect(keys).toEqual(['foo.bang', 'foo.bar']);
});

test('setting namespaced object with nested keys results in many properties being set', () => {
  let ps = new PropertySource('test');

  ps.setProperty('foo', { bar: 4, bang: { test: 'bazz' } }, {});
  let keys = ps.getKeys();
  keys.sort();

  let propertyMeta = ps.getProperty('foo.bar');
  let propertyMeta2 = ps.getProperty('foo.bang.test');
  expect(propertyMeta).toEqual(new PropertyMeta('foo.bar', '4', 'test', {}));
  expect(propertyMeta2).toEqual(new PropertyMeta('foo.bang.test', 'bazz', 'test', {}));
  expect(keys).toEqual(['foo.bang.test', 'foo.bar']);
});

test('setting namespaced object with nested mixed case keys results in many lowercased properties being set', () => {
  let ps = new PropertySource('test');

  ps.setProperty('Foo', { bAr: 4, baNG: { testIng: 'bazz' } }, {});
  let keys = ps.getKeys();
  keys.sort();

  let propertyMeta = ps.getProperty('foo.bar');
  let propertyMeta2 = ps.getProperty('foo.bang.testing');
  expect(propertyMeta).toEqual(new PropertyMeta('foo.bar', '4', 'test', {}));
  expect(propertyMeta2).toEqual(new PropertyMeta('foo.bang.testing', 'bazz', 'test', {}));
  expect(keys).toEqual(['foo.bang.testing', 'foo.bar']);
});
