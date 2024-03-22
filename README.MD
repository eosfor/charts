# Overview

The repo contains an attempt to make a tool to help analyze and visualize traffic flows, coming through Azure FW and logged into Log Analytics. It uses PowerShell for data extraction and processing, d3js for visualization all plugged into .NET Interactive notebooks.

The HTML folder contains the HTML version of it. To use it you just need to run a script and provide your `WorkspaceID`. It will execute a query, process it and create a `csv` file. Then you could use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extention in your VS code to open the html file and see the visualization

> NOTE: the GUID you see in the notebook is just a random GUID ;). Just to show where to plug your own stuff
