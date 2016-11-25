'use strict';
import test from 'blue-tape';
import createProxyContext from '../src/createProxyTrie';

const createSampleState = () => ({
  thisShouldNotBeProxied1: 0xFFFFFFFF,
  thisShouldNotBeProxied2: true,
  thisShouldNotBeProxied3: 'Hello World',
  thisShouldNotBeProxied4: undefined,
  thisShouldNotBeProxied5: 'a',
  arrayOfPrimitives: [
    0xFFFFFFFF,
    true,
    'Hello World',
    undefined,
    null
  ],
  arrayOfObjects: [
    { foo: 'bar' },
    {
      nestedObject: {
        anotherLevelOfNesting: {
          eventualPrimitive: 0x7FFFFFFF
        },
        immediatePrimitive: true
      }
    }
  ],
  object: {
    hello: 'world'
  },
  data: {
    data: {
      data: {
        data: -1
      }
    }
  }
});

test('creating proxy trie', t => {
  const createProxyTrie = createProxyContext();
  const sampleInitialState = createSampleState();

  return Promise.resolve(sampleInitialState)
    .then(previousState => new Promise(next => {
      // 1st version of persistent state
      const proxyTrie = createProxyTrie(previousState, newState => {
        t.ok(newState !== previousState, 'root node is created anew');
        t.ok(newState.object !== previousState.object, 'interim node is created anew');
        t.ok(newState.object.hello === '世界', 'value is updated');
        next(newState);
      });

      // 1st update
      proxyTrie.object.hello = '世界';
    }))
    .then(previousState => new Promise(next => {
      // 2nd version of persistent state
      const proxyTrie = createProxyTrie(previousState, newState => {
        t.ok(newState.object.hello === '世界', 'previous update is persisted');
        t.ok(newState !== previousState, 'root node is created anew');
        t.ok(newState.arrayOfObjects !== previousState.arrayOfObjects, 'interim node is created anew');
        t.ok(newState.arrayOfObjects[0] !== previousState.arrayOfObjects[0], 'interim node is created anew');
        t.ok(newState.arrayOfObjects[0].foo === 'BAR', 'value is updated');
        next(newState);
      });

      // 2nd update
      proxyTrie.arrayOfObjects[0].foo = 'BAR';
    }))
    .then(previousState => new Promise(next => {
      // 3rd version of persistent state
      const proxyTrie = createProxyTrie(previousState, newState => {
        t.ok(newState.object.hello === '世界', 'previous update is persisted');
        t.ok(newState.arrayOfObjects[0].foo === 'BAR', 'previous update is persisted');
        t.ok(newState !== previousState, 'root node is created anew');
        t.ok(newState.thisShouldNotBeProxied5 === 123456789, 'value is updated');
        next(newState);
      });

      // 3rd update
      proxyTrie.thisShouldNotBeProxied5 = 123456789;
    }));
});
