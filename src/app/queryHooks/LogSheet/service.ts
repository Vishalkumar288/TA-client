import { client } from "../client";

export const createLog = async (data: any): Promise<any> => {
  const response = await client.post("/log-entry", data);
  return response.data;
};
