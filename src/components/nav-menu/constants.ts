import router from 'next/router'
import IS_ACCOUNT_ENABLED from 'utils/isAccountEnabled'

export const navbarConfig: any = {
  menu: [
    {
      name: 'Start',
      subMenu: [
        {
          name: 'What is Ideamarket?',
          onClick: () =>
            window.open(
              'https://medium.com/@harmonylion1/decentralizing-the-search-for-truth-using-financial-markets-648bf4408b5c#:~:text=Media%20corporations%20are%20the%20central,media%20corporations%20say%20they%20are',
              '_blank'
            ),
        },
        {
          name: 'User Tutorial',
          onClick: () =>
            window.open(
              'https://docs.ideamarket.io/user-guide/tutorial',
              '_blank'
            ),
        },
        {
          name: 'Whitepaper',
          onClick: () => window.open('https://docs.ideamarket.io/', '_blank'),
        },
      ],
    },
    {
      name: 'Community',
      subMenu: [
        {
          name: 'Discord',
          onClick: () =>
            window.open('https://discord.com/invite/zaXZXGE4Ke', '_blank'),
        },
        {
          name: 'Twitter',
          onClick: () =>
            window.open('https://twitter.com/ideamarket_io', '_blank'),
        },
        {
          name: 'Reddit',
          onClick: () =>
            window.open('https://www.reddit.com/r/ideamarket/', '_blank'),
        },
        {
          name: `We're hiring`,
          onClick: () => window.open('https://jobs.ideamarket.io', '_blank'),
        },
      ],
    },
    {
      name: 'Media',
      subMenu: [
        {
          name: 'Podcast',
          onClick: () =>
            window.open(
              'https://www.youtube.com/channel/UCZRFb695b8pVWErrDPKO8Ag',
              '_blank'
            ),
        },
        {
          name: 'Newsletter',
          onClick: () =>
            window.open('http://ideamarket.substack.com', '_blank'),
        },
        {
          name: 'Shop',
          onClick: () =>
            window.open('https://ideamarket-io.myshopify.com', '_blank'),
        },
      ],
    },
    {
      name: 'Bridge',
      onClick: () => router.push('/bridge'),
    },
    {
      name: IS_ACCOUNT_ENABLED ? 'Account' : 'Wallet',
      onClick: () =>
        router.push(IS_ACCOUNT_ENABLED ? '/user-account' : '/account'),
    },
  ],
}
