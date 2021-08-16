export const humanReadableFromISO = (participantDate) => {
    const submittedDate = new Date(String(participantDate));
    const humanReadable = submittedDate.toLocaleString('en-US', { month: 'long' }) + ' ' + submittedDate.getDate() + ',' + submittedDate.getFullYear();
    return humanReadable; // October 30, 2020
  }

import { getIdToken } from "./shared.js";

export const getParticipantSelection = async (filter) => {
  const idToken = await getIdToken();
  const response = await fetch(`http://localhost:5001/nih-nci-dceg-connect-dev/us-central1/biospecimen?api=getParticipantSelection&type=${filter}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer" + idToken,
    },
  });
  return response.json();
}
