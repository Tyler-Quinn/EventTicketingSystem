import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      width: '100%',
      maxWidth: '516px',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    adornment: {
      width: 'auto',
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        fontSize: theme.typography.subtitle1.fontSize,
      },
    },
}))

const useInputStyles = makeStyles(theme => ({
    '@global': {
      '@keyframes loadingEffect': {
        '0%': {
          opacity: 0.9,
        },
        '50%': {
          opacity: 0.3,
        },
        '100%': {
          opacity: 0.9,
        },
      },
    },
    root: ({ defaultShadow, hideShadow }) => ({
      padding: '0.8rem 0',
      marginLeft: '.7rem',
      transition: 'all 0.15s ease-out',
      borderRadius: '1.5rem',
      boxShadow: defaultShadow ? theme.boxShadow.input.normal : 'none',
      '&:hover': {
        boxShadow: () => {
          if (hideShadow) {
            return 'none'
          } else if (defaultShadow) {
            return theme.boxShadow.input.bold
          } else {
            return theme.boxShadow.input.normal
          }
        },
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: '.5rem .6rem',
        fontSize: theme.typography.subtitle2.fontSize,
      },
    }),
    input: ({ centerAlign, leftAlign, loadingValue, smallFontSize }) => ({
      textAlign: leftAlign ? 'left' : centerAlign ? 'center' : 'right',
      fontSize: smallFontSize ? '1.6rem' : theme.typography.h4.fontSize,
      fontWeight: theme.typography.h4.fontWeight,
      color: theme.palette.text.primary,
      textOverflow: 'clip',
      padding: `6px ${theme.padding.extraLight} 7px ${theme.padding.extraLight}`,
      animation: loadingValue
        ? `loadingEffect 1s ${theme.transitions.easing.sharp} infinite`
        : 'none',
      [theme.breakpoints.down('xs')]: {
        fontSize: smallFontSize ? '1.6rem' : theme.typography.subtitle2.fontSize,
        padding: '.5rem',
      },
    }),
    focused: {
      borderRadius: '1.5rem',
      boxShadow: theme.boxShadow.input.normal,
    },
}))

