from main import find_direction
import json
from unittest.mock import Mock


def test_valid():
    path = find_direction(
        Mock(
            get_json=Mock(
                return_value={
                    "startId": "10",
                    "endId": "12",
                }
            )
        )
    )

    print(path)
    for p in path:
        print(p["image"])

    assert len(path) is None