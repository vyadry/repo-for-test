const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildFolderUrl,
  buildFileUrl,
  buildBreadcrumbs
} = require("../../utils/navigation");

const urlCases = [
  ["ASCII hierarchy", "one/two", "/files/h/one/two", "/content/h/one/two"],
  ["spaces and punctuation", "team notes/spec#1?.txt",
    "/files/h/team%20notes/spec%231%3F.txt", "/content/h/team%20notes/spec%231%3F.txt"],
  ["Unicode", "café/文.txt",
    "/files/h/caf%C3%A9/%E6%96%87.txt", "/content/h/caf%C3%A9/%E6%96%87.txt"],
  ["additional reserved characters", "a&b/c+d",
    "/files/h/a%26b/c%2Bd", "/content/h/a%26b/c%2Bd"],
  ["URL delimiters", "a:b/c=d;@[]",
    "/files/h/a%3Ab/c%3Dd%3B%40%5B%5D", "/content/h/a%3Ab/c%3Dd%3B%40%5B%5D"],
  ["literal percent sequence", "x%20y",
    "/files/h/x%2520y", "/content/h/x%2520y"],
  ["space distinct from percent sequence", "x y",
    "/files/h/x%20y", "/content/h/x%20y"],
  ["combined percent and punctuation", "a%#?/leaf",
    "/files/h/a%25%23%3F/leaf", "/content/h/a%25%23%3F/leaf"],
  ["multiple nested names", "team notes/文#?/read me.txt",
    "/files/h/team%20notes/%E6%96%87%23%3F/read%20me.txt",
    "/content/h/team%20notes/%E6%96%87%23%3F/read%20me.txt"],
  ["trailing separator", "team notes/文#?/",
    "/files/h/team%20notes/%E6%96%87%23%3F/",
    "/content/h/team%20notes/%E6%96%87%23%3F/"]
];

for (const [name, path, folderHref, fileHref] of urlCases) {
  test("exact folder and file hrefs: " + name, () => {
    assert.equal(buildFolderUrl("h", path), folderHref);
    assert.equal(buildFileUrl("h", path), fileHref);
  });
}

test("default and empty folder paths target the commit root", () => {
  assert.equal(buildFolderUrl("h"), "/files/h/");
  assert.equal(buildFolderUrl("h", ""), "/files/h/");
});

test("history and commit root retain non-clickable current locations", () => {
  assert.deepEqual(buildBreadcrumbs(), [{ text: "HISTORY", href: undefined }]);
  assert.deepEqual(buildBreadcrumbs(undefined, "ignored/path"), [
    { text: "HISTORY", href: undefined }
  ]);
  for (const path of [undefined, "", "///"]) {
    assert.deepEqual(buildBreadcrumbs("h", path), [
      { text: "HISTORY", href: "/" },
      { text: "ROOT", href: undefined }
    ]);
  }
});

const breadcrumbCases = [
  ["ASCII hierarchy", "one/two", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "one", href: "/files/h/one/" },
    { text: "two" }
  ]],
  ["redundant separators", "/one//two/", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "one", href: "/files/h/one/" },
    { text: "two" }
  ]],
  ["nested file with original labels", "team notes/文#?/read me.txt", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "team notes", href: "/files/h/team%20notes/" },
    { text: "文#?", href: "/files/h/team%20notes/%E6%96%87%23%3F/" },
    { text: "read me.txt" }
  ]],
  ["nested folder with original labels", "team notes/文#?/", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "team notes", href: "/files/h/team%20notes/" },
    { text: "文#?" }
  ]],
  ["literal percent ancestor", "x%20y/leaf", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "x%20y", href: "/files/h/x%2520y/" },
    { text: "leaf" }
  ]],
  ["space ancestor", "x y/leaf", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "x y", href: "/files/h/x%20y/" },
    { text: "leaf" }
  ]],
  ["literal percent final label", "one/x%20y", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "one", href: "/files/h/one/" },
    { text: "x%20y" }
  ]],
  ["percent and punctuation ancestor", "a%#?/leaf", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "a%#?", href: "/files/h/a%25%23%3F/" },
    { text: "leaf" }
  ]],
  ["additional reserved ancestors", "a&b/c+d/leaf", [
    { text: "HISTORY", href: "/" },
    { text: "ROOT", href: "/files/h/" },
    { text: "a&b", href: "/files/h/a%26b/" },
    { text: "c+d", href: "/files/h/a%26b/c%2Bd/" },
    { text: "leaf" }
  ]]
];

for (const [name, path, expected] of breadcrumbCases) {
  test("complete breadcrumbs: " + name, () => {
    const actual = buildBreadcrumbs("h", path);
    assert.deepEqual(actual, expected);
    assert.equal(Object.hasOwn(actual[actual.length - 1], "href"), false);
  });
}
