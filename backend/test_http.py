from main import find_direction
import json
from unittest.mock import Mock


def test_valid():
    path = find_direction(
        Mock(
            get_data=Mock(
                return_value=json.dumps(
                    {
                        "startId": "6",
                        "endId": "15",
                        "weather": 0,
                    }
                )
            )
        )
    )

    print(path)
    for p in path[0]["response"]:
        print(p["image"])

    assert len(path) is None
