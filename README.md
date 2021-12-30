# Welcome to wExplore-3D

## What is it?
wExplore is a system of tools designed to browse wikipedia and other dense networks in a more interesting way.

Use it on:
1. Wikipedia topics
2. Social networks
3. Citation links
4. Codebase analysis
=================

## Usage

Inclusive of:
1. Set up your `workspace` with the `config.json` file
    - Choose your filepath(s) and graph name(s)
    - (Optional) Embed multiple graphs with separate origins in the 3D world
2. Procure an observable graph in the correct format
    ```
    py utils/wScrape.py Tom_Corbett,_Space_Cadet --write_to 'data_test.gexf'
    py utils/embed.py data/data.gexf --write_to 'data_test.json'
    npm start
    ```
    (Optional) Running a different version of Python installed on your system, for example, Python3.7 usage:
    ```
    C:\Users\jsalafatinos\AppData\Local\Programs\Python\Python37\python.exe utils/wScrape.py Tom_Corbett,_Space_Cadet --write_to 'data_test.gexf'
    ```


## Features
1. Drag and drop common JSONs to render any graph
2. Integration with custom wikipedia scraping API
3. Integration with ForceAtlas2 Layout computation
4. 3D Web based interface and layout
5. GPU rendered graphics in the browser (ability to view medium to large graphs)


## Todo
[ ] Update CSS3D spawned web pages to be dynamically associated to the node (looking at the label and the label name for the URL component)
[ ] Modularize the code
[ ] Update the API CLI to enable scraping multiple levels (right now it only scrapes one)
[ ] Create an API for ForceAtlas2
[ ] Update Readme for installation
[ ] Update socket connection to not paste an object at every time step but rather move the player around
[ ] Update ability to fly to a node and press a key to pull up some shared collaboration platform (i.e., notion.so, google doc, etc., for real time meta collaboration)
[ ] Ensure requirements.txt is pristine
[ ] Ensure package.json is pristine, and package-lock.json is not in file upload
[X] Add GUI controls for graph edge and node filtering and fly speed
[ ] Edge bundling: Filter the number of edges so we don't have to render as many nodes
[ ] Attribute information showing
    - To be able to pass in an object of attributes via the .json graph viz file format, and then the wExplore world show the attributes on command. Example: fly up to a node, press KeyV and then it pulls up a little text window of the attributes shown.
[X] Internal Wikipedia iframe
    - //https://github.com/mrdoob/three.js/blob/master/examples/css2d_label.html
[X] Spinning grid below the visual with a hologram