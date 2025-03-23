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

  it("should set and get attributes", () => {
    elym.attr("id", "test-id");
    expect(elym.attr("id")).toBe("test-id");
  });

  it("should set and get text content", () => {
    elym.text("Hello, World!");
    expect(elym.text()).toBe("Hello, World!");
  });

  it("should append a new element", () => {
    const child = elym.append("span");
    expect(child.root().tagName).toBe("SPAN");
    expect(elym.root().contains(child.root())).toBe(true);
  });

  it("should add and remove classes", () => {
    elym.addClass("test-class");
    expect(elym.root().classList.contains("test-class")).toBe(true);
    elym.removeClass("test-class");
    expect(elym.root().classList.contains("test-class")).toBe(false);
  });

  it("should handle event listeners", () => {
    const callback = vi.fn();
    elym.on("click", callback);
    elym.root().dispatchEvent(new Event("click"));
    expect(callback).toHaveBeenCalled();
    elym.off("click");
    elym.root().dispatchEvent(new Event("click"));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should clone the instance", () => {
    const clone = elym.clone();
    expect(clone.root().outerHTML).toBe(elym.root().outerHTML);
  });

  it("should toggle classes", () => {
    elym.toggle("test-class", true);
    expect(elym.root().classList.contains("test-class")).toBe(true);
    elym.toggle("test-class", false);
    expect(elym.root().classList.contains("test-class")).toBe(false);
  });

  it("should bind data to elements", () => {
    const data = ["Item 1", "Item 2"];
    elym.append("ul").append("li").append("li");
    elym.selectChildren("li").data(data, (node, datum) => {
      node.textContent = datum;
    });
    expect(elym.selectChildren("li").nodes().map((node) => node.textContent)).toEqual(data);
  });
});
