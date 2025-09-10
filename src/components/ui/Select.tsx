import React from 'react';
import styles from '../../app/ui.module.css';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {};

const Select: React.FC<SelectProps> = ({ className = '', children, ...rest }) => {
  const classes = [styles.select, className].filter(Boolean).join(' ');
  return <select className={classes} {...rest}>{children}</select>;
};

export default Select;

