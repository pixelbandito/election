import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import RoutesToLoadersContext, { SetRoutesToLoadersContext } from './RoutesToLoadersContext';

const LazyRoute = ({
  fetchData,
  routesToLoadersMap,
  setRoutesToLoadersMap,
  exact,
  path,
  sensitive,
  strict,
  ...passedProps
}) => {
  useEffect(() => {
    if (!fetchData) { return; }

    const routeKey = [JSON.stringify({
      exact,
      path,
      sensitive,
      strict,
    })];

    if (routesToLoadersMap[routeKey] && routesToLoadersMap[routeKey].fetchData === fetchData) {
      return;
    }

    setRoutesToLoadersMap({
      ...routesToLoadersMap,
      [routeKey]: {
        fetchData,
      }
    });
  }, [exact, fetchData, path, routesToLoadersMap, sensitive, setRoutesToLoadersMap, strict]);

  return <Route {...passedProps} />;
};

const LazyRouteWithContext = props => (
  <RoutesToLoadersContext.Consumer>
    {rtlContext =>
      <SetRoutesToLoadersContext.Consumer>
        {srtlContext =>
          <LazyRoute
            routesToLoadersMap={rtlContext}
            setRoutesToLoadersMap={srtlContext}
            {...props}
          />
        }
      </SetRoutesToLoadersContext.Consumer>
    }
  </RoutesToLoadersContext.Consumer>
);

export default LazyRouteWithContext;
