import { expect, test } from "vitest";
import { myFunction } from "../src/dom-once";

test("myFunction", () => {
  expect(myFunction()).toBe("Hello, world!");
});
