export async function runWithConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  if (items.length === 0) return;
  let cursor = 0;
  async function drain() {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      await worker(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, drain),
  );
}
