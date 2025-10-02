import React, { useEffect, useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  className = ""
}: OtpInputProps) {
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (autoFocus && !disabled) {
      const first = inputsRef.current[0];
      first?.focus();
      first?.select();
    }
  }, [autoFocus, disabled]);

  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setAt = (index: number, ch: string) => {
    const arr = digits.slice();
    arr[index] = ch || " ";
    onChange(arr.join("").replace(/ /g, "").slice(0, length));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    if (disabled) return;
    const raw = e.target.value.replace(/\D/g, ""); // only digits
    if (!raw) {
      // cleared
      setAt(i, "");
      return;
    }
    const ch = raw[raw.length - 1];
    setAt(i, ch);
    // move next
    const next = inputsRef.current[i + 1];
    if (next) next.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    i: number
  ) => {
    if (disabled) return;
    const key = e.key;
    const cur = inputsRef.current[i];
    if (key === "Backspace") {
      if ((cur?.value ?? "") === "" && i > 0) {
        const prev = inputsRef.current[i - 1];
        prev?.focus();
        setAt(i - 1, "");
      } else {
        // clear current
        setAt(i, "");
      }
    } else if (key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (key === "ArrowRight" && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const arr = pasted.split("").slice(0, length);
    // build new value based on where paste happened
    const startIndex = Number(
      (e.target as HTMLInputElement).dataset?.index ?? 0
    );
    const base = digits.slice();
    for (let j = 0; j < arr.length && startIndex + j < length; j++) {
      base[startIndex + j] = arr[j];
    }
    onChange(base.join("").replace(/ /g, "").slice(0, length));
    // focus after paste
    const focusIndex = Math.min(startIndex + arr.length, length - 1);
    setTimeout(() => inputsRef.current[focusIndex]?.focus(), 0);
    e.preventDefault();
  };

  return (
    <div
      className={`flex gap-2 ${className}`}
      aria-label={`${length}-digit code`}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          data-index={i}
          ref={(el) => {
            if (el) inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digits[i].trim() === "" ? "" : digits[i]}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="w-10 h-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ))}
    </div>
  );
}
