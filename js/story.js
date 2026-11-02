/*
  File Frenzy – the story.

  Everything a player reads lives in this file, so you can edit the story
  without touching the game engine. See WRITING.md for the full guide.

  Quick markup cheat sheet (inside `text`):
    blank line            new paragraph
    [[Label->passage id]] a choice (a line with only a link becomes a big choice button)
    [[passage id]]        a choice whose label is the passage id
    {{back}}              a "Back" link (or {{back:any words}})
    {{restart}}           a "Play again" link
    **bold**  *italic*    emphasis
    [words](https://...)  a link to another website (opens in a new tab)
    > line                a riddle / verse line (consecutive > lines stay together)
    %% 0101 0110          a glowing "computer code" line
    [Top tip] text        a boxed callout with that label
    - item / 1. item      bulleted / numbered lists
    <tag>...              a block of raw HTML (tables, details, etc.)

  Each passage can also have:
    title   heading shown at the top (read first by screen readers)
    kind    "lesson" for "But why?!" pages (they get a different look)
    art     a picture key from STORY.art
    learn   list of fact ids from STORY.facts to add to the notebook
    quiz    multiple-choice question (wrong answers give hints, not dead ends)
    ending  marks an ending: { id, name }
    was     the passage name in the original Twine game (for reference)
*/

window.STORY = {
  meta: {
    title: "File Frenzy",
    tagline: "An interactive fiction game about file format identification and the dire consequences of getting it wrong.",
    original: "https://github.com/Francesca4242/File_Format_Frenzy",
    originalPlay: "https://francesca4242.github.io/File_Format_Frenzy/",
    checked: "November 2026 (PRONOM / DROID signature file v125)"
  },

  start: "entrance",

  /* ------------------------------------------------------------------ */
  /* Pictures. Add new illustrations to /pictures and register them here. */
  /* ------------------------------------------------------------------ */
  art: {
    "hot-chocolate": {
      src: "pictures/hot-chocolate.svg",
      alt: "A steaming mug of hot chocolate with a marshmallow bobbing on top."
    },
    "mouse": {
      src: "pictures/mouse.svg",
      alt: "A small round grey mouse with big pink ears and a curly tail."
    },
    "paperclip": {
      src: "pictures/paperclip.svg",
      alt: "A slightly rusty paperclip with big friendly eyes, a floating light bulb above its head."
    },
    "encoding": {
      src: "pictures/encoding.png",
      wide: true,
      alt: "Three cartoon faces with speech bubbles. The first face, raising one eyebrow, says a long string of 0s and 1s, which is 'I speak binary' in binary. The second, in a cowboy hat, says '49 20 73 70 65 61 6B 20 68 65 78 0A', which is 'I speak hex' in hex. The third, with star-shaped eyes, says 'I speak English!'"
    },
    "chocolate-mouse": {
      src: "pictures/chocolate-mouse.svg",
      alt: "A rather large mouse with chocolate smeared all over its whiskers, sitting beside an empty tub of hot chocolate powder."
    }
  },

  /* ------------------------------------------------------------------ */
  /* Notebook facts. Passages add these with `learn: [...]`.             */
  /* ------------------------------------------------------------------ */
  facts: {
    "fomo": {
      title: "FOMO",
      text: "“Fear of missing out” was first used in the early 2000s and joined the dictionaries about a decade later. The Oxford English Dictionary describes it as anxiety that an exciting or interesting event may currently be happening elsewhere."
    },
    "binary": {
      title: "Bits, bytes and binary",
      text: "Computers store everything as 0s and 1s (bits). Eight bits make a byte, and one byte can hold a number from 0 to 255. Each position in a byte is worth double the one to its right: 128, 64, 32, 16, 8, 4, 2, 1."
    },
    "ascii": {
      title: "ASCII",
      text: "ASCII (American Standard Code for Information Interchange) is a table that gives every letter, digit and punctuation mark a number. Capital A is 65, lower-case a is 97 and a space is 32.",
      link: { label: "ASCII table on Wikipedia", url: "https://en.wikipedia.org/wiki/ASCII" }
    },
    "hex": {
      title: "Hexadecimal (hex)",
      text: "Hex counts with sixteen symbols: 0–9 then A–F. Every byte can be written as exactly two hex digits, from 00 to FF, which is why file format researchers look at files in hex. The letter A is 41 in hex."
    },
    "hex-editor": {
      title: "Hex editors",
      text: "A hex editor shows the raw bytes of a file: hex on one side, and the ASCII letters those bytes would make on the other. It’s the file format researcher’s magnifying glass. Always look at a copy of a file, never the original!",
      link: { label: "HexEd.it – a free hex editor in your browser", url: "https://hexed.it/" }
    },
    "digipres": {
      title: "Digital preservation",
      text: "Digital preservation is the work of keeping digital files usable for the long term, even when the software that made them is long gone. Knowing exactly what format a file is in is one of the very first steps."
    },
    "pronom": {
      title: "PRONOM",
      text: "PRONOM is a free online database of file formats run by The National Archives (UK). It describes thousands of formats and the patterns that identify them. Tools such as DROID and Siegfried, and preservation systems such as Preservica and Archivematica, rely on it.",
      link: { label: "Search PRONOM", url: "https://pronom.nationalarchives.gov.uk/" }
    },
    "puid": {
      title: "PUIDs",
      text: "Every format in PRONOM has a PUID (PRONOM Unique Identifier), such as fmt/1820 or x-fmt/263. A PUID never changes, so it’s a reliable way to name a format exactly, even when names and extensions are confusing."
    },
    "droid": {
      title: "Identification tools",
      text: "DROID (from The National Archives), Siegfried and Fido are free tools that read files and tell you their format using PRONOM’s signatures. They look inside the file rather than just trusting the extension.",
      link: { label: "Download DROID", url: "https://www.nationalarchives.gov.uk/information-management/manage-information/preserving-digital-records/droid/" }
    },
    "extension": {
      title: "File extensions",
      text: "An extension is the bit after the dot in a file name, like .pdf or .docx. It’s only a label: anyone can change it, and the computer will believe them. Researchers treat it as a clue, not proof."
    },
    "extension-only": {
      title: "Extension-only formats",
      text: "Some formats, like CSV (x-fmt/18), plain text (x-fmt/111) and generic .dat files (fmt/1730), have no reliable internal pattern to look for. Tools can only identify them by their extension, so these identifications are the least certain."
    },
    "signature": {
      title: "Internal signatures (magic numbers)",
      text: "Many formats begin with a special set of bytes, a bit like a name badge. PDFs begin with %PDF, PNGs with ‰PNG, and ZIP files with PK. PRONOM calls these patterns internal signatures, and they’re the most reliable way to identify a file."
    },
    "offset": {
      title: "BOF, EOF and offsets",
      text: "Signatures say where to look. BOF means “beginning of file” and EOF means “end of file”. The offset says how many bytes in from there the pattern starts. Offset 0 from BOF means the very first byte."
    },
    "zip": {
      title: "ZIP and the letters PK",
      text: "ZIP files (x-fmt/263) start with the bytes 50 4B 03 04. In ASCII, 50 4B spells “PK”, the initials of Phil Katz, who created the ZIP format for his PKZIP program in 1989."
    },
    "container": {
      title: "Container formats",
      text: "Lots of formats are secretly ZIP files with special contents: Word .docx, Excel .xlsx, EPUB e-books, OpenDocument files and Android apps. Tools use container signatures to look inside the ZIP and work out what it really is."
    },
    "lossless": {
      title: "Lossless compression",
      text: "Lossless compression makes a file smaller without throwing anything away. When you unpack it, you get back every single bit. ZIP, PNG and FLAC are all lossless."
    },
    "lossy": {
      title: "Lossy compression",
      text: "Lossy compression makes files much smaller by throwing away detail people are unlikely to notice. JPEG photos and MP3 music are lossy. Once the detail is gone, it can’t be brought back, which matters a lot for archives."
    },
    "fixity": {
      title: "Fixity",
      text: "Fixity means proving a file hasn’t changed. Archives calculate a checksum (a kind of digital fingerprint, such as MD5 or SHA-256) and check it again later. If even one bit changes, the fingerprint changes too."
    },
    "contribute": {
      title: "You can help PRONOM",
      text: "PRONOM is built from research by The National Archives and contributions from archives and enthusiasts all over the world. If you find a format that’s missing or wrong, you can tell the PRONOM team by opening an issue on their PRONOM Research GitHub repository or emailing pronom@nationalarchives.gov.uk.",
      link: { label: "PRONOM Research on GitHub", url: "https://github.com/digital-preservation/PRONOM_Research" }
    }
  },

  /* ------------------------------------------------------------------ */
  /* "Learn more" links, shown from the toolbar and at the end.          */
  /* ------------------------------------------------------------------ */
  resources: [
    {
      heading: "Look formats up",
      items: [
        { label: "PRONOM", url: "https://pronom.nationalarchives.gov.uk/", text: "The National Archives’ file format registry. Search by name, extension or PUID." },
        { label: "Just Solve the File Format Problem", url: "http://fileformats.archiveteam.org/", text: "A huge community wiki about file formats, from the everyday to the gloriously obscure." },
        { label: "Library of Congress: Sustainability of Digital Formats", url: "https://www.loc.gov/preservation/digital/formats/", text: "Detailed descriptions of formats and how risky they are to keep long-term." },
        { label: "Wikipedia: List of file signatures", url: "https://en.wikipedia.org/wiki/List_of_file_signatures", text: "A long table of magic numbers. Great for practising your hex!" },
        { label: "Gary Kessler’s File Signatures Table", url: "https://www.garykessler.net/library/file_sigs.html", text: "A classic reference used by digital forensics people." }
      ]
    },
    {
      heading: "Identify your own files",
      items: [
        { label: "DROID", url: "https://www.nationalarchives.gov.uk/information-management/manage-information/preserving-digital-records/droid/", text: "Free tool from The National Archives that identifies formats in bulk using PRONOM." },
        { label: "Siegfried", url: "https://www.itforarchivists.com/siegfried/", text: "A fast format identification tool that also uses PRONOM signatures." },
        { label: "Fido", url: "https://github.com/openpreserve/fido", text: "Format identification from the Open Preservation Foundation." },
        { label: "HexEd.it", url: "https://hexed.it/", text: "Look at the raw bytes of a file in your browser. Try it on a copy of a photo and spot the signature!" }
      ]
    },
    {
      heading: "Do file format research",
      items: [
        { label: "Contribute to PRONOM", url: "https://github.com/digital-preservation/PRONOM_Research", text: "Suggest new formats, signatures and corrections by opening an issue." },
        { label: "PRONOM data on GitHub", url: "https://github.com/nationalarchives/pronom", text: "The whole PRONOM dataset and its source code are open." },
        { label: "FFDev", url: "https://ffdev.info/", text: "A tool for writing and testing your own PRONOM-style signatures." },
        { label: "DROID signature files", url: "https://pronom.nationalarchives.gov.uk/signature-list", text: "Every release of the signature file that DROID uses, so you can see PRONOM grow." }
      ]
    },
    {
      heading: "Learn about digital preservation",
      items: [
        { label: "DPC Digital Preservation Handbook", url: "https://www.dpconline.org/handbook", text: "A friendly, free guide from the Digital Preservation Coalition." },
        { label: "Open Preservation Foundation", url: "https://openpreservation.org/", text: "A community that builds and looks after open-source preservation tools." },
        { label: "BitCurator", url: "https://bitcurator.net/", text: "Tools and training for archivists working with born-digital material." }
      ]
    },
    {
      heading: "The original game",
      items: [
        { label: "File Format Frenzy (original Twine version)", url: "https://francesca4242.github.io/File_Format_Frenzy/", text: "Play the first version of this game, made in Twine." }
      ]
    }
  ],

  /* ------------------------------------------------------------------ */
  /* Passages                                                            */
  /* ------------------------------------------------------------------ */
  passages: {

    "entrance": {
      was: "Cafe Entrance Start",
      title: "Bits and Bytes",
      text: `It's a cold night as you race to your local internet cafe called 'Bits and Bytes'. Pushing open the door you see the place unusually deserted. There's no staff on the premises and most of the lights are off apart from a green glow coming from one of the screens.

There's no one really around. Maybe you should go back home for a cosy hot chocolate?

Then again, there is no one really around, and curiosity has got the better of you! You love computers...

[[Go home for a cosy hot chocolate->hot-chocolate]]
[[Reach out towards the screen->screen]]`
    },

    "hot-chocolate": {
      was: "cosy hot chocolate",
      title: "A cosy hot chocolate",
      art: "hot-chocolate",
      text: `That was a disappointing trip, but at least there is some hot chocolate powder left at the back of the cupboard. You settle on the couch and stare contemplatively into your cup. Watching the steam wisp its way upwards, you sense that you've missed out on something important.

Do you:

[[Ignore the niggling feelings of an unfinished quest and call it an early night->early-night]]
[[Jump up from the sofa, throw on your cosiest coat and head out again with purpose back to the cafe->back-to-cafe]]`
    },

    "early-night": {
      was: "Ignore the niggling feelings of an unfinished quest and call it an early night",
      title: "An early night",
      learn: ["fomo"],
      ending: { id: "sleepy", name: "The Sleepy Ending" },
      text: `FOMO, a word first used in the early 2000s, made it into the dictionary around a decade later. The Oxford English Dictionary defines FOMO as "anxiety that an exciting or interesting event may currently be happening elsewhere, often aroused by posts seen on social media".

Some surveys have claimed that as many as 7 in 10 adults have felt FOMO. Congratulations on being part of the calm, well-rested 30%!

You drift into a wonderful, deep, undisturbed sleep.`
    },

    "back-to-cafe": {
      was: "Jump up from the sofa, throw on your coziest coat and head out again with purpose back to the cafe",
      title: "Back to the cafe",
      text: `Re-entering the internet cafe with a renewed sense of purpose, you head straight for the humming, glowing, bizarre light of the computer. Stretching out a hand...

[[You reach out towards the screen->screen]]`
    },

    "screen": {
      was: "you reach out towards the screen",
      title: "Through the screen",
      text: `A sucking noise like a backwards hairdryer warns you too late of imminent departure. The computer screen becomes soft and wavy, and you slide through it like butter on butter and down a tunnel. The surface of the tunnel is made up of floating ones and zeros that flicker softly in the pale green light. Eventually, after what feels like hours, you land on a bouncy bed of zeros broken up by far more pointy ones!

[[You find your hands drifting over the numbers, and find yourself hypnotically making patterns->patterns]]`
    },

    "patterns": {
      was: "You find your hands drifting over the numbers, and find yourself hypnotically making patterns",
      title: "Patterns in the numbers",
      learn: ["binary"],
      text: `The patterns you've made with the numbers form groups of eight and almost seem like a strange code:

%% 01010111 01100101 01101100 01100011 01101111 01101101 01100101

You try and work out what the computer is telling you! Could it be...`,
      quiz: {
        label: "What is the computer saying?",
        who: "You are left feeling like you are wrong, even though no one is there to tell you so...",
        why: "why-binary",
        options: [
          { text: "Advance", hint: "“Advance” starts with a capital A, which is 01000001 in binary. Does the first group of eight match?" },
          { text: "Monitor", hint: "“Monitor” starts with a capital M, which is 01001101 in binary. Does the first group of eight match?" },
          { text: "Welcome", goto: "senses" },
          { text: "Archive", hint: "“Archive” starts with a capital A, which is 01000001 in binary. Does the first group of eight match?" }
        ]
      }
    },

    "why-binary": {
      was: " But why 1",
      kind: "lesson",
      title: "But why?! Reading binary",
      learn: ["binary", "ascii"],
      text: `Computers store everything in 0s and 1s. That's because all information is carried in pulses of electricity, so everything is in one of two states: on or off. Rather like Morse code with only dots and dashes.

Each single 0 or 1 is called a **bit**. Bits are grouped into eights, and a group of eight bits is called a **byte**. One byte can stand for any number from 0 to 255.

To turn numbers into letters, computers use a lookup table. The most famous is **ASCII**, where every letter, number and punctuation mark has its own number. Capital A is 65, lower-case a is 97 and a space is 32.

Each position in a byte is worth double the one to its right. To read a byte, add up the positions that have a 1:

<div class="table-wrap"><table>
<caption class="visually-hidden">Reading the byte 01010111</caption>
<tr><th scope="row">Position worth</th><td>128</td><td>64</td><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td><td>1</td></tr>
<tr><th scope="row">First byte</th><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>1</td></tr>
</table></div>

So 01010111 is 64 + 16 + 4 + 2 + 1 = **87**. In ASCII, 87 is a capital **W**!

[Top tip] You don't have to do it all by hand. Look the numbers up in an [ASCII table](https://en.wikipedia.org/wiki/ASCII), or search for a "binary to text converter" and paste in the code.

You may now want to go {{back}}.`
    },

    "senses": {
      was: "You take a few moments to recover your senses",
      title: "Recovering your senses",
      text: `The glowing green area you find yourself in is very dim. It smells of mouse droppings, but as your eyes adjust you also make out the frames of many windows floating in the air. Do you:

[[Follow the scent of mouse droppings->mouse-hole]]
[[Attempt to open a window and hope the smell clears->window]]`
    },

    "mouse-hole": {
      was: "Follow the scent of mouse droppings",
      title: "The mouse hole",
      art: "mouse",
      text: `The smell is far stronger in the corner of the room. A cursor-y glance reveals a large mouse hole. You follow the passageway, stepping over mouse droppings and pieces of cheese. You come out in a large cavern full of mice. It really, really, really smells.

Do you:

[[Venture forth to greet the mice->mice]]
[[Go back and attempt to open a window->window]]`
    },

    "window": {
      was: "attempt to open a window and hope the smell clears",
      title: "The padlocked window",
      text: `The window is padlocked and you need a code to get inside... There is some writing on the wall next to it, but it's far too dim to read.

But wait, there is also a glow coming from a nearby corner. It looks like some sort of rubbish.

[[Follow the scent of mouse droppings->mouse-hole]]
[[Walk towards the old rusty paperclip->paperclip]]`
    },

    "mice": {
      was: "venture forth to greet the mice",
      title: "The mice",
      art: "mouse",
      text: `The mice talk in a strange language of clicking and whirring. Occasionally they slide across the floor, barely using their legs.

One mouse approaches you:

"We, and we alone, know the direction you should take. You need to answer one question, and what you click on decides where we take you."

"Think very carefully before you make your choice."

"Which way of writing numbers do people often use to look at the insides of file formats? It uses sixteen symbols, so every byte fits neatly into just two characters. That makes it much easier to read than long strings of 0s and 1s!"

[[But why?!->why-encodings]]`,
      quiz: {
        label: "The mouse's question",
        options: [
          { text: "Binary", goto: "left-click" },
          { text: "Hex", goto: "right-click" },
          { text: "Magic", goto: "left-click" },
          { text: "ASCII", goto: "left-click" },
          { text: "UTF-8", goto: "left-click" }
        ]
      }
    },

    "left-click": {
      was: "left click",
      title: "Left click",
      art: "mouse",
      text: `The mouse runs off down the passageway, clicking. Left, left, left it turns, until it reaches a large comfy-looking bedroom. As the mouse gets ready for sleep and finally hibernates, you find yourself in the computer cafe again. The computer is no longer glowing and the screen is blank.

Perhaps it is time for that...

[[Cosy hot chocolate->hot-chocolate]]`
    },

    "right-click": {
      was: "right click",
      title: "Right click",
      text: `You follow the mouse down a passageway. Right, then right, then right again, until you enter a restaurant. A neon sign above the door announces its name: "A Byte to Eat". As you take a seat, a mouse in an apron approaches and hands you a menu. The food isn't exactly what you'd normally expect. There are a number of unusual things you can order.

[[Display Settings->display-settings]]
[[View->view]]
[[Refresh->refresh]]`
    },

    "display-settings": {
      was: "Display Settings",
      title: "Display Settings",
      text: `Once in the display settings, you find more menus within menus within menus. One particular menu catches your eye. It has a little light bulb with a dot that can slide from left to right.

Do you:

[[Decide that you wish to stay in the gloom->gloom]]
[[Slide the dot towards the light bulb and watch the world slowly brighten around you->brighten]]`
    },

    "view": {
      was: "View",
      title: "View",
      text: `A display screen with a map full of strange and mysterious icons appears before you. A sign that says "Start here" points to the main tunnel where you started your journey. A journey that ends, to your dismay, at a dilapidated old recycling bin. You notice another point on the map that says "Adjust screen brightness", which could help with any investigations.

With your map in hand, you make your way back through the tunnels to where you started, stopping along the way to brighten the world around you. Everything becomes clearer and you can see, for the first time, some writing on the wall next to the window you were going to open.

[[Read it->read-it]]
[[Leave and head back for the cosy hot chocolate->hot-chocolate]]`
    },

    "refresh": {
      was: "Refresh",
      title: "Refresh",
      text: `Everything flickers... and you find yourself back where you initially landed.

[[You take a few moments to recover your senses->senses]]`
    },

    "brighten": {
      was: "Slide the dot towards the light bulb and watch the world slowly brighten around you",
      title: "Let there be light",
      text: `The computer world is suddenly bright and colourful, and you are mesmerised as a group of pixels flies past! You can see the tunnels clearly now. Perhaps you can make your way back to where you started and find your way out! It was a mistake coming here in the first place.

As you pass back into the main tunnel, you see some writing on the wall just below the window you were thinking of opening earlier. The window is padlocked, but the writing appears to be instructions on how to get it open.

[[Read it->read-it]]
[[Go back home for that cosy hot chocolate->hot-chocolate]]`
    },

    "gloom": {
      was: "Decide that you wish to stay in the gloom",
      title: "Staying in the gloom",
      text: `A bold choice, but maybe a foolish one! You attempt to find your way back through the gloomy passageways and find yourself in the main cavern. You notice for the first time a ladder, back the way you came. It will be a long journey, but there was that cosy hot chocolate you could have back at your flat...

[[Climb the ladder and go home for a cosy hot chocolate->hot-chocolate]]
[[Attempt to open a window and hope the smell clears->window]]`
    },

    "paperclip": {
      was: "walk towards the old rusty paperclip",
      title: "The old rusty paperclip",
      art: "paperclip",
      text: `The paperclip has eyes and looks surprisingly engaged despite the rust. It is bouncing on what you think are "feet". The paperclip switches on a little floating light bulb above its head and says:

"I can help you, but first you must bring me some paracetamol, as I have a terrible virus, and answer a question for me. I'm very confused as I've been ill for a long time."

"If you help me, I will tell you what is going on and guide you through your quest."

You have some paracetamol in your pocket... but do you really want to answer questions from a strange paperclip?

[[Run away back home for the cosy hot chocolate->hot-chocolate]]
[[Try answering some questions->clippy-question]]`
    },

    "clippy-question": {
      was: "try answering some questions",
      title: "Clippy's question",
      art: "paperclip",
      text: `"Which way of writing numbers do people often use to look at the insides of file formats? It uses sixteen symbols, so every byte fits neatly into just two characters. That makes it much easier to read than long strings of 0s and 1s!"`,
      quiz: {
        label: "Clippy's question",
        who: "Clippy shakes a \"head\" disappointedly. \"I don't think that is quite right!\"",
        why: "why-encodings",
        options: [
          { text: "Binary", hint: "Binary only has two symbols, so a single byte takes eight characters to write. Perfect for computers, hard work for eyes!" },
          { text: "Hex", goto: "light-bulb" },
          { text: "Magic", hint: "Ooh, close in spirit! “Magic numbers” are the special bytes we look for at the start of files, but magic isn't a way of writing numbers down." },
          { text: "ASCII", hint: "ASCII turns numbers into letters, so it's great for spotting readable words inside a file. But lots of bytes don't have a printable ASCII letter at all." },
          { text: "UTF-8", hint: "UTF-8 is a way of storing text that can handle every language's letters (and emoji!). It's not how we look at raw bytes, though." }
        ]
      }
    },

    "why-encodings": {
      was: "But why 2",
      kind: "lesson",
      title: "But why?! Binary, ASCII and hex",
      art: "encoding",
      learn: ["binary", "ascii", "hex", "hex-editor"],
      text: `You have a message you want to send, but instead of using regular letters and numbers, you need to use codes that computers understand. These codes are called "encodings", and there are different types of them. Let's talk about three common ones: binary, ASCII and hex.

1. **Binary**: Imagine you're using only two symbols, like on and off switches. In computer talk, we use 0s and 1s. This is called binary. Everything a computer does is broken down into these 0s and 1s. For example, the letter "A" is 01000001 in binary.
2. **ASCII**: This stands for American Standard Code for Information Interchange. Think of it as a giant table where each letter, number and symbol has its own spot and its own number. For example, the letter "A" is number 65 in the ASCII table.
3. **Hex**: This is short for hexadecimal. Instead of using just 0–9 like we do with everyday numbers, hex also uses the letters A–F, making 16 different symbols in total. For example, the number 10 is written as "A" in hex. The letter "A" (65 in ASCII and 01000001 in binary) is written as 41 in hex.

**Why do file format researchers love hex?** Every byte can be written as exactly two hex digits, from 00 to FF. So the start of a file is easy to read and compare: a ZIP file starts with 50 4B, a PDF with 25 50 44 46. In binary, those same bytes would be a long, blurry wall of 0s and 1s.

[Try it yourself] Make a *copy* of a photo or document and open the copy in a free hex editor such as [HexEd.it](https://hexed.it/). You'll see hex on one side and the ASCII letters on the other. Can you spot letters like PDF, PNG, JFIF or PK near the start?

You may now want to go {{back}}.`
    },

    "light-bulb": {
      was: "light bulb",
      title: "A bright idea",
      art: "paperclip",
      text: `Clippy's disembodied light bulb shines brighter than ever before! Clippy enthusiastically sucks on the paracetamol, and together you walk over to the wall to look at the writing there.

[[Walk together over to the wall->say-hi]]`
    },

    "read-it": {
      was: "read it",
      title: "The writing on the wall",
      art: "paperclip",
      text: `Before you have a chance to start reading, a voice behind you says, "Hi there". You turn to see a paperclip bouncing up and down on what are probably feet, but it is hard to tell. The paperclip has large eyes and seems very friendly, but then again it has been a long day and you aren't the best at reading the facial expressions of stationery.

[[Run away back home for the cosy hot chocolate->hot-chocolate]]
[[Say hi back->say-hi]]`
    },

    "say-hi": {
      was: "say hi back",
      title: "Clippy's story",
      art: "paperclip",
      learn: ["digipres"],
      text: `The paperclip bounces up and down, appearing more and more anxious.

"I'm so glad that you came to help! Our computer has been under attack from a virus for many days now. It is so bad that all the staff in the internet cafe we are based in have also come down with really nasty colds."

You gasp!

"But that is not the worst of it. The files that live here have completely forgotten who they are! The other day I heard a Word document trying to sing and a WAV file trying to present at an important business meeting. The formats are so unhappy, and we need to find a way for them to regain their identities."

You gasp again!

"The file formats have locked themselves in a tight file structure that can only be reached through this window over here. They don't want to open up or see anyone, but they left some clues: clues that only someone who can research file formats could understand."

You gasp really, really loudly!

[[Then take a look at the clues on the wall->clues]]`
    },

    "clues": {
      was: "Then take a look at the clues on the wall",
      title: "The clues on the wall",
      text: `There's a lot of writing on this wall. A lot. You take a careful look, getting out a pen and paper to make some notes. The four-digit code could be one of five possibilities! You'll have to search a file format database to find the right one.

[[Take a careful look at the clues->careful-look]]
[[But why?! What database?->why-pronom]]`,
      quiz: {
        label: "Which code opens the padlock?",
        who: "It's not quite working... You shake and shake the padlock, but it won't budge.",
        why: "why-pronom",
        options: [
          { text: "5321", hint: "Have you taken a careful look at all three clues? The first digit comes from the version number of fmt/1820." },
          { text: "1233", hint: "Have you taken a careful look at all three clues? The last digit is how many letters are in the extension of fmt/2000." },
          { text: "2133", hint: "So close! Check the second and third digits: they come from the PUID of the format with 20 extensions, including cal." },
          { text: "1303", hint: "So close! Check the first digit again: it's the version number of fmt/1820." },
          { text: "2303", goto: "enter-window" }
        ]
      }
    },

    "careful-look": {
      was: "careful look",
      title: "A careful look",
      learn: ["puid", "extension"],
      text: `For this part of the game you will need the internet! Open the [PRONOM website](https://pronom.nationalarchives.gov.uk/) in a new tab and find the following clues. Jot your answers down as you go.

1. **Search by unique ID.** Type fmt/1820 into the PRONOM search box. What version number does this file format have? That's the **first digit** of your code.
2. **Search by extension.** Type cal into the search box (don't include the dot!). You'll see lots of results, so look at the "File extensions" under each one. Find the file format that has 20 different possible extensions, including cal. Look at its PUID (Persistent Unique Identifier, the number starting with fmt/). Its second and third digits are the **second and third digits** of your code.
3. **Count the letters.** Search for fmt/2000. How many letters long is its file extension? Extensions are listed under "File extensions" on the format's page. That's the **fourth digit** of your code.

[Top tip] Lots of search results? Use your browser's find-on-page (Ctrl + F, or Cmd + F on a Mac) and search for the extension.

<details>
<summary>Can't get online right now? Show the answers</summary>
<ol>
<li>fmt/1820 is the <strong>MacCaption File</strong>, version <strong>2</strong>.</li>
<li>The format with 20 extensions including cal is <strong>Broderbund The Print Shop / PrintMaster / American Greetings Project</strong>, PUID fmt/<strong>1300</strong>. Its second and third digits are <strong>3</strong> and <strong>0</strong>.</li>
<li>fmt/2000 is the <strong>Husqvarna Embroidery Stitch File</strong>, with the extension <code>hus</code>: <strong>3</strong> letters.</li>
</ol>
<p>So the code is <strong>2303</strong>.</p>
</details>

PRONOM grows and changes all the time. These clues were last checked in November 2026. If something looks different, that's file format research in action!

Once you have all the digits, go {{back}} and choose the code to crack the lock.`
    },

    "why-pronom": {
      was: "But why 3",
      kind: "lesson",
      title: "But why?! What is PRONOM?",
      learn: ["pronom", "puid", "droid", "contribute"],
      text: `PRONOM is a database that stores information about file formats. It's run by The National Archives in the UK and it's free for anyone to use. The information it stores is used by lots of digital preservation tools, such as DROID and Siegfried, and by digital preservation systems such as Preservica and Archivematica. If your files aren't being identified, or aren't being identified as you expect, it's useful to go straight to the source (PRONOM) to work out why.

It can be a bit tricky to get the searching right at times, so here is a practical guide to making PRONOM easier to search:

- **Know the PUID?** Type it (for example fmt/1820) into the search box and you'll jump straight to that format's page.
- **Know the extension?** Type it without the dot (cal, not .cal). The results also include formats whose *names* contain those letters, so check the "File extensions" listed under each result.
- **Know the name?** Try one short, distinctive word ("Print Shop" rather than the full title). Formats often have other names, or are named after the software that made them, so try those too.
- **Too many results?** Use your browser's find-on-page (Ctrl + F, or Cmd + F on a Mac).
- **Reading a format page:** *Summary* has the name, version, PUID, extensions and description. *Relationships* links to related formats, such as earlier and later versions. *Internal signatures* shows the byte patterns that tools look for. *Container signatures* is for formats that live inside ZIP-like containers. *Changelog* tells you when the entry was added or changed.
- **Need the data for a computer?** Every format page has "Download XML" and "Download JSON" buttons.

[Did you know?] In the version of PRONOM used to check this game, there were 2,571 file formats, and the list grows with every release.

**Can't find a format, or think something is wrong?** That's a research opportunity! PRONOM is built from research by The National Archives and contributions from archives and enthusiasts around the world. You can suggest new formats or corrections through the [PRONOM Research GitHub repository](https://github.com/digital-preservation/PRONOM_Research).

You may now want to go {{back}} or take a [[careful look->careful-look]] at the clues.`
    },

    "enter-window": {
      was: "Enter through the window",
      title: "Through the window",
      learn: ["extension", "extension-only"],
      text: `That seemed to crack the code! You push open the window and enter!

Inside, there are a number of file formats sneezing in bed under thick blankets. It's no wonder: the room is freezing cold and the walls are thin, like your typical home renovation extension.

Clippy clears their throat and speaks:

"These file formats were the first to succumb to the virus. They can only be identified by looking at their **extension**. An extension is the .pdf or .docx attached to the end of a file name. The data inside these files has no reliable structure that can be used for identification, so we have to trust that the extension was entered correctly by the person who created them. We also have to trust that no one has changed their extension, accidentally or on purpose!"

"They are pretty confused right now and have forgotten what their extensions might be, but they do remember the purpose they were created for!"

You gasp!

"Maybe you can match them up with their purpose?" Clippy asks. "If you can, that will give me the energy to run and get them all extra blankets."

[[You decide to take on the challenge->riddle-csv]]`
    },

    "riddle-csv": {
      was: "You decide to take on the challenge",
      title: "The shy file",
      text: `First, a shy file format comes forward. "I think I know what I used to be used for," it mumbles. "But I have a riddle in my head, maybe it will help."

> I dwell unseen, in columns and rows,
> My data organised, it clearly shows.
> With commas I part, my contents displayed,
> In simplest form, my structure arrayed.
> Easy to read and to store, I boast,
> From numbers and text, to the data you host.
> Software finds me easy to lay and scan,
> Guess who I am, if you can.
> What am I?`,
      quiz: {
        label: "Which extension belongs to the shy file?",
        who: "The file looks disappointed in you. \"I don't think that is it!\"",
        options: [
          { text: "py", hint: "A .py file is a Python program. It's full of instructions, not tables of data." },
          { text: "csv", goto: "riddle-txt" },
          { text: "js", hint: "A .js file is JavaScript, the code that makes web pages do things. No columns and rows here!" },
          { text: "dll", hint: "A .dll is a Windows library of code that programs share. Definitely not full of commas." }
        ]
      }
    },

    "riddle-txt": {
      was: "next file format",
      title: "The bored file",
      text: `Next, a bored-looking file format on its phone comes forward!

> I am plain, yet full of words,
> Without the flair of graphs or herds.
> Simple, rustic, yet I hold
> Stories, notes, secrets untold.
> No formatting tricks, just lines true,
> From poems to code, I welcome you.
> Editable, readable, pure and clear,
> What am I? Now, it should appear.
> What am I?`,
      quiz: {
        label: "Which extension belongs to the bored file?",
        who: "The file looks up from its phone, disappointed in you. \"I don't think that is it!\"",
        options: [
          { text: "dat", hint: "Close! A .dat file *could* hold text, but it could hold absolutely anything. This file is plainer than that." },
          { text: "csv", hint: "CSV is plain text too, but it's all about commas, columns and rows. This riddle is about stories and notes." },
          { text: "txt", goto: "riddle-dat" },
          { text: "js", hint: "JavaScript is written in plain text, but it's code for web browsers rather than stories and secrets." }
        ]
      }
    },

    "riddle-dat": {
      was: "next file format 1",
      title: "The file in the lab coat",
      text: `Finally, a file format in a lab coat steps up smartly.

> I am a mystery, wrapped tight within,
> No clue from format, where to begin.
> Generic in nature, a data trove,
> My secrets depend on where I rove.
> Binary, text, or hybrid known,
> My contents vary, yet seldom shown.
> A simple extension, no details loud,
> Guess who I am, shrouded in my cloud.
> What am I?`,
      quiz: {
        label: "Which extension belongs to the file in the lab coat?",
        who: "The file adjusts its goggles, disappointed in you. \"I don't think that is it!\"",
        options: [
          { text: "js", hint: "JavaScript always holds code for web pages, so it's not much of a mystery." },
          { text: "csv", hint: "CSV always holds rows of data separated by commas. This file is far more mysterious." },
          { text: "dat", goto: "riddle-success" },
          { text: "py", hint: "Python files always hold Python code. This file could hold anything at all!" }
        ]
      }
    },

    "riddle-success": {
      was: "success",
      title: "Blankets all round",
      text: `The files are so happy and excited to be getting back to what they love doing that they thank you profusely. All except the .txt files, who already have their phones out, busy texting. As Clippy brings blankets and warm provisions, they settle back down to doing what they do best!

Now that the beds have been cleared, you see a long passageway with another window ajar.

[[Determined to accomplish your mission, you set off->art-room]]
[[Hang around to read some super extra fun things about extension-only file formats->fun-things]]`
    },

    "fun-things": {
      was: "fun things",
      kind: "lesson",
      title: "Super extra fun things about extensions",
      learn: ["extension", "extension-only"],
      text: `**Tip 1: Can you see the extensions on your own computer?** Many computers hide them! To show them:

- **Windows 11:** open File Explorer, choose *View*, then *Show*, then tick *File name extensions*.
- **Windows 10:** open File Explorer, choose the *View* tab, then tick *File name extensions*.
- **Mac:** open Finder, choose *Finder* then *Settings* (or *Preferences*), then *Advanced*, and tick *Show all filename extensions*.

**Tip 2: Extensions can be fibs.** Because an extension is just part of the name, your computer can be tricked into thinking a file is something completely different. [[See how Windows can be tricked->windows-trick]].

**Tip 3: Why are CSV, TXT and DAT so hard to identify?** Most formats begin with a special pattern of bytes, a bit like a name badge. Plain text files don't have one: they're just letters from start to finish. In PRONOM, Comma Separated Values (x-fmt/18), Plain Text File (x-fmt/111) and Data File (fmt/1730) have no internal signatures at all, so tools can only go by the extension.

When you are done having so much fun with file extensions, do feel free to go {{back}}.`
    },

    "windows-trick": {
      was: "see how windows can be tricked into thinking it is a completely different file",
      kind: "lesson",
      title: "Tricking your computer",
      learn: ["extension", "signature"],
      text: `Try this little experiment. It's harmless, as long as you **always use a copy**!

1. Make sure you can see file extensions (see Tip 1).
2. Find a photo, for example holiday.jpg, and make a copy of it.
3. Rename the copy to holiday.txt. Your computer will warn you that the file might become unusable. Say yes, you're a researcher!
4. Look at the icon: your computer now thinks it's a text document. Double-click it and it will probably open in a text editor such as Notepad, full of strange gibberish.
5. Look closely at the gibberish near the very start. You might spot letters like **JFIF** or **Exif**. That's the photo's real identity peeking through!
6. Rename it back to holiday.jpg and it opens as a photo again. Nothing inside the file ever changed, only its label.

**What does this show?** The extension is just a name tag, and your computer believes it. That's why identification tools like DROID don't only trust the extension: they look *inside* the file for its internal signature.

[Bonus experiment] Copy a Word document (.docx), rename the copy to .zip, then open it. Surprise! It's a folder full of other files. You'll find out why later in the game...

You may now want to go {{back}}.`
    },

    "art-room": {
      was: "Determined to accomplish your mission you set off.",
      title: "The confused studio",
      text: `The next room is full of broken typewriters, paintings and musical instruments. Files are sitting around trying to draw on flutes, type on the walls or display images at peculiar angles. They are clearly very confused!

The file formats crowd towards you. "Help us, help us, help us!" they cry. "We can't do anything right any more, as we can't remember quite what we are best at. One of us has a signature that starts with **PK**, but we can't remember who. If you look in PRONOM and find our internal signatures, maybe you can help us out."

[[Unsure about internal signatures?->signatures]]`,
      quiz: {
        label: "Which format has a signature starting with PK?",
        who: "The files look disappointed in you. \"I don't think that is it!\"",
        why: "signatures",
        options: [
          { text: "fmt/1556", hint: "fmt/1556 is the Starlink Data Format. Its signature is 53 44 53, which spells “SDS” in ASCII. Not PK!" },
          { text: "fmt/1000", hint: "fmt/1000 is the TZX Format for old ZX Spectrum tapes. Its signature spells “ZXTape!”. Not PK!" },
          { text: "fmt/2000", hint: "fmt/2000 is the Husqvarna Embroidery Stitch File, and its signature starts with 5B or 5D. Not PK!" },
          { text: "x-fmt/263", goto: "recycling" }
        ]
      }
    },

    "signatures": {
      was: "Unsure about internal signatures?",
      kind: "lesson",
      title: "But why?! Internal signatures",
      learn: ["signature", "offset", "hex"],
      text: `Many file formats start with a special pattern of bytes, a bit like a name badge pinned to the front of the file. These are often called **magic numbers**, and PRONOM calls them **internal signatures**.

Here are some you might meet:

<div class="table-wrap"><table>
<caption>Some famous file signatures</caption>
<thead><tr><th scope="col">Format</th><th scope="col">First bytes in hex</th><th scope="col">As ASCII letters</th></tr></thead>
<tbody>
<tr><td>PDF</td><td>25 50 44 46</td><td>%PDF</td></tr>
<tr><td>PNG image</td><td>89 50 4E 47</td><td>‰PNG</td></tr>
<tr><td>GIF image</td><td>47 49 46 38</td><td>GIF8</td></tr>
<tr><td>ZIP</td><td>50 4B 03 04</td><td>PK..</td></tr>
</tbody>
</table></div>

**Where do I find them in PRONOM?** Open a format's page and look for the *Internal signatures* section. Each signature has a *Byte sequence* written in hex, plus some instructions for where to look:

- **BOF** means "beginning of file" and **EOF** means "end of file".
- The **offset** says how many bytes in from there the pattern starts. An offset of 0 from BOF means the very first byte.
- Curly brackets like {43-65531} mean "skip somewhere between 43 and 65,531 bytes", and brackets like (5B|5D) mean "either 5B or 5D".

**Cracking the PK puzzle:** The letter P is 80 in ASCII, which is **50** in hex. K is 75, which is **4B**. So you're looking for a signature that starts with 50 4B. Search each PUID in PRONOM and compare its byte sequence!

You may now want to go {{back}}.`
    },

    "recycling": {
      was: "Recycling",
      title: "The recycling chute",
      learn: ["zip"],
      text: `The clutter on the floor quickly falls back into use, and the files creatively set about their tasks again, chattering and singing and drawing. Now that the room is clearer, you can spot a rubbish chute in the corner. Two arrows chase each other in a circle: a recycling collection point!

Looking through the chute, you see a large slide, and with only a few seconds of hesitation...

[[You take it!->ram]]
[[Then again, maybe there is a little bit of time to learn some fun facts about x-fmt/263->zip-facts]]`
    },

    "zip-facts": {
      was: "x-fmt/263",
      kind: "lesson",
      title: "Fun facts about x-fmt/263 (ZIP)",
      learn: ["zip", "container", "lossless"],
      text: `- **PK is a person!** The letters PK at the start of every ZIP file are the initials of **Phil Katz**, who created the ZIP format for his program PKZIP in 1989.
- **Looking at both ends.** PRONOM's main ZIP signature checks for 50 4B 03 04 at the beginning of the file *and* for the "end of central directory" record near the end. A ZIP file keeps a table of contents at its tail!
- **ZIP is lossless.** Squash files into a ZIP and unzip them again, and you get back every single bit.
- **Secret ZIPs everywhere.** Word documents (.docx), Excel spreadsheets (.xlsx), PowerPoint (.pptx), OpenDocument files (.odt), EPUB e-books, Java programs (.jar) and Android apps (.apk) are all ZIP files with special contents inside. These are called **container formats**.
- **Why that matters.** If a tool only checked the PK signature, every Word document would be identified as a plain old ZIP! So PRONOM also has **container signatures**, which tell tools like DROID to look *inside* the ZIP for tell-tale files (a .docx contains a folder called "word", for example).

[Try it yourself] Remember the bonus experiment? Copy a .docx file, rename the copy to .zip and open it. Look for the "word" folder and a file called document.xml: that's where your words live!

You may now want to go {{back}}.`
    },

    "ram": {
      was: "you take it!",
      title: "The RAM",
      text: `As you enter the recycling bin, you feel a smog descending upon you. A terrifying RAM with a golden fleece and red eyes emerges from the gloom. It is moving very, very slowly and seems confused. Coughing, spluttering and sneezing, the RAM speaks to you in a croaky voice.

"I believe I am supposed to be the embodiment of memory, but I remember nothing!"

"If only you could help me remember. Can you answer some questions for me? It might just trigger something in my mind. Everything around me is moving so slowly since I became weak."

[[Answer the RAM's questions->ram-question]]
[[Maybe it is time to go home for some cosy hot chocolate->hot-chocolate]]`
    },

    "ram-question": {
      was: "answer the ram's questions",
      title: "The RAM's question",
      text: `The RAM asks, "I can't remember what it is, but I need to work out what this definition means... It was told to me by a young child recently and I think it will jog my memory. The child was trying to explain one of these terms:"

> This is like a magic trick! Imagine you have a big doll's house that you can't fit into your toy box. Then a magician comes and uses a magic spell to shrink it down and fit it into the box. The good news is that whenever you want, the magician can undo the magic and your doll's house will be just as it was before.
>
> In the same way, this shrinks files so they take up less space, but can bring them back to their original size without losing any information.

[[But why?! Tell me about compression->why-compression]]`,
      quiz: {
        label: "What is the child describing?",
        who: "The RAM looks disappointed in you, and very, very slowly shakes its head.",
        why: "why-compression",
        options: [
          { text: "Lossy compression", hint: "Lossy compression makes files smaller by throwing some detail away for ever, like a JPEG photo. The doll's house would come back a bit blurry!" },
          { text: "7zip", hint: "7-Zip is a program (and a format) for squashing files, but the child is describing the *idea*, not a particular tool." },
          { text: "Lossless compression", goto: "final" },
          { text: "Fixity", hint: "Fixity is about proving a file hasn't changed, using a digital fingerprint called a checksum. Nothing gets shrunk!" }
        ]
      }
    },

    "why-compression": {
      kind: "lesson",
      title: "But why?! Squashing files",
      learn: ["lossless", "lossy", "fixity"],
      text: `**Compression** means making a file take up less space. There are two big families:

- **Lossless compression** shrinks a file without losing anything. Unpack it and you get back exactly what you started with, bit for bit. ZIP, PNG images and FLAC audio are lossless.
- **Lossy compression** shrinks files much more by throwing away detail that people probably won't notice, like tiny colour differences in a photo or very quiet sounds in music. JPEG photos and MP3s are lossy. Once that detail is gone, it's gone for good.

**Why do archives care?** If you're keeping something for hundreds of years, you usually want to keep every last bit. Each time a lossy file is saved again, it can lose a little more detail, a bit like photocopying a photocopy.

**And fixity?** Archives also need to prove that files haven't changed over time. They calculate a **checksum**, a short digital fingerprint (such as MD5 or SHA-256). Years later they calculate it again: if the fingerprints match, the file hasn't changed by a single bit. That's called checking the file's fixity.

You may now want to go {{back}}.`
    },

    "final": {
      was: "final success",
      title: "Home at last",
      art: "chocolate-mouse",
      learn: ["contribute"],
      ending: { id: "chocolate", name: "The Chocolate Mouse Ending" },
      text: `The smog clears and the RAM's eyes twinkle as its memory floods back. With a grateful "baaa-ck up!" it sends you whooshing up the slide, and you find yourself back in your flat.

Now surely it is time for that hot chocolate. You head towards your cupboard, and when you open it you see that the remains of your hot chocolate have disappeared. Where it was, there is a mouse.

A rather large mouse, with chocolate smears all over its whiskers...

Hmmmmm, if only you'd headed home sooner!

[[What did I learn?->debrief]]`
    },

    "debrief": {
      kind: "lesson",
      title: "Your research notes",
      text: `Congratulations, file format researcher! The files of Bits and Bytes know who they are again, thanks to you.

Here's what's in your notebook so far:

{{notebook}}

Want to keep going? File format research is a real job, and a real hobby, and the community always needs more curious people. Here are some places to start:

{{resources}}

{{restart}}`
    }
  }
};
