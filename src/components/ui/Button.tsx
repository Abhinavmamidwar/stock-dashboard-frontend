import React from 'react';
import styles from '../../app/ui.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'default';
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', disabled, className = '', children, ...rest }) => {
  const classes = [styles.btn, variant === 'primary' ? styles.btnPrimary : '', disabled ? styles.btnDisabled : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;

