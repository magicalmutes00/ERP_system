import 'dart:isolate';
import 'dart:async';

/// A persistent isolate worker for executing multiple tasks over time
/// without spawning a new isolate for each call.
///
/// Communication is done via [SendPort]/[ReceivePort] message passing.
class IsolateWorker {
  SendPort? _sendPort;
  Isolate? _isolate;
  final ReceivePort _controlPort = ReceivePort();
  final Map<int, Completer<dynamic>> _completers = {};
  int _nextId = 0;

  /// Spawns the background isolate.
  Future<void> start() async {
    _isolate = await Isolate.spawn(
      _entryPoint,
      _controlPort.sendPort,
    );
    final sendPortFuture = _controlPort
        .firstWhere((message) => message is SendPort)
        .then((message) => message as SendPort);
    _controlPort.listen(_handleMessage);
    _sendPort = await sendPortFuture;
  }

  /// Sends a [task] to the worker isolate and returns the result.
  Future<R> execute<R, P>({
    required String task,
    required P params,
  }) async {
    final id = _nextId++;
    final completer = Completer<R>();
    _completers[id] = completer;
    _sendPort!.send(_TaskMessage(id: id, task: task, params: params));
    return completer.future;
  }

  void _handleMessage(dynamic message) {
    if (message is _ResultMessage) {
      final completer = _completers.remove(message.id);
      if (message.error != null) {
        completer?.completeError(message.error!);
      } else {
        completer?.complete(message.result);
      }
    }
  }

  /// Kills the background isolate and releases resources.
  void dispose() {
    _controlPort.close();
    _isolate?.kill();
    _completers.clear();
  }

  /// The isolate entry point.
  static void _entryPoint(SendPort controlSendPort) {
    final receivePort = ReceivePort();
    controlSendPort.send(receivePort.sendPort);

    receivePort.listen((message) {
      if (message is _TaskMessage) {
        try {
          final result = _dispatchTask(message.task, message.params);
          controlSendPort.send(_ResultMessage(
            id: message.id,
            result: result,
            error: null,
          ));
        } catch (e) {
          controlSendPort.send(_ResultMessage(
            id: message.id,
            result: null,
            error: e,
          ));
        }
      }
    });
  }

  static dynamic _dispatchTask(String task, dynamic params) {
    switch (task) {
      case 'parseJson':
        return _parseJsonTask(params as String);
      case 'filterList':
        return _filterListTask(params as Map<String, dynamic>);
      default:
        throw UnsupportedError('Unknown task: $task');
    }
  }

  static dynamic _parseJsonTask(String json) {
    return json;
  }

  static dynamic _filterListTask(Map<String, dynamic> params) {
    final list = params['list'] as List<dynamic>;
    final predicate = params['predicate'] as String;
    return list.where((item) => item.toString().contains(predicate)).toList();
  }
}

class _TaskMessage {
  final int id;
  final String task;
  final dynamic params;
  _TaskMessage({required this.id, required this.task, required this.params});
}

class _ResultMessage {
  final int id;
  final dynamic result;
  final Object? error;
  _ResultMessage({required this.id, this.result, this.error});
}
