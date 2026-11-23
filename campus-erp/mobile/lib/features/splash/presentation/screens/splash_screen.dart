import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/init/init_provider.dart';
import '../widgets/init_error_widget.dart';

class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final initAsync = ref.watch(initializationProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: Center(
        child: initAsync.when(
          loading: () => _buildLoading(theme),
          error: (e, _) => InitErrorWidget(
            message: e.toString(),
            onRetry: () => ref.invalidate(initializationProvider),
          ),
          data: (_) => _buildLoading(theme),
        ),
      ),
    );
  }

  Widget _buildLoading(ThemeData theme) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.school_rounded,
          size: 80,
          color: theme.colorScheme.primary,
        ),
        const SizedBox(height: 24),
        Text(
          'CampusERP',
          style: theme.textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(height: 32),
        CircularProgressIndicator(color: theme.colorScheme.primary),
        const SizedBox(height: 16),
        Text(
          'Initializing...',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
