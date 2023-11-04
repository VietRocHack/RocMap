from main import find_direction
import json
from unittest.mock import Mock

def test_valid():
    path = find_direction(Mock(get_json=Mock(return_value={
        "startId": "3",
        "endId": "11",
    })))

    print(path)

    assert len(path) is None

    