# devextreme-cldr-data

The CLDR data that is optimized for [localizing DevExtreme widgets using Globalize](https://js.devexpress.com/Documentation/Guide/Common/Localization/#Using_Localization_Libraries/Using_Globalize).

## Installation

`npm i devextreme-cldr-data`

## Usage

### JSON files
Install the package.
```
npm install --save-dev devextreme-cldr-data globalize
```

Import the `supplemental.json` and the locale-depended `json` files.

```javascript
import 'devextreme/localization/globalize/number';
import 'devextreme/localization/globalize/date';
import 'devextreme/localization/globalize/currency';
import 'devextreme/localization/globalize/message';

import deMessages from 'devextreme/localization/messages/de.json!json';

import supplemental from 'devextreme-cldr-data/supplemental!json';
import cldrDataDe from 'devextreme-cldr-data/de.js!json';

import Globalize from 'globalize';

Globalize.load(
    supplemental, cldrDataDe
);
```

### JS files

Link the `supplemental.json` and the locale-depended `js` files (`de.js` in the example below) after `devextreme` scripts (`dx.all.js`).

```HTML
<script src="https://cdnjs.cloudflare.com/ajax/libs/cldrjs/0.5.0/cldr.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/cldrjs/0.5.0/cldr/event.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/cldrjs/0.5.0/cldr/supplemental.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/globalize/1.4.0/globalize.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/globalize/1.4.0/globalize/message.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/globalize/1.4.0/globalize/number.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/globalize/1.4.0/globalize/currency.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/globalize/1.4.0/globalize/date.min.js"></script>

<script src="https://cdn3.devexpress.com/jslib/18.2.4/js/dx.all.js"></script>

<script src="https://unpkg.com/devextreme-cldr-data/supplemental.js"></script>
<script src="https://unpkg.com/devextreme-cldr-data/de.js"></script>
```
