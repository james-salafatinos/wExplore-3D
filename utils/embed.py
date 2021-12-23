
import networkx as nx
from fa2 import ForceAtlas2
import pandas as pd
from matplotlib import cm
import numpy as np
import argparse
from networkx.readwrite import json_graph
import json

parser = argparse.ArgumentParser(
    description='An custom graph aesthetic generator  @james-salafatinos on Github.')
parser.add_argument("gexf_file", help="Starting wikipedia page title")
parser.add_argument(
    "--write_to", help="Controls writing to JSON", default='data.json')
args = parser.parse_args()


def loadGEXF(gexf_file):
    G = nx.read_gexf(gexf_file)
    return G


def compute_embeddings(G):
    print('Computting embeddings...')
    forceatlas2 = ForceAtlas2(
        # Behavior alternatives
        outboundAttractionDistribution=False,  # Dissuade hubs
        linLogMode=False,  # NOT IMPLEMENTED
        adjustSizes=False,  # Prevent overlap (NOT IMPLEMENTED)
        edgeWeightInfluence=1.0,

        # Performance
        jitterTolerance=1.0,  # Tolerance
        barnesHutOptimize=True,
        barnesHutTheta=1.2,
        multiThreaded=False,  # NOT IMPLEMENTED

        # Tuning
        scalingRatio=7.0,
        strongGravityMode=False,
        gravity=.2,

        # Log
        verbose=True)

    positions = forceatlas2.forceatlas2_networkx_layout(
        G, pos=None, iterations=100)

    return positions


def normalize(a):
    """
    Noramlize an array:: min/max method
    """
    amin, amax = min(a), max(a)
    for i, val in enumerate(a):
        # Avoid division by zero
        try:
            a[i] = (val-amin) / (amax-amin)
        except:
            a[i] = .1
            print('Tried to divide by zero')
    return a


def get_page_rank_and_colors(G):
    """
    Takes a networkx Graph and returns the color by page rank dictionary by node.
    Ex: {'FL Studio':0.0031,
         'DAW': 0.0001}

    Page rank will always add up to 1 for the entire array.
    """
    print('Getting node color and size maps....')

    PR = nx.algorithms.link_analysis.pagerank_alg.pagerank(G)
    list_of_PR = pd.Series(PR).sort_values()
    color_values_from_PR = normalize(list_of_PR)

    cmap = cm.get_cmap('winter_r', 12)

    node_color_map = {}
    size_map = {}

    for k, v in dict(color_values_from_PR).items():
        rgba = list(map((lambda x: int(x*255//1)), [*cmap(v)]))
        rgba_str = f'rgb({rgba[0]},{rgba[1]},{rgba[2]})'
        node_color_map[k] = rgba_str
        size_map[k] = max(1, 1 + np.log1p(v*100))

    return node_color_map, size_map


def convert_one_node(color_map, size_map, label='default', x=0, y=0, z=0, _id=0, attributes={}):
    _dict = {
        "label": label,
        "x": x,
        "y": y,
        "z": z,
        "id": _id,
        "attributes": attributes,
        "color": color_map[label],
        "size": size_map[label],
    }
    return _dict


def convert_one_edge(source='default', target='default', _id=0, attributes={}, color="rgb(192,192,192)", size=1):
    _dict = {
        "source": source,
        "target": target,
        "id": _id,
        "attributes": attributes,
        "color": color,
        "size": size,
    }
    return _dict


def synthesize(G, embeddings, color_map, size_map, attributes=0):
    json_G = json_graph.node_link_data(G)

    nodes = []
    edges = []

    for node in json_G['nodes']:
        x, y = embeddings[node['id']]
        converted_node = convert_one_node(label=node['label'],
                                          x=x,
                                          y=y,
                                          z=0,
                                          _id=node['id'],
                                          color_map=color_map,
                                          size_map=size_map)
        nodes.append(converted_node)
    for edge in json_G['links']:
        converted_edge = convert_one_edge(source=edge['source'],
                                          target=edge['target'],
                                          _id=edge['id'])
        edges.append(converted_edge)

    return {'nodes': nodes, 'edges': edges}


def write_to_json(payload, output_location):
    print('✏️  - Writing to .JSON format...')
    with open('./data/' + args.write_to, 'w', encoding='utf-8') as f:
        json.dump(payload, f)

    return None


if __name__ == "__main__":

    G = loadGEXF(args.gexf_file)
    embeddings = compute_embeddings(G)
    color_map, size_map = get_page_rank_and_colors(G)
    payload = synthesize(G, embeddings, color_map, size_map)
    write_to_json(payload, 'data.json')
