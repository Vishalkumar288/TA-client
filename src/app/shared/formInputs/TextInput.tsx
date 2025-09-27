// ...existing code...
import React, { ChangeEvent } from "react";

interface TextInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  max?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  maxLength,
  max
}) => {
  return (
    <div className="flex flex-col">
      <label
        className={`mb-1 font-bold text-gray-700 ${
          disabled ? "font-light text-gray-400" : ""
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        max={max}
        disabled={disabled}
        className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:font-light placeholder:text-[#ebe0e0] ${
          disabled ? " cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
};

export default TextInput; 