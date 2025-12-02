import axios from "axios";
import { GET_DASHBOARD_SUMMARY, GET_MISSED_CLIENTS_EXPORT } from "./apiurls";

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



export function getdashboadsummary(params) {
  return axios({
    method: "get",
    url: GET_DASHBOARD_SUMMARY,
    params,
   
    // headers: {
    //   Authorization: authToken,
    // },
  });
}
