import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Template } from 'meteor/templating'
import { Blaze } from 'meteor/blaze'

export default () => {
  const ref = useRef(null)
  const blazeViewRef = useRef(null)

  useEffect(() => {
    if (!ref.current) { return }

    // Use Meteor Blaze to render login buttons
    blazeViewRef.current = Blaze.render(
      Template.loginButtons,
      ReactDOM.findDOMNode(ref.current)
    )

    // Clean up Blaze view
    return () => blazeViewRef.current ? Blaze.remove(blazeViewRef.current) : null
  }, [])

  // Render a placeholder container that will be filled in
  return (
    <>
      <style>
        {`
          #login-buttons {
            display: block;
            margin-right: 0;
          }

          #login-name-link {
            display: block;
          }
        `}
      </style>
      <span ref={ref} />
    </>
  )
}
