# Standalone version of descript

This version is dedicated to generate glyphs from a pivot JSON structure made using the online app. 
These files are obtained by clicking on the save button at the top of the system, in its black stripe. They can then be loaded by adding them to the "examples" sub-directory, and edit its url in line 1 of "main.js".


This demonstration can be run locally by launching the following command:


```bash
python3 -m http.server
```


The tool will be available at [http://localhost:8000/demo.html](http://localhost:8000/demo.html) in your browser.

This should display an svg in which glyphs are randomly scattered.