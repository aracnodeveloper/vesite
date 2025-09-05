export default function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  name,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  name?: string;
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-1 text-black border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-transparent"
    />
  );
}
