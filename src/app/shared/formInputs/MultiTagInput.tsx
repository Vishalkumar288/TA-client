import React, { useState, useEffect, KeyboardEvent } from "react";

interface MultiTagInputProps {
  label: string;
  options?: string[]; // suggestion list
  values: string[]; // selected chips
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
}

const normalize = (s: string) => s.trim();

export default function MultiTagInput({
  label,
  options = [],
  values,
  onChange,
  placeholder = "",
  disabled = false,
  maxTags
}: MultiTagInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);

  useEffect(() => {
    const q = input.toLowerCase().trim();
    setFiltered(
      options
        .filter((o) => !values.includes(o))
        .filter((o) => (q ? o.toLowerCase().includes(q) : true))
        .slice(0, 8)
    );
  }, [input, options, values]);

  const addValue = (val: string) => {
    const v = normalize(val);
    if (!v) return;
    if (maxTags && values.length >= maxTags) return;
    if (values.includes(v)) return;
    onChange([...values, v]);
    setInput("");
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue(input);
    } else if (e.key === "Backspace" && input === "" && values.length) {
      // remove last
      onChange(values.slice(0, -1));
    }
  };

  const remove = (i: number) => {
    const next = values.slice();
    next.splice(i, 1);
    onChange(next);
  };

  return (
    <div className="flex flex-col relative">
      <label
        className={`mb-1 font-bold text-gray-700 ${disabled ? "font-light text-gray-400" : ""}`}
      >
        {label}
      </label>

      <div
        className={`min-h-[44px] px-2 py-1 border border-gray-300 rounded-md flex flex-wrap items-center gap-2 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        onClick={() => {
          if (!disabled) (document.activeElement as HTMLElement)?.blur();
        }}
      >
        {values.map((v, i) => (
          <div
            key={v + i}
            className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
          >
            <span className="mr-2">{v}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-blue-600 hover:text-blue-900 font-bold"
                aria-label={`Remove ${v}`}
              >
                x
              </button>
            )}
          </div>
        ))}

        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // convert typed value to chip on blur
            if (input.trim()) addValue(input);
            // small delay to allow click handlers on suggestions
            setTimeout(() => setOpen(false), 150);
          }}
          placeholder={placeholder}
          disabled={disabled || (maxTags ? values.length >= maxTags : false)}
          className="flex-1 min-w-[120px] px-1 py-1 outline-none placeholder:text-[#ebe0e0]"
        />
      </div>

      {open && filtered.length > 0 && !disabled && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md max-h-48 overflow-auto shadow-sm">
          {filtered.map((opt) => (
            <li
              key={opt}
              onMouseDown={(e) => {
                // prevent blur from firing before click
                e.preventDefault();
                addValue(opt);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-blue-800"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}