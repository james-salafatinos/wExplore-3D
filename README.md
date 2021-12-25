Welcome to wExplore-3D
=================

Set up your `config.json`

-------------------
## Usage
```
py utils/wScrape.py Tom_Corbett_Space_Cadet --write_to 'data.gexf'
py utils/embed.py data/data.gexf --write_to 'data.json'
npm start
```

Todo
[ ] Update the API CLI to enable scraping multiple levels (right now it only scrapes one)
[ ] Update CSS3D spawned web pages to be dynamically associated to the node (looking at the label and the label name for the URL component)
[ ] Update Readme for installation
[ ] Update socket connection to not paste an object at every time step but rather move the player around
[ ] Update ability to fly to a node and press a key to pull up some shared collaboration platform (i.e., notion.so, google doc, etc., for real time meta collaboration)
[ ] Ensure requirements.txt is pristine
[ ] Ensure package.json is pristine, and package-lock.json is not in file upload

Visual/Interaction:
[ ] Edge bundling: Filter the number of edges so we don't have to render as many nodes
[ ] Attribute information showing
    - To be able to pass in an object of attributes via the .explore graph viz file format, and then the wExplore world show the attributes on command. Example: fly up to a node, press KeyV and then it pulls up a little text window of the attributes shown.
[X] Internal Wikipedia iframe
    - //https://github.com/mrdoob/three.js/blob/master/examples/css2d_label.html
[X] Spinning grid below the visual with a hologram