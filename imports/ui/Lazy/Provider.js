import React, { useState } from 'react';

import RoutesToLoadersContext, { SetRoutesToLoadersContext } from './RoutesToLoadersContext';

const Provider = props => {
  const [routesToLoadersMap, setRoutesToLoadersMap] = useState({});

  return (
    <RoutesToLoadersContext.Provider value={routesToLoadersMap}>
      <SetRoutesToLoadersContext.Provider value={setRoutesToLoadersMap}>
        {props.children}
      </SetRoutesToLoadersContext.Provider>
    </RoutesToLoadersContext.Provider>
  );
};

export default Provider;
