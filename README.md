# File Frenzy

An interactive fiction game about file format identification and the dire consequences of getting it wrong.

A cold night, an empty internet cafe called *Bits and Bytes*, a glowing screen... and a computer world where the files have forgotten who they are. Help a rusty paperclip, a cavern of clicking mice and a very forgetful RAM, and learn real file format research along the way, from binary and hex to PRONOM, PUIDs and internal signatures.

This is the new, more accessible version of **[File Format Frenzy](https://github.com/Francesca4242/File_Format_Frenzy)** ([play the original Twine version](https://francesca4242.github.io/File_Format_Frenzy/)). It keeps the same story, structure, characters and sense of humour, and adds:

- **Accessibility**: proper buttons and headings for screen readers, focus that moves to each new page, full keyboard play (Tab/Enter or number keys 1–9, B for back), large tap targets, and a spoken version of the binary code.
- **Reading settings**: four colour themes (classic glow, paper, high contrast, soft cream), three fonts (classic serif, Atkinson Hyperlegible, OpenDyslexic), four text sizes, roomy spacing, reduce animation, hide pictures, and an optional **Read aloud** button.
- **Kinder puzzles**: wrong answers give a specific hint instead of a dead end, and the PRONOM puzzle has a "show the answers" option for players who can't get online.
- **More lessons**: new "But why?!" pages on reading binary, internal signatures, ZIP and container formats, tricking your computer with extensions, and lossless/lossy compression. The three empty passages from the original are now written.
- **A research notebook** that collects 19 facts as you play, plus a **Learn more** page linking to PRONOM, DROID, Siegfried, the DPC Handbook, Just Solve the File Format Problem, and how to contribute your own research to PRONOM.
- **Illustrations**: starter pictures of a mouse, hot chocolate, Clippy and the chocolate-smeared culprit, with spaces ready for more (see [`pictures/README.md`](pictures/README.md)).
- **Progress saved** on your device, and endings to collect.

## Play

Open `index.html` in a browser. No install or build step is needed.

To publish it with GitHub Pages: in the repository's **Settings → Pages**, choose **Deploy from a branch**, pick the branch and the `/ (root)` folder. The game will then appear at `https://francesca4242.github.io/File-Frenzy/`.

## Editing the story

The whole story is in [`js/story.js`](js/story.js), written in a Twine-like style (`[[Choice->passage]]`). See [`WRITING.md`](WRITING.md) for how to change passages, add lessons, notebook facts and pictures.

After editing, check for broken links with:

```bash
node tools/check-story.js
```

## Fact checking

The PRONOM puzzles were re-checked in November 2026 against PRONOM and DROID signature file v125. PRONOM moved to <https://pronom.nationalarchives.gov.uk/>, so all links point there now. The code is still **2303**:

| Clue | Answer |
| --- | --- |
| Version of fmt/1820 | MacCaption File, version **2** |
| Format with 20 extensions including `cal` | fmt/**1300** (Broderbund The Print Shop/PrintMaster/American Greetings Project) → **3**, **0** |
| Extension length of fmt/2000 | Husqvarna Embroidery Stitch File, `hus` → **3** |

The PK signature belongs to x-fmt/263 (ZIP Format, `504B0304`).

## Files

```
index.html           page shell, dialogs and settings
css/style.css        themes and layout
js/story.js          the story, notebook facts, resources and pictures list
js/engine.js         the story engine (you shouldn't need to edit this)
pictures/            illustrations
tools/check-story.js finds broken links and dead ends
```
