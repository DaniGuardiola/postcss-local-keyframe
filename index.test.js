const postcss = require("postcss");

const plugin = require("./");

const FROM_PATH = "/home/user/test.css";

async function expectOutput(input, output, opts = {}, warnLength = 0) {
  let result = await postcss([plugin(opts)]).process(input, {
    from: FROM_PATH,
  });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(warnLength);
}

it("uses a hashed prefix", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both loader;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: loader;
  }
  `;
  const hashedPrefix = plugin.generateHashedPrefix(FROM_PATH, input);
  const output = `
  @keyframes ${hashedPrefix}loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: ${hashedPrefix}loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both ${hashedPrefix}loader;
  }
  .animation-3 {
    animation: 1.2s infinite ${hashedPrefix}loader ease-in-out both;
  }
  .animation-4 {
    animation-name: ${hashedPrefix}loader;
  }
  `;
  await expectOutput(input, output, {}); // hashed by default
  await expectOutput(input, output, { prefix: "<hash>" });
});

it("bails on :global animations", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes global(bounce) {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both global(bounce);
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: global(bounce);
  }
  `;
  const hashedPrefix = plugin.generateHashedPrefix(FROM_PATH, input);
  const output = `
  @keyframes ${hashedPrefix}loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes bounce {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: ${hashedPrefix}loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both bounce;
  }
  .animation-3 {
    animation: 1.2s infinite ${hashedPrefix}loader ease-in-out both;
  }
  .animation-4 {
    animation-name: bounce;
  }
  `;
  await expectOutput(input, output, {}); // hashed by default
  await expectOutput(input, output, { prefix: "<hash>" });
});

it("uses a custom hashed prefix", async () => {
  function generateHashedPrefix(filename, css) {
    return `${plugin.hash(filename)}-${plugin.hash(css)}-custom-`.trim();
  }

  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both loader;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: loader;
  }
  `;
  const hashedPrefix = generateHashedPrefix(FROM_PATH, input);
  expect(hashedPrefix).toContain("custom");
  const output = `
  @keyframes ${hashedPrefix}loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: ${hashedPrefix}loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both ${hashedPrefix}loader;
  }
  .animation-3 {
    animation: 1.2s infinite ${hashedPrefix}loader ease-in-out both;
  }
  .animation-4 {
    animation-name: ${hashedPrefix}loader;
  }
  `;
  await expectOutput(input, output, { generateHashedPrefix }); // hashed by default
  await expectOutput(input, output, { prefix: "<hash>", generateHashedPrefix });
});

it("uses a fixed prefix", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both loader;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: loader;
  }
  `;
  const output = `
  @keyframes prefixed-loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: prefixed-loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both prefixed-loader;
  }
  .animation-3 {
    animation: 1.2s infinite prefixed-loader ease-in-out both;
  }
  .animation-4 {
    animation-name: prefixed-loader;
  }
  `;
  await expectOutput(input, output, { prefix: "prefixed-" });
});

it("fails with wrong shorthand property", async () => {
  const input = `
  .animation {
    animation: 100ms;
  }
  `;
  await expectOutput(input, input, { prefix: "prefixed-" }, 1);
});
