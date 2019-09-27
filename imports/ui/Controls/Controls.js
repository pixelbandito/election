// Third-party imports
// React
import React, { useMemo } from 'react';
// Everything else
import classNames from 'classnames';
import uuidV4 from 'uuid/v4';

// Local imports
// ../
import Input from '../Input';
import WithThemeCssModule from '../WithThemeCssModule';
// ./
import styles from './Controls.module.css';

const Checkbox = ({
  childrenProps = {},
  className,
  fill,
  id: customId,
  inputProps = {},
  label,
  labelProps = {},
  ...passedProps
}) => {
  const id = useMemo(() => (customId || uuidV4()), [customId]);

  return (
    <div
      {...passedProps}
      className={classNames(styles.Control, styles.Checkbox, className, {
        [styles.fill]: fill,
      })}
    >
      <label
        htmlFor={`${id || ''}-input`}
        {...childrenProps}
        {...labelProps}
        className={classNames(styles.label, childrenProps.className, labelProps.className)}
      >
        <Input
          id={`${id || ''}-input`}
          type="checkbox"
          {...childrenProps}
          {...inputProps}
          className={classNames(styles.input, childrenProps.className, inputProps.className)}
        />
        {label}
      </label>
    </div>
  );
};

const Text = ({
  childrenProps = {},
  className,
  fill,
  id: customId,
  inputProps = {},
  label,
  labelProps = {},
  ...passedProps
}) => {
  const id = useMemo(() => (customId || uuidV4()), [customId]);

  return (
    <div
      {...passedProps}
      className={classNames(styles.Control, styles.Text, className, {
        [styles.fill]: fill,
      })}
    >
      <label
        htmlFor={`${id || ''}-input`}
        {...childrenProps}
        {...labelProps}
        className={classNames(styles.label, childrenProps.className, labelProps.className)}
      >
        {label}
      </label>
      <Input
        id={`${id || ''}-input`}
        type="text"
        {...childrenProps}
        {...inputProps}
        className={classNames(styles.input, childrenProps.className, inputProps.className)}
      />
    </div>
  );
}

const Controls = {
  Checkbox: WithThemeCssModule(Checkbox, styles),
  Text: WithThemeCssModule(Text, styles),
};

export default Controls;
