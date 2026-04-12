/// <reference types="codeceptjs" />
import "dotenv/config";
import { setHeadlessWhen } from "@codeceptjs/configure";

setHeadlessWhen(process.env.HEADLESS === "true");

export const config: CodeceptJS.MainConfig = {
  tests: "./test/identity/**/*_test.ts",
  output: "./output",
  helpers: {
    Playwright: {
      browser: "chromium",
      url: process.env.BASE_URL || "http://localhost:3000",
      show: true,
      waitForNavigation: "domcontentloaded",
    },
  },
  include: {
    I: "./steps_file",
    loginPage: "./pages/LoginPage.ts",
  },
  name: "S2O-Restaurant-E2E",
};
