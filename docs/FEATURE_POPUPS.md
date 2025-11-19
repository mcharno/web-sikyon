# Feature Popups and Modals

## Overview

The FeatureModal component provides rich, interactive popups when users click on map features. It automatically detects and displays various types of content including images, PDFs, and external links.

## Component Architecture

```
FeatureModal
│
├── Modal Header
│   ├── Title (from name or type)
│   └── Close button
│
├── Modal Body
│   ├── Special Fields Section (highlighted)
│   ├── Description Section
│   ├── Images Section (gallery + lightbox)
│   ├── PDFs Section (document links)
│   └── Additional Properties
│
└── Modal Footer
    └── Close button
```

## Automatic Field Detection

The FeatureModal intelligently detects and categorizes feature properties:

### 1. Special Fields

Displayed prominently at the top in highlighted cards:

```javascript
const specialFields = [
  'name',      // Feature name
  'type',      // Classification
  'count',     // Quantity
  'period',    // Time period
  'date',      // Specific date
  'material'   // Material composition
];
```

**Example Display:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ TYPE            │ PERIOD          │ COUNT           │
│ Fine Ware       │ Classical       │ 15              │
├─────────────────┼─────────────────┼─────────────────┤
│ MATERIAL        │ DATE            │                 │
│ Ceramic         │ 450-400 BCE     │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

### 2. Image Fields

Detected by field name or file extension:

```javascript
function isImageField(key, value) {
  const lowerKey = key.toLowerCase();
  const lowerValue = value.toLowerCase();

  return (
    // By field name
    lowerKey.includes('image') ||
    lowerKey.includes('photo') ||
    lowerKey.includes('picture') ||

    // By file extension
    lowerValue.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );
}
```

**Recognized patterns:**
- `image`, `image_url`, `main_image`
- `photo`, `photo_url`, `photo_reference`
- `picture`, `pictures`
- Any field ending in `.jpg`, `.png`, etc.
- Array fields: `images[]`, `photos[]`

### 3. PDF Fields

Detected by field name or file extension:

```javascript
function isPDFField(key, value) {
  const lowerKey = key.toLowerCase();
  const lowerValue = value.toLowerCase();

  return (
    // By field name
    lowerKey.includes('pdf') ||
    lowerKey.includes('document') ||
    lowerKey.includes('report') ||

    // By file extension
    lowerValue.match(/\.pdf$/i)
  );
}
```

**Recognized patterns:**
- `pdf`, `pdf_url`, `pdf_report`
- `document`, `documentation`
- `report`, `report_url`
- Any field ending in `.pdf`
- Array fields: `pdfs[]`, `documents[]`

### 4. URL Fields

Detected by field name or protocol:

```javascript
function isURLField(key, value) {
  const lowerKey = key.toLowerCase();

  return (
    // By field name
    lowerKey.includes('url') ||
    lowerKey.includes('link') ||
    lowerKey.includes('reference') ||
    lowerKey.includes('external') ||

    // By protocol
    value.startsWith('http://') ||
    value.startsWith('https://')
  );
}
```

**Recognized patterns:**
- `url`, `website_url`, `source_url`
- `link`, `external_link`
- `reference`, `external_reference`
- Any value starting with `http://` or `https://`

## Usage Examples

### Basic Feature Properties

```javascript
const feature = {
  properties: {
    name: "Red-Figure Kylix",
    type: "Fine Ware",
    period: "Classical",
    count: 3,
    description: "Fragments of an Attic red-figure drinking cup"
  }
};
```

**Renders as:**
```
┌─────────────────────────────────────────────────────┐
│ Red-Figure Kylix                              [×]   │
├─────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐     │
│ │ TYPE         │ PERIOD       │ COUNT        │     │
│ │ Fine Ware    │ Classical    │ 3            │     │
│ └──────────────┴──────────────┴──────────────┘     │
│                                                     │
│ Description                                         │
│ Fragments of an Attic red-figure drinking cup      │
│                                                     │
│ Additional Properties                               │
│ [Empty - all properties shown above]                │
└─────────────────────────────────────────────────────┘
```

### Feature with Images

```javascript
const feature = {
  properties: {
    name: "Building Foundation",
    type: "Architecture",
    period: "Hellenistic",
    image: "https://example.com/photos/building-001.jpg",
    images: [
      "https://example.com/photos/building-001a.jpg",
      "https://example.com/photos/building-001b.jpg",
      "https://example.com/photos/building-001c.jpg"
    ],
    description: "Well-preserved foundation walls"
  }
};
```

**Renders as:**
```
┌─────────────────────────────────────────────────────┐
│ Building Foundation                           [×]   │
├─────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┐                     │
│ │ TYPE         │ PERIOD       │                     │
│ │ Architecture │ Hellenistic  │                     │
│ └──────────────┴──────────────┘                     │
│                                                     │
│ Description                                         │
│ Well-preserved foundation walls                     │
│                                                     │
│ Images                                              │
│ ┌────┬────┬────┬────┐                              │
│ │[📷]│[📷]│[📷]│[📷]│  ← Click to enlarge          │
│ └────┴────┴────┴────┘                              │
└─────────────────────────────────────────────────────┘
```

### Feature with PDFs

```javascript
const feature = {
  properties: {
    name: "Coin Hoard",
    type: "Coins",
    period: "Hellenistic",
    pdf_report: "https://example.com/reports/coin-hoard-001.pdf",
    documentation: "https://example.com/docs/analysis.pdf",
    description: "Small hoard of bronze coins"
  }
};
```

**Renders as:**
```
┌─────────────────────────────────────────────────────┐
│ Coin Hoard                                    [×]   │
├─────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┐                     │
│ │ TYPE         │ PERIOD       │                     │
│ │ Coins        │ Hellenistic  │                     │
│ └──────────────┴──────────────┘                     │
│                                                     │
│ Description                                         │
│ Small hoard of bronze coins                         │
│                                                     │
│ Documents                                           │
│ ┌─────────────────────────────────────────────┐    │
│ │ 📄  Pdf Report                               │    │
│ └─────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────┐    │
│ │ 📄  Documentation                            │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Feature with External Links

```javascript
const feature = {
  properties: {
    name: "Survey Square A-12",
    type: "Survey Area",
    external_reference: "https://zenodo.org/records/1054450",
    publication_url: "https://doi.org/10.1234/example",
    description: "Primary survey area"
  }
};
```

**Renders links as clickable:**
```
┌─────────────────────────────────────────────────────┐
│ Additional Properties                               │
│                                                     │
│ EXTERNAL REFERENCE                                  │
│ https://zenodo.org/records/1054450 ← Clickable     │
│                                                     │
│ PUBLICATION URL                                     │
│ https://doi.org/10.1234/example ← Clickable        │
└─────────────────────────────────────────────────────┘
```

## Image Lightbox

Clicking any image thumbnail opens a full-screen lightbox:

```
┌──────────────────────────────────────────────────────┐
│                                              [×]     │
│                                                      │
│                                                      │
│              ┌────────────────────┐                  │
│              │                    │                  │
│              │                    │                  │
│              │   Full-Size Image  │                  │
│              │                    │                  │
│              │                    │                  │
│              └────────────────────┘                  │
│                                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Full-screen overlay with dark backdrop
- Click anywhere to close
- Close button in top-right
- Maximum 90vh/90vw sizing
- Object-fit: contain (preserves aspect ratio)

## Error Handling

### Missing Images

When an image fails to load:

```
┌────────────────┐
│   ┌──────┐     │
│   │ 📷   │     │  ← SVG placeholder icon
│   │      │     │
│   └──────┘     │
│ Image not      │
│ available      │
└────────────────┘
```

**Implementation:**
```javascript
<img
  src={imageUrl}
  onError={(e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  }}
/>
<div className="media-placeholder" style={{ display: 'none' }}>
  {/* SVG icon */}
  <span>Image not available</span>
</div>
```

### Missing Properties

- Empty properties are filtered out
- Sections with no content are hidden
- Graceful fallback for missing special fields

## Customization

### Adding New Special Fields

Edit `FeatureModal.js`:

```javascript
const specialFields = [
  'name',
  'type',
  'count',
  'period',
  'date',
  'material',
  'your_new_field'  // Add here
];
```

### Custom Field Formatting

```javascript
const formatValue = (key, value) => {
  // Date formatting
  if (key === 'date' || key.includes('_date')) {
    return new Date(value).toLocaleDateString();
  }

  // Number formatting
  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  // URL shortening
  if (isURLField(key, value)) {
    return value.replace(/^https?:\/\//, '');
  }

  return value;
};
```

### Excluding Fields

Add to excluded list:

```javascript
const excludeFromProperties = [
  'description',
  'image', 'images',
  'photo', 'photos',
  'pdf', 'pdfs',
  'document', 'documents',
  ...specialFields,
  'internal_id',        // Add custom exclusions
  'system_generated'
];
```

## Styling

### CSS Classes

```css
/* Modal container */
.modal-backdrop { }
.modal-content { }

/* Header */
.modal-header { }
.modal-title { }
.modal-close { }

/* Body sections */
.modal-body { }
.feature-highlights { }
.highlight-item { }
.feature-description { }
.feature-media { }
.media-gallery { }
.media-item { }
.media-thumbnail { }
.feature-documents { }
.document-link { }
.feature-properties { }

/* Lightbox */
.lightbox-backdrop { }
.lightbox-content { }
.lightbox-image { }
.lightbox-close { }
```

### Theme Customization

```css
/* Change highlight color */
.highlight-item {
  border-left-color: #your-color;
  background: linear-gradient(135deg,
    rgba(your-r, your-g, your-b, 0.1) 0%,
    rgba(your-r, your-g, your-b, 0.1) 100%
  );
}

/* Change document link color */
.document-link {
  color: #your-color;
}

.document-link:hover {
  border-color: #your-color;
}
```

## Integration with Map

### Triggering the Modal

```javascript
// In MapView.js
const handleMapClick = (event) => {
  const feature = event.features[0];
  if (feature) {
    onFeatureClick({
      properties: feature.properties,
      geometry: feature.geometry
    }, feature.source);
  }
};
```

### Passing Layer Context

```javascript
// In MapPage.js
<FeatureModal
  feature={selectedFeature}
  onClose={() => setSelectedFeature(null)}
/>

// The feature object includes:
{
  properties: { ... },  // All feature properties
  geometry: { ... },    // GeoJSON geometry
  layerId: 'pottery'    // Source layer ID
}
```

## Performance Considerations

1. **Lazy Image Loading**: Images load only when modal opens
2. **Thumbnail Optimization**: Consider serving thumbnails for gallery
3. **Conditional Rendering**: Sections render only if content exists
4. **Memoization**: Consider using `useMemo` for complex computations
5. **Event Delegation**: Single lightbox component for all images

## Accessibility

```javascript
// ARIA labels
<button
  className="modal-close"
  onClick={onClose}
  aria-label="Close modal"
>

// Keyboard navigation
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);

// Focus management
useEffect(() => {
  if (selectedImage) {
    const closeButton = document.querySelector('.lightbox-close');
    closeButton?.focus();
  }
}, [selectedImage]);
```

## Best Practices

1. **Consistent Data**: Ensure property names are consistent across features
2. **Valid URLs**: Validate image and PDF URLs before deployment
3. **Responsive Images**: Use appropriately sized images
4. **Alt Text**: Generate descriptive alt text from feature properties
5. **Loading States**: Show loading indicators for slow-loading images
6. **Error Tracking**: Log failed image loads for debugging
7. **Cache Headers**: Set appropriate cache headers for media files
