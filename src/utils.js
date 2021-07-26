export const humanReadableFromISO = (participantDate) => {
    const submittedDate = new Date(String(participantDate));
    const humanReadable = submittedDate.toLocaleString('en-US', { month: 'long' }) + ' ' + submittedDate.getDate() + ',' + submittedDate.getFullYear();
    return humanReadable; // October 30, 2020
  }