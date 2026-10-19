import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubmissionGate } from '../src/utils/submissionGate.js';
import { apiErrorMessage, notify, notifyApiError } from '../src/utils/notifications.js';

const deferred = () => {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
};

test('duplicate clicks during confirmation and API processing submit only once', async () => {
  const run = createSubmissionGate({ lockAfterSuccess: true });
  const confirmation = deferred();
  const response = deferred();
  let requests = 0;
  let successes = 0;
  const submit = async () => {
    if (!await confirmation.promise) return false;
    requests++;
    await response.promise;
    successes++;
    return true;
  };
  const first = run(submit);
  await run(submit);
  assert.equal(requests, 0);
  confirmation.resolve(true);
  await Promise.resolve();
  await run(submit);
  assert.equal(requests, 1);
  assert.equal(successes, 0);
  response.resolve();
  await first;
  assert.equal(successes, 1);
  await run(submit);
  assert.equal(requests, 1, 'stay locked after success until checkout unmounts');
});

test('cancellation sends no request and allows a later attempt', async () => {
  const run = createSubmissionGate();
  let requests = 0;
  await run(async () => false);
  assert.equal(requests, 0);
  await run(async () => { requests++; return true; });
  assert.equal(requests, 1);
});

test('a failed request unlocks submission for retry', async () => {
  const run = createSubmissionGate({ lockAfterSuccess: true });
  await assert.rejects(run(async () => { throw new Error('API failure'); }), /API failure/);
  let retried = false;
  await run(async () => { retried = true; return true; });
  assert.equal(retried, true);
});

test('wholesale gate allows another order after a completed request', async () => {
  const run = createSubmissionGate();
  let requests = 0;
  await run(async () => { requests++; return true; });
  await run(async () => { requests++; return true; });
  assert.equal(requests, 2);
});

test('API messages take precedence, network failures are useful, and 403 is announced once', () => {
  assert.equal(apiErrorMessage({ response: { data: { message: 'Insufficient stock.' } } }, 'Fallback'), 'Insufficient stock.');
  assert.equal(apiErrorMessage({ request: {} }, 'Fallback'), 'Unable to reach the server. Please try again.');
  assert.equal(apiErrorMessage({}, 'Fallback'), 'Fallback');
  const original = notify.error;
  const messages = [];
  notify.error = message => messages.push(message);
  try {
    notifyApiError({ response: { status: 400, data: { message: 'Invalid OTP.' } } }, 'Fallback');
    notifyApiError({ response: { status: 403, data: { message: 'Forbidden.' } } }, 'Fallback');
    assert.deepEqual(messages, ['Invalid OTP.']);
  } finally {
    notify.error = original;
  }
});
