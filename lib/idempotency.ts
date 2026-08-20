import { kv } from "@vercel/kv";

const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;
const POLL_INTERVAL_MS = 500;
const MAX_POLL_ATTEMPTS = 120;

export type JournalSubmissionState = {
  status: "processing" | "completed" | "failed";
  response?: string;
  entryId?: string;
  error?: string;
};

function getKey(userId: string, idempotencyKey: string) {
  return `journal:idempotency:${userId}:${idempotencyKey}`;
}

export async function claimJournalSubmission(
  userId: string,
  idempotencyKey: string,
) {
  const key = getKey(userId, idempotencyKey);
  const claimed = await kv.set<JournalSubmissionState>(
    key,
    { status: "processing" },
    { nx: true, ex: IDEMPOTENCY_TTL_SECONDS },
  );

  return { claimed: claimed === "OK", key };
}

export async function getJournalSubmission(key: string) {
  return kv.get<JournalSubmissionState>(key);
}

export async function waitForJournalSubmission(key: string) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const state = await getJournalSubmission(key);
    if (state?.status === "completed") return state;
    if (state?.status === "failed")
      throw new Error(state.error || "Journal submission failed");
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Journal submission is still processing");
}

export async function completeJournalSubmission(
  key: string,
  response: string,
  entryId: string,
) {
  await kv.set<JournalSubmissionState>(
    key,
    { status: "completed", response, entryId },
    { ex: IDEMPOTENCY_TTL_SECONDS },
  );
}

export async function failJournalSubmission(key: string, error: unknown) {
  await kv.set<JournalSubmissionState>(
    key,
    {
      status: "failed",
      error:
        error instanceof Error ? error.message : "Journal submission failed",
    },
    { ex: IDEMPOTENCY_TTL_SECONDS },
  );
}

export function streamFromText(text: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(text);
      controller.close();
    },
  });
}
