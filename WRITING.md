# Writing and editing File Frenzy

Everything the player reads is in `js/story.js`. It's one big JavaScript object, but you mostly only touch the text between backticks.

## A passage

```js
"mouse-hole": {
  title: "The mouse hole",          // heading at the top of the page
  art: "mouse",                     // optional picture (see STORY.art)
  learn: ["binary"],                // optional notebook facts to unlock
  text: `The smell is far stronger in the corner of the room...

Do you:

[[Venture forth to greet the mice->mice]]
[[Go back and attempt to open a window->window]]`
},
```

The bit before the colon (`"mouse-hole"`) is the passage's id. Links point at ids.

Optional extras:

- `kind: "lesson"` gives the page the blue "Lesson" box, used for "But why?!" pages.
- `ending: { id: "sleepy", name: "The Sleepy Ending" }` makes it an ending.
- `was: "..."` is just a note of the passage's name in the original Twine game.

## Text markup

| Write | You get |
| --- | --- |
| a blank line | a new paragraph |
| `[[Label->id]]` on its own line | a big choice button |
| `[[Label->id]]` inside a sentence | an inline link |
| `{{back}}` or `{{back:head back}}` | a link back to the previous page |
| `{{restart}}` | a "Play again" link |
| `**bold**`, `*italic*` | **bold**, *italic* |
| `[PRONOM](https://...)` | a website link that opens in a new tab |
| lines starting `> ` | a riddle or verse, line breaks kept |
| `%% 0101...` | glowing computer code (screen readers read it digit by digit) |
| `[Top tip] Some text` | a boxed tip labelled "Top tip" (any label works) |
| lines starting `- ` or `1. ` | bulleted or numbered lists |
| a block starting with `<` | raw HTML, e.g. a `<table>` or `<details>` |

## Questions

Questions use `quiz` instead of plain links, so wrong answers can give hints:

```js
quiz: {
  label: "Clippy's question",                         // read out before the options
  who: "Clippy shakes a \"head\" disappointedly.",    // shown for any wrong answer
  why: "why-encodings",                               // optional "But why?!" lesson link
  options: [
    { text: "Binary", hint: "Binary only has two symbols..." },  // wrong: stay and show the hint
    { text: "Hex", goto: "light-bulb" }                          // right: go to a passage
  ]
}
```

The letters A), B), C)... are added automatically. An option with `goto` can also be a "wrong" branch that moves the story on, like the mice sending you to the left-click bedroom.

## Notebook facts

Add a fact to `facts`, then add its id to a passage's `learn` list:

```js
"zip": {
  title: "ZIP and the letters PK",
  text: "ZIP files start with the bytes 50 4B 03 04...",
  link: { label: "Optional link", url: "https://..." }
}
```

## Pictures

1. Put the file in `pictures/` (SVG or PNG work best; keep files small).
2. Register it in `art` with **alt text** describing what's in it:
   ```js
   "mice-cavern": { src: "pictures/mice-cavern.png", alt: "Dozens of mice in a glowing green cave." }
   ```
3. Add `art: "mice-cavern"` to the passage.

Add `wide: true` for diagrams that should fill the page width. If a picture file is missing, the game just leaves it out.

## Check your work

```bash
node tools/check-story.js
```

This lists links to passages that don't exist, unknown facts or pictures, passages nobody can reach, and dead ends.
