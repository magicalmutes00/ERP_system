import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/dio_client.dart';
import '../services/cache_service.dart';
import '../services/sync_service.dart';
import '../threading/worker_pool.dart';

class AppInitResult {
  final DioClient dioClient;
  final bool isAuthenticated;
  final WorkerPool workerPool;
  final CacheService cacheService;
  final SyncService syncService;

  AppInitResult({
    required this.dioClient,
    required this.isAuthenticated,
    required this.workerPool,
    required this.cacheService,
    required this.syncService,
  });
}

class AppInitException implements Exception {
  final String message;
  AppInitException(this.message);

  @override
  String toString() => message;
}

class AppInitializer {
  static Future<AppInitResult> initialize() async {
    try {
      await Future.wait([
        SharedPreferences.getInstance(),
        Future(() => null),
      ]);

      final dioClient = DioClient();
      await dioClient.init();

      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'access_token');
      final isAuthenticated = token != null;

      final workerPool = WorkerPool(maxWorkers: 2);
      await workerPool.start();

      final cacheService = CacheService();
      final syncService = SyncService(workerPool);

      return AppInitResult(
        dioClient: dioClient,
        isAuthenticated: isAuthenticated,
        workerPool: workerPool,
        cacheService: cacheService,
        syncService: syncService,
      );
    } catch (e) {
      throw AppInitException('App initialization failed: $e');
    }
  }
}
