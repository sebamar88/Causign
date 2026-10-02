"""Deterministic standard-library protocol fixture, not a Python SDK.
Only fake lookup effects. stdout is JSONL; diagnostics use stderr.
"""
import datetime
import json
import sys

sequence = 0
run_id = None
pending = None
terminal = False

def emit(kind, payload, **extra):
    global sequence
    sequence += 1
    message = dict(protocol='causign/1', id='python:' + str(sequence),
                   timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                   type=kind, payload=payload, **extra)
    print(json.dumps(message, allow_nan=False), flush=True)
    return message

for line in sys.stdin:
    try:
        message = json.loads(line)
        kind = message['type']
        if kind == 'hello':
            emit('adapter.ready', dict(adapter=dict(name='python-stdlib-fixture', version='0.1.0'),
                 supportedVersions=['causign/1'], capabilities=['observe.output', 'observe.toolRequests',
                 'observe.toolExecution', 'observe.toolResults', 'observe.toolRejections', 'intercept.tools', 'control.cancel']), correlationId=message['id'])
        elif kind == 'configure':
            emit('adapter.configured', {}, correlationId=message['id'])
        elif kind == 'run.start':
            run_id = message['runId']
            emit('run.started', {}, runId=run_id, correlationId=message['id'])
            selected = any(m['name'] == 'lookup' for m in message['payload']['interceptions'])
            pending = emit('tool.requested', dict(name='lookup', input=message['payload']['input'], intercepted=selected), runId=run_id, operationId='lookup:1')
            if not selected:
                emit('tool.started', dict(name='lookup'), runId=run_id, operationId='lookup:1')
                emit('tool.completed', dict(name='lookup', output={'customer': 'Fake'}, execution='real'), runId=run_id, operationId='lookup:1')
                emit('run.completed', dict(output={'customer': 'Fake'}), runId=run_id)
                terminal = True
        elif kind == 'run.cancel' and not terminal:
            terminal = True
            emit('run.cancelled', message['payload'], runId=run_id, correlationId=message['id'])
        elif kind in ('tool.mock', 'tool.proceed', 'tool.reject') and not terminal:
            if not pending or message['correlationId'] != pending['id'] or message['operationId'] != pending['operationId'] or message['runId'] != run_id:
                raise ValueError('Invalid decision correlation')
            if kind == 'tool.mock':
                response = message['payload']['response']
                if response['kind'] == 'result':
                    emit('tool.completed', dict(name='lookup', output=response['value'], execution='mock'), runId=run_id, operationId='lookup:1')
                    emit('run.completed', dict(output=response['value']), runId=run_id)
                else:
                    emit('tool.failed', dict(name='lookup', error=dict(message='Mock error', details=response['value']), execution='mock'), runId=run_id, operationId='lookup:1')
                    emit('run.failed', dict(error=dict(message='Mock error')), runId=run_id)
            elif kind == 'tool.proceed':
                emit('tool.started', dict(name='lookup'), runId=run_id, operationId='lookup:1')
                emit('tool.completed', dict(name='lookup', output={'customer': 'Fake'}, execution='real'), runId=run_id, operationId='lookup:1')
                emit('run.completed', dict(output={'customer': 'Fake'}), runId=run_id)
            else:
                emit('tool.rejected', dict(name='lookup', **message['payload']), runId=run_id, operationId='lookup:1')
                emit('run.failed', dict(error=dict(message='Rejected')), runId=run_id)
            pending = None
            terminal = True
    except Exception as error:
        print(str(error), file=sys.stderr, flush=True)
        if run_id and not terminal:
            emit('run.errored', dict(error=dict(message=str(error))), runId=run_id)
        break
