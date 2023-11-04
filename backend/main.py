import functions_framework
import direction


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
    request_json = request.get_json(silent=True)

    start_id = request_json["startId"]
    end_id = request_json["endId"]

    graph, edges_dict = direction.load_data("../data")

    path = direction.find_shortest_path(start_id, end_id, graph, edges_dict)

    detailed_path = get_detailed_path(path, edges_dict)

    return detailed_path


def get_image_url(raw):
    return f"https://firebasestorage.googleapis.com/v0/b/rocmap.appspot.com/o/images%2F{raw}?alt=media"


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
