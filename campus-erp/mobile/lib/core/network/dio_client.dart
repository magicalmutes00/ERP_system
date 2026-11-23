import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  late final Dio dio;
  final _storage = const FlutterSecureStorage();

  static const String baseUrl = 'http://localhost:4000/api/v1';

  Future<void> init() async {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.addAll([
      AuthInterceptor(_storage),
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
      ),
    ]);
  }
}

class AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _storage;

  AuthInterceptor(this._storage);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _storage.read(key: 'access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      try {
        final refreshToken = await _storage.read(key: 'refresh_token');
        if (refreshToken != null) {
          final response = await Dio().post(
            '${DioClient.baseUrl}/auth/refresh',
            options: Options(headers: {'Authorization': 'Bearer $refreshToken'}),
          );
          final newToken = response.data['accessToken'] as String;
          final newRefreshToken = response.data['refreshToken'] as String;
          await _storage.write(key: 'access_token', value: newToken);
          await _storage.write(key: 'refresh_token', value: newRefreshToken);

          err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
          final retryResponse = await Dio().fetch(err.requestOptions);
          handler.resolve(retryResponse);
          return;
        }
      } catch (_) {
        await _storage.deleteAll();
      }
    }
    handler.next(err);
  }
}
