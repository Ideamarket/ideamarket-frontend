import classNames from "classnames"

const ToggleSwitch = ({
  handleChange,
  isOn,
  className,
}: {
  handleChange: (e: any) => void
  isOn: boolean,
  className?: string,
}) => {
  return (
    <label className={classNames(className, "toggle-switch")}>
      <input type="checkbox" checked={isOn} onChange={handleChange} />
      <span className="switch" />
    </label>
  )
}

export default ToggleSwitch
