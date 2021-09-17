import BrandDiscord from '../assets/brand-discord.svg'
import BrandTwitter from '../assets/brand-twitter.svg'
import BrandGithub from '../assets/brand-github.svg'
import A from './A'

export default function Footer() {
  return (
    <div className="py-5 md:flex md:justify-between">
      <div className="flex justify-center space-x-5 font-sf-pro-text">
        <A
          href="https://docs.ideamarket.io"
          className="text-sm leading-none tracking-tightest-2"
        >
          Need Help?
        </A>
        <A
          href="https://docs.ideamarket.io"
          className="text-sm leading-none tracking-tightest-2"
        >
          Contact
        </A>
        <A
          href="/TOS.pdf"
          target="_blank"
          className="text-sm leading-none tracking-tightest-2"
        >
          Legal &amp; Privacy
        </A>
      </div>
      <div className="flex items-center justify-center mt-5 space-x-2 md:mt-0 md:justify-end">
        <A href="https://twitter.com/ideamarket_io">
          <BrandTwitter className="w-7 h-7" />
        </A>
        <A href="https://discord.com/invite/zaXZXGE4Ke">
          <BrandDiscord className="w-7 h-7" />
        </A>
        <A href="https://github.com/Ideamarket">
          <BrandGithub className="w-7 h-7" />
        </A>
        <p className="pl-2 text-sm leading-none text-center tracking-tightest-2">
          &copy;2021 IdeaMarkets
        </p>
      </div>
    </div>
  )
}
