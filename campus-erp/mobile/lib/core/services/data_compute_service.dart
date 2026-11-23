import '../threading/compute_utils.dart';

/// Computes derived data and statistics in background isolates.
/// All methods offload CPU-intensive calculations off the main thread.
abstract final class DataComputeService {
  static Future<double> computeAttendancePercentage({
    required int present,
    required int total,
  }) async {
    return ComputeUtils.run(() {
      if (total == 0) return 0.0;
      return (present / total) * 100;
    });
  }

  static Future<Map<String, double>> computeGradeDistribution({
    required List<double> marks,
    required List<double> thresholds,
    required List<String> grades,
  }) async {
    return ComputeUtils.run(() {
      final distribution = <String, double>{};
      for (final grade in grades) {
        distribution[grade] = 0;
      }
      for (final mark in marks) {
        for (int i = 0; i < thresholds.length; i++) {
          if (mark >= thresholds[i]) {
            distribution[grades[i]] = (distribution[grades[i]] ?? 0) + 1;
            break;
          }
        }
      }
      return distribution;
    });
  }

  static Future<Map<String, dynamic>> computeFeeSummary({
    required List<Map<String, dynamic>> feeRecords,
  }) async {
    return ComputeUtils.run(() {
      double totalPaid = 0;
      double totalDue = 0;
      double totalPending = 0;
      int paidCount = 0;
      int dueCount = 0;
      int pendingCount = 0;

      for (final record in feeRecords) {
        final status = record['status'] as String;
        final amount = (record['amount'] as num).toDouble();
        switch (status) {
          case 'paid':
            totalPaid += amount;
            paidCount++;
          case 'due':
            totalDue += amount;
            dueCount++;
          case 'pending':
            totalPending += amount;
            pendingCount++;
        }
      }

      return {
        'totalPaid': totalPaid,
        'totalDue': totalDue,
        'totalPending': totalPending,
        'paidCount': paidCount,
        'dueCount': dueCount,
        'pendingCount': pendingCount,
        'overallTotal': totalPaid + totalDue + totalPending,
      };
    });
  }

  static Future<List<Map<String, dynamic>>> aggregateWeekdayAttendance({
    required List<Map<String, dynamic>> attendanceRecords,
  }) async {
    return ComputeUtils.run(() {
      final weekdayMap = <int, int>{};
      final weekdayTotal = <int, int>{};

      for (final record in attendanceRecords) {
        final dayOfWeek = record['dayOfWeek'] as int;
        final isPresent = record['isPresent'] as bool;

        weekdayTotal[dayOfWeek] = (weekdayTotal[dayOfWeek] ?? 0) + 1;
        if (isPresent) {
          weekdayMap[dayOfWeek] = (weekdayMap[dayOfWeek] ?? 0) + 1;
        }
      }

      final result = <Map<String, dynamic>>[];
      for (int day = 0; day < 7; day++) {
        final present = weekdayMap[day] ?? 0;
        final total = weekdayTotal[day] ?? 0;
        result.add({
          'day': day,
          'present': present,
          'total': total,
          'percentage': total > 0 ? (present / total) * 100 : 0.0,
        });
      }
      return result;
    });
  }

  static Future<List<Map<String, dynamic>>> computeCourseProgress({
    required List<Map<String, dynamic>> assignments,
    required List<Map<String, dynamic>> exams,
  }) async {
    return ComputeUtils.run(() {
      final completed = assignments.where((a) => a['submitted'] == true).length;
      final totalAssignments = assignments.length;
      final avgExamScore = exams.isEmpty
          ? 0.0
          : exams.fold<num>(0, (s, e) => s + (e['score'] as num? ?? 0)) / exams.length;
      final maxExamScore = exams.isEmpty
          ? 0.0
          : exams.map((e) => (e['maxScore'] as num? ?? 0).toDouble()).reduce((a, b) => a > b ? a : b);

      return [
        {'label': 'Assignments Completed', 'value': completed.toDouble(), 'total': totalAssignments.toDouble()},
        {'label': 'Average Exam Score', 'value': avgExamScore.toDouble(), 'total': maxExamScore},
      ];
    });
  }
}
