# react-async-iterator

Iterate over an async iterable while component is mounted.

## Install

```
npm i react-async-iterator react --save
```

## Usage

### with Async Generators

Async Generators were introduced in [this tc39 proposal](https://github.com/tc39/proposal-async-iteration). It will be part of ES2018 and can be found on the list of [finished proposals](https://github.com/tc39/proposals/blob/master/finished-proposals.md). You can use it today with [babel-plugin-transform-async-generator](https://babeljs.io/docs/plugins/transform-async-generator-functions/).

```js
import React from 'react';
import { render } from 'react-dom';
import { createComponent } from 'react-async-iterator';

const LoadSearch = createComponent(async function* loadSearch(initialProps) {
  const response = await fetch(`/api/search?q=${initialProps.q}`);
  const results = await response.json();
  // The yield keyword is used to pause and resume a generator function.
  // If the component is unmounted then we will not resume and
  // setResults will not be called.
  initialProps.setResults(yield results);
});

class App extends Component {
  componentWillMount() {
    this.setState({
      q: '',
      results: [],
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

        {results.map(item => <div key={item.id}>{item.title}</div>)}

        <LoadSearch
          q={this.state.q}
          setResults={results => this.setState({ results })}
          key={this.state.q}
        />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
```

### without Async Generators

You don't need async generators to create an async iterator. Learn more about async iterators and generators in [this article by Jake Archibald](https://jakearchibald.com/2017/async-iterators-and-generators/).

```js
import React from 'react';
import { render } from 'react-dom';
import { createComponent } from 'react-async-iterator';

// loadSearch returns an async iterable
const LoadSearch = createComponent(function loadSearch(initialProps) {
  let i = 0;

  return {
    async next(value) {
      switch (i++) {
        case 0: {
          const response = await fetch(`/api/search?q=${initialProps.q}`);
          const results = await response.json();
          return { value: results, done: false };
        }

        case 1: {
          initialProps.setResults(value);
          return { value: undefined, done: true };
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

class App extends Component {
  componentWillMount() {
    this.setState({
      q: '',
      results: [],
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

        {results.map(item => <div key={item.id}>{item.title}</div>)}

        <LoadSearch
          q={this.state.q}
          setResults={results => this.setState({ results })}
          key={this.state.q}
        />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
```
