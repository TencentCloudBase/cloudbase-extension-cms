module.exports = {
  important: true,
  theme: {
    textColor: (theme) => theme('colors'),
    colors: {
      primary: '#0052d9',
    },
    maxWidth: {
      80: '80%',
    },
  },
  purge: ['./src/**/*.tsx'],
  variants: {
    extend: {},
  },
  plugins: [],
}
