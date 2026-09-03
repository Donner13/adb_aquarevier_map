# Form Accessibility and Best Practices Audit Report

This report outlines the gaps identified during the audit of all forms on the platform, specifically focusing on `index.html` and `internal.html`. The audit checks for label association, error placement, required field indication, screen reader announcements for errors, error styling, autocomplete attributes, and input types.

## 1. Missing Labels
The following input fields do not have an associated `<label>` element, nor do they use `aria-label` or `aria-labelledby`:

*   `search-input` (in both `index.html` and `internal.html`)
*   `embed-width-type`, `embed-width-px`, `embed-height`, `embed-snippet-output` (in `index.html`)
*   `textGeneratorContent` (in both `index.html` and `internal.html`)
*   `contact-name`, `contact-group`, `contact-lat`, `contact-lng`, `contact-address`, `contact-person`, `contact-desc`, `contact-phone`, `contact-email`, `contact-logo` (in `internal.html`)
*   Configuration inputs: `cfg-marker-size`, `cfg-marker-border`, `cfg-marker-tooltip` (in `internal.html`)
*   Boundary style inputs: `cfg-ug-color`, `cfg-ug-fill`, `cfg-ug-weight`, `cfg-ug-opacity`, `cfg-kr-color`, `cfg-kr-weight`, `cfg-kr-dash`, `cfg-ca-color`, `cfg-ca-fill`, `cfg-ca-weight`, `cfg-ca-opacity` (in `internal.html`)
*   River style inputs: `cfg-riv-color`, `cfg-riv-weight-det`, `cfg-riv-opacity`, `cfg-rivl-color`, `cfg-rivl-shadow`, `cfg-rivl-color-light`, `cfg-rivl-shadow-light`, `cfg-rivl-size` (in `internal.html`)
*   WMS configuration inputs: `custom-wms-name`, `custom-wms-url`, `custom-wms-layers` (in `internal.html`)
*   Theme configuration inputs: `cfg-theme-bgBase`, `cfg-theme-textPrimary`, `cfg-theme-accentPrimary` (in `internal.html`)
*   Import GeoJSON inputs: `import-geojson-file`, `import-layer-name`, `import-layer-color` (in `internal.html`)
*   `auditLayerSelect` (in `internal.html`)

## 2. Required Fields Indication
*   The `feedback-category` and `feedback-text` fields use the standard HTML `required` attribute. This is acceptable, but for broader compatibility with screen readers, they should also include `aria-required="true"`.

## 3. Error Message Announcements (Screen Readers)
*   The `feedback-category` and `feedback-text` inputs are missing the `aria-describedby='feedback-error'` attribute. This prevents screen readers from announcing validation errors associated with these fields.
*   The `feedback-error` container element itself does not utilize an `aria-live` region (e.g., `aria-live="assertive"`) to automatically announce the error when it appears dynamically.

## 4. Error Styling
*   The `feedback-error` element relies entirely on color (`color: #ef4444`) to convey the error state. It lacks a non-color indicator, such as a warning icon (⚠️) or explicit text like "Fehler:" prefix.

## 5. Autocomplete Attributes
Several form fields related to user or organizational information are missing appropriate `autocomplete` attributes:

*   `contact-name` is missing `autocomplete='organization'`
*   `contact-address` is missing `autocomplete='street-address'`
*   `contact-person` is missing `autocomplete='name'`
*   `contact-phone` is missing `autocomplete='tel'`
*   `contact-email` is missing `autocomplete='email'`

## 6. Input Types
*   The `contact-phone` input uses `type="text"`. It should use `type="tel"` to trigger correct mobile keyboards and validation.
*   The `search-input` field uses `type="text"`. It should use `type="search"` to provide semantic meaning and native browser search features (like a clear button).

## 7. Field Validation Messages (Placement)
*   The `feedback-error` message is currently placed below the `feedback-text` textarea. Since this single error message applies to both the `feedback-category` select and the `feedback-text` textarea, it should ideally be linked to *both* fields using `aria-describedby`. Alternatively, and preferably, the validation should be separated into two distinct error messages placed immediately near their respective fields.
