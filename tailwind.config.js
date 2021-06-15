const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  darkMode: 'class',
  purge: {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
  },
  theme: {
    typography: (theme) => ({}),
    extend: {
      typography: (theme) => ({
        dark: {
          css: {
            color: 'white',
          },
        },
      }),
      gridTemplateColumns: {
        'mobile-row': '1fr minmax(160px, 1fr) 1fr',
      },
      colors: {
        'brand-gray-white': '#E5E4E5',
        'brand-gray-white-2': '#868686',
        'brand-blue': '#0857e0',
        'brand-gray': '#f6f6f6',
        'brand-gray-2': '#708090',
        'brand-gray-3': '#dc2e9',
        'brand-gray-4': '#435366',
        'very-dark-blue': 'hsl(235, 42%, 17%)',
        'very-dark-blue-2': 'hsl(235, 42%, 10%)',
        'very-dark-blue-3': 'hsl(235, 42%, 5%)',
        'brand-green': '#329300',
        'brand-neon-green': '#5de200',
        'brand-red': '#8f0033',
        'brand-alto': '#d8d8d8',
        'brand-new-blue': '#074ef0',
        'brand-new-dark': '#1a1d3f',
        'brand-border-gray': '#dce2e9',
        'brand-border-gray-2': '#CECECE',
        'brand-purple': '#08245A',
        'brand-light-blue': defaultTheme.colors.indigo['100'],
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        'gilroy-bold': ['Gilroy-Bold', ...defaultTheme.fontFamily.sans],
        'sf-compact-medium': [
          'SF Compact Display Medium',
          ...defaultTheme.fontFamily.sans,
        ],
        'sf-pro-text': ['SFProText', ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        7.5: '1.875rem',
        18: '4.5rem',
        30: '7.5rem',
        43: '10.75rem',
        68: '14.5rem',
        140: '30rem',
        156.5: '39.125rem',
      },
      letterSpacing: {
        tightest: '-0.015625rem', // -0.25px
        'tightest-2': '-0.018125rem', // -0.29px;
      },
      backgroundImage: (theme) => ({
        'top-mobile': "url('/topbg-mobile.svg')",
        'top-desktop': "url('/topbg.svg')",
      }),
      borderRadius: {
        xlg: '0.625rem',
      },
      boxShadow: {
        home: '0 1px 5px 0 rgba(0, 0, 0, 0.05)',
        embed: '0px 0px 8px rgba(0, 0, 0, 0.25)',
      },
      minHeight: {
        6: '1.5rem',
      },
      maxHeight: {
        home: '82rem',
      },
      minWidth: {
        100: '25rem',
        150: '37.5rem',
      },
      maxWidth: {
        88: '22rem',
        100: '25rem',
        150: '37.5rem',
        304: '76rem',
      },
      fontSize: {
        '6+xl': '4.2rem',
      },
      textOpacity: {
        60: '0.6',
      },
    },
  },
  variants: {
    typography: ['dark'],
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
