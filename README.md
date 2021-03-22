# Carbonara

This is a custom element to compute web navigation carbon footprint.

## Usage
### CDN

```html
<!-- pin to a specific version if required -->
<script type="module" src="https://unpkg.com/@digital4better/carbonara@latest/dist/carbonara.js"></script>
 
<p>Your navigation has emitted <carbon-ara></carbon-ara> so far.</p>
```

### Locally

```bash
npm install @digital4better/carbonara
```

```html
<script type="module" src="./node_modules/@digital4better/carbonara/dist/carbonara.js"></script>

<p>Your navigation has emitted <carbon-ara></carbon-ara> so far.</p>
```

## Supported properties

| Attribute | Type | Default value | Description |
| --- | --- | --- | --- |
| position | "top", "bottom" | "top" | the tooltip position |
| persistance | "none", "session", "local" | "none" | when set to "none" the footprint will be reset on page refresh. "local" and "session" will persist footprint in navigator storage. |

