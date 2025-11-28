import axios from "axios";
import { GET_MISSED_CLIENTS_EXPORT } from "./apiurls";

export function exportMissedClients(params) {
  return axios({
    method: "get",
    url: GET_MISSED_CLIENTS_EXPORT,
    params,
    // headers: {
    //   Authorization: authToken,
    // },
  });
}
