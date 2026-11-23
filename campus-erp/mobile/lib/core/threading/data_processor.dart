import 'dart:convert';
import 'compute_utils.dart';

/// CPU-intensive data processing operations that run in background isolates.
/// This demonstrates how to offload heavy computations off the main thread.
abstract final class DataProcessor {
  /// Parses and transforms a large JSON string in a background isolate.
  static Future<List<T>> parseList<T>({
    required String rawJson,
    required T Function(Map<String, dynamic>) fromMap,
  }) async {
    final list = await ComputeUtils.run(() {
      final decoded = jsonDecode(rawJson) as List<dynamic>;
      return decoded.cast<Map<String, dynamic>>();
    });
    return list.map(fromMap).toList();
  }

  /// Filters and sorts a list in a background isolate.
  static Future<List<T>> filterAndSort<T>({
    required List<T> items,
    required bool Function(T) filter,
  }) async {
    return ComputeUtils.run(() {
      final filtered = items.where(filter).toList();
      return filtered;
    });
  }

  /// Computes summary statistics from a numeric dataset.
  static Future<Map<String, double>> computeStatistics({
    required List<num> values,
  }) async {
    return ComputeUtils.run(() {
      if (values.isEmpty) {
        return {'min': 0, 'max': 0, 'avg': 0, 'sum': 0, 'count': 0};
      }
      final sum = values.fold<num>(0, (a, b) => a + b);
      final avg = sum / values.length;
      return {
        'min': values.cast<double>().reduce((a, b) => a < b ? a : b),
        'max': values.cast<double>().reduce((a, b) => a > b ? a : b),
        'avg': avg,
        'sum': sum.toDouble(),
        'count': values.length.toDouble(),
      };
    });
  }

  /// Batch processes items in parallel across multiple isolates.
  static Future<List<R>> batchProcess<T, R>({
    required List<T> items,
    required R Function(T) transform,
    int batchSize = 100,
  }) async {
    final batches = <List<T>>[];
    for (int i = 0; i < items.length; i += batchSize) {
      batches.add(items.sublist(i, (i + batchSize).clamp(0, items.length)));
    }

    final results = await ComputeUtils.runAll(
      batches.map((batch) => () {
        return batch.map(transform).toList();
      }).toList(),
    );

    return results.expand((r) => r).toList();
  }
}
