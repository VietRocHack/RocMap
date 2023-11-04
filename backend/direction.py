import json
from heapq import heapify, heappush, heappop


def load_data(data_dir):
    nodes_file = open(f'{data_dir}/nodes.json')
    edges_file = open(f'{data_dir}/edges.json')

    nodes = json.load(nodes_file)
    edges = json.load(edges_file)

    edges_dict = {}

    graph = {}

    for node in nodes:
        graph[node["id"]] = []

    for edge in edges:
        start_node = edge["startId"]
        edge_id = edge["id"]
        graph[start_node].append(edge_id)
        edges_dict[edge["id"]] = edge
    
    return (graph, edges_dict)


def find_shortest_path(start_id, end_id, graph, edges_dict):
    start_path = []
    heap = [] 

    for edge_id in graph[start_id]:
        heap.append((edges_dict[edge_id]["distance"], [edge_id]))

    heapify(heap)

    while len(heap) != 0:
        top = heappop(heap)
        dist = top[0]
        path = top[1]
        cur_id = edges_dict[path[0]]["endId"]
        if cur_id == end_id:
            return top

        for edge_id in graph[cur_id]:
            new_path = list(path)
            new_path.insert(0, edge_id)
            heappush(heap, (dist + edges_dict[edge_id]["distance"], new_path))

        
    return []

    
    

