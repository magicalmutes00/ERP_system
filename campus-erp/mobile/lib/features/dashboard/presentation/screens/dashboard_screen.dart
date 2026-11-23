import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/init/init_provider.dart';
import '../../../../core/services/data_compute_service.dart';
import '../../../../core/services/sync_service.dart';

final dashboardStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final cache = ref.read(cacheServiceProvider);
  if (cache != null && cache.has('dashboard_stats')) {
    final cached = await cache.get<Map<String, dynamic>>('dashboard_stats');
    if (cached != null) return cached;
  }

  final stats = await DataComputeService.computeFeeSummary(
    feeRecords: [
      {'status': 'paid', 'amount': 25000},
      {'status': 'paid', 'amount': 25000},
      {'status': 'due', 'amount': 15000},
      {'status': 'pending', 'amount': 10000},
    ],
  );

  final attendance = await DataComputeService.computeAttendancePercentage(
    present: 42,
    total: 48,
  );

  final gradeDist = await DataComputeService.computeGradeDistribution(
    marks: [85, 72, 91, 65, 78, 88, 95, 70, 60, 82],
    thresholds: [90, 80, 70, 60, 0],
    grades: ['A', 'B', 'C', 'D', 'F'],
  );

  final result = <String, dynamic>{
    'feeSummary': stats,
    'attendance': attendance,
    'gradeDistribution': gradeDist,
  };

  await cache?.put('dashboard_stats', result);
  return result;
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final statsAsync = ref.watch(dashboardStatsProvider);
    final initAsync = ref.watch(initializationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          if (initAsync.valueOrNull?.syncService != null)
            IconButton(
              icon: const Icon(Icons.sync),
              onPressed: () {
                initAsync.valueOrNull!.syncService.syncAll({
                  SyncOperation.fetchAttendance: () => '{"data":[]}',
                  SyncOperation.fetchCourses: () => '{"data":[]}',
                  SyncOperation.fetchExams: () => '{"data":[]}',
                  SyncOperation.fetchFees: () => '{"data":[]}',
                });
              },
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _handleLogout(context, ref),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: theme.colorScheme.primaryContainer,
                      child: Icon(
                        Icons.person,
                        color: theme.colorScheme.onPrimaryContainer,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome back!',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Student',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Quick Overview',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: statsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Error: $e')),
                data: (stats) => GridView.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  children: [
                    _StatCard(
                      icon: Icons.calendar_today,
                      label: 'Attendance',
                      value: '${(stats['attendance'] as num).toStringAsFixed(1)}%',
                      color: Colors.blue,
                    ),
                    _StatCard(
                      icon: Icons.assignment,
                      label: 'Assignments',
                      value: '3',
                      color: Colors.green,
                    ),
                    _StatCard(
                      icon: Icons.book,
                      label: 'Courses',
                      value: '6',
                      color: Colors.orange,
                    ),
                    _StatCard(
                      icon: Icons.payments,
                      label: 'Fees',
                      value: '${(stats['feeSummary'] as Map)['paidCount']} Paid',
                      color: Colors.purple,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleLogout(BuildContext context, WidgetRef ref) async {
    const storage = FlutterSecureStorage();
    await storage.deleteAll();
    ref.invalidate(initializationProvider);
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
