/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file');
type loginPage = typeof import('./pages/LoginPage');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, loginPage: loginPage }
  interface Methods extends Playwright {}
  interface I extends ReturnType<steps_file> {}
  namespace Translation {
    interface Actions {}
  }
}
