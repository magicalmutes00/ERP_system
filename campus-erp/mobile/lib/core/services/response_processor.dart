import 'dart:convert';
import '../threading/compute_utils.dart';
import '../models/api_response.dart';

/// Parses API response payloads in background isolates to keep the UI thread
/// free from CPU-heavy JSON deserialization.
abstract final class ResponseProcessor {
  static Future<ApiResponse<T>> process<T>({
    required String rawBody,
    required T Function(Map<String, dynamic>) fromJson,
  }) async {
    final map = await ComputeUtils.run(() {
      return jsonDecode(rawBody) as Map<String, dynamic>;
    });
    return ApiResponse(
      success: map['success'] as bool? ?? false,
      data: map['data'] != null ? fromJson(map['data'] as Map<String, dynamic>) : null,
      error: map['error'] as String? ?? map['message'] as String?,
      statusCode: map['statusCode'] as int? ?? 200,
    );
  }

  static Future<List<T>> processList<T>({
    required String rawBody,
    required T Function(Map<String, dynamic>) fromJson,
  }) async {
    final list = await ComputeUtils.run(() {
      final decoded = jsonDecode(rawBody);
      if (decoded is Map<String, dynamic> && decoded['data'] is List) {
        return (decoded['data'] as List).cast<Map<String, dynamic>>();
      }
      if (decoded is List) {
        return decoded.cast<Map<String, dynamic>>();
      }
      throw FormatException('Unexpected response format');
    });
    return list.map(fromJson).toList();
  }

  static Future<Map<String, dynamic>> rawDecode(String rawBody) async {
    return ComputeUtils.run(() {
      return jsonDecode(rawBody) as Map<String, dynamic>;
    });
  }
}
