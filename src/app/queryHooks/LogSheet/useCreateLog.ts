import { useMutation } from "@tanstack/react-query";
import { createLog } from "./service";
import { AxiosError } from "axios";

export const useCreateLog = () => {
  const mutation = useMutation<any, AxiosError<{ message: string }>, any>({
    mutationFn: ({ data }: any) => createLog(data)
  });

  return mutation;
};
