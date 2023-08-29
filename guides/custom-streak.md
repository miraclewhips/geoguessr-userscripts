# Custom Streak Script

You can create your own GeoJSON polygons using the website: https://geojson.io/

## Basic Example

### Step 1

Use the Draw Polygon tool to draw a new polygon on the map. Click on the first point you added to close the shape when you are finished. You can draw as many polygons as you want.

![](https://i.imgur.com/2zvBTzz.jpg)

### Step 2

Click on the polygon once you have created it and add a new field with `name` on the left and the name of the region on the right. This is the name that will display in-game.

![](https://i.imgur.com/8OoFEX8.jpg)

### Step 3

Click the button in the top right to copy the GeoJSON code to your clipboard.

![](https://i.imgur.com/6c655Jl.jpg)

### Step 4

Edit the GeoGuessr Custom Streaks userscript and replace the `null` (shown below) with the GeoJSON code you just copied. Save the userscript once you are done. It should now use the regions you created for the streaks.

![](https://i.imgur.com/ae8Izos.jpg)