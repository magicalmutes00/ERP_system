import 'package:flutter_test/flutter_test.dart';
import 'package:campus_erp/app/app.dart';

void main() {
  testWidgets('App renders splash screen on start', (WidgetTester tester) async {
    await tester.pumpWidget(const CampusERPApp());
    expect(find.text('CampusERP'), findsOneWidget);
  });
}
