"use client";

import { useState, FormEvent, useEffect } from "react";
import AlertMessage from "@/app/shared/layouts/AlertMessage";
import TextInput from "@/app/shared/formInputs/TextInput";
import MultiTagInput from "@/app/shared/formInputs/MultiTagInput";
import { useCreateLog } from "@/app/queryHooks/LogSheet/useCreateLog";
import { storageKeys } from "@/app/shared/constants/storageKeys";
import { Download } from "lucide-react";

interface FormPayload {
  distance: string;
  fromPlaces: string[];
  toPlaces: string[];
  date: string;
  token: string;
}

const getTodayIso = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const saveCache = (data: Partial<FormPayload>) => {
  try {
    const payload = {
      distance: data.distance ?? "",
      fromPlaces: data.fromPlaces ?? [],
      toPlaces: data.toPlaces ?? []
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        storageKeys.CACHE_KEY,
        JSON.stringify(payload)
      );
    }
  } catch {
    // ignore storage errors
  }
};

const loadCache = (): Partial<FormPayload> | null => {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(storageKeys.CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function LogSheetForm() {
  const maxDate = getTodayIso();
  const [form, setForm] = useState<FormPayload>({
    distance: "",
    fromPlaces: [],
    toPlaces: [],
    date: maxDate,
    token: ""
  });

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setForm((prev) => ({
        ...prev,
        distance: cached.distance ?? prev.distance,
        fromPlaces: cached.fromPlaces ?? prev.fromPlaces,
        toPlaces: cached.toPlaces ?? prev.toPlaces,
        date: prev.date || maxDate,
        token: ""
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [showMFA, setShowMFA] = useState<boolean>(false);

  const handleInputChange = (
    field: keyof Omit<FormPayload, "fromPlaces" | "toPlaces">,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiChange = (
    field: "fromPlaces" | "toPlaces",
    values: string[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: values }));
  };

  const handleShowMFA = () => {
    // require distance, date, and at least one chip in from/to before going to MFA
    if (
      !form.distance ||
      !form.date ||
      form.fromPlaces.length === 0 ||
      form.toPlaces.length === 0
    ) {
      setMessage({ type: "error", text: "Please fill all fields." });
      return;
    }
    setMessage(null);
    setShowMFA((prev) => !prev);
  };

  const { mutate, isPending, error, isError } = useCreateLog();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const { distance, fromPlaces, toPlaces, date, token } = form;

    if (
      !distance ||
      fromPlaces.length === 0 ||
      toPlaces.length === 0 ||
      !date ||
      !token
    ) {
      setMessage({ type: "error", text: "Please fill all fields." });
      return;
    }

    if (!/^\d{6}$/.test(token)) {
      setMessage({ type: "error", text: "Code must be 6 digits." });
      return;
    }
    const formattedData = {
      ...form,
      fromPlaces: fromPlaces.join(", "),
      toPlaces: toPlaces.join(", ")
    };

    mutate(
      { data: formattedData },
      {
        onSuccess: () => {
          saveCache({ distance, fromPlaces, toPlaces });
          setMessage({ type: "success", text: "Distance Info Logged!" });
          setForm({
            distance: "",
            fromPlaces: [],
            toPlaces: [],
            date: "",
            token: ""
          });
          setShowMFA(false);
          setTimeout(() => {
            setMessage(null);
            const cached = loadCache();
            setForm((prev) => ({
              ...prev,
              distance: cached?.distance || "",
              fromPlaces: cached?.fromPlaces || [],
              toPlaces: cached?.toPlaces || [],
              date: maxDate,
              token: ""
            }));
          }, 5000);
        }
      }
    );
  };

  useEffect(() => {
    if (isError) {
      setMessage({
        type: "error",
        text: (error as any)?.response?.data?.message ?? "something went wrong"
      });
    }
  }, [(error as any)?.response?.data?.message, isError]);

  const placeOptions = [
    "Hyderabad",
    "Medak",
    "Mumbai",
    "Bengaluru",
    "Chennai",
    "Delhi"
  ];

  return (
    <div className="min-h-[100svh] flex items-center justify-center flex-col p-2 bg-auto gap-2">
      <div className="flex justify-end items-center p-2 min-w-full">
        <button className="flex items-center text-blue-500">
          <Download className="max-h-4"/>
          {"Sheet"}
        </button>
      </div>
      <div className="max-w-md w-full bg-gray-400 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Log Sheet Info</h1>
        {message && <AlertMessage type={message.type} text={message.text} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Distance"
            value={form.distance}
            onChange={(e) => handleInputChange("distance", e.target.value)}
            disabled={showMFA}
            placeholder="e.g., 53128"
          />

          <MultiTagInput
            label="From"
            options={placeOptions}
            values={form.fromPlaces}
            onChange={(vals) => handleMultiChange("fromPlaces", vals)}
            disabled={showMFA}
            placeholder="Type or pick places"
          />

          <MultiTagInput
            label="To"
            options={placeOptions}
            values={form.toPlaces}
            onChange={(vals) => handleMultiChange("toPlaces", vals)}
            disabled={showMFA}
            placeholder="Type or pick places"
          />

          <TextInput
            label="Date"
            type="date"
            value={form.date}
            disabled={showMFA}
            onChange={(e) => handleInputChange("date", e.target.value)}
            max={maxDate}
          />

          {showMFA && (
            <TextInput
              label="Google Authenticator code"
              value={form.token}
              onChange={(e) => handleInputChange("token", e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
            />
          )}

          {showMFA ? (
            <>
              <button
                onClick={handleShowMFA}
                disabled={isPending}
                className="w-full text-blue-700 py-2 rounded-md hover:bg-blue-600 hover:text-white disabled:bg-blue-300 cursor-pointer border-2 border-blue-600"
              >
                {"Go Back"}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 cursor-pointer"
              >
                {isPending ? "Submitting..." : "Submit"}
              </button>
            </>
          ) : (
            <button
              onClick={handleShowMFA}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 cursor-pointer"
            >
              {"Next"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
