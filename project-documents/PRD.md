# Felix & Gift Wedding Website
## Product Requirements Document

**Document Type:** Product Requirements Document  
**Product:** Felix & Gift Wedding Website  
**Version:** 1.0  
**Status:** Initial Specification  

---

# 1. Product Overview

The Felix & Gift Wedding Website is a beautiful, responsive wedding website that serves as the digital home for Felix and Gift's wedding.

The website should serve different purposes before, during, and after the wedding.

Before the wedding, it should build excitement and provide guests with important information such as:

- Felix and Gift's names
- wedding date
- wedding countdown
- wedding story
- ceremony information
- reception information
- venue
- dress code
- wedding schedule

During the wedding, the website should remain useful by allowing guests to quickly access event information and upload photographs they take at the wedding.

After the wedding, the website should naturally become more focused on memories. The countdown should no longer be the centerpiece. Instead, the wedding gallery and guest photographs should become more prominent.

The product must also include a protected admin area where authorized administrators can:

- manage wedding information
- change the wedding date
- update wedding details
- manage the schedule
- review guest photo uploads
- approve photographs
- reject photographs
- delete photographs
- download original photographs

The public website should feel:

- joyful
- romantic
- lively
- elegant
- warm
- personal
- celebratory
- contemporary
- photography-focused

It must not look like a SaaS application, corporate website, generic dashboard, or generic wedding template.

---

# 2. Product Vision

The website should feel like a combination of:

1. A modern digital wedding invitation
2. An editorial wedding website
3. A shared wedding photo album

The experience should evolve with the wedding itself.

Before the wedding:

> Felix & Gift are getting married.

During the wedding:

> Today is the day.

After the wedding:

> We said "I do."

The website should therefore remain valuable after the ceremony instead of becoming obsolete once the countdown reaches zero.

---

# 3. Primary Product Goals

The first version of the product must accomplish the following:

1. Beautifully present Felix and Gift's wedding.
2. Give guests important wedding information in one place.
3. Display a live countdown to the wedding.
4. Allow guests to upload wedding photographs without creating accounts.
5. Provide a beautiful public wedding photo gallery.
6. Allow administrators to manage wedding information.
7. Allow administrators to moderate guest photographs.
8. Make the experience excellent on mobile devices.
9. Remain useful after the wedding.

---

# 4. Version 1 Non-Goals

The following features should NOT be built in Version 1:

- RSVP management
- guest accounts
- guest authentication
- seating plans
- meal preferences
- wedding gift registry
- payments
- live chat
- messaging
- video uploads
- social networking features
- complex administrator permissions
- multi-wedding support
- multi-tenant architecture
- native mobile applications

These features can be considered later.

Version 1 should remain focused.

---

# 5. User Types

There are two primary user types:

1. Guest
2. Administrator

---

# 6. Guest

Guests do not need accounts.

A guest should be able to:

- visit the public wedding website
- view Felix and Gift's names
- see the wedding date
- see the countdown
- read Felix and Gift's story
- view ceremony details
- view reception details
- view the wedding schedule
- see the venue
- get directions to the venue
- see dress code information
- browse approved wedding photographs
- open photographs in a larger viewer
- navigate between photographs
- upload one or multiple photographs
- optionally provide their name
- optionally provide a caption

Guests cannot:

- access the admin dashboard
- modify wedding information
- approve photographs
- reject photographs
- delete photographs
- see pending photographs
- perform administrator actions

---

# 7. Administrator

Administrators must authenticate.

The administration area should live under:

```text
/admin
```

Possible routes:

```text
/admin/login
/admin
/admin/photos
/admin/settings
/admin/schedule
```

An authenticated administrator should be able to:

- log in
- log out
- view an admin dashboard
- change the wedding date
- update wedding information
- update Felix and Gift's names if necessary
- update ceremony information
- update reception information
- update venue details
- update dress code
- update wedding story
- update hero content
- manage the wedding schedule
- review uploaded photographs
- approve photographs
- reject photographs
- delete photographs
- download original photographs
- perform appropriate bulk photo actions

Version 1 does not require a complex role and permission system.

A small number of authorized administrators is sufficient.

---

# 8. Wedding Lifecycle

The public website should understand whether the wedding is:

1. upcoming
2. happening today
3. already completed

The experience should respond appropriately.

---

# 9. Pre-Wedding State

Before the configured wedding date, the site should emphasize anticipation.

Example:

> Felix & Gift are getting married in

```text
92 DAYS
14 HOURS
37 MINUTES
12 SECONDS
```

The countdown should update live.

---

# 10. Wedding-Day State

When the wedding day arrives, the site should stop presenting a normal countdown.

It should not display:

```text
00 DAYS
00 HOURS
00 MINUTES
00 SECONDS
```

Instead, the interface should transition into a wedding-day message.

Example:

> Today is the day.

or:

> Felix & Gift are getting married today.

The exact final copy can be refined during visual implementation.

---

# 11. Post-Wedding State

After the wedding day, the site should transition toward a memory-focused experience.

Example:

> We said "I do."

The public gallery and guest photo upload experience should become more prominent.

The website should begin feeling more like Felix and Gift's shared wedding album.

---

# 12. Public Website Structure

The public experience should primarily be a beautifully designed scrolling website.

The initial structure should be approximately:

```text
Hero
↓
Countdown
↓
Our Story
↓
Wedding Details
↓
Wedding Schedule
↓
Venue
↓
Share Your Photos
↓
Wedding Gallery
↓
Footer
```

The precise order can change if a better visual experience is discovered during implementation.

Do not create unnecessary pages when a section on the main wedding page would provide a better experience.

---

# 13. Navigation

The public navigation may contain:

```text
Home
Our Story
Details
Schedule
Gallery
Share Photos
```

The navigation should support smooth movement to relevant sections.

The "Share Photos" action should receive appropriate visual emphasis because guest photography is one of the primary product features.

Mobile navigation should be compact, polished, and easy to operate.

---

# 14. Hero Section

The hero should immediately establish:

- whose wedding this is
- when the wedding is happening
- the emotional visual identity of the website

Example:

```text
Felix & Gift

We're getting married

December 12, 2026
```

The hero may include:

- Felix and Gift's names
- wedding date
- short message
- hero photograph
- subtle decorative wedding artwork
- a countdown preview
- a call to view wedding details

The hero must feel like an elegant digital invitation.

It should not resemble the hero of a startup landing page.

---

# 15. Wedding Countdown

The site must include a live countdown.

It should display:

- days
- hours
- minutes
- seconds

Example:

```text
092
DAYS

14
HOURS

37
MINUTES

12
SECONDS
```

The countdown must use wedding information stored in the backend.

The wedding date must NOT be permanently hardcoded inside the React component.

Changing the date from the admin dashboard should automatically affect the public countdown.

The countdown must account for the configured wedding timezone.

This is important because guests may view the website from different countries and timezones.

---

# 16. Our Story

The website should contain a section telling Felix and Gift's story.

It should support:

- section title
- introductory text
- longer story
- one or more photographs

The design should prioritize:

- typography
- photography
- spacing
- editorial composition

Avoid presenting the story inside generic dashboard-style cards.

---

# 17. Wedding Details

The website should clearly display important wedding information.

At minimum:

- wedding date
- ceremony time
- reception time
- venue name
- venue address
- dress code

The information must remain easy to scan on mobile.

Example:

```text
THE CEREMONY

December 12, 2026
2:00 PM

The Garden Estate
Lagos, Nigeria
```

The actual wedding information will be configured later through the admin dashboard.

Do not treat sample content as production data.

---

# 18. Wedding Schedule

The website should contain a visual timeline or schedule for the wedding.

Example:

```text
2:00 PM
Ceremony

3:30 PM
Photography & Cocktails

4:30 PM
Reception

6:00 PM
Dinner

7:30 PM
Dancing
```

Each schedule entry should support:

- title
- optional description
- time
- display order

Schedule information should be stored as structured data.

It should not be permanently hardcoded into frontend components.

Administrators should be able to manage the schedule.

---

# 19. Venue

The venue section should display:

- venue name
- address
- optional venue description
- directions action

Example:

```text
THE VENUE

The Garden Estate
Lagos, Nigeria

[ Get Directions ]
```

Selecting "Get Directions" should open an appropriate mapping application or service.

An embedded interactive map is optional for Version 1.

---

# 20. Guest Photo Sharing

Guest photo uploads are a CORE feature of the product.

Guests should not be required to:

- register
- log in
- verify an email
- create a password

The upload flow should be intentionally simple.

Expected flow:

```text
Guest selects "Share Your Photos"
↓
Guest selects one or multiple images
↓
Selected images are previewed
↓
Guest may remove incorrect selections
↓
Guest optionally provides their name
↓
Guest optionally provides a caption
↓
Guest starts upload
↓
Upload progress is displayed
↓
Upload succeeds
↓
Friendly confirmation is displayed
```

Example call to action:

> Captured a beautiful moment?

Button:

> Share Your Photos

Example success message:

> Thank you for adding to Felix & Gift's wedding memories.

The final wording can be refined during implementation.

---

# 21. Photo Upload Requirements

Guests should be able to:

- select one photograph
- select multiple photographs
- preview photographs before upload
- remove photographs before upload
- optionally provide their name
- optionally provide a caption
- see upload progress
- know when an upload succeeds
- know when an upload fails
- retry when appropriate

The upload experience must be especially easy on phones.

Many guests will upload directly from their phone galleries during or shortly after the wedding.

---

# 22. Supported Media

Version 1 supports photographs only.

Video uploads are outside the initial scope.

Supported image formats should include common formats such as:

- JPEG
- PNG
- WebP

HEIC/HEIF should only be supported if the chosen implementation can reliably process or display it.

The implementation must define sensible:

- maximum file size
- maximum photos per upload
- allowed MIME types

Validation must not exist solely in frontend code.

---

# 23. Cloudinary

Cloudinary will be used for image storage and image delivery.

Cloudinary will be responsible for:

- storing uploaded wedding photographs
- serving photographs
- generating optimized image variants
- producing appropriately sized thumbnails
- delivering responsive image variants
- preserving access to original uploaded photographs
- deleting image assets when administrators delete photographs

Raw image files should NOT be stored inside PostgreSQL.

Supabase should instead store metadata and references to the Cloudinary assets.

---

# 24. Photo Metadata

Each uploaded photo should have database information similar to:

```text
id
cloudinary_public_id
secure_url
original_filename
width
height
format
bytes
guest_name
caption
status
created_at
approved_at
```

`cloudinary_public_id` is important because Cloudinary asset management and deletion should not depend solely on storing an image URL.

---

# 25. Secure Cloudinary Upload Architecture

Sensitive Cloudinary credentials must never be exposed to browser code.

The frontend must never receive:

```text
CLOUDINARY_API_SECRET
```

or any equivalent privileged credential.

A secure upload flow should be used.

Conceptually:

```text
Guest Browser
      ↓
Next.js Application
      ↓
Secure upload authorization/signature
      ↓
Cloudinary
      ↓
Upload result
      ↓
Photo metadata stored in Supabase
```

Codex should implement the smallest secure solution appropriate for the architecture.

---

# 26. Photo Moderation

Guest photographs must NOT automatically appear in the public gallery.

Every newly uploaded photograph should initially receive:

```text
PENDING
```

Supported moderation states:

```text
PENDING
APPROVED
REJECTED
```

Expected flow:

```text
Guest uploads photo
        ↓
Cloudinary stores photo
        ↓
Supabase metadata record is created
        ↓
status = PENDING
        ↓
Administrator reviews photo
        ↓
Approve / Reject / Delete
        ↓
APPROVED photos become publicly visible
```

Only photographs with:

```text
status = APPROVED
```

may appear in the public gallery.

---

# 27. Public Wedding Gallery

The website should contain a responsive photo grid.

The gallery should NOT force every image into identical square containers.

Portrait photographs should be able to remain visually tall.

Landscape photographs should be allowed to remain wide.

The intended result should feel like an elegant photography wall.

Conceptually:

```text
┌──────────────┐ ┌─────────────────────┐
│              │ │                     │
│              │ │      Landscape      │
│   Portrait   │ └─────────────────────┘
│              │ ┌──────────┐ ┌──────────┐
│              │ │          │ │          │
└──────────────┘ │  Photo   │ │ Portrait │
                 │          │ │          │
                 └──────────┘ └──────────┘
```

Possible technical implementations include:

- CSS Grid
- CSS columns
- masonry-style layout
- another appropriate responsive layout

The technical implementation is secondary to the desired visual experience.

---

# 28. Gallery Responsive Behaviour

The number of columns should respond naturally to screen width.

For example:

```text
Small mobile:
1 to 2 columns

Large mobile:
2 columns

Tablet:
2 to 3 columns

Desktop:
3 to 4 columns

Large desktop:
4 or more when visually appropriate
```

These numbers are guidelines rather than rigid requirements.

The gallery should look composed rather than mechanically filling available space.

---

# 29. Photo Lightbox

Clicking or tapping a gallery photograph should open a large immersive viewer.

The lightbox should support:

- larger image
- close action
- previous image
- next image
- keyboard navigation on desktop
- swipe gestures on touch devices
- optional caption
- optional uploader name

On mobile:

```text
Swipe left
→ next photograph

Swipe right
→ previous photograph
```

Background scrolling should be appropriately controlled while the lightbox is open.

The lightbox must be accessible.

---

# 30. Gallery Loading

The website must not attempt to load the entire wedding album at full resolution when the page opens.

The gallery should use:

- optimized Cloudinary thumbnails
- lazy loading
- incremental loading
- appropriate responsive image sizes

Version 1 should preferably use a "Load More" approach.

Example:

```text
24 photos displayed

[ Load More ]

next 24 photos
```

This provides predictable behaviour and keeps the implementation understandable.

---

# 31. Admin Authentication

Supabase Auth should be used for administrator authentication.

Administrators should be able to:

- log in
- remain authenticated securely
- log out

Guests do not use Supabase Auth.

The application must enforce admin authorization on the server/data layer where appropriate.

Security must NOT depend on merely hiding admin links from public users.

An unauthenticated visitor who manually enters:

```text
/admin
```

must not gain access to administrator functionality.

---

# 32. Admin Login

Route:

```text
/admin/login
```

The page should contain a simple and polished authentication experience.

It does not need the elaborate animation of the public wedding website.

The design should still use the Felix & Gift wedding identity.

---

# 33. Admin Dashboard

Route:

```text
/admin
```

The admin dashboard should provide a concise overview.

Example:

```text
Felix & Gift

Wedding Date
December 12, 2026

Days Remaining
92

Total Uploaded Photos
341

Pending Review
27

Approved
302

Rejected
12
```

The admin area should visually belong to the same brand.

However, usability should take priority over decorative animation.

The public website can be highly expressive.

The admin interface should be calmer and more functional.

---

# 34. Admin Photo Management

Route:

```text
/admin/photos
```

Administrators should be able to view:

- all uploads
- pending uploads
- approved uploads
- rejected uploads

Each photograph should display useful metadata such as:

- image preview
- guest name, when provided
- caption, when provided
- upload date
- moderation status

Available individual actions:

```text
Approve
Reject
Delete
Download Original
```

Useful bulk actions:

```text
Select Multiple
Approve Selected
Reject Selected
Delete Selected
```

Bulk downloading can be added after the primary moderation workflow is reliable.

---

# 35. Photo Deletion

When an administrator deletes a photograph, the application should remove:

1. the Cloudinary asset
2. the corresponding Supabase record

Cloudinary administrative operations must happen securely.

Cloudinary API secrets must never be exposed to the browser.

Destructive deletion should require a confirmation interaction.

---

# 36. Wedding Settings

Route:

```text
/admin/settings
```

Administrators should be able to update important wedding content.

At minimum:

```text
Partner One Name
Partner Two Name

Wedding Date
Wedding Time
Wedding Timezone

Ceremony Time
Reception Time

Venue Name
Venue Address

Dress Code

Hero Heading
Hero Message

Wedding Story
```

The initial values may be:

```text
Partner One: Felix
Partner Two: Gift
```

Wedding-specific information such as the actual date and venue should be configured later.

Changes made by administrators should affect the public website without requiring another code deployment.

---

# 37. Data-Driven Content Principle

Content that the couple can reasonably be expected to change should generally live in the application's data layer instead of being permanently hardcoded inside React components.

For example:

Bad:

```tsx
const weddingDate = "2026-12-12";
const venue = "Some Hall";
```

Preferred conceptually:

```text
Frontend
↓
Wedding Settings
↓
Supabase
```

This applies particularly to:

- couple names
- wedding date
- wedding time
- venue
- dress code
- wedding story
- schedule
- hero copy

---

# 38. Wedding Schedule Administration

Route:

```text
/admin/schedule
```

Administrators should be able to:

- create schedule entries
- edit schedule entries
- delete schedule entries
- reorder schedule entries

Each entry should contain:

```text
id
title
description
time
sort_order
created_at
updated_at
```

---

# 39. Technology Stack

The initial technology stack should be:

## Frontend and Application Framework

**Next.js**

Use the current stable Next.js architecture appropriate for the repository.

Prefer App Router unless the existing codebase provides a good reason to use another approach.

---

## Programming Language

**TypeScript**

Use strict TypeScript.

Avoid unnecessary use of:

```ts
any
```

---

## Styling

**Tailwind CSS**

Use Tailwind CSS for:

- layout
- responsive styling
- spacing
- typography
- visual states
- design tokens
- component styling

Avoid scattering arbitrary palette values throughout components.

Define reusable design tokens where sensible.

---

## Animation

**Motion**

Use Motion for intentional application animation where it provides real value.

Prefer simple CSS transitions when they are sufficient.

Do not add complicated animation code for effects CSS handles cleanly.

---

## Backend Platform

**Supabase**

Supabase will provide:

- PostgreSQL database
- authentication
- authorization capabilities
- Row Level Security
- backend data services

Supabase acts as the primary backend/data platform.

---

## Authentication

**Supabase Auth**

Used for administrator authentication.

Guests do not authenticate in Version 1.

---

## Database

**Supabase PostgreSQL**

Used for:

- wedding settings
- wedding schedule
- photo metadata
- moderation status
- relevant application configuration

---

## Image Storage

**Cloudinary**

Used for:

- original wedding photograph storage
- optimized image delivery
- image resizing
- responsive transformations
- thumbnails
- gallery images
- admin original downloads

---

## Deployment

**Vercel**

The Next.js application should be deployable to Vercel.

---

## Source Control

**Git + GitHub**

Development should be performed through normal source control practices.

Major phases should remain small enough to review and commit independently.

---

# 40. Architecture

The high-level application architecture is:

```text
                         ┌────────────────────┐
                         │     Cloudinary     │
                         │                    │
                         │ Wedding Photographs│
                         └─────────▲──────────┘
                                   │
                              Image Files
                                   │
                                   │
┌──────────────┐          ┌────────┴─────────┐
│              │          │                  │
│ Wedding Guest├─────────►│    Next.js App   │
│              │          │                  │
└──────────────┘          └────────┬─────────┘
                                   │
                              Application Data
                                   │
                         ┌─────────▼──────────┐
                         │      Supabase      │
                         │                    │
                         │ PostgreSQL + Auth  │
                         └─────────▲──────────┘
                                   │
                                   │
┌──────────────┐          ┌────────┴─────────┐
│              │          │                  │
│ Administrator├─────────►│      /admin      │
│              │          │                  │
└──────────────┘          └──────────────────┘
```

The architecture should remain intentionally simple.

Do NOT introduce a separate Express, NestJS, or other backend server unless a requirement emerges that genuinely justifies one.

Next.js server functionality should handle the limited trusted server-side operations needed by the product.

---

# 41. Responsibility Split

## Next.js

Responsible for:

- public website
- admin interface
- server-side application logic
- API endpoints or server actions where appropriate
- Cloudinary signing
- secure Cloudinary deletion operations
- authorization checks where appropriate

## Supabase

Responsible for:

- PostgreSQL database
- wedding information
- schedule
- photo metadata
- authentication
- authorization
- Row Level Security

## Cloudinary

Responsible for:

- actual image files
- image optimization
- resizing
- transformations
- image delivery

## Vercel

Responsible for:

- hosting and deployment of the Next.js application

---

# 42. Why Cloudinary and Supabase Are Both Used

Supabase provides its own file storage system.

However, photography is one of the primary features of this product.

Cloudinary is intentionally selected because of its strong image-specific capabilities.

For example, the same wedding photograph may need:

```text
300px thumbnail
800px mobile/tablet version
1600px large gallery version
Original photograph for administrator download
```

Cloudinary can generate and deliver appropriate transformations without requiring the application to manually generate and store every variation.

Therefore:

```text
Supabase
→ structured data
→ database
→ authentication
→ authorization

Cloudinary
→ photographs
→ image optimization
→ image transformations
→ image delivery
```

---

# 43. Initial Database Model

The exact schema should be reviewed during implementation.

A reasonable initial structure is:

## wedding_settings

```text
id
partner_one_name
partner_two_name
wedding_date
timezone
ceremony_time
reception_time
venue_name
venue_address
dress_code
hero_heading
hero_message
story
created_at
updated_at
```

For Version 1, the application represents one wedding.

Do not build unnecessary multi-tenant architecture.

---

# 44. schedule_items

```text
id
title
description
time
sort_order
created_at
updated_at
```

---

# 45. photos

```text
id
cloudinary_public_id
secure_url
original_filename
width
height
format
bytes
guest_name
caption
status
created_at
approved_at
```

Possible photo status values:

```text
PENDING
APPROVED
REJECTED
```

Whether this should use a PostgreSQL enum or another constrained representation should be decided during database implementation.

---

# 46. Database Security

Supabase Row Level Security should be enabled where appropriate.

The public frontend should NOT receive unrestricted database permissions.

For example, guests must not be capable of manually performing:

```sql
UPDATE photos
SET status = 'APPROVED';
```

Admin-only mutations must require proper authorization.

Public users should only have the minimum operations required for the public experience.

---

# 47. Wedding Color Palette

The supplied Felix & Gift wedding palette should serve as the visual foundation.

The current reference palette consists of:

## Deep Navy

```text
#000330
```

Used for:

- strong contrast
- important typography
- dark sections
- navigation
- prominent design accents

## Soft Sky Blue

```text
#6698D3
```

Used for:

- highlights
- interactive accents
- decorative details
- subtle supporting sections

## Dark Chocolate Brown

```text
#421C0F
```

Used for:

- warm typography
- decorative contrast
- warm secondary areas

## Warm Cream

```text
#FAE5C6
```

Used primarily for:

- page backgrounds
- light sections
- softer visual surfaces
- warm visual breathing room

The provided palette image should also be retained in the project as a visual reference if available.

Suggested project location:

```text
project-documents/
├── PRD.md
└── references/
    └── wedding-color-palette.jpg
```

---

# 48. Color Usage

The four palette colors should NOT simply be used equally across the interface.

Suggested hierarchy:

```text
Warm Cream
→ dominant light background

Deep Navy
→ strongest contrast

Dark Chocolate Brown
→ warmth and secondary contrast

Soft Sky Blue
→ accent and highlight
```

Individual sections may reverse the palette.

For example:

```text
Cream Hero
↓
Cream Story
↓
Navy Photography Section
↓
Cream Details
↓
Soft Blue Accent Section
↓
Dark Brown Footer
```

The final design should feel composed rather than looking like four vertical color blocks.

---

# 49. Typography

The public website should combine:

1. An expressive serif or display typeface for large wedding typography
2. A clean, highly readable sans-serif for body copy and interface elements

Typography should form a significant part of the website's personality.

Avoid using many unrelated font families.

Two carefully chosen families should normally be enough.

---

# 50. Public Design Direction

The public website should feel:

- romantic
- happy
- lively
- celebratory
- elegant
- warm
- intimate
- editorial
- modern
- personal
- photography-focused

Think:

```text
Modern Editorial Wedding Invitation
+
Personal Wedding Album
+
Interactive Digital Experience
```

Do NOT design it like:

```text
SaaS Product
Business Dashboard
Corporate Landing Page
Generic Bootstrap Theme
Generic Wedding Template
```

---

# 51. Visual Composition

The design should use:

- generous whitespace
- expressive typography
- large photography
- asymmetrical compositions where appropriate
- layered imagery
- tasteful borders
- subtle decorative wedding elements
- careful contrast
- strong section composition

Avoid excessive generic rounded cards.

Not every piece of information needs to live inside a bordered rectangle.

The public site should feel designed rather than assembled from dashboard components.

---

# 52. Animation Direction

Animation is an important part of the wedding experience.

Motion should feel:

- celebratory
- graceful
- light
- responsive
- intentional

Appropriate animations include:

- gentle text reveals
- mask reveals
- staggered heading entrances
- image entrance animations
- subtle scroll transitions
- slight parallax where appropriate
- countdown digit transitions
- gallery entrance animations
- hover states
- button feedback
- lightbox transitions
- restrained decorative animation

---

# 53. Hero Animation

Felix and Gift's names may be introduced sequentially.

Conceptually:

```text
Felix
```

then:

```text
&
```

then:

```text
Gift
```

The exact animation is a design decision.

It should feel elegant rather than theatrical.

---

# 54. Decorative Motion

Subtle wedding-oriented decorative elements may include tasteful interpretations of:

- petals
- ribbons
- flowers
- paper
- tiny sparkles
- celebratory particles
- abstract curved shapes

Avoid:

- excessive confetti
- constant bouncing
- giant animated hearts
- aggressive zoom effects
- effects that interrupt reading
- animations that block interaction
- unnecessarily slow transitions

The website should feel alive without behaving like a Valentine's Day screensaver.

---

# 55. Reduced Motion

Respect the user's:

```css
prefers-reduced-motion
```

setting where appropriate.

Important content must remain accessible even when animation is reduced or disabled.

---

# 56. Responsive Design

Mobile is a primary experience.

Do NOT design the entire site for desktop first and merely shrink everything afterward.

The product must be intentionally designed for:

- small phones
- larger phones
- tablets
- laptops
- desktops

Special attention should be given to:

- hero typography
- navigation
- countdown
- schedule
- gallery
- photo selection
- photo previews
- upload progress
- lightbox gestures
- admin moderation

A guest standing at Felix and Gift's wedding holding a phone should be able to upload photographs comfortably.

---

# 57. Loading States

Every significant asynchronous interaction should provide feedback.

Examples:

- loading wedding information
- loading gallery photographs
- uploading photographs
- approving photographs
- rejecting photographs
- deleting photographs
- saving settings

Users should never be left wondering whether their action worked.

---

# 58. Empty States

Empty states should be intentionally designed.

Example when the public gallery is empty:

> Felix & Gift's album is just getting started.

Example when no admin photographs are pending:

> You're all caught up.

Do not allow empty pages to appear broken.

---

# 59. Error Handling

Public-facing errors should be understandable.

Avoid exposing technical messages such as:

```text
500 Internal Server Error
PostgREST exception
Cloudinary signature mismatch
```

Prefer user-friendly messages such as:

> We couldn't upload that photo. Please try again.

Technical details can be recorded in appropriate development/server logs.

---

# 60. Accessibility

The product should use good accessibility practices from the beginning.

Requirements include:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient color contrast
- useful alternative text
- accessible form labels
- accessible upload controls
- accessible lightbox behaviour
- appropriate modal focus handling
- reduced-motion support

Accessibility should not be treated as a final cleanup task.

---

# 61. Image Performance

Wedding photography can make the website extremely heavy if implemented poorly.

Therefore:

- thumbnails should use optimized Cloudinary transformations
- full original photographs should not load in the grid
- images should lazy-load where appropriate
- responsive image sizing should be used
- appropriate image quality should be selected
- the gallery should load incrementally

The page should never download hundreds of full-resolution wedding photographs immediately.

---

# 62. Upload Abuse Protection

Because guests can upload photographs without authenticating, the upload functionality will be publicly reachable.

The implementation should therefore include sensible protection.

Potential protections include:

- file size limits
- allowed MIME types
- maximum files per upload
- secure Cloudinary signing
- rate limiting
- text input sanitization
- rejection of unsupported file types

Do not add CAPTCHA unless there is a genuine need.

The upload flow should remain friendly for real wedding guests.

---

# 63. SEO and Social Sharing

The public site should contain suitable:

- page title
- meta description
- favicon
- Open Graph metadata
- social sharing image

For example, sharing the website through WhatsApp could produce a preview similar to:

```text
Felix & Gift are getting married 💙

December 12, 2026
```

The actual date should come from the configured wedding settings.

---

# 64. Environment Variables

Sensitive configuration should be provided through environment variables.

Likely variables include:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

The exact environment variables should depend on the final implementation.

Secrets must never be committed to Git.

Provide:

```text
.env.example
```

containing variable names and documentation without real secrets.

---

# 65. Suggested Application Structure

Codex must inspect the repository before deciding the exact structure.

A possible structure is:

```text
app/
  page.tsx

  admin/
    login/
      page.tsx

    page.tsx

    photos/
      page.tsx

    settings/
      page.tsx

    schedule/
      page.tsx

  api/
    uploads/
    photos/
    admin/

components/
  wedding/
  gallery/
  uploads/
  admin/
  shared/

lib/
  supabase/
  cloudinary/
  auth/
  validation/

types/

public/

project-documents/
  PRD.md
  references/
    wedding-color-palette.jpg
```

This is illustrative.

Do not force this structure if the existing repository already has sensible conventions.

---

# 66. Development Philosophy

Codex must NOT attempt to build the entire application in a single pass.

Development should proceed in controlled phases.

For every phase:

1. Inspect the relevant existing code.
2. Explain what needs to change.
3. Identify files that will likely be changed or created.
4. Implement only the current phase.
5. Run appropriate checks.
6. Fix problems introduced by the implementation.
7. Summarize the work.
8. Stop.

Do not automatically continue into the next major phase.

---

# 67. Phase 0: Repository Analysis

Do NOT modify the project during this phase.

Codex should inspect:

- repository structure
- framework
- Next.js version
- React version
- TypeScript configuration
- package manager
- package dependencies
- Tailwind configuration
- linting
- formatting
- existing components
- existing utility functions
- existing assets
- environment setup
- Git state
- existing design system, if any

Then compare the existing repository against this PRD.

Output:

```text
Current architecture
Existing relevant functionality
Missing dependencies
Recommended architecture
Potential technical concerns
Implementation sequence
```

Do not implement anything yet.

---

# 68. Phase 1: Project Foundation

Establish the minimum application foundation.

Tasks may include:

- confirm Next.js setup
- confirm TypeScript configuration
- configure Tailwind if required
- establish design tokens
- configure wedding color palette
- establish typography
- establish public application shell
- establish admin shell
- establish environment validation
- install only genuinely necessary dependencies

Do not implement major product functionality yet.

---

# 69. Phase 2: Supabase Foundation

Configure Supabase.

Implement:

- Supabase project integration
- database connection
- initial database schema
- migrations
- generated or maintained types
- Row Level Security policies
- development configuration

Initial tables:

```text
wedding_settings
schedule_items
photos
```

Add sensible development seed data where appropriate.

Use:

```text
Felix
Gift
```

as sample partner names.

Do not invent additional personal wedding information.

---

# 70. Phase 3: Administrator Authentication

Implement:

```text
/admin/login
```

Protect:

```text
/admin
/admin/photos
/admin/settings
/admin/schedule
```

Verify:

- unauthenticated users cannot access administrator routes
- authorized administrators can access them
- authentication persists appropriately
- logout works
- unauthorized data mutations are rejected

---

# 71. Phase 4: Public Wedding Foundation

Build the initial public page structure.

Implement:

- navigation
- hero
- wedding identity
- palette
- typography
- section structure
- responsive layout

Example hero content:

```text
Felix & Gift

We're getting married
```

Use database-backed wedding information as early as reasonably possible.

Avoid duplicating temporary hardcoded content throughout the application.

---

# 72. Phase 5: Wedding Countdown

Implement the countdown.

Requirements:

- wedding date comes from Supabase
- configured timezone is respected
- countdown updates live
- server/client rendering is handled correctly
- pre-wedding state works
- wedding-day state works
- post-wedding state works
- layout is responsive
- countdown is accessible

---

# 73. Phase 6: Wedding Information

Implement:

- Our Story
- Wedding Details
- Schedule
- Venue
- Dress Code

Connect relevant content to Supabase.

Do not focus on elaborate admin editing yet.

First ensure the public presentation works correctly.

---

# 74. Phase 7: Admin Wedding Settings

Implement:

```text
/admin/settings
```

Administrators should be able to modify wedding information.

Verify the complete flow:

```text
Administrator changes wedding information
↓
Supabase updates
↓
Public website receives updated information
↓
Website reflects change
```

No application redeployment should be required for ordinary wedding-content changes.

---

# 75. Phase 8: Admin Schedule Management

Implement:

```text
/admin/schedule
```

Support:

- create
- edit
- delete
- reorder

Verify changes appear correctly on the public website.

---

# 76. Phase 9: Cloudinary Foundation

Configure Cloudinary.

Implement the smallest secure upload foundation.

Verify that a test image can successfully travel through:

```text
Browser
↓
Application
↓
Cloudinary
```

Verify:

- credentials remain server-side
- transformations work
- public ID is returned
- original asset remains retrievable

Do NOT immediately build the complete guest upload experience.

First prove the storage pipeline.

---

# 77. Phase 10: Guest Photo Uploads

Build the complete guest photo-sharing interface.

Support:

- single image selection
- multiple image selection
- image previews
- removing selected images
- optional guest name
- optional caption
- client validation
- appropriate server validation
- progress feedback
- success state
- error state

Successful upload should result in:

```text
Cloudinary asset
+
Supabase photo record
+
status = PENDING
```

---

# 78. Phase 11: Admin Photo Moderation

Implement:

```text
/admin/photos
```

Support:

- all photos
- pending photos
- approved photos
- rejected photos
- approve
- reject
- delete
- original download

Then add appropriate bulk operations.

Do not overcomplicate filtering in the initial implementation.

---

# 79. Phase 12: Public Wedding Gallery

Implement the responsive photograph grid.

The public query must return only:

```text
status = APPROVED
```

Support:

- optimized thumbnails
- varied photograph aspect ratios
- responsive columns
- lazy loading
- incremental loading
- loading state
- empty state
- load-more behaviour

The gallery must look like a photography experience rather than a data grid.

---

# 80. Phase 13: Photo Lightbox

Implement the immersive image viewer.

Support:

- open
- close
- previous photograph
- next photograph
- keyboard navigation
- mobile swipe navigation
- caption
- uploader name where available
- accessible modal behaviour
- appropriate animation

---

# 81. Phase 14: Animation and Visual Polish

Only begin significant animation work after the product's fundamental behaviour is functioning correctly.

Polish:

- hero entrance
- Felix and Gift name reveal
- section transitions
- scroll effects
- photograph entrances
- countdown transitions
- button interactions
- decorative motion
- gallery transitions
- lightbox animation

Do not use animation to hide broken layouts.

---

# 82. Phase 15: Performance Review

Review:

- Cloudinary transformations
- gallery image sizes
- responsive image behaviour
- image loading strategy
- lazy loading
- database queries
- unnecessary client rendering
- JavaScript bundle weight
- unnecessary rerenders
- pagination/load-more behaviour
- Core Web Vitals where practical

---

# 83. Phase 16: Accessibility and Responsive QA

Test the experience across representative screen sizes.

At minimum consider:

```text
Small Android phone
Modern iPhone
Large mobile phone
Tablet
Laptop
Desktop
Large desktop
```

Verify:

- navigation
- hero
- countdown
- wedding details
- schedule
- photo uploading
- gallery
- lightbox
- admin login
- admin moderation
- admin settings

Also test keyboard-only interaction.

---

# 84. Phase 17: Production Readiness

Before production deployment, review:

- production Supabase configuration
- production Cloudinary configuration
- Vercel environment variables
- database migrations
- Row Level Security
- admin authorization
- Cloudinary signing
- upload restrictions
- rate limiting
- destructive actions
- error handling
- metadata
- Open Graph sharing
- favicon
- sitemap
- robots configuration
- build output
- deployment behaviour

Deploy using Vercel.

---

# 85. Phase Completion Report

At the end of every implementation phase, Codex should provide:

```text
Completed
Files Created
Files Modified
Packages Added
Database Changes
Environment Variables Required
Tests / Checks Performed
Known Limitations
Recommended Next Phase
```

Then stop.

Do not automatically begin another major phase.

---

# 86. Definition of Done

Version 1 is considered complete when all of the following are true.

## Public Experience

- The website clearly presents Felix and Gift's wedding.
- The website is visually polished.
- The website is responsive.
- The supplied wedding color palette is used thoughtfully.
- Wedding information comes from Supabase.
- The site includes Felix and Gift's story.
- The site includes wedding details.
- The site includes the wedding schedule.
- The site includes venue information.

## Countdown

- The countdown uses the configured wedding date.
- The countdown uses the configured timezone.
- The countdown updates live.
- The wedding-day state works.
- The post-wedding state works.
- The date is not permanently hardcoded inside the UI.

## Guest Uploads

- Guests can upload without accounts.
- Guests can select multiple photographs.
- Guests can preview photographs.
- Guests can remove selections.
- Guests can optionally provide their name.
- Guests can optionally provide captions.
- Guests receive progress feedback.
- Guests receive success feedback.
- Upload failures are handled clearly.
- Uploaded photographs are stored in Cloudinary.
- Photo metadata is stored in Supabase.
- New uploads are pending by default.

## Administration

- Administrators can authenticate.
- `/admin` is protected.
- Unauthorized users cannot perform admin actions.
- Administrators can update wedding information.
- Administrators can update the schedule.
- Administrators can review guest photographs.
- Administrators can approve photographs.
- Administrators can reject photographs.
- Administrators can delete photographs.
- Administrators can download original photographs.

## Gallery

- Only approved photographs are public.
- Photographs appear in a responsive photo grid.
- Portrait and landscape photographs retain appropriate proportions.
- Optimized image versions are loaded.
- The entire album does not load at full resolution immediately.
- Additional photographs can be loaded incrementally.
- Selecting a photograph opens the lightbox.
- Previous and next navigation works.
- Mobile swipe navigation works.

## Design

- The site feels romantic and celebratory.
- The site feels lively without becoming visually chaotic.
- The site feels modern and editorial.
- The site makes strong use of wedding photography.
- The public site does not resemble a SaaS dashboard.
- Animation enhances the experience rather than distracting from it.
- Mobile receives first-class attention.

## Security

- Cloudinary secrets are not exposed.
- Supabase service-role credentials are not exposed.
- Admin operations require authorization.
- RLS is configured appropriately.
- Uploads have sensible restrictions.
- Arbitrary unsupported file uploads are rejected.

## Production

- The project builds successfully.
- Relevant linting and type checks succeed.
- Required environment variables are documented.
- Production deployment works on Vercel.

---

# 87. Codex Operating Instructions

Read this entire PRD before making architectural decisions.

Do not attempt to implement the entire application at once.

Begin with Phase 0 only.

Before modifying code, inspect the repository thoroughly.

Determine:

- what already exists
- what technologies are already configured
- which dependencies are already installed
- which utilities already exist
- which components can be reused
- which conventions the repository follows

Do not recreate functionality that already exists.

Prefer the smallest implementation that satisfies the requirements.

Do not introduce abstractions merely because they could theoretically be useful later.

Do not add features listed under Non-Goals.

Do not silently make large architectural decisions.

When multiple meaningful implementation approaches exist, explain the tradeoffs before choosing one.

Follow existing repository conventions unless this PRD explicitly requires changing them.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
CLOUDINARY_API_SECRET
administrator credentials
```

to client-side code.

Treat authentication, authorization, database security, upload security, and privileged Cloudinary operations as actual security boundaries.

Do not treat hidden buttons or hidden routes as security.

After every phase:

1. Run appropriate TypeScript checks.
2. Run linting where configured.
3. Run relevant tests where configured.
4. Run the production build when appropriate.
5. Fix problems caused by the implementation.
6. Summarize the phase.
7. Stop.

Do not automatically begin the next major phase.

The first task after receiving this PRD is:

> Perform Phase 0: Repository Analysis only. Do not modify any files.