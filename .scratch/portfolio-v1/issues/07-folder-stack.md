# 07: Folders and the Song stack

**What to build:** The centrepiece. Every Song appears in its own paper Folder, stacked
down the page, each showing its cover taped on, its title, its story and its platform link
when it has one. The play control is present but does nothing yet.

**Blocked by:** 02, 04

**Status:** ready-for-agent

- [ ] Each Folder is a tabbed paper shape with an unbroken keyline over the whole silhouette and no seam where the tab meets the body — built with the negative-margin technique, not `clip-path`, which clips the border
- [ ] The Folder's shadow is a single filter on the wrapper, not a shadow per box, so the tab/body join has no notch
- [ ] Tab position alternates down the column
- [ ] The cover image is taped at its top two corners with mirrored, rotated, translucent strips that overlap both the image and the ground behind it; rotation varies between instances and is never animated
- [ ] Every Folder is fully visible with no overlap; on a narrow screen they are full width with a generous gap and a reduced shadow offset
- [ ] Songs appear in the order set in the CMS
- [ ] A Song with no platform link renders no link; a Song with no English story shows the Italian one
- [ ] The stack is marked up as a list of articles, never as a tab interface, and decorative tape is hidden from assistive technology
- [ ] Every tap target clears 24 by 24 pixels
- [ ] Playwright covers: all seeded Songs present and in order, the missing-link case, and the fallback case
