class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;
  final int statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    required this.statusCode,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? parser) {
    return ApiResponse(
      success: json['success'] as bool? ?? false,
      data: parser != null ? parser(json['data']) : json['data'] as T?,
      error: json['error'] as String? ?? json['message'] as String?,
      statusCode: json['statusCode'] as int? ?? 200,
    );
  }
}
