# Your website, and how to change the words on it

This guide is for you, Anna. It explains the admin panel of anna-milazzo.com: what each part of it is, what it changes on the public site, and how to change it without breaking anything.

Read it once from start to finish. After that, come back and look up the one thing you need. Every field you can edit is listed here with the exact name you will see on screen.

---

## 1. Getting in, and what you are looking at

**The address is `anna-milazzo.com/admin`.** Sign in with your email address and your password.

Keep that password somewhere safe, in a password manager or written down at home. There is no working "forgot my password" link on this site, because no mail service is connected to the panel. If you lose the password, your developer has to make you a new account.

Once you are in, the menu down the left side holds everything. It is split into two kinds of thing, and the difference matters.

**Pages that always exist.** You open them and edit them in place. You cannot create them and you cannot delete them.

| In the menu | What it is |
| --- | --- |
| **Landing page** (Home) | The front page of the site, top to bottom |
| **Contact page** (Pagina contatti) | The contact page |
| **Legals page** (Note legali) | The legal notice |
| **Settings** (Impostazioni) | Your public email address, your profile links, and the footer that appears on every page |

**Lists you add to and remove from.** These are collections of items.

| In the menu | What it is |
| --- | --- |
| **Songs** | Your works. Each one is a card on the front page with a cover, a player and a story |
| **Media** | Every image on the site: the portrait, and the cover of each work |
| **Audio** | Every MP3 on the site |
| **Users** | The login accounts. This is not content. See section 11 |

Those four list names stay in English whatever language the panel is set to. The four pages above them are translated.

At the top of the edit screen you will find one language switcher. It is the important one: it decides which language you are writing. There is a second one, for the language of the panel's own buttons and menus, but it lives in your account settings and it changes nothing on your website. Section 3 explains both.

There is also a **Save** button on every edit screen. Nothing you type is stored until you press it.

**Creating things.** In any of the four lists, the button that makes a new item is at the top right. It reads **Create new** with the panel in English, and **Crea Nuovo** with the panel in Italian. This guide says "Create new" throughout.

---

## 2. The one warning that matters

**There is no draft. There is no preview. There is no undo.**

When you press Save, the change is on the public website that second. Anyone visiting anna-milazzo.com sees it. There is no "publish" step to hold it back, no history of earlier versions to return to, and no way to recover text you have replaced.

Three habits protect you completely:

1. **Keep the real website open in a second browser tab.** Save in the panel, move to the other tab, reload the page, look at it. That is your preview.
2. **Before you rewrite anything long, copy the old text out first.** Paste it into an email to yourself, or into a notes app. If the new version reads worse, you can put the old one back.
3. **Write long text somewhere else and paste it in.** The About text, a work's story, the legal notice. Write them in your own notes, then paste.

There is also nowhere private to experiment. Creating a work "to see what it looks like" puts that work on the live site immediately. If you want to try something, copy the existing wording somewhere safe first, change it on a field that already exists, and put the old wording straight back. Do not create a test work: it would be online.

---

## 3. The two languages, and the safety net

The site exists twice. Italian is the main site at **anna-milazzo.com**. English lives at **anna-milazzo.com/en**.

### Two switchers, not one

- **The content language switcher** decides which language you are *writing*. It is at the top of the edit screen and it offers **Italian** and **English**. This is the one that matters.
- **The panel language switcher** decides the language of the panel's own buttons and menus. It is a setting on your own account page. Changing it changes nothing on your website. It only changes what the software says to you.

### The safety net

Italian is the default language of the site, and English falls back to Italian. **A field you leave empty in English shows the Italian text instead.** Nothing on the English site is ever blank because you have not translated it yet. You can add a new work in Italian only, and the English site shows it in Italian rather than showing a hole.

**There is a catch, and it matters for corrections.** The fallback only works while the English field is empty, and right now almost none of them are: your site was set up with English text already written into every field. So when you *correct* something rather than adding something, correcting the Italian does not correct the English. Fix a typo in Italian, then switch to English and check the same field there.

### It does not work the other way round

The fallback runs one way only. **Italian never falls back to English.** If you switch to English, add a work, type its title in English and press Save, the English site looks perfect and the main Italian site has a work with no title on it.

So the rule for new content is short: **always fill Italian first. English can wait.** For corrections to text that already exists, do both.

Before you type anything, glance at the content language switcher. This matters most when you are creating something new: a work, a skill, a step in the timeline, or an image (the alternative text on an image is per-language too).

### Fields that are the same in both languages

A few fields are shared. They have no Italian version and no English version, there is only one of them, and changing it from either side changes both sites at once. This surprises people, so here is the whole list.

| Where | The shared fields |
| --- | --- |
| A work (Songs) | Cover image, Audio, Duration in seconds, Streaming link, Order |
| Landing page | Portrait, and each timeline entry's Period |
| Settings | Public contact address, and each Elsewhere link's URL |

Everything else on the site is per-language.

---

## 4. Landing page

Open **Landing page** in the menu. It is one long screen, divided into groups that match the sections of the front page, in the order a visitor meets them.

### How the repeating lists work

Four things on this site are lists of rows: the Skills, the Timeline entries, the What to write points on the contact page, the In practice facts, and the Elsewhere links in Settings. They all behave the same way, and you will use them constantly, so here is how they work once.

Each row is folded shut and shows only a short summary of itself. Click a row's title bar to fold it open, and again to fold it shut. To make a new row, scroll to the bottom of the list and press the button there: it reads **Add Entry**, **Add Skill**, **Add Fact** and so on in English, and **Aggiungi Tappa**, **Aggiungi Competenza** and so on in Italian. To move a row, drag it by the handle on its left. To remove one, use the small menu at the right of its title bar.

Remember that a folded row can be hiding a required field that is empty. If the panel refuses to save and you cannot see what is red, open the folded rows.

### Hero (Apertura)

The top of the front page, blue, with your name across it.

| Field | What it changes | Required |
| --- | --- | --- |
| **Name** | The huge word at the top left. It is also the browser tab title, the name in the copyright line at the foot of every page, the first link in the footer list, and the big name on the picture that appears when someone shares your site in a message. It is not the small black tag at the very top left of the bar, which is fixed in the code | Yes |
| **Positioning line** | The line under your name. It is also the grey sentence a search engine shows under your site, and the sentence on the shared picture. What a recruiter should understand in two seconds | Yes |
| **Portrait** | The photograph at the top right, tilted, with the black record behind it. Leave it empty and the record and the small round badge stay, with a gap where the photograph should be | No |

**On length.** On the page the name sizes itself to the width available, so it never runs off the edge there, but it has a smallest size below which it would wrap onto two lines. On the picture the site shares it is set at one fixed size instead, with no measuring, so a long name runs off that image. Keep it to two words and about fifteen characters. "Anna Milazzo" sits comfortably. "Anna Maria Milazzo" would be too long for a narrow phone, and too long for the shared picture.

### About (Chi sono)

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The giant white word in the black band above the green section | No |
| **Text** | The white card on the green field, the largest block of writing on the front page. The line breaks you type are kept | No |

If you leave both of these empty, the whole green section disappears from the site.

### Skills (Competenze)

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The giant word in the black band above the yellow section | No |
| **Skills** (the list of entries), each with a **Name** | Each entry is a small coloured tag on the yellow field. Every one also appears in the black strip that scrolls sideways underneath. The first ones also become the coloured tags on the picture people see when they share your site | Name: yes |

**On order.** The first entries in the list, in the order you put them, are the ones that reach the shared picture: usually three, because that picture takes as many as fit on one row and then stops. Put your strongest first, and keep those first three under about twenty-two characters each.

If you remove every entry from the list, both the yellow section and the black scrolling strip disappear.

### Works (Brani)

Careful with the two names here. This group on the Landing page is called **Works** in English and **Brani** in Italian, and it holds the words *around* your works. The works themselves are the list called **Songs** in the menu, covered in section 5. "Brani" is the name of this group and of nothing else in the panel, so do not go looking for it in the menu.

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | Four places at once: the giant word in the black band above the orange section, the orange button at the top of the page, one of the small tags in the bar that follows you down every page, and a line in the footer. If you empty it, the button and the tag and the footer line all go | No |
| **Streaming link label** | The word on the white button under a work that opens Spotify. That button appears on every work that has a streaming link. If you empty this field the button is still drawn, with no word on it | No |
| **Play control label** | Read aloud, never shown. It is the name of the play triangle | No |
| **Pause control label** | The same button's name while a track is playing | No |
| **Seek control label** | The name of the coloured bar you drag to move through a track | No |
| **Previous page control** | The name of the left arrow under the works | No |
| **Next page control** | The name of the right arrow under the works | No |

**Those last five never appear on the screen.** They exist so that a visitor who cannot see the page, and navigates with a program that reads it aloud, hears what each control is. Keep them plain and literal ("Play", "Pause"), never clever. Emptying one takes a name away from a control and shows you nothing in return, so there is no reason to touch them.

The works are shown three at a time, with numbered buttons underneath. Four works make a second page, seven make a third. You cannot change how many appear per page.

### Timeline (Percorso)

The purple section: your training and experience, drawn as coloured blocks along a ruler of years. It reads like a CV rather than a diary, newest first: the most recent thing you have done is the block at the top left, and the ruler counts backwards from there.

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The giant word in the black band above the purple section, a tag in the top bar, and a line in the footer | No |
| **Strip label** | Read aloud only. The name of the scrollable strip. Never shown | No |
| **Entries** (Tappe) | A list of rows, one per step. See "How the repeating lists work" above: press **Add Entry** at the bottom of the list to make one. Each entry has the three fields below | |
| **Period** | The small text in the black column on the left. It also decides **where the block sits and how wide it is**. The years inside it are read: "2022-2026" draws a block four times as wide as "2025". This field is shared by both languages | Yes |
| **Label** | The title inside the coloured block | Yes |
| **Detail** | The small line under that title, inside the block | No |

**Four things worth knowing here.**

The Period must contain a four-digit year for the entry to be placed. An entry written "in corso" with no year still appears, and it goes to the very top, in the first lane on the left, in the place of the most recent thing you have done. But if **no** entry anywhere has a year in it, the whole purple section disappears.

Where you put a row in the list does not decide where the block lands on the page: the years you type do that, so you can add a new entry at the bottom of the list and it will still find its own place. The one exception is a tie. When two entries end in the same year, the one higher up the list is drawn above the other. That already happens on your site, where "2022-2026" and "2025" both end in 2026. If two blocks come out the wrong way round, drag one row above the other by the handle on its left.

The Detail is cut off after two lines and the rest is dropped without warning. Two lines hold more or less text depending on how wide the block is, which is to say on how many years that entry covers. For an entry covering a single year, aim at about fifty characters, one short sentence. For an entry covering three or four years you have room for three times that. The Label has room for about forty characters on a single-year entry.

Every entry is drawn on one shared ruler, from your earliest year to your latest. If you add one step dated 1998, the ruler becomes almost thirty years wide and every recent step shrinks to a sliver. Keep the timeline to the years that are relevant.

### Route to contact (Invito al contatto)

The pink block near the bottom of the front page.

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The big line across the pink block | No |
| **Text** | The sentence under it | No |
| **Button label** | Four places: the white button in the pink block, the pink tag at the top right of the bar on every page, the second button at the top of the front page, and the last line of the footer list. If you empty it, the button at the top of the front page, the pink tag and the footer line all go. The white button inside the pink block stays, but with no word on it, only an arrow | No |

### A note on all the black band headings

The headings above About, Skills, Works, Timeline, and the two on the contact page are set as large as their own letters allow. **They can never run off the edge, at any length, in either language.** What changes is how loud they look. Up to about twelve characters is loudest. Up to twenty is still one strong line. Past about twenty-three characters, on a phone, the heading becomes two smaller lines. That is not broken, it is quieter.

One more limit, on the bar that follows the visitor down the page. On a tablet or a computer it holds three tags: the Works heading, the Timeline heading and the contact Button label. Making one of them longer is fine. Making all three longer at the same time is what would wrap that bar onto a second row there. On a phone the first two tags are hidden, so only the contact Button label affects the height of that bar.

---

## 5. Songs: your works

Open **Songs** in the menu. You get a table of all your works with three columns: the title, the Order number and the streaming link. The table is already sorted the way the works appear on the site, top to bottom, so this screen is where you check what order things are in and which numbers are already used.

Click a row to edit that work. Press **Create new** at the top right to add one.

**Do not try to duplicate an existing work as a starting point.** Each work carries a hidden internal handle that has to be different for every work, so the copy is refused when you save it and the message will not explain why. Always start a new one.

| Field | What it changes | Required |
| --- | --- | --- |
| **Title** | The heading beside the cover on the card. Per-language | Yes |
| **Story** | The paragraph under that title. Your line breaks are kept. Per-language, and left empty in English the Italian shows instead | No |
| **Cover image** | The square picture taped into the card. It also decides whether the black record is drawn behind it: no cover, no record. Shared by both languages | Yes |
| **Audio** | The MP3 the play button plays, and the source of the coloured bars under it. Shared | Yes |
| **Duration in seconds** | The second number in the little clock under the bars. See the warning below. Shared | Yes |
| **Streaming link** | Nothing by itself. Its presence is what makes the white streaming button appear under the work. Empty means no button, never a broken one. Shared | No |
| **Order** | Where the work sits in the stack, and therefore which page of three it lands on. **Lowest first: 1 appears above 2.** A new work arrives with 0 already in this box, and 0 is lower than every number your existing works use, so a new work goes to the top of the list on its own. Shared | Yes, and already filled in |
| **Reference** | Hidden from you on purpose. It is an internal handle used by the setup script. Leave it alone | n/a |

**The Duration in seconds is typed by hand.** Nothing measures it for you and nothing checks it against the file. It sets the printed running time, how fast the coloured bar fills, and how far you can drag. Type 24 for a four minute track and the bar fills after twenty-four seconds and then sits full while the music keeps playing, and dragging only reaches the first twenty-four seconds. The sound itself is fine, so nothing looks like an error.

**It is seconds only.** Do not type `3:45`. To get the number, open the track in whatever you play music with, read the length, then multiply the minutes by sixty and add the rest. Three minutes and forty-five seconds is `225`. Four minutes and five seconds is `245`. The smallest number the field accepts is 1, so it refuses a 0.

The little number on each card's paper tab ("01", "02") is added by the page from the work's position. You do not type it.

**On Order numbers.** Give every work its own number: two works with the same number fall in an unpredictable order. Two things make that easy. The numbers do not have to be whole, so to slot a work between the ones numbered 1 and 2, type 1.5. And they do not have to start at 1: numbering your works 10, 20, 30 leaves room to drop something in later without touching anything else. Your five original works are numbered 1 to 5. If you do have to renumber several works, remember there are no drafts, so move the one you care about first and accept that the public page is briefly in an odd order while you work.

**Deleting a work is immediate and permanent.** Its title and story are gone. The cover image and the MP3 are not deleted: they stay behind in Media and Audio.

---

## 6. Contact page

Open **Contact page** in the menu.

### The top of the page

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The big word at the top left, on the blue. Also the browser tab title, and the giant word on the picture the page shares with. Keep it to about thirteen characters, because on that shared picture it is set at a fixed size and a longer word would run off the edge | No |
| **Intro** | The paragraph under it | No |

**If you empty the Heading, the entire blue top of the contact page disappears, including the address card.**

### Form (Modulo)

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | Two things at once: the giant word in the black band above the form, and the name the form has for a visitor who navigates with a program that reads the page aloud | No |
| **Required-fields note** | The small line at the top of the grey form panel | No |
| **Name field** | The small word above the first box | No |
| **Email field** | The small word above the second box | No |
| **Message field** | The small word above the tall box | No |
| **Send button** | The word on the blue button | No |
| **While sending** | Replaces that word for the second or two the message takes to go | No |
| **Anti-bot check note** | Appears under the anti-robot check, only when that check is what stopped the message | No |
| **Missing-field note** | Appears under whichever box was left empty | No |
| **Bad-address note** | Appears under the email box when what was typed is not an address | No |
| **Privacy note** | The small text beside the send button. The form stores nothing, and this is the place to say so | No |

### What to write (Cosa scrivere)

The white card to the left of the form, telling someone what to put in a first message.

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The heading on that card, with the pink line under it. **This heading holds the whole card up: if you empty it, the entire white card goes, taking the intro and every numbered point with it** | No |
| **Intro** | The paragraph under it | No |
| **Points**, each with a **Text** | The numbered rows on that card. This is one of the repeating lists: press **Add Point** at the bottom to add a row. The black numerals are added by the page, you do not type them | Text: yes |

### In practice (In pratica)

The yellow section at the foot of the page: short, checkable facts about working with you.

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The giant word in the black band above the yellow section | No |
| **Facts** | A repeating list, one row per fact. Each row has the two fields below | |
| **Term** | The small word on the paper tab at the top of the little card. **Two or three words at most**, about twenty characters. Longer does not cut off, it wraps the tab onto two lines and the card looks wrong | Yes |
| **Value** | The sentence inside that card. No length limit | Yes |

Keep dates out of these. A fact that goes out of date is worse than no fact.

### By email (Per email)

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The heading on the small taped card at the top right of the page, above your address. **If you empty it, that whole card disappears, even with an address set** | No |
| **Note** | The paragraph on that card, between the heading and the orange address | No |
| **Elsewhere heading** | The heading above the column of white profile buttons on the right of the last section. **If you empty it, that whole column of buttons disappears from the contact page**, even with links set in Settings. The small footer links are not affected: the footer has its own separate version of this word, in Settings | No |

**The address itself is not here.** It lives in Settings. See section 7.

### Outcome messages (Messaggi di esito)

The line that appears at the top of the form panel after someone presses send.

| Field | What it changes | Required |
| --- | --- | --- |
| **Sent** | The line with a tick, when the message went | No |
| **Not sent** | The line with a cross, when it did not. **Your email address from Settings is added at the end of this sentence as a link**, so write it so that something naturally follows, for example "Write to me directly at" | No |
| **Missing or wrong fields** | The line with a cross when a box was empty or wrong | No |

---

## 7. Settings

Open **Settings** in the menu. This is small and it reaches every page.

| Field | What it changes | Required |
| --- | --- | --- |
| **Public contact address** | Four places, on its own: the orange address on the taped card at the top right of the contact page, the white address in the footer of every page, the end of the "not sent" message in the form, and the picture the contact page shares with. There is a fifth place it does **not** reach, described just below. Shared by both languages. **If you empty it, the taped card and the footer address both disappear.** It must be a real address, so `anna@gmail` is refused. A long professional address is safe, the layout was built for it | No |
| **Elsewhere** (the list of links) | A repeating list. Each row has the two fields below | |
| **Label** | The word on the big white buttons on the contact page, and on the small underlined links in the footer. Per-language | Yes |
| **URL** | Where that link goes. It opens in a new tab. Shared by both languages | Yes |
| **Footer nav heading** | The small grey word over the list of pages in the footer. If you empty it the list stays with no heading | No |
| **Footer links heading** | The same, over the profile links in the footer | No |
| **Legals link label** | The underlined link at the bottom left of the footer. If you empty it the link is still there, with nothing to read and nothing to see | No |

### If your email address changes, there are two places to fix

Changing **Public contact address** updates four places on its own. The fifth is in the **Elsewhere** list further down this same page.

One of those links is not a profile. It is your email address written as a link, and it starts with `mailto:` instead of `https://`. Open that row and change the address after `mailto:` as well, or the big white "Write to me" button on your contact page, and the matching link in the footer, keep opening a mail to your old address. Nothing on the screen will tell you.

### How to write a URL

**A link to a website must be the whole address, starting with `https://`.** Type `instagram.com/anna` and it becomes a link inside your own website and gives a "page not found". Copy the address out of your browser's address bar and paste the whole thing.

**There is one exception, and it is already in your list.** The link that opens an email starts with `mailto:` followed by your address, with no `https://` and no slashes. That one is correct as it is. Change the address inside it when your address changes, but do not turn it into an `https://` link.

### One important thing this page does not do

The Public contact address is the address people *see*. It is not where the contact form delivers its messages. That delivery address is set up by your developer, outside the panel. If you change your email address, tell him, or the form will keep sending to the old one.

---

## 8. Legals page

| Field | What it changes | Required |
| --- | --- | --- |
| **Heading** | The title at the top of the legal page, and the browser tab title there | No |
| **Body** | The whole notice below it | No |

This is the one field on the whole site with a proper text editor, so bold and lists and links work here.

**One trap.** Everywhere else on the site, an empty English field falls back to the Italian. The Body of the legal page does not: if you delete the English text, the English legal page shows its heading and nothing else. If you do not want to translate it, leave the English Body untouched rather than emptying it.

---

## 9. Media and Audio

These two lists hold your files. Nothing here appears on the site until a work or the Landing page points at it, so uploading a file is safe and changes nothing on its own.

### Media: images

**Accepted formats: JPEG, PNG, WebP and AVIF.** Nothing else. A photo taken on a recent iPhone is usually in a format the panel refuses. On the phone, open Settings, then Camera, then Formats, and choose "Most Compatible": from then on your photos are JPEG. Or export the photo as JPEG before you upload it.

Every image needs **Alternative text**, and it is required and per-language. It never appears on the page. It is what a visitor who cannot see the picture hears in its place, what appears if the picture fails to load, and the name the image is listed under in Media, which is how you find it again when you come to choose it. So write what the picture shows, in a few words.

Upload an image while the content switcher is on English and the alternative text is stored in English only, and the Italian site has none. Upload in Italian.

**The site does not resize anything.** The exact file you upload is the file every visitor downloads, so the weight is yours to control.

**Song covers.** Square, and this is not only about looks: the black record behind the sleeve is positioned from the cover's width, so it sits correctly only on a square image. About 1000 to 1200 pixels each way. JPEG or WebP, under 250 KB. Use PNG only for flat graphic artwork with few colours.

**The portrait.** About 1200 pixels wide, upright, and **no taller than three parts of height for every four parts of width**. A normal upright phone photograph is exactly that shape and fits. Anything taller, a narrow crop for instance, hangs out of its box and collides with the graphic below it. Keep it under 300 KB: it is the first thing a recruiter waits for.

**Crop your image before you upload it.** The panel has a crop tool of its own, and it is not a preview: cropping there replaces the stored picture everywhere that picture is used, and the old framing is gone for good. There is no focal point tool on this site.

### Audio: your MP3s

**MP3 and nothing else.** A WAV or an AIFF is refused. Export as MP3 first.

There is nothing to fill in on an audio file. When you upload one, the site listens to the whole file, measures its waveform and its tone, and stores them. That is why the little coloured bars under each work look like that particular piece of music. Those measurements are hidden from you and you never touch them.

Because it reads the whole file, **a long track takes a noticeable while to save. Wait. Do not press Save a second time.**

Any file over 50 MB is refused with a message. No music of yours should come near that.

### Deleting files

Deleting a file that a work still uses is refused, and the panel shows an ugly technical error rather than a helpful one. That refusal is protecting you.

**It does not protect the portrait.** Deleting the portrait image works, with no warning at all, and the photograph is gone from the front page until you upload it again and choose it again in the Portrait field.

The order for deleting a work's file is: point the work at a different file, or delete the work, and only then delete the file.

Replacing the file on an existing Media entry changes it everywhere that entry is used at once, not only in the place you were looking at.

---

## 10. Adding a new work, step by step

Do it in this order and nothing can go wrong.

**Before you start**, have two files ready on your computer: a square cover image around 1200 by 1200 pixels as a JPEG, and the track as an MP3. Work out the length of the track in seconds. Two minutes forty is 160.

1. **Check the content language switcher says Italian.** This is the step people skip.
2. Go to **Media** in the menu. You will see a list of the images already on the site. Press **Create new** at the top right, choose your cover file, and fill in **Alternative text**: a few words describing the picture. Save.
3. Go to **Audio** and press **Create new**, then choose the MP3. There is nothing to fill in. Save, and wait: the site is measuring the file. Do not press Save twice.
4. Go to **Songs** and press **Create new**. Do not duplicate an existing work.
5. Fill in **Title**.
6. Fill in **Story** if you want one. It is optional, and you can add it later.
7. Choose the **Cover image**. A panel slides open listing your images by the Alternative text you wrote for each one, so look for the words you typed in step 2.
8. Choose the **Audio** from step 3. It is listed by its file name.
9. Type **Duration in seconds**. Seconds only, no colon.
10. Add a **Streaming link** if the piece is on Spotify or elsewhere. Paste the whole address starting `https://`. Leave it empty and no button appears.
11. **Order.** The box arrives with 0 already in it, and 0 is lower than every number your existing works use, so if you do nothing here the new work goes to the top of the front page. If you want it somewhere else, look at the Order column in the Songs table to see which numbers are taken, and pick a free one. Lowest appears first, and a number like 1.5 is allowed.
12. Press **Save**. The work is on the live site now.
13. Open anna-milazzo.com in another tab, reload it, and play the track. Watch the little clock: if the second number does not match the real length, go back and correct the Duration.
14. Optional: switch the content language to **English**, open the same work, and type the English Title and Story. If you do not, the English site shows the Italian, and that is fine.

---

## 11. What never to touch

**Users.** These are the login accounts, not content. Delete your own and you are locked out of the panel, with no password reset email to rescue you.

**The Reference field on a work.** It is hidden from you on purpose. It is how the setup script recognises a work. Changing it makes the script build a duplicate instead of updating.

**The Duplicate action on a work.** The hidden Reference has to be different for every work, so a duplicate refuses to save and the error will not tell you why.

**The multi-select delete in a list.** Ticking several items and deleting them all with one confirmation is the fastest way to lose several things at once.

**The file inside an existing Media entry, and the panel's crop tool.** Both change every place that entry is used, and neither can be undone.

**The six screen-reader labels on the Landing page:** Previous page control, Next page control, Seek control label, Play control label, Pause control label, and Strip label under Timeline. They never appear on screen. Emptying one takes a name away from a control that visitors who cannot see the page rely on, and shows you nothing.

**The setup script.** Your developer has a command that fills the site with the starter text. It was how the site was first built. **Once you have written your own words, that script must never be run again.** It puts the placeholder text back over the whole landing page, the whole contact page, the legal notice and Settings, in both languages, including your email address. It also puts the five starter works back to how they were, removes any streaming link you added to one of them, and replaces the portrait choice. Anything you added beyond what it knows about, an extra skill, an extra timeline step, an extra fact, is dropped. Works you created yourself and files you uploaded yourself are safe. If anyone ever proposes running "the seed" or "the reset", say that you have real content now and ask what it will overwrite.

---

## 12. If something goes wrong

| What you see | Why | What to do |
| --- | --- | --- |
| You saved, but the site looks the same | The page in your other tab is the old one | Reload that page. If it still looks old, hold Shift and reload |
| The panel refuses to save, a field is red | A required field is empty **in the language you are currently editing**. Nothing at all was saved, including the changes on the same screen that were fine | Fill the red field and save again. If you cannot see the red one, open the folded groups and list rows, it is hiding in one |
| "Locked by another user" | It is almost certainly your own other browser tab, still holding that page open | Close the other tab and wait five minutes: that is how long the lock lasts. The panel also offers to take the lock over, but do that only from the tab holding the words you want to keep, or the older values can be written back |
| A technical database error when deleting an image or an MP3 | A work is still using that file | Point the work at another file, or delete the work, then delete the file |
| The portrait vanished from the front page and nothing warned you | The portrait image was deleted from Media. That deletion is not blocked | Upload the photograph again and choose it again in the Portrait field on the Landing page |
| The English page shows Italian text | Normal, on a field you have never filled in English. The Italian is standing in | Nothing to fix, unless you want to translate it |
| You corrected a typo in Italian and the English page still shows it | Your site was set up with English text in every field, so that field is not empty and the fallback does not apply | Switch to English and correct the same field there |
| On the Italian site a work has no title, or a skill is an empty coloured tag | It was created while the switcher was on English. Nothing is missing, only the Italian words | Switch to Italian, open the item, fill it in |
| A whole coloured section has disappeared | Its fields were emptied. Green goes when both About fields are empty. Yellow goes when the skills list is empty. Orange goes when there are no works. Purple goes when no timeline entry has a year in it | Put text back in one of those fields |
| The top of the contact page is gone | The contact page Heading was emptied | Type the heading back |
| The address card on the contact page is gone | Either the Public contact address in Settings or the By email Heading is empty | Fill whichever is empty |
| The white card of numbered points is gone from the contact page | The What to write Heading was emptied, and it holds up the whole card | Type the heading back |
| The column of white profile buttons is gone from the contact page | The Elsewhere heading on the contact page was emptied | Type it back. The links themselves are fine, they are in Settings |
| The word vanished from a button but the button is still there | Some labels empty rather than disappear: the Route to contact Button label, the Streaming link label, the Legals link label | Type the word back |
| A timeline entry landed at the top instead of where you expected | Its Period has no four-digit year in it, so it is treated as the most recent thing you have done | Put a year in the Period, or leave it if that is where you want it |
| Two timeline blocks came out the wrong way round | They end in the same year, so the row order in the panel decides | Drag one row above the other by the handle on its left |
| The playing bar fills too soon, or dragging stops early | The Duration in seconds is wrong | Correct it. Seconds only, so 3:45 is 225 |
| The Duration field refuses what you typed | The smallest number it accepts is 1 | Type the real length in seconds |
| A new work went to the top of the page on its own | Its Order is 0, which is what a new work arrives with, and 0 is lower than every other number | Give it a free number from the Order column in the Songs table |
| An upload was refused | Wrong format, or over 50 MB. Images: JPEG, PNG, WebP, AVIF. Audio: MP3 only | Export in the right format and try again. Nothing was half-saved |
| An upload seems stuck | A long MP3 is being measured | Wait. Do not press Save again |
| A copy of a work refuses to save | Each work carries a hidden handle that has to be different for every work | Create a new work instead of duplicating one |
| A link goes to a "page not found" on your own site | The URL was typed without `https://` | Paste the whole address from the browser bar |
| Bold, bullets and links vanished when you pasted from Word | Only the legal page keeps formatting. Everywhere else, formatting is dropped without a word. Line breaks survive in two fields only, the About Text and a work's Story. In every other box a line break you type is shown as a space | Paste as plain text, and do not worry about it |
| The English legal page shows only its heading | The English Body was emptied, and that one field does not fall back to the Italian | Paste the text back in |
| Nobody receives the messages from the contact form | The delivery address is configured by your developer, not by the Public contact address in Settings | Ask him to change the delivery address |
| The "Write to me" button still opens a mail to your old address | That link is a separate row in the Elsewhere list in Settings, starting with `mailto:`. It does not follow the Public contact address | Open that row and change the address after `mailto:` |
| The preview picture on WhatsApp or LinkedIn is out of date | That picture is built when the site is put online, not when you save. Your change is on the site, but not yet on the picture | Ask Cinquin Andy to rebuild the site. After that, the sharing services may still hold their own copy for a while |
| You deleted a work by accident | It is gone, and there is no undo. The title and story cannot be recovered | Its cover and MP3 are still in Media and Audio, so rebuild the work from those |

### If none of that helps

Your developer is **Cinquin Andy**, at **andy-cinquin.com**, credited at the foot of every page. Tell him what you were doing, what you pressed, and what you saw. A screenshot of the whole screen, panel and all, is worth several paragraphs.