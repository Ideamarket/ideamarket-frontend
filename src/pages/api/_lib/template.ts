import { TokenData } from './types'

function getCss() {
  return `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  
  :root {
    -moz-tab-size: 4;
    -o-tab-size: 4;
       tab-size: 4;
  }
  
  html {
    line-height: 1.15; 
    -webkit-text-size-adjust: 100%; 
  }
  
  
  body {
    margin: 0;
  }
  
  body {
    font-family:
      system-ui,
      -apple-system, 
      'Segoe UI',
      Roboto,
      Helvetica,
      Arial,
      sans-serif,
      'Apple Color Emoji',
      'Segoe UI Emoji';
  }
  
  
  hr {
    height: 0; 
    color: inherit; 
  }
  
  
  abbr[title] {
    -webkit-text-decoration: underline dotted;
            text-decoration: underline dotted;
  }
  
  b,
  strong {
    font-weight: bolder;
  }
  
  code,
  kbd,
  samp,
  pre {
    font-family:
      ui-monospace,
      SFMono-Regular,
      Consolas,
      'Liberation Mono',
      Menlo,
      monospace; 
    font-size: 1em; 
  }
  
  small {
    font-size: 80%;
  }
  
  sub,
  sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }
  sub {
    bottom: -0.25em;
  }
  sup {
    top: -0.5em;
  }
  
  
  table {
    text-indent: 0; 
    border-color: inherit; 
  }
  
  
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit; 
    font-size: 100%; 
    line-height: 1.15; 
    margin: 0; 
  }
  
  button,
  select { 
    text-transform: none;
  }
  
  button,
  [type='button'],
  [type='reset'],
  [type='submit'] {
    -webkit-appearance: button;
  }
  
  ::-moz-focus-inner {
    border-style: none;
    padding: 0;
  }
  
  :-moz-focusring {
    outline: 1px dotted ButtonText;
  }
  
  :-moz-ui-invalid {
    box-shadow: none;
  }
  
  legend {
    padding: 0;
  }
  
  progress {
    vertical-align: baseline;
  }
  
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    height: auto;
  }
  
  [type='search'] {
    -webkit-appearance: textfield; 
    outline-offset: -2px; 
  }
  
  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  
  ::-webkit-file-upload-button {
    -webkit-appearance: button; 
    font: inherit; 
  }
  
  
  summary {
    display: list-item;
  }
  
  blockquote,
  dl,
  dd,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr,
  figure,
  p,
  pre {
    margin: 0;
  }
  button {
    background-color: transparent;
    background-image: none;
  }
  
  button:focus {
    outline: 1px dotted;
    outline: 5px auto -webkit-focus-ring-color;
  }
  fieldset {
    margin: 0;
    padding: 0;
  }
  ol,
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  
  html {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; 
    line-height: 1.5; 
  }
  
  body {
    font-family: inherit;
    line-height: inherit;
  }
  
  *,
  ::before,
  ::after {
    box-sizing: border-box; 
    border-width: 0; 
    border-style: solid; 
    border-color: #e5e7eb; 
  }
  
  hr {
    border-top-width: 1px;
  }
  
  img {
    border-style: solid;
  }
  textarea {
    resize: vertical;
  }
  input::-moz-placeholder, textarea::-moz-placeholder {
    opacity: 1;
    color: #9ca3af;
  }
  input:-ms-input-placeholder, textarea:-ms-input-placeholder {
    opacity: 1;
    color: #9ca3af;
  }
  input::placeholder,
  textarea::placeholder {
    opacity: 1;
    color: #9ca3af;
  }
  button,
  [role="button"] {
    cursor: pointer;
  }
  table {
    border-collapse: collapse;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: inherit;
    font-weight: inherit;
  }
  
  a {
    color: inherit;
    text-decoration: inherit;
  }
  
  button,
  input,
  optgroup,
  select,
  textarea {
    padding: 0;
    line-height: inherit;
    color: inherit;
  }
  
  pre,
  code,
  kbd,
  samp {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }
  
  img,
  svg,
  video,
  canvas,
  audio,
  iframe,
  embed,
  object {
    display: block;
    vertical-align: middle;
  }
  
  img,
  video {
    max-width: 100%;
    height: auto;
  }
  * {
    --tw-shadow: 0 0 #0000;
    --tw-ring-inset: var(--tw-empty, );
    --tw-ring-offset-width: 0px;
    --tw-ring-offset-color: #fff;
    --tw-ring-color: rgba(59, 130, 246, 0.5);
    --tw-ring-offset-shadow: 0 0 #0000;
    --tw-ring-shadow: 0 0 #0000;
  }
  .mr-5 {
    margin-right: 1.25rem;
  }
  .mt-1 {
    margin-top: 0.25rem;
  }
  .mr-1 {
    margin-right: 0.25rem;
  }
  .ml-2 {
    margin-left: 0.5rem;
  }
  .mb-1 {
    margin-bottom: 0.25rem;
  }
  .flex {
    display: flex;
  }
  .block {
    display: block;
  }
  .inline-block {
    display: inline-block;
  }
  .grid {
    display: grid;
  }
  .h-screen {
    height: 100vh;
  }
  .h-20 {
    height: 5rem;
  }
  .h-auto {
    height: auto;
  }
  .w-screen {
    width: 100vw;
  }
  .w-20 {
    width: 5rem;
  }
  .max-w-full {
    max-width: 100%;
  }
  .flex-none {
    flex: none;
  }
  .transform {
    --tw-translate-x: 0;
    --tw-translate-y: 0;
    --tw-rotate: 0;
    --tw-skew-x: 0;
    --tw-skew-y: 0;
    --tw-scale-x: 1;
    --tw-scale-y: 1;
    transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .flex-col {
    flex-direction: column;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .overflow-hidden {
    overflow: hidden;
  }
  .rounded-full {
    border-radius: 9999px;
  }
  .p-10 {
    padding: 2.5rem;
  }
  .p-1 {
    padding: 0.25rem;
  }
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .pt-2 {
    padding-top: 0.5rem;
  }
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pr-0 {
    padding-right: 0px;
  }
  .pl-2 {
    padding-left: 0.5rem;
  }
  .text-center {
    text-align: center;
  }
  .align-middle {
    vertical-align: middle;
  }
  .text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }
  .font-semibold {
    font-weight: 600;
  }
  .font-medium {
    font-weight: 500;
  }
  .uppercase {
    text-transform: uppercase;
  }
  .leading-6 {
    line-height: 1.5rem;
  }
  .leading-8 {
    line-height: 2rem;
  }
  .leading-5 {
    line-height: 1.25rem;
  }
  .text-white {
    --tw-text-opacity: 1;
    color: rgba(255, 255, 255, var(--tw-text-opacity));
  }
  .text-gray-400 {
    --tw-text-opacity: 1;
    color: rgba(156, 163, 175, var(--tw-text-opacity));
  }
  .text-gray-100 {
    --tw-text-opacity: 1;
    color: rgba(243, 244, 246, var(--tw-text-opacity));
  }
  .text-green-500 {
    --tw-text-opacity: 1;
    color: rgba(16, 185, 129, var(--tw-text-opacity));
  }
  .scale-400 {
    --tw-scale-x: 4;
    --tw-scale-y: 4;
  }  
  `
}

export function getHtml(tokenData: TokenData) {
  const twitterLogo = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    class="inline-block align-middle"
  >
    <path
      d="M17.857 20C19.04 20 20 19.04 20 17.857V2.143C20 .96 19.04 0 17.857 0H2.143C.96 0 0 .96 0 2.143v15.714C0 19.04.96 20 2.143 20h15.714zM7.353 15.8a8.297 8.297 0 01-4.496-1.313c.237.026.464.035.705.035 1.371 0 2.63-.464 3.634-1.25a2.93 2.93 0 01-2.736-2.03c.45.066.857.066 1.321-.055a2.927 2.927 0 01-2.343-2.874v-.036a2.92 2.92 0 001.32.37C4.04 8.17 3.456 7.08 3.456 6.215V6.21c0-.545.143-1.045.398-1.478a8.305 8.305 0 006.034 3.063c-.415-1.987 1.072-3.599 2.858-3.599.843 0 1.602.353 2.138.925a5.736 5.736 0 001.857-.706 2.923 2.923 0 01-1.286 1.612 5.832 5.832 0 001.688-.456 6.142 6.142 0 01-1.469 1.518c.009.125.009.255.009.38 0 3.87-2.946 8.33-8.33 8.33z"
      fill="#FFF"
      fill-rule="nonzero"
      class=""
    ></path>
  </svg>
  `
  const substackLogo = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="inline-block align-middle">
    <path d="M17.857 20C19.04 20 20 19.04 20 17.857V2.143C20 .96 19.04 0 17.857 0H2.143C.96 0 0 .96 0 2.143v15.714C0 19.04.96 20 2.143 20h15.714zM7.353 15.8a8.297 8.297 0 01-4.496-1.313c.237.026.464.035.705.035 1.371 0 2.63-.464 3.634-1.25a2.93 2.93 0 01-2.736-2.03c.45.066.857.066 1.321-.055a2.927 2.927 0 01-2.343-2.874v-.036a2.92 2.92 0 001.32.37C4.04 8.17 3.456 7.08 3.456 6.215V6.21c0-.545.143-1.045.398-1.478a8.305 8.305 0 006.034 3.063c-.415-1.987 1.072-3.599 2.858-3.599.843 0 1.602.353 2.138.925a5.736 5.736 0 001.857-.706 2.923 2.923 0 01-1.286 1.612 5.832 5.832 0 001.688-.456 6.142 6.142 0 01-1.469 1.518c.009.125.009.255.009.38 0 3.87-2.946 8.33-8.33 8.33z" fill="#fff"></path><path fill="#fff" d="M2.352 1.949h15.297v15.106H2.352z"></path><path d="M15.278 6.697H4.721v1.421h10.557zM4.721 9.405v6.605L10 13.06l5.279 2.95V9.405zM15.278 3.99H4.721v1.42h10.557z">
    </path>
  </svg>
  `
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
        ${getCss()}
    </style>
  </head>
  <body class="overflow-hidden">
  <div
    class="p-10 w-screen h-screen flex justify-center items-center transform scale-400"
    style="background-color: #021f5d;"
  >
      <div class="flex flex-col justify-center items-center leading-6 text-white">
        <div class="flex flex-none text-white">
          <div class="mr-5 w-20 h-20">
            <img
              class="block max-w-full h-auto align-middle rounded-full"
              src="https://unavatar.backend.ideamarket.io/${tokenData.market}/${
    tokenData.username
  }"
              alt=""
            />
          </div>
          <div class="mt-1 text-2xl font-semibold leading-8 text-gray-400">
            <div class="">
              <span class="align-middle">
              <a
                  href="https://twitter.com/elonmusk"
                  target="_blank"
                  rel="noreferrer"
                  class="cursor-pointer hover:underline"
              >
              ${tokenData.username}
              </a>
              </span>
              <span class="mr-1 ml-2">
                ${
                  tokenData.market === 'twitter'
                    ? twitterLogo
                    : tokenData.market === 'substack'
                    ? substackLogo
                    : null
                }
              </span>
            </div>
            <div class="mt-1 text-sm leading-5">Rank ${tokenData.rank}</div>
          </div>
        </div>
        <div class="text-white">
          <div class="grid grid-cols-2 p-1 mb-1">
            <div class="px-2 pt-2 pb-2 text-center">
              <div class="mb-1 text-base font-medium text-gray-100">Price</div>
              <div class="text-2xl font-medium leading-8 uppercase">$${
                tokenData.price
              }</div>
            </div>
            <div class="pt-2 pr-0 pb-2 pl-2 text-center">
              <div class="mb-1 text-base font-medium text-gray-100">
                7D Change
              </div>
              <div class="text-2xl font-medium leading-8 uppercase">
                <div class="${
                  tokenData.weeklyChange && tokenData.weeklyChange[0] === '-'
                    ? 'text-red-500'
                    : 'text-green-500'
                } uppercase">${tokenData.weeklyChange}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`
}
