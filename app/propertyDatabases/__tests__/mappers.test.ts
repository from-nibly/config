import { PropertyDatabase } from '../propertyDatabase';
import { StaticPropertyLoader } from '../../propertyLoaders/staticPropertyLoader';

class Foo {
  constructor(public bar: number) {}

  static map(obj: any): Foo {
    return new Foo(parseInt(obj.bar));
  }
}

class FooNew {
  constructor(public bar: string) {}

  static map(obj: any): Foo {
    return new Foo(obj.bar);
  }
}

class ArrayFoo {
  constructor(public name: string, public bar: number) {}

  static arrayMap(name: string, obj: any): ArrayFoo {
    return new ArrayFoo(name, parseInt(obj.bar));
  }
}

class ArrayFooNew {
  constructor(public name: string, public bar: string) {}

  static arrayMap(name: string, obj: any): ArrayFoo {
    return new ArrayFoo(name, obj.bar);
  }
}

test('registered mapper can be used', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 5 } }));
  config.registerMapper('foo', Foo.map);
  await config.loadProperties();
  expect(config.get('foo').asMapped()).toEqual(new Foo(5));
});

test('no registered mapper will use passed in mapper', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 5 } }));
  await config.loadProperties();
  expect(config.get('foo').asMapped(Foo.map)).toEqual(new Foo(5));
});

test('no registered mapper, and no passed will throw', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 5 } }));
  await config.loadProperties();
  expect(() => config.get('foo').asMapped()).toThrow();
});

test('registered arrayMapper can be used', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(
    new StaticPropertyLoader({ foo: { test1: { bar: 5 }, test2: { bar: 6 } } })
  );
  config.registerArrayMapper('foo', ArrayFoo.arrayMap);
  await config.loadProperties();
  expect(config.get('foo').asMappedArray()).toEqual([
    new ArrayFoo('test1', 5),
    new ArrayFoo('test2', 6),
  ]);
});

test('no registered arrayMapper will use passed in mapper', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(
    new StaticPropertyLoader({ foo: { test1: { bar: 5 }, test2: { bar: 6 } } })
  );
  await config.loadProperties();
  expect(config.get('foo').asMappedArray(ArrayFoo.arrayMap)).toEqual([
    new ArrayFoo('test1', 5),
    new ArrayFoo('test2', 6),
  ]);
});

test('no registered arrayMapper, and no passed will throw', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(
    new StaticPropertyLoader({ foo: { test1: { bar: 5 }, test2: { bar: 6 } } })
  );
  await config.loadProperties();
  expect(() => config.get('foo').asMappedArray()).toThrow();
});

test('registered mapper can be overridden', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(new StaticPropertyLoader({ foo: { bar: 5 } }));
  config.registerMapper('foo', Foo.map);
  await config.loadProperties();
  expect(config.get('foo').asMapped(FooNew.map)).toEqual(new FooNew('5'));
});

test('registered arrayMapper can be overridden', async () => {
  let config: PropertyDatabase = new PropertyDatabase([]);
  config.withPropertyLoader(
    new StaticPropertyLoader({ foo: { test1: { bar: 5 }, test2: { bar: 6 } } })
  );
  config.registerArrayMapper('foo', ArrayFoo.arrayMap);
  await config.loadProperties();
  expect(config.get('foo').asMappedArray(ArrayFooNew.arrayMap)).toEqual([
    new ArrayFooNew('test1', '5'),
    new ArrayFooNew('test2', '6'),
  ]);
});
