import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../services/cache_service.dart';
import '../services/sync_service.dart';
import '../threading/worker_pool.dart';
import 'app_initializer.dart';

final initializationProvider = FutureProvider<AppInitResult>((ref) async {
  return AppInitializer.initialize();
});

final isInitializedProvider = Provider<bool>((ref) {
  return ref.watch(initializationProvider).valueOrNull != null;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(initializationProvider).valueOrNull?.isAuthenticated ?? false;
});

final dioClientProvider = Provider<DioClient?>((ref) {
  return ref.watch(initializationProvider).valueOrNull?.dioClient;
});

final workerPoolProvider = Provider<WorkerPool?>((ref) {
  return ref.watch(initializationProvider).valueOrNull?.workerPool;
});

final cacheServiceProvider = Provider<CacheService?>((ref) {
  return ref.watch(initializationProvider).valueOrNull?.cacheService;
});

final syncServiceProvider = Provider<SyncService?>((ref) {
  return ref.watch(initializationProvider).valueOrNull?.syncService;
});
