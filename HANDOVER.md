# Handover: running this project with Claude

This guide is for someone who doesn't write code. You do every task by
**copying a prompt below into Claude Code** (opened in this project's folder)
and answering Claude's questions. Claude already knows how the project works
(from `CLAUDE.md` and `README.md`).

**Ground rules**

- Do one prompt at a time, and wait until Claude says it's finished.
- Replace anything in `<angle brackets>` with your own text, for example a file path.
- If Claude asks you to approve a command or a file change, read its one-line
  explanation and approve it. If you're unsure, ask: *"What does this do, in plain words?"*
- If something goes wrong, use **Prompt 9 (Something is broken)**.
- Nothing you do here is final until you **save it (Prompt 8)**. Before then,
  *"Undo everything you changed since my last save"* takes you back.

**Tip:** to find a file's path, drag the file into the Claude window. Its path
gets pasted in.

---

## 0. First time on a new computer

```
I'm not a developer. Check that this computer is ready to run this project:
Node.js 20 or newer must be installed, then run npm install. If anything is
missing, tell me exactly what to download and click, step by step.
Finish by confirming the project builds.
```

## 1. Look at the site

```
Start the website on this computer and give me the link to open in my browser.
Leave it running.
```

To stop it later: *"Stop the website."*

---

## 2. Replace the project with a new one

You'll get one of these from the client or designer. Pick the prompt that
matches what you have.

### 2a. You have an SVG-editor backup (a `.json` file with the images inside)

This is the easiest case.

```
I want to replace the current project with a new one. The new SVG-editor
backup file is at: <path to the .json file>

1. First archive the current project: move data/project.json and its images
   folder in public/projects/ into archive/<old project name>/. Don't delete them.
2. Then import the new file with npm run import-editor.
3. Tell me in plain words how many scenes, plots and pins were imported, and
   list any problems.
Don't touch anything else yet.
```

### 2b. You have a `project.json` file plus a folder of images

```
I want to replace the current project with a new one. I have a project file
at <path to project.json> and its images in <path to images folder>.

1. Archive the current project: move data/project.json and its images folder
   in public/projects/ into archive/<old project name>/. Don't delete them.
2. Copy the images into public/projects/<new project name>/, converting them to
   WebP at most 4000 px wide if they aren't already.
3. Put the new project file in data/project.json and fix the image paths
   and sizes so they match.
4. Check the file against lib/schema.ts and tell me in plain words about
   anything wrong or missing.
```

### 2c. You only have images, no shapes

The plots need drawing first, and Claude can't do that for you. Ask the designer
to draw them in the SVG editor and send you the backup (2a). Alternatively, ask
for an SVG of the plots and use **Prompt 6**.

---

## 3. Add the details from an Excel sheet

Use this for titles, statuses, prices, plot areas and card text.

```
Here is an Excel file with the plot details: <path to .xlsx>

Read it and, BEFORE changing anything, show me a simple table:
- which column you'll use to match each row to a plot on the map,
- what each other column will become (status, a number like area/price,
  a line on the details card, the card title, ...),
- rows that don't match any plot, and plots that have no row.
Wait for me to say OK. Then update data/project.json, keeping all shapes
exactly as they are. Add any statuses or number fields you used to
"categories" and "values" with sensible labels and units.
```

If the matching looks wrong, tell Claude something like: *"The plot numbers are
in column C, and A-2 in the sheet is A-002 on the map."*

## 4. Name, colours and statuses

```
Set the project name to "<name>" and the brand colour to <colour, e.g. #0f766e
or "dark green">. Give the statuses these colours: available = green,
reserved = orange, sold = red. Show me the result on the site.
```

## 5. Change a few details

```
On the <scene name, e.g. Zone 1> map, change plot <plot id or name>:
<what to change, e.g. status to sold, price to 3,200,000, add a line
"View: Park" to its card>.
```

```
Add a pin called "<label>" on the <scene name> map at <describe where, or
give x/y in percent of the image>, with this description: "<text>".
```

## 6. Line up plots drawn in Figma/Illustrator (Align SVG)

```
I have an SVG of the plots for the <scene name> map at <path to .svg>.
Start the site, then explain step by step how I use the "Align SVG" switch
to line it up. When I paste you the copied hotspots, add them to that scene
and help me give them proper ids and labels.
```

## 7. Check everything before handing over

```
Check the project is ready to hand over:
1. Run lint, type-check and build.
2. List any data problems in project.json (wrong links, points outside the
   image, missing images, plots without a status).
3. Start the site and tell me which pages to click through to check it myself.
Explain any problem in plain words and offer to fix it.
```

## 8. Save your work

```
Save my changes in git with a clear message describing what I changed today.
If this project has a remote repository set up, tell me and ask before pushing.
```

Putting the site online depends on where it's hosted. Ask the developer how
this is done for this client, then add the steps here.

## 9. Something is broken

```
Something is wrong: <describe what you see, e.g. "the Zone 1 map is blank" or
"clicking a plot does nothing">. Find out why, explain it in plain words, and
fix it. Don't change the shapes unless I agree.
```

```
Undo everything you changed since my last save.
```

## 10. Bring back an old project

```
Restore the archived project "<name>" from archive/: archive the current
project first in the same way, then put the old project.json and images
back. Start the site so I can check it.
```

---

## For whoever maintains this guide

The prompts rely on `CLAUDE.md` (the rules Claude follows) and `README.md`
(the data format). If you change how projects are imported, update the
prompts here too.
