import 'isolate_worker.dart';

/// Manages a pool of [IsolateWorker] instances for parallel task execution.
class WorkerPool {
  final int _maxWorkers;
  final List<IsolateWorker> _workers = [];
  int _currentIndex = 0;

  WorkerPool({int maxWorkers = 2}) : _maxWorkers = maxWorkers;

  /// Starts all worker isolates in the pool.
  Future<void> start() async {
    for (int i = 0; i < _maxWorkers; i++) {
      final worker = IsolateWorker();
      await worker.start();
      _workers.add(worker);
    }
  }

  /// Dispatches a task to the next available worker (round-robin).
  Future<R> execute<R, P>({
    required String task,
    required P params,
  }) async {
    final worker = _workers[_currentIndex % _workers.length];
    _currentIndex++;
    return worker.execute<R, P>(task: task, params: params);
  }

  /// Runs the same [task] across all workers in parallel with different [paramsList].
  Future<List<R>> executeAll<R, P>({
    required String task,
    required List<P> paramsList,
  }) async {
    final futures = <Future<R>>[];
    for (final params in paramsList) {
      final worker = _workers[futures.length % _workers.length];
      futures.add(worker.execute<R, P>(task: task, params: params));
    }
    return Future.wait(futures);
  }

  /// Releases all worker resources.
  void dispose() {
    for (final worker in _workers) {
      worker.dispose();
    }
    _workers.clear();
  }
}
