import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

export default () => {
  const ref = useRef(null);
  const { current } = ref;
  const [view, setView] = useState(null);

  useEffect(() => {
    if (!current) { return; }

    // Use Meteor Blaze to render login buttons
    // console.log('ref.current', current);
    setView(Blaze.render(
      Template.loginButtons,
      ReactDOM.findDOMNode(current),
    ));

    // console.log('clean up', view);
    // Clean up Blaze view
    return () => Blaze.remove(view);
  }, [current]);

  // Just render a placeholder container that will be filled in
  return <span ref={ref} />;
}
