'use strict';
import { defineReactive } from '../reactive';

const sampleObj = {
  value1: true,
  value2: false,
  value3: 12345,
  value4: 555,
  value5: {
    value51: true,
    value52: false
  }
};

console.time(1);
const defined = defineReactive(sampleObj);
console.timeEnd(1);

console.log(defined);
console.log(defined.value1);

defined.value1 = false;

console.log(defined.value1);
console.log(defined.value5);
