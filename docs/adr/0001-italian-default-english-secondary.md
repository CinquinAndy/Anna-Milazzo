# Italian is the default locale, English is secondary, French is not supported

The Portfolio serves an Italian musician looking for work, so Italian carries the
primary audience and English carries the international one. Italian is served
unprefixed at `/`, English at `/en`.

French was in the opening brief and has been explicitly dropped: the developer is
French, but no reader of this Portfolio is. Recording this because the absence of
French is surprising given who built it, and because the URL shape, an unprefixed
default locale rather than the `/it` + `/en` pair that Next.js documents, is
expensive to reverse once the site is indexed.
