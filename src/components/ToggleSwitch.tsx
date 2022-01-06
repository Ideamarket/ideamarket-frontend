const ToggleSwitch = ({
  handleChange,
  isOn,
}: {
  handleChange: () => void
  isOn: boolean
}) => {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={isOn} onChange={handleChange} />
      <span className="switch" />
    </label>
  )
}

export default ToggleSwitch
