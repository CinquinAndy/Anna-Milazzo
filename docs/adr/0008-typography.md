# Bricolage Grotesque for display, Instrument Sans for body

Headings are set in Bricolage Grotesque, body in Instrument Sans, labels in Azeret Mono.
All three are loaded with the `latin-ext` subset and Bricolage with its `opsz` and `wdth`
axes exposed.

Recorded because the choice is driven by Italian, not by taste, and someone will
otherwise swap it for something they like better. Short strings — which is nearly all of
a brutalist portfolio, set very large — expand 200-300% from English to Italian per the
IBM expansion table. A variable width axis is the only typographic lever that absorbs
that at the same optical size; DM Sans, the theme's original choice, has no width axis,
so the same text can only be paid for by shrinking the headline. DM Sans is also what
neobrutalism.dev ships as its default, which makes it the genre's house font rather than
a differentiator.

Consequence: headings floor at `line-height: 0.9`. Italian all-caps carries diacritics
above the cap height, and the 0.82 this style invites will clip `È À Ù`.
