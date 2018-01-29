# react-async-iterator

Iterate over an async iterable while component is mounted.

The `AsyncIterator` component closely follows the semantics of [the async iteration statement (for-await-of)](https://github.com/tc39/proposal-async-iteration#the-async-iteration-statement-for-await-of). Each yielded value will be passed to the `initialProps.onYield` callback. If the component unmounts then it will not resume iteration after yielding.

## Install

```
npm i react-async-iterator react --save
```

## Example

### `./SearchArtists.js`

#### with async generators

Async Generators are introduced in [this tc39 proposal](https://github.com/tc39/proposal-async-iteration). It will be part of ES2018 and can be found on the list of [finished proposals](https://github.com/tc39/proposals/blob/master/finished-proposals.md). You can use it today with [babel-plugin-transform-async-generator](https://babeljs.io/docs/plugins/transform-async-generator-functions/).

```js
import React from 'react';
import { render } from 'react-dom';
import { createComponent } from 'react-async-iterator';

export default createComponent(async function* searchArtists(initialProps) {
  const response = await fetch(`/v1/search?q=${initialProps.q}&type=artist`);
  const results = await response.json();
  yield { artists: results.artists.items };
});
```

#### with generators

```js
import React from 'react';
import { render } from 'react-dom';
import { createComponent } from 'react-async-iterator';

// sync iterators can yield promises
export default createComponent(function* searchArtists(initialProps) {
  yield fetch(`/v1/search?q=${initialProps.q}&type=artist`)
    .then(response => response.json())
    .then(results => ({ artists: results.artists.items }));
});
```

#### with custom async iterables

You don't need async generators to create an async iterator. Learn more about async iterators and generators in [this article by Jake Archibald](https://jakearchibald.com/2017/async-iterators-and-generators/).

```js
import React from 'react';
import { render } from 'react-dom';
import { createComponent } from 'react-async-iterator';

export default createComponent(function searchArtists(initialProps) {
  let i = 0;

  return {
    // async iteratables return promises that resolve to { value, done }
    async next() {
      switch (i++) {
        case 0: {
          const response = await fetch(
            `/v1/search?q=${initialProps.q}&type=artist`,
          );
          const results = await response.json();
          const value = { artists: results.artists.items };

          return { value, done: false };
        }

        default: {
          return { value: undefined, done: true };
        }
      }
    },

    [Symbol.asyncIterator]() {
      return this;
    },
  };
});
```

#### with custom iterables

```js
import React from 'react';
import { render } from 'react-dom';
import { createComponent } from 'react-async-iterator';

export default createComponent(function searchArtists(initialProps) {
  let i = 0;

  return {
    next() {
      switch (i++) {
        case 0: {
          // sync iterators can yield promises
          const value = fetch(`/v1/search?q=${initialProps.q}&type=artist`)
            .then(response => response.json())
            .then(results => ({ artists: results.artists.items }));

          return { value, done: false };
        }

        default: {
          return { value: undefined, done: true };
        }
      }
    },

    [Symbol.iterator]() {
      return this;
    },
  };
});
```

### `./App.js`

```js
import React from 'react';
import { render } from 'react-dom';
import SearchArtists from './SearchArtists';

class App extends Component {
  componentWillMount() {
    this.setState({
      q: '',
      artists: [],
    });
  }

  onChange = e => {
    this.setState({
      q: e.target.value,
    });
  };

  render() {
    return (
      <div>
        <input type="text" value={this.state.q} onChange={this.onChange} />

        {this.state.artists.map(item => <div key={item.id}>{item.name}</div>)}

        <SearchArtists
          q={this.state.q}
          onYield={state => this.setState(state)}
          key={this.state.q}
        />
      </div>
    );
  }
}
```
