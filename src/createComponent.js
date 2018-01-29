import React from 'react';

export default function createComponent(fn) {
  class AsyncIterator extends React.Component {
    static displayName = `AsyncIterator(${fn.name || 'fn'})`;

    static defaultProps = {
      onYield() {},
    };

    componentWillMount() {
      this.setState({
        error: undefined,
      });
    }

    componentDidMount() {
      let mounted = true;

      this.componentWillUnmount = () => {
        mounted = false;
      };

      const initialProps = this.props;
      const iterable = fn(initialProps);
      const isAsyncIterator = !!iterable[Symbol.asyncIterator];
      const iterator = isAsyncIterator
        ? iterable[Symbol.asyncIterator]()
        : iterable[Symbol.iterator]();

      // can replace with for-await-of syntax eventually
      (function iterate() {
        let promise = Promise.resolve(iterator.next());

        if (!isAsyncIterator) {
          promise = promise
            .then(result => Promise.all([result.value, result]))
            .then(([value, { done }]) => ({ value, done }));
        }

        return promise.then(result => {
          if (!mounted || result.done) return;
          initialProps.onYield(result.value);
          return iterate();
        });
      })().catch(error => {
        if (!mounted) return;
        this.setState({ error });
      });
    }

    shouldComponentUpdate(nextProps, nextState) {
      return nextState.error !== this.state.error;
    }

    render() {
      if (this.state.error) throw this.state.error;
      return null;
    }
  }

  return AsyncIterator;
}
