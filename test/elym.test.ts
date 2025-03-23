import { describe, it, expect, beforeEach, vi } from "vitest";
import { Elym } from "../src/elym/elym";

describe("Elym", () => {
  let elym: Elym;

  beforeEach(() => {
    document.body.innerHTML = ""; // Clear the DOM before each test
    elym = new Elym("<div></div>");
  });

  it("should call the callback with the current instance", () => {
    const callback = vi.fn();
    elym.call(callback);
    expect(callback).toHaveBeenCalledWith(elym);
  });

  it("should remove elements from the DOM", () => {
    document.body.appendChild(elym.root());
    expect(document.body.contains(elym.root())).toBe(true);
    elym.remove();
    expect(document.body.contains(elym.root())).toBe(false);
  });
});
