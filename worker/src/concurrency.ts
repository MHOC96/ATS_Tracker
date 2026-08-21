const maxConcurrency = Number(process.env.WORKER_CONCURRENCY ?? 5);

let active = 0;
const waiters: Array<() => void> = [];

export async function withWorkerConcurrency<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= maxConcurrency) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }

  active += 1;
  try {
    return await fn();
  } finally {
    active -= 1;
    const next = waiters.shift();
    if (next) next();
  }
}
