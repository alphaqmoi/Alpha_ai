import pytest
import json
import subprocess

def test_qmoi_infer_runs():
    result = subprocess.run(['python', 'qmoi_infer.py'], capture_output=True, text=True)
    assert result.returncode == 0

def test_qmoi_infer_output():
    # Simulate input and check output
    process = subprocess.Popen(['python', 'qmoi_infer.py'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    input_data = json.dumps({"asset_value": 1.0, "open_trades": []}) + '\n'
    stdout, _ = process.communicate(input=input_data)
    assert 'symbol' in stdout or 'recommendation' in stdout
