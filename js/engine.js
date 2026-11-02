/*
  File Frenzy – a small, accessible story engine.
  It reads window.STORY (js/story.js) and turns passages into pages.
  You shouldn't need to edit this file to change the story.
*/
(function () {
  "use strict";

  var STORY = window.STORY;
  var SAVE_KEY = "file-frenzy-save-v1";
  var SETTINGS_KEY = "file-frenzy-settings-v1";
  var ENDING_TOTAL = Object.keys(STORY.passages).filter(function (id) { return STORY.passages[id].ending; }).length;

  var DEFAULT_SETTINGS = {
    theme: "classic", font: "classic", size: "m", spacing: "normal",
    motion: false, pictures: true, tts: false
  };

  var storyEl = document.getElementById("story");
  var announcer = document.getElementById("announcer");
  var backBtn = document.getElementById("btn-back");
  var countEl = document.getElementById("notebook-count");

  /* ---------- Storage (always optional: the game works without it) ---------- */
  function load(key) {
    try { var raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
  function forget(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  var state = freshState();
  var saved = load(SAVE_KEY);
  if (saved && typeof saved === "object") {
    state.facts = Array.isArray(saved.facts) ? saved.facts.filter(function (f) { return STORY.facts[f]; }) : [];
    state.endings = Array.isArray(saved.endings) ? saved.endings : [];
    if (saved.current && STORY.passages[saved.current]) {
      state.current = saved.current;
      state.history = (saved.history || []).filter(function (h) { return STORY.passages[h]; });
    }
  }
  var settings = Object.assign({}, DEFAULT_SETTINGS, load(SETTINGS_KEY) || {});

  function freshState() {
    return { current: null, history: [], facts: [], endings: [] };
  }
  function persist() {
    save(SAVE_KEY, { current: state.current, history: state.history.slice(-100), facts: state.facts, endings: state.endings });
  }

  /* ---------- Small helpers ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function announce(msg) {
    announcer.textContent = "";
    window.setTimeout(function () { announcer.textContent = msg; }, 50);
  }

  /* ---------- Markup ---------- */
  // Twine-style links: [[Label->target]], [[target<-Label]], [[Label|target]], [[target]]
  function parseLink(inner) {
    var m;
    if ((m = inner.match(/^(.*)->(.*)$/))) return { label: m[1].trim(), target: m[2].trim() };
    if ((m = inner.match(/^(.*)<-(.*)$/))) return { label: m[2].trim(), target: m[1].trim() };
    if ((m = inner.match(/^(.*)\|(.*)$/))) return { label: m[1].trim(), target: m[2].trim() };
    return { label: inner.trim(), target: inner.trim() };
  }

  function inline(text) {
    var links = [];
    text = text.replace(/\[\[(.+?)\]\]/g, function (_, inner) {
      links.push(parseLink(inner));
      return "\u0000" + (links.length - 1) + "\u0000";
    });
    text = text
      .replace(/\{\{back(?::([^}]+))?\}\}/g, function (_, label) {
        return '<button type="button" class="inline-link" data-action="back">' + escapeHtml(label || "back") + "</button>";
      })
      .replace(/\{\{restart\}\}/g, '<button type="button" class="inline-link" data-action="restart">Play again from the beginning</button>')
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, function (_, label, url) {
        return '<a href="' + url + '" target="_blank" rel="noopener">' + label + '<span class="visually-hidden"> (opens in a new tab)</span></a>';
      })
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?!\w)/g, "$1<em>$2</em>");
    return text.replace(/\u0000(\d+)\u0000/g, function (_, i) {
      var l = links[+i];
      return '<button type="button" class="inline-link" data-goto="' + escapeHtml(l.target) + '">' + escapeHtml(l.label) + "</button>";
    });
  }

  function choiceList(lines) {
    var ul = el("ul", { "class": "choices" });
    lines.forEach(function (line) {
      var l = parseLink(line.trim().slice(2, -2));
      var btn = el("button", { type: "button", "class": "choice", "data-goto": l.target });
      btn.innerHTML = inline(l.label);
      ul.appendChild(el("li", null, [btn]));
    });
    return ul;
  }

  function binaryBlock(code) {
    var wrap = el("div");
    wrap.appendChild(el("p", { "class": "binary", "aria-hidden": "true", text: code }));
    var spoken = "Binary code: " + code.split(/\s+/).map(function (g) { return g.split("").join(" "); }).join(", then ");
    wrap.appendChild(el("p", { "class": "visually-hidden", text: spoken }));
    return wrap;
  }

  function renderText(src, into) {
    var blocks = src.replace(/\r/g, "").split(/\n\s*\n/);
    blocks.forEach(function (block) {
      var trimmed = block.trim();
      if (!trimmed) return;
      var lines = trimmed.split("\n").map(function (l) { return l.trim(); });

      if (trimmed === "{{notebook}}") { into.appendChild(notebookList(2, false)); return; }
      if (trimmed === "{{resources}}") { into.appendChild(resourcesList(2)); return; }
      if (trimmed.charAt(0) === "<") { var raw = el("div"); raw.innerHTML = trimmed; while (raw.firstChild) into.appendChild(raw.firstChild); return; }
      if (lines.every(function (l) { return /^\[\[.+\]\]$/.test(l); })) { into.appendChild(choiceList(lines)); return; }
      if (lines.every(function (l) { return l.indexOf(">") === 0; })) {
        var verse = el("blockquote", { "class": "verse" });
        verse.innerHTML = lines.map(function (l) { return inline(l.replace(/^>\s?/, "")); }).join("<br>");
        into.appendChild(verse);
        return;
      }
      if (trimmed.indexOf("%%") === 0) { into.appendChild(binaryBlock(trimmed.replace(/^%%\s*/, ""))); return; }
      if (lines.every(function (l) { return /^- /.test(l); })) {
        var ul = el("ul");
        lines.forEach(function (l) { ul.appendChild(el("li", { html: inline(l.slice(2)) })); });
        into.appendChild(ul);
        return;
      }
      if (lines.every(function (l) { return /^\d+\. /.test(l); })) {
        var ol = el("ol");
        lines.forEach(function (l) { ol.appendChild(el("li", { html: inline(l.replace(/^\d+\. /, "")) })); });
        into.appendChild(ol);
        return;
      }
      var callout = trimmed.match(/^\[([^\[\]]+)\]\s+(?!\()([\s\S]*)$/);
      if (callout) {
        var box = el("div", { "class": "callout", "data-label": callout[1] });
        box.appendChild(el("p", { "class": "visually-hidden", text: callout[1] + ":" }));
        box.appendChild(el("p", { html: inline(callout[2].replace(/\n/g, " ")) }));
        into.appendChild(box);
        return;
      }
      // A paragraph that ends with a run of choice lines: split it.
      var firstChoice = lines.findIndex(function (l, i) {
        return lines.slice(i).every(function (x) { return /^\[\[.+\]\]$/.test(x); });
      });
      if (firstChoice > 0) {
        into.appendChild(el("p", { html: inline(lines.slice(0, firstChoice).join(" ")) }));
        into.appendChild(choiceList(lines.slice(firstChoice)));
        return;
      }
      into.appendChild(el("p", { html: inline(lines.join(" ")) }));
    });
  }

  /* ---------- Notebook and resources ---------- */
  function addFacts(ids, into) {
    var added = [];
    (ids || []).forEach(function (id) {
      if (STORY.facts[id] && state.facts.indexOf(id) === -1) { state.facts.push(id); added.push(STORY.facts[id].title); }
    });
    if (added.length) {
      var msg = added.length === 1
        ? "New in your notebook: " + added[0]
        : added.length + " new notes in your notebook: " + added.join(", ");
      if (into) into.appendChild(el("p", { "class": "new-notes", text: "📓 " + msg }));
      announce(msg);
    }
    updateCount();
  }
  function updateCount() { countEl.textContent = state.facts.length; }

  function notebookList(level, showLocked) {
    var wrap = el("div", { "class": "notebook" });
    var total = Object.keys(STORY.facts).length;
    wrap.appendChild(el("p", { "class": "progress", text: "You’ve collected " + state.facts.length + " of " + total + " notes, and found " + state.endings.length + " of " + ENDING_TOTAL + " endings." }));
    if (!state.facts.length) {
      wrap.appendChild(el("p", { text: "Your notebook is empty for now. Every “But why?!” lesson you read adds a note here." }));
    }
    var ids = Object.keys(STORY.facts).filter(function (id) { return state.facts.indexOf(id) !== -1; });
    ids.forEach(function (id) {
      var f = STORY.facts[id];
      var item = el("div", { "class": "fact" });
      item.appendChild(el("h" + (level + 1 > 6 ? 6 : level), { text: f.title }));
      item.appendChild(el("p", { text: f.text }));
      if (f.link) {
        var p = el("p");
        p.innerHTML = inline("[" + escapeHtml(f.link.label) + "](" + f.link.url + ")");
        item.appendChild(p);
      }
      wrap.appendChild(item);
    });
    var left = total - ids.length;
    if (showLocked && left > 0) {
      wrap.appendChild(el("p", { "class": "small", text: left + " more " + (left === 1 ? "note is" : "notes are") + " hidden in the game. Try the “But why?!” links and the side paths!" }));
    }
    return wrap;
  }

  function resourcesList(level) {
    var wrap = el("div", { "class": "resources" });
    STORY.resources.forEach(function (group) {
      wrap.appendChild(el("h" + level, { text: group.heading }));
      var ul = el("ul");
      group.items.forEach(function (item) {
        var li = el("li");
        li.innerHTML = inline("[" + escapeHtml(item.label) + "](" + item.url + ")") + " – " + escapeHtml(item.text);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    });
    return wrap;
  }

  /* ---------- Quizzes ---------- */
  var LETTERS = "ABCDEFGHIJ";
  function renderQuiz(quiz, pid) {
    var id = "quiz-" + pid;
    var wrap = el("div", { "class": "quiz", role: "group", "aria-labelledby": id });
    wrap.appendChild(el("p", { "class": "quiz-label", id: id, text: quiz.label || "Choose an answer:" }));
    var ul = el("ul", { "class": "choices" });
    var feedback = el("div", { "class": "feedback", id: id + "-feedback" });
    quiz.options.forEach(function (opt, i) {
      var label = LETTERS.charAt(i) + ") " + opt.text;
      var btn = el("button", { type: "button", "class": "choice" });
      btn.innerHTML = escapeHtml(label);
      if (opt.goto) {
        btn.setAttribute("data-goto", opt.goto);
      } else {
        btn.setAttribute("aria-describedby", id + "-feedback");
        btn.addEventListener("click", function () {
          btn.classList.add("tried");
          feedback.innerHTML = "";
          if (quiz.who) feedback.appendChild(el("p", { "class": "who", html: inline(quiz.who) }));
          if (opt.hint) feedback.appendChild(el("p", { html: "<strong>Hint:</strong> " + inline(opt.hint) }));
          if (quiz.why) {
            var p = el("p");
            p.innerHTML = inline("[[But why?!->" + quiz.why + "]]");
            feedback.appendChild(p);
          }
          announce("Not quite. " + feedback.textContent.replace(/But why\?!$/, ""));
        });
      }
      ul.appendChild(el("li", null, [btn]));
    });
    wrap.appendChild(ul);
    wrap.appendChild(feedback);
    return wrap;
  }

  /* ---------- Pictures ---------- */
  function figure(key) {
    var art = STORY.art[key];
    if (!art) return null;
    var img = el("img", { src: art.src, alt: art.alt, loading: "lazy" });
    var fig = el("figure", { "class": "art" + (art.wide ? " wide" : "") }, [img]);
    img.addEventListener("error", function () { fig.remove(); });
    return fig;
  }

  /* ---------- Read aloud ---------- */
  var canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  function stopSpeaking() { if (canSpeak) window.speechSynthesis.cancel(); }
  function readAloudButton(target) {
    var btn = el("button", { type: "button", "aria-pressed": "false" }, ["🔊 Read aloud"]);
    btn.addEventListener("click", function () {
      if (window.speechSynthesis.speaking) {
        stopSpeaking();
        btn.textContent = "🔊 Read aloud"; btn.setAttribute("aria-pressed", "false");
        return;
      }
      var clone = target.cloneNode(true);
      clone.querySelectorAll(".tools, [aria-hidden='true'], .num").forEach(function (n) { n.remove(); });
      var u = new window.SpeechSynthesisUtterance(clone.innerText || clone.textContent);
      u.lang = "en-GB";
      u.onend = function () { btn.textContent = "🔊 Read aloud"; btn.setAttribute("aria-pressed", "false"); };
      btn.textContent = "⏹ Stop reading"; btn.setAttribute("aria-pressed", "true");
      window.speechSynthesis.speak(u);
    });
    return btn;
  }

  /* ---------- Pages ---------- */
  function numberChoices(root) {
    var buttons = root.querySelectorAll(".choice");
    buttons.forEach(function (b, i) {
      if (i < 9) b.insertBefore(el("span", { "class": "num", "aria-hidden": "true", text: String(i + 1) }), b.firstChild);
    });
  }

  function render(id, focus) {
    stopSpeaking();
    var p = STORY.passages[id];
    storyEl.innerHTML = "";
    if (!p) {
      storyEl.appendChild(el("section", { "class": "passage" }, [
        el("h1", { tabindex: "-1", text: "Lost in the tunnels" }),
        el("p", { text: "This page (“" + id + "”) seems to have been eaten by mice. Go back and try another path." })
      ]));
      return;
    }
    var section = el("section", { "class": "passage" + (p.kind === "lesson" ? " lesson" : ""), "aria-labelledby": "passage-title" });
    if (p.kind === "lesson") section.appendChild(el("p", { "class": "kicker", text: "Lesson" }));
    var h = el("h1", { id: "passage-title", tabindex: "-1", text: p.title || id });
    section.appendChild(h);
    if (p.art) { var fig = figure(p.art); if (fig) section.appendChild(fig); }
    renderText(p.text || "", section);
    if (p.quiz) section.appendChild(renderQuiz(p.quiz, id));

    if (p.ending) {
      if (state.endings.indexOf(p.ending.id) === -1) state.endings.push(p.ending.id);
      var box = el("div", { "class": "ending", role: "note" });
      box.appendChild(el("strong", { text: "The End: " + p.ending.name }));
      box.appendChild(el("span", { text: "You’ve found " + state.endings.length + " of " + ENDING_TOTAL + " endings." }));
      section.appendChild(box);
      if (!/\[\[/.test(p.text)) {
        var again = el("ul", { "class": "choices" });
        again.appendChild(el("li", null, [el("button", { type: "button", "class": "choice", "data-action": "restart", text: "Play again from the beginning" })]));
        again.appendChild(el("li", null, [el("button", { type: "button", "class": "choice", "data-action": "learn", text: "Learn more about file formats" })]));
        section.appendChild(again);
      }
    }

    var tools = el("div", { "class": "tools" });
    if (canSpeak && settings.tts) tools.appendChild(readAloudButton(section));
    if (tools.childNodes.length) section.appendChild(tools);

    numberChoices(section);
    storyEl.appendChild(section);
    document.title = (p.title || id) + " – " + STORY.meta.title;
    backBtn.disabled = state.history.length === 0;
    if (focus) h.focus();
    addFacts(p.learn, section);
  }

  function go(id) {
    if (state.current) state.history.push(state.current);
    state.current = id;
    render(id, true);
    persist();
  }
  function back() {
    if (!state.history.length) return;
    state.current = state.history.pop();
    render(state.current, true);
    persist();
  }
  function restart() {
    state.current = null;
    state.history = [];
    persist();
    titleScreen(true);
  }

  function titleScreen(focus) {
    stopSpeaking();
    storyEl.innerHTML = "";
    backBtn.disabled = true;
    document.title = STORY.meta.title;
    var s = el("section", { "class": "passage title-screen", "aria-labelledby": "title-heading" });
    var art = el("div", { "class": "title-art" });
    ["mouse", "hot-chocolate"].forEach(function (k) {
      var a = STORY.art[k];
      if (a) {
        var img = el("img", { src: a.src, alt: "" });
        img.addEventListener("error", function () { img.remove(); });
        art.appendChild(img);
      }
    });
    s.appendChild(art);
    var h = el("h1", { id: "title-heading", tabindex: "-1", text: STORY.meta.title });
    s.appendChild(h);
    s.appendChild(el("p", { "class": "tagline", text: STORY.meta.tagline }));
    var buttons = el("div", { "class": "start-buttons" });
    if (state.current) {
      buttons.appendChild(el("button", { type: "button", "class": "primary", onclick: function () { render(state.current, true); } }, ["Continue your adventure"]));
      buttons.appendChild(el("button", { type: "button", "class": "secondary", onclick: function () { state.history = []; state.current = null; go(STORY.start); } }, ["Start a new adventure"]));
    } else {
      buttons.appendChild(el("button", { type: "button", "class": "primary", onclick: function () { go(STORY.start); } }, ["Start the adventure"]));
    }
    s.appendChild(buttons);
    var notes = el("div", { "class": "notes" });
    notes.innerHTML =
      "<p><strong>Before you start:</strong> this is a choose-your-own-adventure game. Pick choices with your mouse, by tapping, with <kbd>Tab</kbd> and <kbd>Enter</kbd>, or with the number keys. Wrong answers give hints, not game overs.</p>" +
      "<p>One puzzle asks you to search the <a href=\"https://pronom.nationalarchives.gov.uk/\" target=\"_blank\" rel=\"noopener\">PRONOM file format database<span class=\"visually-hidden\"> (opens in a new tab)</span></a>, so internet access helps (but there is a button to show the answers).</p>" +
      "<p>Change colours, fonts and text size in <strong>Settings</strong>. Lessons you discover are saved in your <strong>Notebook</strong>.</p>" +
      "<p>This is a new version of <a href=\"" + STORY.meta.originalPlay + "\" target=\"_blank\" rel=\"noopener\">File Format Frenzy<span class=\"visually-hidden\"> (opens in a new tab)</span></a>, made with Twine.</p>";
    s.appendChild(notes);
    storyEl.appendChild(s);
    if (focus) h.focus();
  }

  /* ---------- Dialogs ---------- */
  function openDialog(id, fill) {
    var d = document.getElementById(id);
    if (fill) fill(d);
    var opener = document.activeElement;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    d.addEventListener("close", function onClose() {
      d.removeEventListener("close", onClose);
      if (opener && opener.focus && document.contains(opener)) opener.focus();
    });
  }
  function closeDialog(d) { if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); }

  document.querySelectorAll("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) {
      if (e.target === d) closeDialog(d); // click on the backdrop
      if (e.target.closest("[data-close]")) closeDialog(d);
    });
  });

  function openNotebook() {
    openDialog("dlg-notebook", function () {
      var body = document.getElementById("notebook-body");
      body.innerHTML = "";
      body.appendChild(notebookList(3, true));
      var reset = el("button", { type: "button", "class": "secondary" }, ["Forget my notes and endings"]);
      reset.addEventListener("click", function () {
        if (window.confirm("Clear your notebook and found endings? Your place in the story is kept.")) {
          state.facts = []; state.endings = []; persist(); updateCount();
          closeDialog(document.getElementById("dlg-notebook"));
          announce("Notebook cleared.");
        }
      });
      body.appendChild(el("p", null, [reset]));
    });
  }
  function openLearn() {
    openDialog("dlg-learn", function () {
      var body = document.getElementById("learn-body");
      body.innerHTML = "";
      body.appendChild(el("p", { text: "Curious? These free websites and tools are used by real file format researchers and digital archivists." }));
      body.appendChild(resourcesList(3));
    });
  }

  /* ---------- Settings ---------- */
  var form = document.getElementById("settings-form");
  function applySettings() {
    var root = document.documentElement;
    root.setAttribute("data-theme", settings.theme);
    root.setAttribute("data-font", settings.font);
    root.setAttribute("data-size", settings.size);
    root.setAttribute("data-spacing", settings.spacing);
    root.setAttribute("data-motion", settings.motion ? "reduce" : "auto");
    root.setAttribute("data-pictures", settings.pictures ? "on" : "off");
  }
  function syncForm() {
    ["theme", "font", "size", "spacing"].forEach(function (name) {
      var input = form.querySelector('input[name="' + name + '"][value="' + settings[name] + '"]');
      if (input) input.checked = true;
    });
    form.elements.motion.checked = !!settings.motion;
    form.elements.pictures.checked = !!settings.pictures;
    form.elements.tts.checked = !!settings.tts;
  }
  form.addEventListener("change", function (e) {
    var t = e.target;
    settings[t.name] = t.type === "checkbox" ? t.checked : t.value;
    applySettings();
    save(SETTINGS_KEY, settings);
    if (t.name === "tts" && state.current && storyEl.querySelector(".passage:not(.title-screen)")) render(state.current, false);
  });
  if (!canSpeak) document.getElementById("tts-setting").hidden = true;

  /* ---------- Events ---------- */
  storyEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-goto], [data-action]");
    if (!t) return;
    var target = t.getAttribute("data-goto");
    var action = t.getAttribute("data-action");
    if (target) go(target);
    else if (action === "back") back();
    else if (action === "restart") restart();
    else if (action === "learn") openLearn();
  });
  backBtn.addEventListener("click", back);
  document.getElementById("btn-notebook").addEventListener("click", openNotebook);
  document.getElementById("btn-learn").addEventListener("click", openLearn);
  document.getElementById("btn-settings").addEventListener("click", function () { openDialog("dlg-settings", syncForm); });
  document.getElementById("btn-help").addEventListener("click", function () { openDialog("dlg-help"); });
  document.getElementById("btn-restart").addEventListener("click", function () {
    closeDialog(document.getElementById("dlg-help"));
    restart();
  });

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector("dialog[open]")) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
    if (/^[1-9]$/.test(e.key)) {
      var buttons = storyEl.querySelectorAll(".choice");
      var b = buttons[+e.key - 1];
      if (b) { e.preventDefault(); b.click(); }
    } else if ((e.key === "Backspace" || e.key === "b" || e.key === "B") && !backBtn.disabled) {
      e.preventDefault();
      back();
    }
  });

  /* ---------- Start ---------- */
  applySettings();
  updateCount();
  titleScreen(false);
})();
