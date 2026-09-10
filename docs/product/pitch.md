# RocMap — Devpost pitch

Original submission: https://devpost.com/software/rocmap

## Inspiration

We realize that numerous visitors, including first-year students, encounter
difficulties navigating routes around the campus. And even Google Maps often fails
to pinpoint the precise intersections, or tunnels inside halls and buildings. Our
team members had come up with the idea of developing a web application designed to
help navigate better between halls on campus.

## What it does

RocMap takes data of the starting and ending points from user's input and creates
the most optimal route map, with images and instructions included, to navigate
users to their desired destinations. It also calculates the distance and time
depending on the weather conditions, thereby suggesting the shortest and most
efficient path to get there.

## How we built it

We created data points replicating the map of the U of R's Eastman Quad and its
tunnel map. We manually represent each intersection as a node and connect them with
each other. For each connection between point A and point B, we store the distance
between them and an image representing a general direction that guides the user to
go from A to B. These nodes and connections come together as a graph, which we then
run Dijkstra's algorithm on to find the shortest path between two locations. We
output a step-by-step image instruction, and display them on our web app. To handle
the weather feature, we apply a calibrated weighted function for each connection,
and this results in the algorithm choosing to use the tunnels to navigate if the
weather outside is reported to be too bad (raining or snowing heavily).

## Challenges we ran into

In terms of algorithms, we were facing a problem of calculating the most efficient
path when a factor like weather condition comes in. Also, we had to make sure that
the website's UI/UX is intuitive and straightforward, avoiding any potential user
confusion.

## Accomplishments that we're proud of

We are proud that we have created a realistic web application navigating people to
their wanted destination on campus.

## What we learned

We learned how to connect front-end, back-end, and database to design a web
application, improving users' experience.

## What's next for RocMap

Considering the existing campus route map and the project's potential, there is an
opportunity for further expansion by incorporating additional data points
pertaining to campus intersections and facilities. This concept can also be
extended to the creation of similar maps for various locations or universities.

## Post-hackathon: permanent home

RocMap is now re-hosted under the VietRocHack team's own infrastructure at
`rocmap.vietrochack.com`, instead of relying on individual teammates' personal
cloud projects — see [`docs/adr/0001-deploy-topology.md`](../adr/0001-deploy-topology.md).
