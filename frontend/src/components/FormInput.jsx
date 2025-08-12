export default function FormInput({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = true,
  step,
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      step={step}
    />
  );
}
