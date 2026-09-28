// step-definitions/world.ts
// Cucumber World — holds shared state (page, context) across steps in a scenario.

import { BrowserContext, Page } from '@playwright/test';
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export interface ICustomWorld extends World {
  page: Page;
  context: BrowserContext;
}

class CustomWorld extends World implements ICustomWorld {
  page!: Page;
  context!: BrowserContext;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
