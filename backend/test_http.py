from main import find_direction
import json

def test_valid():
    path = find_direction({
        "startId": "10",
        "endId": "7",
    })

    assert len(path) is not None
    