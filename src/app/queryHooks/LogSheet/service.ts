import { client } from "../client";

export const createLog = async (data: any): Promise<any> => {
  const response = await client.post("/log-entry", data);
  return response.data;
};

export const excelLog = async (data: any): Promise<ArrayBuffer> => {
  const response = await client.post("/export-log", data, {
    responseType: "arraybuffer"
  });
  return response.data;
};
