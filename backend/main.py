import functions_framework
import direction
import json
import os

headers = {"Access-Control-Allow-Origin": "*"}

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


@functions_framework.http
def find_direction(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
        <https://flask.palletsprojects.com/en/1.1.x/api/#flask.make_response>.
    """
    body_data = request.get_data()
    request_json = json.loads(body_data)

    start_door_id = request_json["startDoorId"]
    end_hall_id = request_json["endHallId"]
    weather = 0 if "weather" not in request_json else request_json["weather"]

    graph, edges_dict, halls_dict = direction.load_data(DATA_DIR)

    path = direction.find_shortest_path(
        start_door_id,
        end_hall_id,
        graph,
        edges_dict,
        halls_dict,
        weather,
    )

    detailed_path = get_detailed_path(path, edges_dict)

    return ({"response": detailed_path}, 200, headers)


def get_image_url(raw):
    return f"/images/{raw}"


def get_detailed_path(path, edges_dict):
    detailed_path = []
    for edge_id in path[1]:
        edge = edges_dict[edge_id]
        edge_data = {}
        edge_data["dist"] = edge["distance"]
        edge_data["image"] = get_image_url(edge["image"])
        if "textDescription" in edge:
            edge_data["textDescription"] = edge["textDescription"]
        detailed_path.append(edge_data)

    return detailed_path
