export enum SyncOperation {
  fetchAttendance = 'fetchAttendance',
  fetchCourses = 'fetchCourses',
  fetchExams = 'fetchExams',
  fetchFees = 'fetchFees',
}

type SyncHandler = () => Promise<string>;

interface SyncAllHandlers {
  [key: string]: SyncHandler;
}

class SyncService {
  private queue: Array<{op: SyncOperation; handler: SyncHandler}> = [];
  private running = false;

  enqueue(op: SyncOperation, handler: SyncHandler) {
    this.queue.push({op, handler});
  }

  async syncAll(handlers: SyncAllHandlers): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const results = await Promise.all(
        Object.entries(handlers).map(async ([key, handler]) => {
          try {
            const data = await handler();
            return {op: key, ok: true, data};
          } catch (e) {
            return {op: key, ok: false, error: String(e)};
          }
        }),
      );
      // results can be cached if desired
      return;
    } finally {
      this.running = false;
    }
  }

  async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;
      try {
        await item.handler();
      } catch {
        // ignore
      }
    }
  }
}

export const syncService = new SyncService();
