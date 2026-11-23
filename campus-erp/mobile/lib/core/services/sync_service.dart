import 'dart:async';
import '../threading/worker_pool.dart';

/// Supported sync operations.
enum SyncOperation { fetchAttendance, fetchCourses, fetchExams, fetchFees, fetchNotifications }

/// Result of a sync operation.
class SyncResult {
  final SyncOperation operation;
  final bool success;
  final String? data;
  final String? error;
  final DateTime timestamp;

  SyncResult({
    required this.operation,
    required this.success,
    this.data,
    this.error,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

/// Manages background data synchronization using isolate workers.
/// Runs sync operations off the main thread to prevent UI jank.
class SyncService {
  final WorkerPool _workerPool;
  final Map<SyncOperation, DateTime> _lastSync = {};
  bool _isSyncing = false;

  SyncService(this._workerPool);

  bool hasSyncedRecently(SyncOperation op, {Duration within = const Duration(minutes: 5)}) {
    final last = _lastSync[op];
    if (last == null) return false;
    return DateTime.now().difference(last) < within;
  }

  Future<SyncResult> sync(SyncOperation operation, {required String Function() fetchData}) async {
    _isSyncing = true;
    try {
      final result = await _workerPool.execute<String, Map>(task: 'syncOperation', params: {
        'operation': operation.name,
        'timestamp': DateTime.now().toIso8601String(),
      });

      if (!hasSyncedRecently(operation)) {
        final data = fetchData();
        _lastSync[operation] = DateTime.now();
        return SyncResult(operation: operation, success: true, data: data);
      }

      return SyncResult(operation: operation, success: true, data: result);
    } catch (e) {
      return SyncResult(operation: operation, success: false, error: e.toString());
    } finally {
      _isSyncing = false;
    }
  }

  Future<List<SyncResult>> syncAll(Map<SyncOperation, String Function()> operations) async {
    final futures = operations.entries.map((entry) {
      return sync(entry.key, fetchData: entry.value);
    });
    return Future.wait(futures);
  }

  bool get isSyncing => _isSyncing;

  DateTime? lastSyncTime(SyncOperation op) => _lastSync[op];
}
