'use strict';
import test from 'tape';
import { createProxy } from '../src/createProxy';

createProxy.trackChanges = true;
const getTestObj = () => ({
  name: 'May',
  gender: 'alien',
  affiliation: [
    {
      type: 'friend',
      name: 'Alex',
      gender: 'alien',
      age: 299,
      affiliation: [
        {
          type: 'family',
          name: 'R2D2',
          age: -1
        }
      ]
    },
    {
      type: 'friend',
      name: 'Renee',
      gender: 'alien',
      age: 2944,
      affiliation: [
        {
          type: 'belonging',
          name: 'tea',
          tastes: 'good'
        }
      ]
    }
  ],
  nested: {
    foo: {
      bar: 1
    },
    foo2: {
      bar2: 2
    }
  },
  asdf: {
    fff: 'asdf',
    bsdin: 'sdfasf',
    ini: [
      {
        t: 1,
        c: 3,
        vv: {
          asdf: 44444
        }
      },
      {
        t: 1,
        c: 3,
        vv: {
          asdf: 44444
        }
      },
      {
        t: 1,
        c: 3,
        vv: {
          asdf: 44444
        }
      }
    ]
  }
})

test('create proxy', function(t) {
  const testObj = getTestObj();
  const proxy = createProxy(testObj, function(tree) {
    // immutability test
    t.ok(tree.nested.foo.bar === 'ffff');
    t.ok(testObj !== tree);
    t.ok(testObj.asdf === tree.asdf);
    t.ok(testObj.nested !== tree.nested);
    t.ok(testObj.nested.foo !== tree.nested.foo);
    t.ok(testObj.nested.foo.bar !== tree.nested.foo.bar);
    t.ok(testObj.name === tree.name);
    t.ok(testObj.nested.foo2 === tree.nested.foo2);
    t.ok(testObj.nested.foo2.bar2 === tree.nested.foo2.bar2);
    t.end();
  });

  // change value
  proxy.nested.foo.bar = 'ffff';
});

test('create proxy', function(t) {
  const testObj = getTestObj();
  const proxy = createProxy(testObj, function(tree) {
    // immutability test
    t.ok(tree.affiliation[0].type === 'sibling');
    t.ok(testObj !== tree);
    t.ok(testObj.affiliation !== tree.affiliation);
    t.ok(testObj.affiliation[0] !== tree.affiliation[0]);
    t.ok(testObj.affiliation[1] === tree.affiliation[1]);
    t.ok(testObj.nested === tree.nested);
    t.end();
  });

  // change value
  proxy.affiliation[0].type = 'sibling';
});
