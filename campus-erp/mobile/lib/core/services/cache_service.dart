import 'dart:async';
import 'dart:convert';
import '../threading/compute_utils.dart';

/// Provides local caching with JSON serialization/deserialization
/// performed in background isolates.
class CacheService {
  final Map<String, String> _memoryCache = {};
  Timer? _cleanupTimer;

  CacheService() {
    _cleanupTimer = Timer.periodic(const Duration(minutes: 5), (_) => _memoryCache.clear());
  }

  Future<void> put<T>(String key, T value) async {
    final json = await ComputeUtils.run(() {
      if (value is Map || value is List) {
        return jsonEncode(value);
      }
      return value.toString();
    });
    _memoryCache[key] = json;
  }

  Future<T?> get<T>(String key, {T Function(Map<String, dynamic>)? fromJson}) async {
    final cached = _memoryCache[key];
    if (cached == null) return null;

    return ComputeUtils.run(() {
      final decoded = jsonDecode(cached);
      if (fromJson != null && decoded is Map<String, dynamic>) {
        return fromJson(decoded);
      }
      return decoded as T;
    });
  }

  Future<List<T>> getList<T>(String key, {required T Function(Map<String, dynamic>) fromJson}) async {
    final cached = _memoryCache[key];
    if (cached == null) return [];

    return ComputeUtils.run(() {
      final list = jsonDecode(cached) as List<dynamic>;
      return list.cast<Map<String, dynamic>>().map(fromJson).toList();
    });
  }

  bool has(String key) => _memoryCache.containsKey(key);

  void remove(String key) => _memoryCache.remove(key);

  void clear() => _memoryCache.clear();

  void dispose() {
    _cleanupTimer?.cancel();
    _memoryCache.clear();
  }
}
