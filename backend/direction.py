import json
from heapq import heapify, heappush, heappop
import requests


def load_data(data_dir):
    # nodes_file = open(f"{data_dir}/nodes.json")
    # edges_file = open(f"{data_dir}/edges.json")

    nodes_response = requests.get(
        "https://raw.githubusercontent.com/goodudetheboy/RocMap/data/data/nodes.json"
    )

    edges_response = requests.get(
        "https://raw.githubusercontent.com/goodudetheboy/RocMap/data/data/edges.json"
    )

    halls_response = requests.get(
        "https://raw.githubusercontent.com/goodudetheboy/RocMap/data/data/halls.json"
    )
    nodes = nodes_response.json()
    edges = edges_response.json()
    halls = halls_response.json()

    edges_dict = {}
    halls_dict = {}

    graph = {}

    for node in nodes:
        graph[node["id"]] = []

    for edge in edges:
        start_node = edge["startId"]
        edge_id = edge["id"]
        graph[start_node].append(edge_id)
        edges_dict[edge["id"]] = edge

    for hall in halls:
        halls_dict[hall["id"]] = hall

    return (graph, edges_dict, halls_dict)


def find_shortest_path(
    start_door_id,
    end_hall_id,
    graph,
    edges_dict,
    halls_dict,
    weather,
):
    heap = []
    print(halls_dict)
    if start_door_id in halls_dict[end_hall_id]["doors"]:
        return []

    for edge_id in graph[start_door_id]:
        heap.append((get_weighted_distance(edges_dict[edge_id], weather), [edge_id]))

    heapify(heap)
    seen = set()
    while len(heap) != 0:
        top = heappop(heap)
        dist = top[0]
        path = top[1]
        cur_id = edges_dict[path[0]]["endId"]
        if cur_id in halls_dict[end_hall_id]["doors"]:
            return top

        for edge_id in graph[cur_id]:
            if edge_id in seen:
                continue
            seen.add(edge_id)
            new_path = list(path)
            new_path.insert(0, edge_id)
            heappush(
                heap,
                (dist + get_weighted_distance(edges_dict[edge_id], weather), new_path),
            )

    return []


n_weights = [2, 5, 10, 15]
p_weights = [0.1, 0.5, 0.75, 1]


# 0, 1, 2, 3, 4 mode of weather
def get_weighted_distance(edge, w):
    og = edge["distance"]
    weather = min(3, w)
    if weather == 0 or "isInside" in edge and edge["isInside"] is True:
        return og
    if og <= 20:
        return og + n_weights[weather]
    return og * (1 + p_weights[weather])
