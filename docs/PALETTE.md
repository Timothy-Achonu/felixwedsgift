# Wedding Palette

This document defines how the wedding palette should be used as the interface grows. The supplied reference image was used to validate the values below, but it is not an application asset and is intentionally not stored in the repository.

## Color Primitives

These four values are immutable brand primitives and must stay aligned with `src/app/globals.css` and the PRD.

| Token             | Value     | Recommended role                                 |
| ----------------- | --------- | ------------------------------------------------ |
| `--wedding-navy`  | `#000330` | Primary text, strong controls, and dark surfaces |
| `--wedding-blue`  | `#6698D3` | Accents, focus, decoration, and selected states  |
| `--wedding-brown` | `#421C0F` | Secondary text and warm emphasis                 |
| `--wedding-cream` | `#FAE5C6` | Primary page background and light surface        |

## Contrast Guidance

Contrast ratios are symmetric: the ratio is the same regardless of which color is the foreground. A passing ratio does not guarantee that both directions are appropriate for the design, so prefer the semantic roles above.

| Pair          | Ratio     | Text guidance                                   |
| ------------- | --------- | ----------------------------------------------- |
| Navy / Cream  | `16.19:1` | Passes AA for normal and large text             |
| Brown / Cream | `12.17:1` | Passes AA for normal and large text             |
| Navy / Blue   | `6.63:1`  | Passes AA for normal and large text             |
| Brown / Blue  | `4.98:1`  | Passes AA for normal and large text             |
| Blue / Cream  | `2.44:1`  | Fails AA for text; reserve for decoration       |
| Navy / Brown  | `1.33:1`  | Fails AA for text; do not use as a text pairing |

WCAG AA requires at least `4.5:1` contrast for normal text and `3:1` for large text. Functional controls and meaningful graphics must also satisfy their applicable non-text contrast requirements. Purely decorative elements are exempt, but decoration must not be the only way information is communicated.

## Derived Colors

Derived tones may be introduced when a real interface needs surfaces, borders, interaction states, or status feedback. Each derived token must:

- use a semantic purpose-based name rather than a shade number;
- preserve the four primitives above instead of replacing or redefining them;
- be checked against every foreground or background color it will touch;
- meet WCAG AA for its actual text or functional UI use;
- avoid communicating state through color alone.

Do not add speculative shade scales. Add the smallest set of derived tokens required by the feature being implemented and document their intended pairings alongside the code change.

The current interface uses these purpose-specific derived tokens:

| Token                   | Value     | Intended role                                       |
| ----------------------- | --------- | --------------------------------------------------- |
| `--status-error`        | `#A13D28` | Admin validation and request failure messages       |
| `--status-success`      | `#356B4B` | Admin save confirmations                            |
| `--admin-field-surface` | `#FFF7E8` | Translucent admin form-control surfaces             |
| `--admin-focus`         | `#6BAEEC` | Admin form-control focus outline against warm paper |

## Reference

- [WCAG 2.2: Understanding Success Criterion 1.4.3, Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [WCAG 2.2: Understanding Success Criterion 1.4.11, Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
