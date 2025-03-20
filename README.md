# CSS Injector

## To use:

First, install dependencies and run the development server:

```bash
npm install
npm start
```

Then you'll need to load the extension into Chrome.

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" if it is not already enabled.
3. Click on "Load unpacked" and select the `dist` folder of this repository.
4. The extension should now be loaded and ready to use.

## To inject CSS:

1. Open Chrome and navigate to the page you want to inject CSS into.
2. Click on the extension icon in the Chrome toolbar.
3. Click on "Inject CSS" to inject the CSS.

## To edit the CSS:

Navigate to `src/injected.scss` and edit the SCSS. Your changes will automatically be compiled into CSS and injected into the page!

Go crazy!
