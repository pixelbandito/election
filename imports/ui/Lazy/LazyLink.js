import React, { useCallback, useContext, useState } from 'react';
import { Link, MemoryRouter, Route } from 'react-router-dom';

import RoutesToLoadersContext from './RoutesToLoadersContext';

const LazyLink = ({
  loadOn: initLoadon,
  onClick,
  onFocus,
  onMouseOver,
  setRoutesToLoadersMap,
  ...passedProps
}) => {
  const loadOn = initLoadon || ['hover'];
  const [loaded, setLoaded] = useState(false);
  const [fetchers, setFetchers] = useState([]);
  const routesToLoadersMap = useContext(RoutesToLoadersContext);

  const addFetcher = useCallback((fetchData) => setFetchers([
    ...fetchers,
    fetchData,
  ]), [fetchers]);

  const loadOnEvent = useCallback(({ event, targetEventName, callback, fetchData }) => {
    if (loadOn.indexOf(targetEventName) < 0) {
      return;
    }

    if (!loaded) {
      if (fetchData) {
        fetchData();
      }

      fetchers.forEach(fetcher => fetcher());
      setLoaded(true);
    }

    if (callback) {
      callback(event);
    }
  }, [fetchers, loadOn, loaded]);

  const handleMouseOver = useCallback((event) => {
    loadOnEvent({ event, targetEventName: 'hover', callback: onMouseOver });
  }, [loadOnEvent, onMouseOver]);

  const handleFocus = useCallback((event) => {
    loadOnEvent({ event, targetEventName: 'focus', callback: onFocus });
  }, [loadOnEvent, onFocus]);

  const handleRender = useCallback((fetchData) => {
    loadOnEvent({ targetEventName: 'render', fetchData });
  }, [loadOnEvent]);

  const handleClick = useCallback((event) => {
    loadOnEvent({ event, targetEventName: 'click', callback: onClick });
  }, [loadOnEvent, onClick]);

  if (!routesToLoadersMap) {
    return;
  }

  return (
    <React.Fragment>
      <Link
        {...passedProps}
        onFocus={handleFocus}
        onMouseOver={handleMouseOver}
        onClick={handleClick}
      />
      <MemoryRouter
        initialEntries={[passedProps.to]}
      >
        {routesToLoadersMap && Object.entries(routesToLoadersMap).map(([key, loader]) => {
          const routeProps = JSON.parse(key);
          return (
            <Route
              {...routeProps}
              key={key}
            >
              <LazyLinkFetcher
                addFetcher={addFetcher}
                fetchData={loader.fetchData}
                fetchers={fetchers}
                handleRender={handleRender}
                routeProps={routeProps}
              />
            </Route>
          );
        })}
      </MemoryRouter>
    </React.Fragment>
    );
};

const LazyLinkFetcher = ({ addFetcher, fetchData, fetchers, handleRender, routeProps }) => {
  if (fetchers.indexOf(fetchData) < 0) {
    addFetcher(fetchData);
  }

  handleRender(fetchData);

  return null;
}

const LazyLinkWithContext = props => <LazyLink {...props} />;

export default LazyLinkWithContext;
