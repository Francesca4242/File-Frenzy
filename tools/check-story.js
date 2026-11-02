#!/usr/bin/env node
/*
  Checks js/story.js for mistakes: links to passages that don't exist,
  unknown notebook facts or pictures, passages nobody can reach, and
  passages with no way out.

  Run it with:  node tools/check-story.js
*/
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "js/story.js"), "utf8"), sandbox);
const S = sandbox.window.STORY;

const errors = [];
const warnings = [];
const ids = Object.keys(S.passages);

function linksOf(p) {
  const out = [];
  const re = /\[\[(.+?)\]\]/g;
  let m;
  while ((m = re.exec(p.text || ""))) {
    const inner = m[1];
    let t;
    if (inner.includes("->")) t = inner.split("->").pop();
    else if (inner.includes("<-")) t = inner.split("<-")[0];
    else if (inner.includes("|")) t = inner.split("|").pop();
    else t = inner;
    out.push(t.trim());
  }
  if (p.quiz) {
    p.quiz.options.forEach((o) => o.goto && out.push(o.goto));
    if (p.quiz.why) out.push(p.quiz.why);
    p.quiz.options.forEach((o) => {
      if (!o.goto && !o.hint) warnings.push(`quiz option "${o.text}" has neither goto nor hint`);
    });
    if (!p.quiz.options.some((o) => o.goto)) errors.push("a quiz has no correct answer (no option with goto)");
  }
  return out;
}

if (!S.passages[S.start]) errors.push(`start passage "${S.start}" does not exist`);

for (const id of ids) {
  const p = S.passages[id];
  if (!p.title) warnings.push(`"${id}" has no title`);
  for (const t of linksOf(p)) if (!S.passages[t]) errors.push(`"${id}" links to missing passage "${t}"`);
  for (const f of p.learn || []) if (!S.facts[f]) errors.push(`"${id}" teaches unknown fact "${f}"`);
  if (p.art && !S.art[p.art]) errors.push(`"${id}" uses unknown picture "${p.art}"`);
  const hasExit = linksOf(p).length || /\{\{(back|restart)/.test(p.text || "") || p.ending;
  if (!hasExit) errors.push(`"${id}" is a dead end (no links, no {{back}}, not an ending)`);
}

for (const [key, a] of Object.entries(S.art)) {
  if (!a.alt) errors.push(`picture "${key}" has no alt text`);
  if (!fs.existsSync(path.join(root, a.src))) errors.push(`picture "${key}" file missing: ${a.src}`);
}

// Reachability
const seen = new Set([S.start]);
const queue = [S.start];
while (queue.length) {
  const p = S.passages[queue.shift()];
  if (!p) continue;
  for (const t of linksOf(p)) if (S.passages[t] && !seen.has(t)) { seen.add(t); queue.push(t); }
}
for (const id of ids) if (!seen.has(id)) warnings.push(`"${id}" can't be reached from the start`);

const taught = new Set(ids.flatMap((id) => S.passages[id].learn || []));
for (const f of Object.keys(S.facts)) if (!taught.has(f)) warnings.push(`fact "${f}" is never added to the notebook`);

warnings.forEach((w) => console.log("warning: " + w));
errors.forEach((e) => console.log("ERROR:   " + e));
console.log(`\n${ids.length} passages, ${Object.keys(S.facts).length} facts, ${Object.keys(S.art).length} pictures. ` +
  `${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
