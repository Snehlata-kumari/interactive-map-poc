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
- If Claude shows you a plan or a table and asks *"OK?"*, check it. Nothing is
  changed until you answer.
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

## 2. Set up a new project (step by step)

A new project usually comes as **two files**:

| File | What it holds | Example |
| --- | --- | --- |
| **SVG-editor backup** (`.json`) | the map images, the plot shapes, the links between maps, and the Excel plot details if you loaded the sheet in the editor | `new-project.json` |
| **Excel sheet** (`.xlsx`) | the plot details: status, type, area, price, bedrooms… | `new-project-plot-details.xlsx` |

Do steps **2A → 2E in order**, one prompt at a time. Each step ends with a
check, so a problem shows up at the step that caused it.

> **Excel loaded in the editor (easiest):** the import (2B) then also brings in
> the statuses, colours, numbers, filters and card details, and reports how many
> plots got data on each map. If every plot map got its data, **skip 2C and 2D**
> and go to 2E.
>
> **Excel not in the editor, or rows that didn't match:** the import brings in
> only shapes and images, and those plots show **grey**. That's expected. The
> data then comes from the Excel sheet in 2C and 2D.

### 2A. Look at the files first (changes nothing)

```
I have a new project to set up. Don't change anything yet, only look.

- SVG-editor backup: <path to the .json file>
- Excel sheet with the plot details: <path to the .xlsx file>

Tell me in plain words:
1. The project title, and every map (scene) in the backup with its title,
   which map it opens from, and how many plots and pins it has.
2. Which maps have plots that should get a status (the plot/villa maps), and
   which are only for getting around (country, region, overview).
3. The Excel sheet: its sheets, its column names, how many rows, and 3 example rows.
4. For each sheet, which map its rows belong to, and whether the plot ids in
   the sheet match the plot ids on that map EXACTLY. If they don't, show me
   a few side-by-side examples (sheet id → map id) and the rule that turns
   one into the other.
5. Anything that looks odd or missing.
```

Read the answer. Point 4 matters most: the sheet often says `C3-001` while the
map says `c3-A-001`. If Claude's matching rule looks wrong, correct it now, for
example: *"Rows with zone city3 belong to the CITY3 map, and C3-001 is
c3-A-001."*

### 2B. Archive the old project and import the new one

```
Now set up the new project from the SVG-editor backup at <path to the .json file>.

1. Archive the current project first: move data/project.json and its images
   folder in public/projects/ into archive/<old project name>-<today's date>/.
   Don't delete anything. Make sure data/project.json no longer exists before
   importing, so no old data is carried over.
2. Run npm run import-editor with the backup.
3. Tell me in plain words: how many maps, plots and pins were imported, and
   whether that matches what you found in step 2A.
4. Show me the import's "details" report: for each map, how many plots got
   data from the Excel rows in the backup, and which rows matched no plot.
   If rows didn't match, explain why (sheet id vs plot id or label) with a few
   examples.
5. Start the site and give me the link. I'll check I can click from the first
   map down to every other map, and that plots with data are coloured.
Don't add or change any data yourself yet.
```

**Check:** click through every map on the site. If a map is missing, a link
goes to the wrong place or an image is wrong, tell Claude now (or ask the
designer for a corrected backup). Don't continue until the maps are right.

**Then:** if every plot map got its data, go to **2E**. If rows didn't match,
the easiest fix is in the editor: give each Excel row the plot's id or label,
download the backup again and repeat 2B. Otherwise continue with 2C.

### 2C. Plan how the Excel columns are used (changes nothing)

*Only when the Excel data didn't come in with the import in 2B.*

```
Now plan how to bring in the Excel sheet at <path to the .xlsx file>.
Don't change anything yet. Show me one simple table with a row for EVERY
column in the sheet:

| Column | Becomes | Shown how |

where "Becomes" is one of:
- the plot id used for matching (and the matching rule from step 2A),
- a status-like choice used for colours and filters (e.g. status, typology,
  facade): list all its different values and suggest a colour for each status,
- a number with a unit used for the card and for "from–to" filters (e.g. plot
  area m², GFA m², price AED, bedrooms, parking),
- a text line on the plot's details card,
- ignored (say why, e.g. "only used for matching", "always empty").

Then tell me:
- how many rows match a plot on the map, for each map,
- which rows match NO plot (list them),
- which plots on those maps have NO row (list them),
- which maps will get coloured plots, a colour legend and filters.

Wait for me to say OK.
```

Check the table. Common things to correct:

- *"Status colours: Available = green, Booked = orange, Sold = red, Blocked = grey."*
- *"Show Price on the card, but don't make a filter for it."*
- *"Ignore the confirmed column."*
- *"Rows for the Villa map are in the second sheet."*

When it looks right, answer **"OK, go ahead."**

### 2D. Bring in the Excel data

Only after you've said OK to the table in 2C:

```
Apply the plan we agreed in step 2C to data/project.json:
- add the status-like columns to "categories" (with labels and colours) and the
  numbers to "values" (with labels and units),
- give every matched plot its categories, values and card lines,
- on every map that has plots with data, set "colorBy" to the status and turn on
  filters for the agreed categories and numbers, plus search,
- don't change any shapes, links or images.
Then run lint and type-check, start the site, check the browser console for
"[project.json] … problem(s)" and fix any you caused. Give me the link and tell me:
how many plots got data on each map, and which ones didn't, if any.
```

### 2E. Check it on the site

Open the link and check, for each plot map:

- [ ] the plots are **coloured** and the legend shows the statuses,
- [ ] the **filters** open and narrow down the plots (try a status and a range),
- [ ] clicking a plot opens a **card** with the right details (compare 2–3 plots with the Excel sheet),
- [ ] **search** finds a plot by its name.

If something is off, tell Claude exactly what you see, e.g. *"Plot c3-A-005 on
CITY3 is grey and its card is empty"*. Then set the name and colours
(**Prompt 4**), check everything (**Prompt 7**) and save (**Prompt 8**).

---

## 3. Update the data later

### 3a. A new version of the Excel sheet

```
Here is an updated Excel sheet: <path to .xlsx>. Compare it with the data now in
data/project.json and, BEFORE changing anything, list in plain words what would
change (per plot: old → new), plus any new columns, new status values, or rows
that match no plot. Use the same matching rule as before. Wait for my OK, then
apply it without touching any shapes, and show me the result on the site.
```

### 3b. The designer changed the shapes (new SVG-editor backup, same project)

Use this when it's the **same project** with corrected or extra shapes, or an
updated Excel sheet loaded in the editor. It keeps your colours, filters and the
card lines you added. Plots with an Excel row in the backup take that row's
status, numbers and details. **Don't archive first.**

```
The designer sent an updated SVG-editor backup of the SAME project at
<path to .json>. Re-import it with npm run import-editor WITHOUT archiving, so
the existing data is kept. Then compare data/project.json with
data/project.previous.json and tell me in plain words which maps and plots were
added, removed or reshaped, and which plots lost their data because their id
changed. Start the site so I can check.
```

If plots lost their data because the designer renamed them, ask: *"Copy the data
from the old ids to the new ids: <old> → <new>, …"*.

---

## 4. Name, colours and statuses

```
Set the project name to "<name>" and the brand colour to <colour, e.g. #0f766e
or "dark green">. Give the statuses these colours: available = green,
booked = orange, sold = red, blocked = grey. Show me the result on the site.
```

## 5. Change a few details

```
On the <map name, e.g. CITY3> map, change plot <plot id or name>:
<what to change, e.g. status to sold, price to 3,200,000, add a line
"View: Park" to its card>.
```

```
Add a pin called "<label>" on the <map name> map at <describe where, or
give x/y in percent of the image>, with this description: "<text>".
```

## 5b. Filters, colours and details cards

**How it works, in plain words.** A filter shows up on a map only when three
things agree:

1. **The project knows the choice and its options**, e.g. Status: Available
   (green), Booked (orange), Sold (red).
2. **The map is told to show a filter for it**, e.g. CITY3 shows Status and
   Typology filters, and from–to sliders for Plot area and GFA.
3. **Each plot has a value that is exactly one of those options**, e.g. plot
   c3-A-001 is "available".

Good to know:

- The checkboxes list **every option**, with the number of plots on that map next to each.
- Ticking two options of the same filter shows plots with **either** one. Ticking
  options in different filters shows plots that match **all** of them.
- Plots that don't match **fade out**. They don't disappear.
- **Colours and the legend** are set separately ("colour this map by status"), so a
  map can have colours without filters.
- **A spelling difference breaks the match.** "Sold" is not "sold". Such a plot
  shows grey, has no status on its card, and vanishes as soon as you tick a
  status. Claude's check (Prompt 7) lists these mistakes.
- **Clicking a plot** opens its **card** when it has any details (status,
  numbers or card text). Otherwise it goes straight into the next map. The
  card's **Explore** button goes into the next map.

**Change the filters or colours on a map**

```
On the <map name, e.g. CITY3> map: show filters for <e.g. status and typology>,
from–to sliders for <e.g. plot area and price>, and <keep / remove> the search box.
Colour the plots by <e.g. status>. Before changing anything, tell me if any
plot on that map has a value that isn't one of the options, or has no value.
Then show me the result on the site.
```

**Add a new choice that you can filter by** (e.g. facade, view)

```
Add a new filter "<name, e.g. View>" with these options: <e.g. Park, Road, Pool>.
Take each plot's value from <the Excel column "View" / this list: …>.
Show it as a filter on <map names>. List the plots that end up with no value
or a value that isn't one of the options, and wait for my OK before applying.
```

**Change what a plot's card shows**

```
On the <map name> map, change the card of <plot id or name / every plot>:
<e.g. add the picture <path to image>, the subtitle "Phase 1", the description
"…", a line "View: Park", and a button "Brochure" that opens <link>>.
```

**Change what a click does**

```
On the <map name> map, clicking <plot id or name / every plot> should
<open its card first / go straight into the next map without a card>.
Tell me what has to change for that and wait for my OK.
```

## 6. Line up plots drawn in Figma/Illustrator (Align SVG)

Use this when you only have images and an SVG of the plots, not an SVG-editor
backup. (If you only have images and no shapes at all, ask the designer to draw
the plots in the SVG editor and send you the backup. Claude can't draw them.)

```
I have an SVG of the plots for the <map name> map at <path to .svg>.
Start the site, then explain step by step how I use the "Align SVG" switch
to line it up. When I paste you the copied hotspots, add them to that map
and help me give them proper ids and labels.
```

## 7. Check everything before handing over

```
Check the project is ready to hand over:
1. Run lint, type-check and build.
2. List any data problems in project.json (wrong links, points outside the
   image, missing images, plots on coloured maps without a status, values
   that aren't one of the options, filters for choices that don't exist).
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
Something is wrong: <describe what you see, e.g. "the CITY3 map is blank" or
"clicking a plot does nothing">. Find out why, explain it in plain words, and
fix it. Don't change the shapes unless I agree.
```

```
Undo everything you changed since my last save.
```

**Common cases**

| What you see | Usually means | Say to Claude |
| --- | --- | --- |
| All plots grey | No statuses or colours yet, or `colorBy` not set on that map | *"Plots on <map> are grey. Check categories, colorBy and that the plots have a status."* |
| Some plots grey | Those rows didn't match (different id) | *"List the plots on <map> without a status and the Excel rows that matched nothing."* |
| A plot is grey, has no status on its card, or vanishes when you filter | Its value isn't one of the options (e.g. "Sold" vs "sold") | *"Check the console problems for <map> and fix the plot values to match the options."* |
| No filter button | The map has no `filters` | *"Turn on filters for status and area on <map>."* |
| Old project's data shows up | `project.json` wasn't archived before importing | *"Undo the import, archive project.json properly, and import again (step 2B)."* |
| "No map data yet" or "The map can't be shown" | Empty project or wrong start map | *"Why does the site say there's no map? Check rootScene and the scenes."* |

## 10. Bring back an old project

```
Restore the archived project "<name>" from archive/: archive the current
project first in the same way, then put the old project.json and images
back where they belong (data/project.json and public/projects/<name>/).
Start the site so I can check it.
```

---

## For whoever maintains this guide

The prompts rely on `CLAUDE.md` (the rules Claude follows) and `README.md`
(the data format). If you change how projects are imported, update the
prompts here too. Section 2 assumes the importer brings in shapes,
images and links, plus the Excel data loaded in the editor (`details`, see
`scripts/editor-details.mjs`): plot data, definitions, colours and filters,
with a match report. An Excel sheet that isn't in the editor is mapped by hand
after a confirmed plan (2C, 2D).
