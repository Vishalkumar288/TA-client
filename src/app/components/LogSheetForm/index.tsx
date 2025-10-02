"use client";

import { useState, useEffect } from "react";
import AlertMessage from "@/app/shared/layouts/AlertMessage";
import TextInput from "@/app/shared/formInputs/TextInput";
import MultiTagInput from "@/app/shared/formInputs/MultiTagInput";
import { useCreateLog } from "@/app/queryHooks/LogSheet/useCreateLog";
import { storageKeys } from "@/app/shared/constants/storageKeys";
import { Download } from "lucide-react";
import Dialog from "@/app/shared/dialogBox";
import OtpInput from "@/app/shared/formInputs/OtpInput";
import { useExportLog } from "@/app/queryHooks/LogSheet/useExportLog";

interface FormPayload {
  distance: string;
  fromPlaces: string[];
  toPlaces: string[];
  date: string;
  token: string;
}

interface AuthLoad {
  value: string;
  showDialog: boolean;
  setShowDialog: (open: boolean) => void;
  handleInputChange: (
    field: keyof Omit<FormPayload, "fromPlaces" | "toPlaces">,
    value: string
  ) => void;
  mode: "submit" | "download";
  onConfirm: () => void;
  isPending: boolean;
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

const AuthenticatorComp = ({
  value,
  showDialog,
  setShowDialog,
  handleInputChange,
  mode,
  onConfirm,
  isPending
}: AuthLoad & { mode: "submit" | "download"; onConfirm: () => void }) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!value || value.trim().length !== 6) {
      setLocalError("Code must be 6 digits.");
      return;
    }
    // clear local error and call parent handler
    setLocalError(null);
    onConfirm();
  };

  return (
    <Dialog
      open={showDialog}
      title={
        mode === "download"
          ? "Enter code to Download"
          : "Enter Authenticator code"
      }
      onClose={() => {
        setLocalError(null);
        setShowDialog(false);
      }}
      onConfirm={handleConfirm}
      isPending={isPending}
    >
      <>
        <div className="flex flex-col mt-1.5 gap-2">
          <label className="mb-1 font-bold text-amber-100-700">
            Authenticator code
          </label>
          <div className="flex gap-8 items-center">
            <OtpInput
              value={value}
              onChange={(v) => {
                handleInputChange("token", v);
                if (localError) setLocalError(null);
              }}
              length={6}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                handleInputChange("token", "");
                setLocalError(null);
              }}
              className="flex items-center text-sm underline cursor-pointer "
            >
              Clear
            </button>
          </div>
          <div className="text-sm text-red-600 min-h-[20px]">
            {localError
              ? localError
              : value && value.length !== 6
              ? "Enter 6 digits to enable Confirm"
              : ""}
          </div>
        </div>
      </>
    </Dialog>
  );
};

export default function LogSheetForm() {
  const maxDate = getTodayIso();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<"submit" | "download">("submit");

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

  const isPrelimValid =
    !!form.distance &&
    !!form.date &&
    form.fromPlaces.length > 0 &&
    form.toPlaces.length > 0;

  const { mutate, isPending, error, isError } = useCreateLog();
  const {
    mutate: exportExcel,
    isPending: isExcelLoading,
    error: excelError,
    isError: isExcelError
  } = useExportLog();

  const handleDialogConfirm = () => {
    if (dialogMode === "submit") {
      const formattedData = {
        ...form,
        fromPlaces: form.fromPlaces.join(", "),
        toPlaces: form.toPlaces.join(", ")
      };

      mutate(
        { data: formattedData },
        {
          onSuccess: () => {
            saveCache({
              distance: form.distance,
              fromPlaces: form.fromPlaces,
              toPlaces: form.toPlaces
            });
            setMessage({ type: "success", text: "Distance Info Logged!" });
            setForm({
              distance: "",
              fromPlaces: [],
              toPlaces: [],
              date: "",
              token: ""
            });
            setShowMFA(false);
            setShowDialog(false);
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
            }, 3000);
          }
        }
      );
    }
    if (dialogMode === "download") {
      setShowMFA(false);
      exportExcel(
        { data: { token: form.token } },
        {
          onSuccess: (arrayBuffer) => {
            try {
              const blob = new Blob([arrayBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "form-data.xlsx";
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
              setShowDialog(false);
              setMessage({ type: "success", text: "Download started" });
              setTimeout(() => {
                setMessage(null);
              }, 3000);
            } catch (err) {
              setMessage({
                type: "error",
                text: "Failed to save file"
              });
            }
          }
        }
      );
      setForm((prev) => ({ ...prev, token: "" }));
    }
    setShowMFA(false);
    setShowDialog(false);
  };

  const handleShowMFA = () => {
    if (!isPrelimValid) {
      setMessage({
        type: "error",
        text: "Please fill all fields before proceeding."
      });
      return;
    }
    setMessage(null);
    setDialogMode("submit");
    setShowDialog(true);
    setShowMFA(true);
  };

  useEffect(() => {
    if (isError) {
      console.log(error)
      setMessage({
        type: "error",
        text: error?.response?.data?.message ?? "something went wrong"
      });
    }
    if (isExcelError) {
      console.log(excelError)
      setMessage({
        type: "error",
        text: excelError?.response?.data?.message ?? "something went wrong"
      });
    }
  }, [
    error?.response?.data?.message,
    excelError?.response?.data?.message,
    isError,
    isExcelError
  ]);

  const placeOptions = [
    "Medchal",
    "Athvelly Farm",
    "Dabilpur Farm",
    "Yellampet Plant",
    "M.Pally Farm",
    "City Office",
    "Airport",
    "Secundrabad Railway",
    "GPR Mall",
    "Kalakal Guest House"
  ];

  return (
    <>
      <div className="min-h-[100svh] flex items-center justify-center flex-col p-2 bg-auto gap-2">
        <div className="flex justify-end items-center p-2 min-w-full">
          <button
            className="flex items-center text-blue-500 cursor-pointer"
            onClick={() => {
              setDialogMode("download");
              setShowDialog(true);
              setShowMFA(true);
            }}
          >
            <Download className="max-h-4" />
            {"Sheet"}
          </button>
        </div>
        <div className="max-w-md w-full bg-gray-400 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-4">Log Sheet Info</h1>
          {message && <AlertMessage type={message.type} text={message.text} />}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
            <button
              onClick={handleShowMFA}
              disabled={!isPrelimValid}
              className={`w-full text-white py-2 rounded-md ${
                isPrelimValid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              {"Next"}
            </button>
          </form>
        </div>
      </div>
      <AuthenticatorComp
        handleInputChange={handleInputChange}
        setShowDialog={(open: boolean) => {
          setShowDialog(open);
          if (!open) setShowMFA(false);
        }}
        showDialog={showDialog}
        value={form.token}
        mode={dialogMode}
        onConfirm={handleDialogConfirm}
        isPending={isPending || isExcelLoading}
      />
    </>
  );
}
