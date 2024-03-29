import requests
import argparse
import time
parser = argparse.ArgumentParser(
    description='A Wikipedia Scraper @james-salafatinos on Github.')
parser.add_argument("start_title", help="Starting wikipedia page title")
parser.add_argument(
    "--depth", help="Controls how many rounds link gathering (O^2N)", type=int, default=1)
parser.add_argument(
    "--pllimit", help="Controls how many links to return from a page (< = more API requests)", type=int, default=500)
parser.add_argument(
    "--write_to", help="Controls writing to GEXF", default='data.gexf')
args = parser.parse_args()

# Setup
baseURL = "https://en.wikipedia.org/w/api.php?"
num_requests = 0
db = {}
depth = args.depth
params = {
    'action': "query",
    'format': "json",
    'prop': 'links',
    'pllimit': args.pllimit,
    'plnamespace': 0,
    'ascii': 2,
    'titles': args.start_title,
}


def buildURL(params, baseURL, continue_token):
    """
    Takes API params and baseURL and concatenates to query string
    """
    url = baseURL

    if continue_token:
        params['plcontinue'] = continue_token

    for k in params:
        url += "&"+k+"="+str(params[k])
    print(f'⚙️  - Building URL... ', url)
    return url


def makeRequest(url):
    global num_requests
    """
    Makes simple JSON request to API
    https://www.mediawiki.org/wiki/API:Backlinks
    """

    print(
        f'📡 - Requesting... (Request: ({params["titles"]}), Total Requests So Far: {num_requests})')
    num_requests += 1

    # Request
    r = requests.get(url)
    res = r.json()
    return res


def checkStop(json):
    """
    Checks if continue string is returned from wikipedia
    """
    stop = False

    try:
        if json['batchcomplete'] == '':
            print('🟢 - Batch Complete.')
            stop = True
    except:
        print("🟡 - Batch incomplete...")
    return stop


def getContinueToken(json):
    """
    Gets the continue token if it exists
    """
    token = ''
    try:
        token = json['continue']['plcontinue']
        print("➰ - Observing continue token...", token)
    except:
        "◼️ - Batch complete - No continue token"
    return token


def getTitles(json):
    """
    Pulls the link titles out into a list
    """
    titles = []
    self_pageID = list(json['query']['pages'].keys())[0]

    self_title = json['query']['pages'][self_pageID]['title']

    try:
        links = json['query']['pages'][self_pageID]['links']
    except:
        print("🔴 - Could not get links from getTitles(json)...")
        links = []
    for title in links:
        if ok(title):
            titles.append(title['title'])
        else:
            pass

    return self_title, titles


def ok(title):
    """
    Checks for stopwords to discard links
    """
    return "List of" not in str(title)


def store(db, self_title, titles):
    """
    Store in a dictionary database
    """
    db[self_title] = titles
    return None


def merge(db, self_title, titles):
    """
    Merges titles in a dictionary database
    """
    db[self_title] = db[self_title] + titles
    return None


def dropDuplicates(db, self_title):
    """
    Drops duplicate titles in a dictionary database
    """
    db[self_title] = list(set(db[self_title]))
    return None


def extract(self_title, continue_token=0):
    """
    Recursively iterates through page continues to extract all links on a page
    """

    res = makeRequest(buildURL(params, baseURL, continue_token))
    continue_token = getContinueToken(res)
    titles = getTitles(res)  # self_title, titles
    self_title = titles[0]

    # print("DB KEYS", db.keys())

    if self_title in db.keys():
        print(f"📑 - Merging... ({self_title}), ({len(titles[1])} titles)")
        merge(db, *titles)
        # print("MERGED", db)
    else:
        print(f"💾 - Storing... ({self_title}), ({len(titles[1])} titles)")
        store(db, *titles)
        # print("STORED", db)

    dropDuplicates(db, self_title)

    if checkStop(res):
        return None

    print('-------------------------------')
    return extract(self_title, continue_token)


def timeout():
    time.sleep(.3*3.141592635897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870992)


def second_run():
    limit = 2000
    counter = 0

    existing_db = db[list(db.keys())[0]]
    sorted_db = sorted(existing_db)
    for link in sorted_db:
        print('\n\n')
        print('🔁 - Second run...', link)
        params['titles'] = link
        if params.get('plcontinue') != None:
            del params['plcontinue']
        print(params)
        extract(link)

        if counter == limit:
            break
        else:
            counter += 1
            timeout()


def write_to_gexf(output_location):
    print('✏️  - Writing to .GEXF format...')
    global db
    import networkx as nx

    in_memory_tuples = []
    for entry in db:
        for value in db[entry]:
            in_memory_tuples.append((entry, value))

    G = nx.DiGraph()
    G.add_edges_from(in_memory_tuples)
    nx.write_gexf(G, output_location, encoding='utf-8', version='1.1draft')
    return None


if __name__ == "__main__":

    extract(args.start_title)
    second_run()

    if args.write_to:
        write_to_gexf("./data/" + args.write_to)
