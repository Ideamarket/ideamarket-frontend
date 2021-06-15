const SelectTokensFormat = ({ token }) => (
  <div className="flex flex-row items-center w-full">
    <div className="flex items-center">
      <img
        className="w-7.5"
        style={{ minWidth: 24, minHeight: 24 }}
        src={token.logoURL}
        alt="logo"
      />
    </div>
    <div className="ml-2.5">
      <div>{token.symbol}</div>
    </div>
  </div>
)

export default SelectTokensFormat
