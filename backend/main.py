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
    print(request.get_json())
    request_json = request.get_json(silent=True)
    request_args = request.args

    start_id = request_json['startId']
    end_id = request_json['endId']

    graph, edges_dict = direction.load_data("../data")

    path = direction.find_shortest_path(start_id, end_id, graph, edges_dict)

    return path
