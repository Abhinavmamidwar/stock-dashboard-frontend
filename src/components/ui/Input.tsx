import React from 'react';
import styles from '../../app/ui.module.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {};

const Input: React.FC<InputProps> = ({ className = '', ...rest }) => {
  const classes = [styles.input, className].filter(Boolean).join(' ');
  return <input className={classes} {...rest} />;
};

export default Input;

