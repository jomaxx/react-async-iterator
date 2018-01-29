import React from 'react';

export default function createComponent(fn) {
  class AsyncIterator extends React.Component {
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

      const iterable = fn(this.props);
      const iterator = iterable[Symbol.asyncIterator]();

      const promise = (function iterate(value) {
        return iterator.next(value).then(function(result) {
          if (!mounted || result.done) return undefined;
          return iterate(result.value);
        });
      })();

      promise.catch(error => mounted && this.setState({ error }));
    }

    shouldComponentUpdate(nextProps, nextState) {
      return nextState.error !== this.state.error;
    }

    render() {
      if (this.state.error) throw this.state.error;
      return null;
    }
  }

  AsyncIterator.displayName = `AsyncIterator(${fn.name || 'fn'})`;

  return AsyncIterator;
}
