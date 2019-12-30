---
to: imports/ui/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.js
---

// Third-party imports
// React
import React from 'react'
// Everything else
import classNames from 'classnames'

// Local imports
// ../
import styles from './<%=h.changeCase.pascal(name)%>.module.css'

const <%=h.changeCase.pascal(name)%> = ({
  className,
  ...passedProps
}) => (
  <div
    {...passedProps}
    className={classNames(className, styles.<%=h.changeCase.pascal(name)%>)}
  />
)

export default <%=h.changeCase.pascal(name)%>
