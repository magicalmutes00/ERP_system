import 'dart:async';
import 'dart:isolate';

abstract final class ComputeUtils {
  /// Runs a [computation] in a background isolate.
  /// The function and its return value must be sendable across isolates
  /// (primitives, lists, maps, or simple objects).
  static Future<T> run<T>(FutureOr<T> Function() computation) {
    return Isolate.run(computation);
  }

  /// Runs multiple computations in parallel, each in its own isolate.
  static Future<List<T>> runAll<T>(
    List<FutureOr<T> Function()> computations,
  ) async {
    final futures = computations.map((c) => Isolate.run(c)).toList();
    return Future.wait(futures);
  }

  /// Runs a [computation] with a [timeout]. Throws [TimeoutException] if exceeded.
  static Future<T> runWithTimeout<T>(
    FutureOr<T> Function() computation, {
    Duration timeout = const Duration(seconds: 30),
  }) {
    return Isolate.run(computation).timeout(timeout);
  }
}
