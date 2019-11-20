import React from 'react';

const LazyComponent = props => {
  return <div {...props}>BOOM!</div>;
};

// const setTimeoutPromise = time => new Promise((resolve, reject) => setTimeout(() => resolve(time), time));

LazyComponent.fetchData = async () => {
  const request = new Request('https://xkcd.com/info.0.json', { method: 'GET' });
  await fetch(request);
}

export default LazyComponent;
