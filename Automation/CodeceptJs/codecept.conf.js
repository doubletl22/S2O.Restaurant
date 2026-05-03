const headless = process.env.HEADLESS === "true";

exports.config = {
  tests: "./*_test.js",
  output: "./output",
  helpers: {
    Playwright: {
      url: process.env.BASE_URL || "http://localhost:3000",
      show: !headless,
      browser: "chromium",
      waitForNavigation: "domcontentloaded",
      restart: false,
      keepCookies: true,
      keepBrowserState: true
    }
  },
  include: {
    I: "./steps_file.js"
  },
  bootstrap: null,
  mocha: {},
  name: "S2O-ITC5-CodeceptJS"
};
