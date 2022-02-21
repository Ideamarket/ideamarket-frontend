const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  darkMode: 'class',
  purge: {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
  },
  theme: {
    screens: {
      xs: '320px',
      // => @media (min-width: 320px) { ... }

      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
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
        ...defaultTheme.colors,
        'brand-gray-white': '#E5E4E5',
        'brand-gray-white-2': '#868686',
        'brand-blue': '#0857e0',
        'brand-navy': '#102360',
        'theme-blue-1': '#01133C',
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
        'brand-pink': '#DE5E5E',
        'brand-alto': '#d8d8d8',
        'brand-new-blue': '#074ef0',
        'brand-new-dark': '#1a1d3f',
        'brand-border-gray': '#dce2e9',
        'brand-border-gray-2': '#CECECE',
        'brand-purple': '#08245A',
        'brand-light-blue': defaultTheme.colors.indigo['100'],
        'brand-blue-1': '#0E8FFF',
        'brand-blue-2': '#2345C3',
        'brand-yellow-green-1': '#68B700',
        'brand-yellow-green-2': '#e6ffc4',
        'yellow-1': '#FFAC33',
        'green-1': '#4ABB0C',
        'brand-light-green': '#1FD493',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        'gilroy-bold': ['Gilroy-Bold', ...defaultTheme.fontFamily.sans],
        'sf-compact-medium': [
          'SF Compact Display Medium',
          ...defaultTheme.fontFamily.sans,
        ],
        'sf-pro-text': ['SFProText', ...defaultTheme.fontFamily.sans],
        inter: ['Inter Regular', ...defaultTheme.fontFamily.sans],
      },
      inset: {
        0: 0,
        1: '0.25rem',
        2: '0.5rem',
        '1/2': '50%',
      },
      spacing: {
        ...defaultTheme.spacing,
        7.5: '1.875rem',
        16: '4rem',
        18: '4.5rem',
        25: '6.5rem',
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
        maintenance: "url('/MaintenanceBg.svg')",
        'top-desktop-new': "url('/topbg-new.png')",
        'top-mobile-new': "url('/topbg-new.png')",
        'ideamarket-bg': "url('/ideamarket.svg')",
      }),
      boxShadow: {
        home: '0 1px 5px 0 rgba(0, 0, 0, 0.05)',
        embed: '0px 0px 8px rgba(0, 0, 0, 0.25)',
        'shadow-1': '0px 4px 10px rgba(0, 0, 0, 0.15)',
      },
      width: {
        120: '30rem',
        128: '32rem',
        136: '34rem',
      },
      height: {
        120: '30rem',
        128: '32rem',
        136: '34rem',
      },
      minHeight: {
        6: '1.5rem',
      },
      maxHeight: {
        home: '82rem',
      },
      minWidth: {
        ...defaultTheme.minWidth,
        70: '18rem',
        100: '25rem',
        150: '37.5rem',
      },
      maxWidth: {
        ...defaultTheme.maxWidth,
        88: '22rem',
        100: '25rem',
        150: '37.5rem',
        304: '76rem',
        336: '84rem',
      },
      textOpacity: {
        ...defaultTheme.textOpacity,
        60: '0.6',
      },
      backgroundOpacity: ['active'],
      zIndex: {
        '-10': '-10',
        '-20': '-20',
      },
      gradientColorStops: {
        ...defaultTheme.gradientColorStops,
        'brand-blue-1': '#0E8FFF',
        'brand-blue-2': '#2345C3',
        'brand-sky-blue-1': '#a4b8eb',
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
