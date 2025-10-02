import { useMutation } from "@tanstack/react-query";
import { excelLog } from "./service";
import { AxiosError } from "axios";

export const useExportLog = () => {
  const mutation = useMutation<any, AxiosError<{ message: string }>, any>({
    mutationFn: ({ data }: any) => excelLog(data),
    onError: (error) => {
      // If backend sent JSON but axios returned ArrayBuffer
      if (error.response?.data instanceof ArrayBuffer) {
        try {
          const decoded = new TextDecoder().decode(error.response.data);
          const parsed = JSON.parse(decoded);
          error.response.data = parsed; // overwrite with parsed JSON
        } catch (e) {
          console.error("Failed to parse error buffer:", e);
        }
      }
    }
  });

  return mutation;
};
