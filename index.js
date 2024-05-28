const parseAnimationShorthand = require("./lib/animationShorthand");

const HASH_PREFIX = "<hash>";
const DEFAULT_GLOBAL_REGEXP = "^global--(.+)$";
const DEFAULT_LOCAL_REGEXP = "^local--(.+)$";
const PROCESSED = Symbol("processed");

const plugin = ({
  prefix = HASH_PREFIX,
  generateHashedPrefix = plugin.generateHashedPrefix,
  defaultScope = "global",
  globalRegExp = DEFAULT_GLOBAL_REGEXP,
  localRegExp = DEFAULT_LOCAL_REGEXP,
}) => {
  const isHashPrefix = prefix === HASH_PREFIX;
  let resolvedPrefix = prefix;

  const GLOBAL_REGEXP = new RegExp(globalRegExp);
  const LOCAL_REGEXP = new RegExp(localRegExp);

  function isGlobal(name) {
    return GLOBAL_REGEXP.test(name);
  }

  function cleanGlobalName(name) {
    return name.replace(GLOBAL_REGEXP, "$1");
  }

  function isLocal(name) {
    return LOCAL_REGEXP.test(name);
  }

  function cleanLocalName(name) {
    return name.replace(LOCAL_REGEXP, "$1");
  }

  const isGlobalByDefault = defaultScope === "global";

  function applyNameScoping(node, getName, setName) {
    if (node[PROCESSED]) return;
    const name = getName(node);
    if (name) {
      const shouldBeGlobal =
        isGlobal(name) || (isGlobalByDefault && !isLocal(name));
      if (shouldBeGlobal) {
        setName(node, cleanGlobalName(name), name);
      } else if (!name.startsWith(resolvedPrefix)) {
        setName(node, `${resolvedPrefix}${cleanLocalName(name)}`, name);
      }
    }
    node[PROCESSED] = true;
  }

  return {
    postcssPlugin: "postcss-local-keyframes",

    Once: (root) => {
      if (isHashPrefix) {
        resolvedPrefix = generateHashedPrefix(
          root.source.input.from,
          root.source.input.css
        );
      }
    },

    AtRule: {
      keyframes: (atRule) => {
        applyNameScoping(
          atRule,
          (node) => node.params,
          (node, value) => (node.params = value)
        );
      },
    },

    Declaration: {
      ["animation-name"]: (decl) => {
        applyNameScoping(
          decl,
          (node) => node.value,
          (node, value) => (node.value = value)
        );
      },

      animation: (decl, { result }) => {
        applyNameScoping(
          decl,
          (node) => {
            const name = parseAnimationShorthand(node.value).name;
            if (!name) {
              decl.warn(
                result,
                `Can't get animation name from shorthand property`
              );
            }
            return name;
          },
          (node, value, name) => {
            node.value = node.value.replace(name, value);
          }
        );
      },
    },
  };
};

plugin.generateHashedPrefix = function (filename, css) {
  return `_${plugin.hash(`${filename} - ${css}`).slice(-5)}_`;
};

// from: https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781?permalink_comment_id=4738050#gistcomment-4738050
plugin.hash = function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
};

module.exports = plugin;

module.exports.postcss = true;
