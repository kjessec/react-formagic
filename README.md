# react-formagic

A react form binding that adapts to your code, not the other way around.

## Example
Please visit [example](https://github.com/kjessec/react-formagic/tree/example) branch of this repo. More examples are coming...

## Usage/API

At the end of the day, `react-formagic` is just a HoC wrapper that translates props given to it into a set of enhanced props that'll make it easy to work with forms.

### `formagic(selectPropsToListen, subscribeToChanges, [options])`

#### `function selectPropsToListen(props) => Object`
A selector function that converts selected props into a set of `enhanced` props, upon whose change `subscribeToChanges` will automatically be called with the entire updated data tree.

Please note that the return value _MUST_ be an object, as `react-formagic` needs to be able to walk through the tree.


#### `function subscribeToChanges(newState, [dispatcher]) => null`
A subscriber function that will be called each time a leaf value is updated. `newState` is the entire data tree, rather than only the changed value.

`newState` signature is the same as what `selectPropsToListen` will select.

If dispatcher is available from the props given (e.g. given through `react-redux`'s `mapDispatchToProps`), it'll be available as the second argument. You can use this trait to hook your form changes to your redux store.

#### `object options (default: true)`
- `boolean transclude`: Determines whether to override originally given props with the reactive data tree.

  If set to `false`, `react-formagic` will namespace the reactive data tree under `formagic`.


### Binding your form elements to formagic

You have 2 choices. They are exactly the same, so choose what you prefer. Obviously you have more control going with the first option. :P

Have a look at [this](https://github.com/kjessec/react-formagic/blob/example/src/Survey/Survey.js) for a working React component example.

1. Manually binding
  ````javascript
    render() {
      const { myData } = this.props;
      return (
        // yes, just replace your data.
        <input type="text" onChange={(ev) => your.data = String(ev.target.value)}/>
      );
    }
  ````

2. Using  `bind` helper

  The third argument is optional.

  This is doing exactly the same thing as the first option,
apart from [this](https://github.com/kjessec/react-formagic/blob/master/src/index.js#L69).
  ````javascript
    import { bind } from 'react-formagic';
    render() {
      const { myData } = this.props;
      return (
        // the third argument is optional.
        // this is doing exactly the same thing as the first option,
        // apart from [this](https://github.com/kjessec/react-formagic/blob/master/src/index.js#L69)
        <input type="text" {...bind(data, 'key', String)}/>
      );
    }

  ````

## More of 'how it works' stuff
### A bit of history
I don't know if it's just me, but handling form data with one-way data flow has been a massive headache for me. Mainly because `onChange` listeners on form elements will only ever give you the changed leaf data, and you'd have to have a matching reducer or a store updater that knows how to translate that partial change to the data source.

If you by any bad chance have a deeply nested data structure, you have to be __VERY__ clever about your actions/store updaters, or just... write as many action/store updaters as all partial change can ever occur.

I tried to use other React form libraries, but it felt as if I am adding a lot of code just to make forms work, to a level I feel enforced to write codes in a certain way, just for a goddamn form!

Then I tried the great [vue](https://github.com/vuejs/vue) (if you haven't you should really try it). You know, two-way libraries are just so much of a relief when it comes to dealing with forms. But At that time I was already managing quite a collection of redux actions/reducers I was reluctant to change, so I decided to give it a try and glue vue and Redux together.

I discovered this one trait: `vue` would have updated the data source before `onChange` events will have fired - you could have the updated data source without doing anything, and you could simply pass that data source to any `onChange` function. Easy!

I've come back to React world since then (team problem), but thought hey why not give it a try. Hence `react-formagic`.

You can read [this document](https://vuejs.org/guide/reactivity.html#How-Changes-Are-Tracked) about `vue`'s reactivity mechanism.

### Reactivity to rescue

`react-formagic` will walk through the data tree and replace each all leaf values with reactive getter/setter using `Object.defineProperty`. The setter will first update the original value, then subsequently call `subscribeToChanges` with the updated data tree.

...What does it mean? It means you already have the fully updated data tree even before your data hits your store through reducer or whatever flux store updater. Since we have the entire data tree, all we have to do is to replace the source data as a whole, like [this](https://github.com/kjessec/react-formagic/blob/example/src/Survey/ducks/index.js#L22).

So yes, it's kind of two-way. But it is only kind of two-way because how the updated data should be applied to your store is left to you. The data flow terminates at `subscribeToChanges`, so you can explicitly further modify it before handing it to an action.

This walk process is `O(n)`, and runs **every single time** the selected props are updated (through `componentWillReceiveProps` lifecycle method).

Therefore it is really important that you provide a sensible `selectPropsToListen` selector. With a `all => all` (also known as identity function) selector, `react-formagic` will try to walk EVERY SINGLE leaf value, which is less than desirable. Also depending on the size of the data, it may have a performance hit, despite the linear time complexity.


## Disclaimer

This project is still in its PoC stage. If you'd like to see how it works, please visit [the example page](https://github.com/kjessec/react-formagic/tree/example).

## TODO
- Tests
- Optimisation (could the recursive walk be bypassed using some heuristics?)
- npm publish

## LICENSE
MIT
