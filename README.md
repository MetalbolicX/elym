# Elym

## Description
**Elym** is an *element* DOM *manipulator* wrapper library to create, add, and remove elements,
attributes and event listeners inspired in syntax of method chaining of [D3js](https://d3js.org/) and [jQuery](https://jquery.com/).

## Installation
Download from npm:
```sh
npm i elym
```

## Usage
A basic example of how to use the library. For more information see the documentation.

```ts
import { Elym } from "elym";

const heroes = new Elym(`
    <ul class="heroes">
        <li>Superman</li>
        <li>Batman</li>
        <li>Wonder woman</li>
    </ul>
`)
.selectAll("li")
.on("click", ({ target }: Event) => {
    alert(`${target.textContent} was clicked.`);
});

const container = document.getElementById("container");

container.appendChild(heroes.root());
```

## Technologies used

<p align="left">
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/>
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="40" height="40"/>
    </a>
</p>

## Contributing
Contributions are always welcome.

## License
[MIT](https://choosealicense.com/licenses/mit/)

