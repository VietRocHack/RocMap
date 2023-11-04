from heapq import heapify, heappush, heappop

prefer_inside = True


def custom_compare(a, b):
    if prefer_inside and a[0] != b[0]:
        return -1 if a[0] is True else 1
    if a[1] == b[1]:
        return 0
    return -1 if a[1] < b[1] else 1


heap = [(False, 10), (True, 5), (False, 10), (True, 2)]

heapify(heap, custom_compare)

print(heap)
