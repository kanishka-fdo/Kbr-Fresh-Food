// Lock synchronously, including while the confirmation dialog is open.
export function createSubmissionGate({ lockAfterSuccess = false } = {}) {
  let busy = false;
  return async task => {
    if (busy) return;
    busy = true;
    let succeeded = false;
    try {
      succeeded = await task() === true;
    } finally {
      if (!succeeded || !lockAfterSuccess) busy = false;
    }
  };
}
