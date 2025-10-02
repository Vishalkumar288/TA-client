import { useMutation } from "@tanstack/react-query";
import { excelLog } from "./service";
import { AxiosError } from "axios";

export const useExportLog = () => {
  const mutation = useMutation<any, AxiosError<{ message: string }>, any>({
    mutationFn: ({ data }: any) => excelLog(data)
  });

  return mutation;
};
