/**
 * @classdesc
 * A utility class for building and manipulating DOM elements.
 * It was inspired by the D3.js library and jQuery syntax.
 */
export class Elym {
  #root: HTMLElement | SVGSVGElement;
  #nodes: (HTMLElement | SVGElement)[];
  #eventListeners = new WeakMap<
    HTMLElement | SVGElement,
    Map<string, EventListener[]>
  >();
  #data = new WeakMap<HTMLElement | SVGElement, any>();
  public static instances = new WeakMap<HTMLElement | SVGElement, Elym>();

  /**
   * Create an HTML or SVG element from an HTML string.
   * @param {string} htmlTemplate - The HTML string to be converted to an element.
   * @returns {HTMLElement | SVGElement} - The HTML or SVG element created from the HTML string.
   * @throws {Error} - If the HTML string is invalid or does not contain a valid element.
   * @example
   * ```ts
   * const element = Elym.createElement(`<section class="container"><h1>Hello, World!</h1></section>`);
   * document.body.appendChild(element.root());
   * ```
   */
  public static createFromTemplate(
    htmlTemplate: string
  ): HTMLElement | SVGElement {
    // Check if the HTML string appears to be an SVG element.
    // A simple check for the presence of "<svg" at the beginning is sufficient for most cases.
    if (htmlTemplate.trim().startsWith("<svg")) {
      const parser = new DOMParser(),
        svgDoc = parser.parseFromString(htmlTemplate, "image/svg+xml"),
        svgElement = svgDoc.documentElement;

      if (!svgElement || svgElement.tagName !== "svg") {
        throw new Error("Invalid SVG: No valid SVG element found");
      }

      return svgElement;
    } else {
      const range = document.createRange(),
        fragment = range.createContextualFragment(htmlTemplate),
        element = fragment.firstElementChild as HTMLElement;

      if (!element) {
        throw new Error("Invalid HTML: No valid element found");
      }

      return element;
    }
  }

  /**
   * Selects a single element which is already in the DOM.
   * @param {string} selector - The CSS selector to match the element.
   * @returns {Elym} A new Elym instance wrapping the selected element.
   * @example
   * ```ts
   * const title = Elym.select("h1");
   * title.text("Hello, Elym!");
   * ```
   */
  public static select(selector: string): Elym {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`No element found for selector: ${selector}`);
    }
    return Elym.fromElement(element as HTMLElement);
  }

  /**
   * Selects multiple elements which are already in the DOM.
   * @param {string} selector - The CSS selector to match the elements.
   * @returns {Elym} A new Elym instance wrapping the selected elements.
   * @example
   * ```ts
   * const list = Elym.selectAll("li");
   * list.each((node, index) => {
   *   console.log(`Item ${index + 1}: ${node.textContent}`);
   * });
   * ```
   */
  public static selectAll(selector: string): Elym {
    const elements = Array.from(document.querySelectorAll(selector));
    return Elym.fromElement(...elements);
  }

  /**
   * Creates a new Elym instance from one or more elements.
   * @param {...Element} elements - The HTML or SVG elements.
   * @returns {Elym} A new Elym instance wrapping the provided elements.
   * @throws {Error} - If no elements are provided.
   * @example
   * ```ts
   * const element1 = document.createElement('div');
   * const element2 = document.createElement('span');
   * const elym = Elym.fromElement(element1, element2);
   * ```
   */
  public static fromElement(...elements: Element[]): Elym {
    if (elements.length === 0) {
      throw new Error("At least one element must be provided");
    }
    const instance = new Elym("<div></div>"); // Temporary root element
    instance.#root = elements[0] as HTMLElement;
    instance.#nodes = elements as (HTMLElement | SVGElement)[];
    instance.#nodes.forEach((node) => Elym.instances.set(node, instance));
    return instance;
  }

  /**
   * Creates a new Elym instance.
   * @param {string} htmlTemplate - The HTML template string.
   * @throws {Error} - If the argument is invalid.
   * @example
   * ```ts
   * const hello = new Elym('<div class="container"><h1>Hello, World!</h1></div>');
   * document.body.appendChild(hello.root());
   * ```
   */
  constructor(htmlTemplate: string) {
    const rootElement = Elym.createFromTemplate(htmlTemplate);
    if (
      !(
        rootElement instanceof HTMLElement ||
        rootElement instanceof SVGSVGElement
      )
    ) {
      throw new Error("Invalid root element created");
    }
    this.#root = rootElement;
    this.#nodes = [this._root];
    Elym.instances.set(this._root, this);
  }

  /**
   * Retrieves the Elym instance associated with a given DOM element.
   * @param node - The HTML or SVG element for which to retrieve the Elym instance.
   * @returns The Elym instance associated with the given node, or null if no instance is found.
   * @example
   * ```ts
   * const hello = new Elym('<div class="container"><h1>Hello, World!</h1></div>');
   * document.body.appendChild(hello.root());
   * // Retrieve the instance associated with the container
   * const container = document.querySelector(".container");
   * const instance = Elym.getInstance(container);
   * instance.selectChild("h1").text("Hello, Elym!");
   * ```
   */
  public static getInstance(node: HTMLElement | SVGElement): Elym | null {
    return Elym.instances.get(node) || null;
  }

  /**
   * Checks if an Elym instance is associated with a given DOM element.
   * @param node - The HTML or SVG element to check.
   * @returns True if an instance is associated with the node, otherwise false.
   * @example
   * ```ts
   * const hello = new Elym('<div class="container"><h1>Hello, World!</h1></div>');
   * document.body.appendChild(hello.root());
   * // Check if an instance is associated with the container
   * const container = document.querySelector(".container");
   * const isInstance = Elym.isInstance(container);
   * console.log(isInstance); // true
   * ```
   */
  public static isInstance(node: HTMLElement | SVGElement): boolean {
    return Elym.instances.has(node);
  }

  /**
   * Checks if an Elym instance is associated with a given DOM element using a selector.
   * @param {string} selector - The CSS selector to match the element.
   * @returns {boolean} True if an instance is associated with the node, otherwise false.
   * @example
   * ```ts
   * const isInstance = Elym.isInstanceBySelector(".container");
   * console.log(isInstance); // true or false
   * ```
   */
  public static isInstanceBySelector(selector: string): boolean {
    const element = document.querySelector(selector);
    return element ? Elym.instances.has(element as HTMLElement) : false;
  }

  /**
   * Retrieves the Elym instance associated with a given DOM element using a selector.
   * @param {string} selector - The CSS selector to match the element.
   * @returns {Elym | null} The Elym instance associated with the given node, or null if no instance is found.
   * @example
   * ```ts
   * const instance = Elym.getInstanceBySelector(".container");
   * if (instance) {
   *   instance.selectChild("h1").text("Hello, Elym!");
   * }
   * ```
   */
  public static getInstanceBySelector(selector: string): Elym | null {
    const element = document.querySelector(selector);
    return element ? Elym.instances.get(element as HTMLElement) || null : null;
  }

  /**
   * Selects a single child element of an Elym instance.
   * @param {string} selector - The CSS selector to match the element.
   * @returns {this} The current instance for chaining.
   * @remmarks
   * The selectChild methods worrks on the elements that haven't been added to the DOM yet.
   * @example
   * ```ts
   * const hello = new Elym('<div class="container"><h1>Hello, World!</h1></div>');
   * hello.selectChild("h1").text("Hello, Elym!");
   * ```
   */
  public selectChild(selector: string): this {
    const selectedElement = this._root.querySelector(selector);
    if (selectedElement) {
      this.#nodes = [selectedElement as HTMLElement];
    }
    return this;
  }

  /**
   * Selects multiple child elements of an Elym instance.
   * @param {string} selector - The CSS selector to match the elements.
   * @returns {this} The current instance for chaining.
   * @remmarks
   * The selectChildren methods worrks on the elements that haven't been added to the DOM yet.
   * @example
   * ```ts
   * const hello = new Elym('<div class="container"><h1>Hello, World!</h1><p>Paragraph</p></div>');
   * hello.selectChildren("h1, p").text("Hello, Elym!");
   * ```
   */
  public selectChildren(selector: string): this {
    this.#nodes = Array.from(
      this._root.querySelectorAll(selector)
    ) as HTMLElement[];
    return this;
  }

  /**
   * Gets or sets an attribute on the selected elements.
   * @param {string} attribute - The attribute name.
   * @param {string} [value] - The attribute value.
   * @returns {this | string | null} The current instance for chaining or the attribute value.
   * @example
   * ```ts
   * const container = new Elym('<div class="container"></div>');
   * // Set an attribute
   * container.attr("id", "myId");
   * // Get an attribute
   * const id = container.attr("id");
   * console.log(id); // "myId"
   * ```
   */
  public attr(attribute: string): string | null;
  public attr(attribute: string, value: string): this;
  public attr(attribute: string, value?: string): this | string | null {
    if (arguments.length === 1) {
      const [firstNode] = this._nodes;
      return this._nodes.length ? firstNode.getAttribute(attribute) : null;
    }
    this._nodes.forEach((node) => node.setAttribute(attribute, value!));
    return this;
  }

  /**
   * Gets or sets the text content of the selected elements.
   * @param {string} [value] - The text content.
   * @returns {this | string} The current instance for chaining or the text content.
   * @example
   * ```ts
   * const paragraph = new Elym('<p>Hello, World!</p>');
   * // Set text content
   * paragraph.text("Hello, Elym!");
   * // Get text content
   * const text = paragraph.text();
   * console.log(text); // "Hello, Elym!"
   * ```
   */
  public text(): string;
  public text(value: string): this;
  public text(value?: string): string | this {
    if (!value) {
      const [firstNode] = this._nodes;
      return firstNode?.textContent || "";
    }
    this._nodes.forEach((node) => (node.textContent = value));
    return this;
  }

  /**
   * Appends a new element to the selected elements.
   * @param {string} tagName - The tag name of the element to append.
   * @returns {Elym} A new Elym instance wrapping the appended element.
   * @example
   * ```ts
   * const listContainer = new Elym('<ul class="list-container"></ul>');
   * listContainer.append("li").text("Item 1");
   * listContainer.append("li").text("Item 2");
   * ```
   */
  public append(tagName: string): Elym {
    const newElements: (HTMLElement | SVGElement)[] = [];
    this._nodes.forEach((node) => {
      let newElement: HTMLElement | SVGElement;
      if (node instanceof SVGElement) {
        newElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          tagName
        );
      } else {
        newElement = document.createElement(tagName);
      }

      node.appendChild(newElement);
      newElements.push(newElement);
    });
    return Elym.fromElement(...newElements);
  }

  /**
   * Appends multiple elements or Elym objects to the selected elements.
   * @param {...(HTMLElement | Elym)[]} elements - The elements or Elym objects to append.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const container = new Elym('<div class="container"></div>');
   * const ul = document.createElement("ul");
   * const li = new Elym('<li></li>');
   * container.appendElements(child1, child2);
   * ```
   */
  public appendElements(...elements: (HTMLElement | Elym)[]): this {
    elements.forEach((element) => {
      if (element instanceof Elym) {
        this._nodes.forEach((node) => node.append(...element._nodes));
      } else {
        this._nodes.forEach((node) => node.append(element));
      }
    });
    return this;
  }

  /**
   * Gets or sets a CSS style property on the selected elements.
   * @param {string} property - The CSS property name.
   * @param {string} [value] - The CSS property value.
   * @returns {this | string | null} The current instance for chaining or the CSS property value.
   * @example
   * ```ts
   * const container = new Elym('<div class="container"></div>');
   * // Set a style property
   * container.style("background-color", "red");
   * // Get a style property
   * const backgroundColor = container.style("background-color");
   * console.log(backgroundColor); // "red"
   * // Set using an object
   * container.style({ backgroundColor: "blue", color: "white" });
   * ```
   */
  public style(property: string): string | null;
  public style(property: string, value: string): this;
  public style(
    property: string | Record<string, string>,
    value?: string
  ): this | string | null {
    if (typeof property === "string") {
      if (value === undefined) {
        const [firstNode] = this._nodes;
        return this.nodes.length
          ? firstNode.style.getPropertyValue(property)
          : null;
      }
      this._nodes.forEach((node) => node.style.setProperty(property, value!));
      return this;
    }
    this._nodes.forEach((node) => {
      Object.entries(property).forEach(([key, val]) =>
        node.style.setProperty(key, val)
      );
    });
    return this;
  }

  /**
   * Gets or sets a property on the selected elements.
   * @param {string} property - The property name.
   * @param {T} [value] - The property value.
   * @returns {this | T} The current instance for chaining or the property value.
   * @example
   * ```ts
   * const builder = new Elym('<input type="text" value="Initial value">');
   * // Set a property
   * builder.property("value", "Updated value");
   * // Get a property
   * const value = builder.property("value");
   * console.log(value); // "Updated value"
   * ```
   */
  public property<T = any>(property: string): T;
  public property<T = any>(property: string, value: T): this;
  public property<T = any>(property: string, value?: T): this | T {
    if (value === undefined) {
      const [firstNode] = this._nodes;
      return this._nodes.length
        ? (firstNode as any)[property]
        : (null as unknown as T);
    }
    this._nodes.forEach((node) => ((node as any)[property] = value));
    return this;
  }

  /**
   * Gets or sets the HTML content of the selected elements.
   * @param {string | Node} [content] - The HTML content.
   * @returns {this | string} The current instance for chaining or the HTML content.
   * @example
   * ```ts
   * const builder = new Elym('<div class="container"></div>');
   * // Set HTML content
   * builder.html('<p>Hello, World!</p>');
   * // Get HTML content
   * const html = builder.html();
   * console.log(html); // '<p>Hello, World!</p>'
   * ```
   */
  public html(content?: string | Node): string | this {
    if (content === undefined) {
      return this._nodes.map((node) => node.innerHTML).join("");
    }

    this._nodes.forEach((node) => {
      if (typeof content === "string") {
        const fragment = document
          .createRange()
          .createContextualFragment(content);
        node.replaceChildren(fragment);
        return;
      }
      node.replaceChildren(content);
    });

    return this;
  }

  /**
   * Adds an event listener to the selected elements.
   * @param {string} event - The event type.
   * @param {EventListener} callback - The event listener callback.
   * @param {boolean | AddEventListenerOptions} [options] - The event listener options.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<button>Click me</button>');
   * builder.on("click", () => {
   *   console.log("Button clicked!");
   * });
   * ```
   */
  public on(
    event: string,
    callback: EventListener,
    options?: boolean | AddEventListenerOptions
  ): this {
    const [eventType, namespace] = event.split(".");
    this._nodes.forEach((node) => {
      node.addEventListener(eventType, callback, options);
      if (!this._eventListeners.has(node)) {
        this._eventListeners.set(node, new Map());
      }
      const eventMap = this._eventListeners.get(node)!;
      const eventKey = namespace ? `${eventType}.${namespace}` : eventType;
      eventMap.set(eventKey, [...(eventMap.get(eventKey) || []), callback]);
    });
    return this;
  }

  /**
   * Removes an event listener from the selected elements.
   * @param {string} event - The event type.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<button>Click me</button>');
   * const clickHandler = () => {
   *  console.log("Button clicked!");
   * };
   * builder.on("click", clickHandler);
   * // Remove the click event listener
   * builder.off("click");
   * ```
   */
  public off(event: string): this {
    const [eventType, namespace] = event.split(".");
    this._nodes.forEach((node) => {
      const eventMap = this._eventListeners.get(node);
      if (!eventMap) return;

      if (namespace) {
        for (const key of eventMap.keys()) {
          if (
            key.startsWith(eventType + ".") &&
            key.endsWith("." + namespace)
          ) {
            eventMap
              .get(key)!
              .forEach((callback) =>
                node.removeEventListener(eventType, callback)
              );
            eventMap.delete(key);
          }
        }
        return;
      }
      eventMap
        .get(eventType)
        ?.forEach((callback) => node.removeEventListener(eventType, callback));
      eventMap.delete(eventType);
    });
    return this;
  }

  /**
   * Prepends the selected elements to a parent element.
   * @param {HTMLElement | Elym} parent - The parent element.
   * @returns {this} The current instance for chaining.
   * @example
   * Originally the html file is looking like:
   * ```html
   * <div class="container"></div>
   * ```
   * ```ts
   * const container = Elym.select('<div class="container"></div>');
   * const child = document.createElement("p");
   * // Prepend the child element to the container
   * container.prepend(child);
   * ```
   * The html file will look like:
   * ```html
   * <div class="container">
   *  <p></p>
   * </div>
   * ```
   */
  public prepend(parent: HTMLElement | Elym): this {
    this._nodes.forEach((node) => {
      if (parent instanceof Elym) {
        parent._nodes.forEach((parentNode) => parentNode.prepend(node));
        return;
      }
      parent.prepend(node);
    });
    return this;
  }

  /**
   * Adds one or more class names to the selected elements.
   * @param {...string[]} classNames - The class names to add.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<div></div>');
   * // Add a single class
   * builder.addClass("container");
   * // Add multiple classes
   * builder.addClass("container", "bg-red", "text-white");
   * ```
   */
  public addClass(...classNames: string[]): this {
    this._nodes.forEach((node) => node.classList.add(...classNames));
    return this;
  }

  /**
   * Removes one or more class names from the selected elements.
   * @param {...string[]} classNames - The class names to remove.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<div class="container bg-red text-white"></div>');
   * // Remove a single class
   * builder.removeClass("container");
   * // Remove multiple classes
   * builder.removeClass("bg-red", "text-white");
   * ```
   */
  public removeClass(...classNames: string[]): this {
    this._nodes.forEach((node) => node.classList.remove(...classNames));
    return this;
  }

  /**
   * Inserts the selected elements before a reference element.
   * @param {HTMLElement} referenceElement - The reference element.
   * @returns {this} The current instance for chaining.
   * @example
   * The original html file is looking like:
   * ```html
   * <p>Reference Element</p>
   * ```
   * ```ts
   * const paragraph = Elym.select('<p>Reference Element</p>');
   * const builder = new Elym('<div class="container"></div>');
   * const child = document.createElement("p");
   * // Insert the container before the reference element
   * builder.insertBefore(paragraph.root());
   * ```
   * The html file will look like:
   * ```html
   * <p>Reference Element</p></p>
   * <div class="container"></div>
   * ```
   */
  public insertBefore(referenceElement: HTMLElement): this {
    this._nodes.forEach((node) =>
      referenceElement.parentNode?.insertBefore(node, referenceElement)
    );
    return this;
  }

  /**
   * Inserts the selected elements after a reference element.
   * @param {HTMLElement} referenceElement - The reference element.
   * @returns {this} The current instance for chaining.
   * @example
   * The original html file is looking like:
   * ```html
   * <p>Reference Element</p>
   * ```
   * ```ts
   * const paragraph = Elym.select('<p>Reference Element</p>');
   * const builder = new Elym('<div class="container"></div>');
   * const child = document.createElement("p");
   * // Insert the container after the reference element
   * builder.insertAfter(paragraph.root());
   * ```
   * The html file will look like:
   * ```html
   * <p>Reference Element</p>
   * <div class="container"></div>
   * ```
   */
  public insertAfter(referenceElement: HTMLElement): this {
    this._nodes.forEach((node) =>
      referenceElement.parentNode?.insertBefore(
        node,
        referenceElement.nextSibling
      )
    );
    return this;
  }

  /**
   * Appends the selected elements to a parent element.
   * @param {HTMLElement | Elym} parent - The parent element.
   * @returns {this} The current instance for chaining.
   * @example
   * The original html file is looking like:
   * ```html
   * <div class="container"></div>
   * ```
   * ```ts
   * const builder = new Elym('<div></div>');
   * const container = Elym.select('<div class="container"></div>');
   * // Append the builder to the container
   * builder.appendTo(container);
   * ```
   * The html file will look like:
   * ```html
   * <div class="container">
   *  <div></div>
   * </div>
   * ```
   */
  public appendTo(parent: HTMLElement | Elym): this {
    this._nodes.forEach((node) => {
      if (parent instanceof Elym) {
        parent._nodes.forEach((parentNode) => parentNode.appendChild(node));
        return;
      }
      parent.appendChild(node);
    });
    return this;
  }

  /**
   * Checks if the selected elements have a class or toggles a class based on a boolean value.
   * @param {string} className - The class name.
   * @param {boolean} [value] - The boolean value to toggle the class.
   * @returns {this | boolean} The current instance for chaining or the class presence.
   * @example
   * ```ts
   * const builder = new Elym('<div class="container"></div>');
   * // Check if the container has the class
   * const hasClass = builder.classed("container");
   * console.log(hasClass); // true
   * // Toggle the class
   * builder.classed("container", false);
   * ```
   */
  public classed(className: string): boolean;
  public classed(className: string, value: boolean): this;
  public classed(className: string, value?: boolean): this | boolean {
    if (value === undefined) {
      const [firstNode] = this._nodes;
      return this.nodes.length
        ? firstNode.classList.contains(className)
        : false;
    }
    this._nodes.forEach((node) => node.classList.toggle(className, value));
    return this;
  }

  /**
   * Iterates over the selected elements and executes a callback for each element.
   * @param {function} callback - The callback function.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<ul><li>Item 1</li><li>Item 2</li></ul>');
   * builder.selectChildren("li").each((node, index) => {
   *   console.log(`Item ${index + 1}: ${node.textContent}`);
   * });
   * ```
   */
  public each(
    callback: (node: HTMLElement | SVGElement, index: number) => void
  ): this {
    this._nodes.forEach((node, index) =>
      callback(node as HTMLElement | SVGElement, index)
    );
    return this;
  }

  /**
   * Calls a callback function with the current instance.
   * @param {function} callback - The callback function.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<div></div>');
   * builder.call((builder) => {
   *   builder.text("Hello, World!");
   * });
   * ```
   */
  public call(callback: (builder: Elym) => void): this {
    callback(this);
    return this;
  }

  /**
   * Removes the selected elements from the DOM.
   * @remmarks
   * The remove method also removes all event listeners and data bound to the elements.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<div></div>');
   * builder.remove();
   * ```
   */
  public remove(): this {
    this._nodes.forEach((node) => {
      const eventMap = this._eventListeners.get(node);
      if (eventMap) {
        eventMap.forEach((callbacks, event) => {
          callbacks.forEach((callback) =>
            node.removeEventListener(event, callback)
          );
        });
        this._eventListeners.delete(node);
      }
      Elym.instances.delete(node);
      node.remove();
    });
    return this;
  }

  /**
   * Clones the current instance, including event listeners and data.
   * @returns {Elym} The cloned instance.
   * @example
   * ```ts
   * const builder = new Elym('<div></div>');
   * builder.on("click", () => {
   *   console.log("Element clicked!");
   * });
   * const clone = builder.clone();
   * clone.on("click", () => {
   *   console.log("Cloned element clicked!");
   * });
   * ```
   */
  public clone(): Elym {
    const clone = new Elym(this._root.outerHTML);
    this._nodes.forEach((node, index) => {
      const clonedNode = clone._nodes[index];

      // Clone event listeners
      const eventMap = this._eventListeners.get(node);
      if (eventMap) {
        const clonedEventMap = new Map<string, EventListener[]>();
        eventMap.forEach((callbacks, event) => {
          callbacks.forEach((callback) =>
            clonedNode.addEventListener(event, callback)
          );
          clonedEventMap.set(event, [...callbacks]);
        });
        clone._eventListeners.set(clonedNode, clonedEventMap);
      }

      // Clone data
      const data = this.#data.get(node);
      if (data !== undefined) {
        clone.#data.set(clonedNode, data);
      }
    });

    return clone;
  }

  /**
   * Toggles a class or attribute based on a boolean condition.
   * @param {string} attributeOrClass - The attribute or class name.
   * @param {boolean} state - The boolean state.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<div></div>');
   * // Toggle a class
   * builder.toggle("active", true);
   * // Toggle an attribute
   * builder.toggle("disabled", false);
   * ```
   */
  public toggle(attributeOrClass: string, state: boolean): this {
    this._nodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        if (node.hasAttribute(attributeOrClass)) {
          if (state) {
            node.setAttribute(attributeOrClass, "");
            return;
          }
          node.removeAttribute(attributeOrClass);
          return;
        }
        node.classList.toggle(attributeOrClass, state);
      }
    });
    return this;
  }

  /**
   * Applies a CSS transition effect to the selected elements.
   * @param {number} duration - Transition duration in milliseconds.
   * @param {Partial<CSSStyleDeclaration>} properties - CSS properties to animate.
   * @param {string} [easing="ease"] - Easing function, default is "ease".
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<div style="width:100px; height:100px; background:red;"></div>');
   * // Transition width and background color
   * builder.transition(500, { width: "200px", backgroundColor: "blue" });
   * // Transition opacity and transform with an ease-out effect
   * builder.transition(300, { opacity: "0.5", transform: "scale(1.2)" }, "ease-out");
   * ```
   */
  public transition(
    duration: number,
    properties: Partial<CSSStyleDeclaration>,
    easing: string = "ease"
  ): this {
    this._nodes.forEach((node) => {
      node.style.transition = `all ${duration}ms ${easing}`;

      Object.entries(properties).forEach(([key, value]) => {
        if (!value) {
          node.style.setProperty(key, String(value));
        }
      });
    });
    return this;
  }

  /**
   * Binds data to the selected elements and optionally executes a callback.
   * @param {T[]} dataset - The data to bind.
   * @param {function} [callback] - The callback function.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<ul><li></li><li></li></ul>');
   * const data = ["Item 1", "Item 2"];
   * builder.selectChildren("li").data(data, (node, datum) => {
   *  node.textContent = datum;
   * });
   * ```
   */
  public data<T>(
    dataset: T[],
    callback?: (node: HTMLElement | SVGElement, datum: T, index: number) => void
  ): this {
    this._nodes.forEach((node, index) => {
      if (index < dataset.length) {
        this.#data.set(node, dataset[index]);
        callback?.(node, dataset[index], index);
      }
    });
    return this;
  }

  /**
   * Resets the selected elements to the root element.
   * @returns {this} The current instance for chaining.
   * @example
   * ```ts
   * const builder = new Elym('<div><p>Hello, World!</p></div>');
   * builder.selectChild("p").backToRoot().selectChildren("p").text("Hello, Elym!");
   * ```
   */
  public backToRoot(): this {
    this.#nodes = [this._root];
    return this;
  }

  /**
   * Gets the root element.
   * @returns {HTMLElement | SVGSVGElement} The root element.
   */
  public root() {
    return this._root;
  }

  /**
   * Gets the first selected element.
   * @returns {HTMLElement | SVGElement} The first selected element.
   */
  public node() {
    const [node] = this._nodes;
    return node;
  }

  /**
   * Gets all selected elements.
   * @returns {Array<HTMLElement | SVGElement>} The selected elements.
   */
  public nodes() {
    return [...this._nodes];
  }

  /**
   * Gets the data bound to a specific element.
   * @param {HTMLElement | SVGElement} node - The element.
   * @returns {any} The data bound to the element.
   */
  public getData(node: HTMLElement | SVGElement) {
    return this.#data.get(node);
  }

  /**
   * Gets the root element.
   * @protected
   * @returns {HTMLElement | SVGSVGElement} The root element.
   */
  protected get _root() {
    return this.#root;
  }

  /**
   * Gets the selected elements.
   * @protected
   * @returns {Array<HTMLElement | SVGElement>} The selected elements.
   */
  protected get _nodes() {
    return this.#nodes;
  }

  /**
   * Gets the event listeners map.
   * @protected
   * @returns {WeakMap<HTMLElement | SVGElement, Map<string, EventListener[]>>} The event listeners map.
   */
  protected get _eventListeners() {
    return this.#eventListeners;
  }
}
