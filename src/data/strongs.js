// A bundled Strong's-style concordance slice.
//
// Full Strong's data is ~14k entries and several megabytes; this app ships an
// offline, curated lexicon of the words students most often click on during a
// manuscript study. Lookup is by English headword, so an entry lists every
// original-language term commonly rendered by that word — which is exactly the
// observation an inductive reader wants ("this one English word covers three
// different Greek words").
//
// To swap in the complete dataset, replace LEXICON with a map of the same
// shape built from any Strong's JSON distribution; nothing else changes.

const e = (strongs, lemma, translit, lang, pos, gloss, note) => ({
  strongs,
  lemma,
  translit,
  lang,
  pos,
  gloss,
  note,
})

export const LEXICON = {
  love: [
    e('G26', 'ἀγάπη', 'agapē', 'Greek', 'noun', 'love; self-giving affection', 'The love God has toward his Son and his people; chosen, not merely felt.'),
    e('G25', 'ἀγαπάω', 'agapaō', 'Greek', 'verb', 'to love, to welcome, to be fond of', 'The verb behind "God so loved the world" (John 3:16).'),
    e('G5368', 'φιλέω', 'phileō', 'Greek', 'verb', 'to love as a friend, to kiss', 'Affectionate, companionable love — contrasted with agapaō in John 21:15-17.'),
    e('H160', 'אַהֲבָה', 'ahavah', 'Hebrew', 'noun', 'love', 'Covenant and family love; used of Israel as bride in Jeremiah 2:2.'),
    e('H2617', 'חֶסֶד', 'chesed', 'Hebrew', 'noun', 'steadfast love, loyal kindness', 'Covenant loyalty; often "lovingkindness" or "mercy" in older versions.'),
  ],
  grace: [
    e('G5485', 'χάρις', 'charis', 'Greek', 'noun', 'grace, favor, kindness', 'Undeserved favor; also the gratitude that answers it ("thanks be to God").'),
    e('H2580', 'חֵן', 'chen', 'Hebrew', 'noun', 'favor, grace, charm', '"Noah found favor (chen) in the eyes of the LORD" — Genesis 6:8.'),
  ],
  faith: [
    e('G4102', 'πίστις', 'pistis', 'Greek', 'noun', 'faith, faithfulness, trust', 'Both the act of trusting and the trustworthiness being trusted.'),
    e('H530', 'אֱמוּנָה', 'emunah', 'Hebrew', 'noun', 'firmness, fidelity, steadiness', 'Root idea of being firmly supported; Habakkuk 2:4.'),
  ],
  believe: [
    e('G4100', 'πιστεύω', 'pisteuō', 'Greek', 'verb', 'to trust, to entrust oneself to', 'John uses this verb ~98 times; the noun "faith" never appears in his Gospel.'),
    e('H539', 'אָמַן', 'aman', 'Hebrew', 'verb', 'to confirm, to support, to trust', 'Source of "amen"; Abraham "believed" the LORD in Genesis 15:6.'),
  ],
  hope: [
    e('G1680', 'ἐλπίς', 'elpis', 'Greek', 'noun', 'hope, expectation', 'Confident expectation of a promised good, not wishful thinking.'),
    e('H8615', 'תִּקְוָה', 'tiqvah', 'Hebrew', 'noun', 'hope; literally a cord', 'The same word as Rahab’s scarlet cord — hope as a lifeline.'),
  ],
  peace: [
    e('G1515', 'εἰρήνη', 'eirēnē', 'Greek', 'noun', 'peace, harmony, wholeness', 'In the NT it carries the full weight of Hebrew shalom.'),
    e('H7965', 'שָׁלוֹם', 'shalom', 'Hebrew', 'noun', 'peace, completeness, welfare', 'Not merely absence of conflict but flourishing wholeness.'),
  ],
  joy: [
    e('G5479', 'χαρά', 'chara', 'Greek', 'noun', 'joy, gladness', 'Shares a root with charis (grace) — joy is grace-shaped.'),
    e('H8057', 'שִׂמְחָה', 'simchah', 'Hebrew', 'noun', 'gladness, mirth, festal joy', 'Often communal and celebratory, tied to feasts.'),
  ],
  word: [
    e('G3056', 'λόγος', 'logos', 'Greek', 'noun', 'word, message, account, reason', 'A whole utterance or rationale; John 1:1 applies it to Christ.'),
    e('G4487', 'ῥῆμα', 'rhēma', 'Greek', 'noun', 'spoken word, saying', 'The particular thing said, as opposed to logos as message.'),
    e('H1697', 'דָּבָר', 'davar', 'Hebrew', 'noun', 'word, matter, thing', 'Hebrew makes no split between a word and the deed it accomplishes.'),
  ],
  god: [
    e('G2316', 'θεός', 'theos', 'Greek', 'noun', 'God, a god', 'With the article, the God of Israel; John 1:1c uses it without.'),
    e('H430', 'אֱלֹהִים', 'elohim', 'Hebrew', 'noun', 'God, gods', 'Plural in form, singular in sense when used of the LORD.'),
    e('H410', 'אֵל', 'el', 'Hebrew', 'noun', 'God, mighty one', 'The short form appearing in names like Isra-el and Immanu-el.'),
  ],
  lord: [
    e('G2962', 'κύριος', 'kyrios', 'Greek', 'noun', 'lord, master, owner', 'The Septuagint’s stand-in for YHWH; a confession of deity in the NT.'),
    e('H3068', 'יְהוָה', 'YHWH', 'Hebrew', 'name', 'the LORD, the covenant name of God', 'Printed as LORD in small capitals in most English versions.'),
    e('H136', 'אֲדֹנָי', 'Adonai', 'Hebrew', 'noun', 'Lord, master', 'Spoken in place of the divine name in Jewish reading tradition.'),
  ],
  spirit: [
    e('G4151', 'πνεῦμα', 'pneuma', 'Greek', 'noun', 'spirit, wind, breath', 'John 3:8 plays on all three senses at once.'),
    e('H7307', 'רוּחַ', 'ruach', 'Hebrew', 'noun', 'spirit, wind, breath', 'Hovering over the waters in Genesis 1:2.'),
  ],
  holy: [
    e('G40', 'ἅγιος', 'hagios', 'Greek', 'adj', 'holy, set apart, sacred', 'The plural is the NT word for "saints".'),
    e('H6918', 'קָדוֹשׁ', 'qadosh', 'Hebrew', 'adj', 'holy, set apart', 'Trebled for emphasis in Isaiah 6:3.'),
  ],
  sin: [
    e('G266', 'ἁμαρτία', 'hamartia', 'Greek', 'noun', 'sin, missing the mark', 'In Paul often a personified power, not just an act.'),
    e('G3900', 'παράπτωμα', 'paraptōma', 'Greek', 'noun', 'trespass, false step', 'A stumbling aside from the right path.'),
    e('H2403', 'חַטָּאת', 'chattath', 'Hebrew', 'noun', 'sin, sin offering', 'The same word names both the offense and its remedy.'),
  ],
  righteousness: [
    e('G1343', 'δικαιοσύνη', 'dikaiosynē', 'Greek', 'noun', 'righteousness, justice', 'Same root as "justify" — a legal standing granted, not earned.'),
    e('H6666', 'צְדָקָה', 'tsedaqah', 'Hebrew', 'noun', 'righteousness, right relation', 'Covenant faithfulness worked out in just dealing.'),
  ],
  righteous: [
    e('G1342', 'δίκαιος', 'dikaios', 'Greek', 'adj', 'righteous, just, upright', 'Used of God, of Christ, and of those declared right with God.'),
    e('H6662', 'צַדִּיק', 'tsaddiq', 'Hebrew', 'adj', 'just, righteous', 'The counterpart of the "wicked" (rasha) in wisdom literature.'),
  ],
  justify: [
    e('G1344', 'δικαιόω', 'dikaioō', 'Greek', 'verb', 'to declare righteous, to acquit', 'A courtroom verdict, not a moral improvement project.'),
  ],
  law: [
    e('G3551', 'νόμος', 'nomos', 'Greek', 'noun', 'law, custom, principle', 'Can mean the Mosaic law, the Pentateuch, or a governing principle.'),
    e('H8451', 'תּוֹרָה', 'torah', 'Hebrew', 'noun', 'instruction, law, teaching', 'Fundamentally teaching from a father or from God, not mere legislation.'),
  ],
  covenant: [
    e('G1242', 'διαθήκη', 'diathēkē', 'Greek', 'noun', 'covenant, testament, will', 'Hebrews 9 exploits the double sense of covenant and last will.'),
    e('H1285', 'בְּרִית', 'berith', 'Hebrew', 'noun', 'covenant, treaty', 'Covenants are "cut" (karath), recalling the divided animals of Genesis 15.'),
  ],
  glory: [
    e('G1391', 'δόξα', 'doxa', 'Greek', 'noun', 'glory, splendor, honor', 'From dokeō, "to seem" — the weight of how one truly appears.'),
    e('H3519', 'כָּבוֹד', 'kavod', 'Hebrew', 'noun', 'glory, weight, honor', 'Root sense is heaviness; glory is substance and gravity.'),
  ],
  mercy: [
    e('G1656', 'ἔλεος', 'eleos', 'Greek', 'noun', 'mercy, compassion', 'The Septuagint often renders chesed with this word.'),
    e('G3628', 'οἰκτιρμός', 'oiktirmos', 'Greek', 'noun', 'compassion, pity', '"The Father of mercies" — 2 Corinthians 1:3.'),
    e('H7356', 'רַחֲמִים', 'rachamim', 'Hebrew', 'noun', 'compassion, tender mercy', 'Related to rechem, "womb" — a mother’s visceral compassion.'),
  ],
  truth: [
    e('G225', 'ἀλήθεια', 'alētheia', 'Greek', 'noun', 'truth, reality, what is unhidden', 'Literally "un-forgetting" — reality brought into the open.'),
    e('H571', 'אֱמֶת', 'emet', 'Hebrew', 'noun', 'truth, firmness, faithfulness', 'Shares the root of emunah — truth as reliability.'),
  ],
  life: [
    e('G2222', 'ζωή', 'zōē', 'Greek', 'noun', 'life, vitality', 'Life as such; John’s word for eternal life.'),
    e('G5590', 'ψυχή', 'psychē', 'Greek', 'noun', 'soul, life, self', 'The living person; sometimes "life" that can be lost or saved.'),
    e('H2416', 'חַי', 'chay', 'Hebrew', 'adj/noun', 'living, alive, life', 'Plural chayyim, "lives", as in "the tree of life".'),
  ],
  eternal: [
    e('G166', 'αἰώνιος', 'aiōnios', 'Greek', 'adj', 'eternal, age-lasting', 'From aiōn, "age" — belonging to the age to come.'),
    e('H5769', 'עוֹלָם', 'olam', 'Hebrew', 'noun', 'long duration, everlasting', 'Time stretching past the horizon of sight.'),
  ],
  world: [
    e('G2889', 'κόσμος', 'kosmos', 'Greek', 'noun', 'world, ordered system, adornment', 'In John, usually humanity in rebellion — still loved by God.'),
    e('G165', 'αἰών', 'aiōn', 'Greek', 'noun', 'age, era, world', '"This present age" as opposed to the age to come.'),
  ],
  flesh: [
    e('G4561', 'σάρξ', 'sarx', 'Greek', 'noun', 'flesh, body, human nature', 'Neutral in John 1:14, morally loaded in Romans 8.'),
    e('H1320', 'בָּשָׂר', 'basar', 'Hebrew', 'noun', 'flesh, body, kin', '"One flesh" in Genesis 2:24 means one kinship.'),
  ],
  heart: [
    e('G2588', 'καρδία', 'kardia', 'Greek', 'noun', 'heart, inner self', 'The seat of thought and will, not merely emotion.'),
    e('H3820', 'לֵב', 'lev', 'Hebrew', 'noun', 'heart, mind, will', 'The Hebrew "heart" thinks and decides.'),
  ],
  soul: [
    e('G5590', 'ψυχή', 'psychē', 'Greek', 'noun', 'soul, life, person', 'Often simply "life" or "self".'),
    e('H5315', 'נֶפֶשׁ', 'nephesh', 'Hebrew', 'noun', 'soul, living being, appetite', 'A whole living creature, not a part of one.'),
  ],
  mind: [
    e('G3563', 'νοῦς', 'nous', 'Greek', 'noun', 'mind, understanding', 'The faculty renewed in Romans 12:2.'),
    e('G1271', 'διάνοια', 'dianoia', 'Greek', 'noun', 'understanding, disposition', 'Deep thought; "love the Lord with all your mind".'),
  ],
  power: [
    e('G1411', 'δύναμις', 'dynamis', 'Greek', 'noun', 'power, ability, miracle', 'Also the standard NT word for a miracle.'),
    e('G1849', 'ἐξουσία', 'exousia', 'Greek', 'noun', 'authority, right, jurisdiction', 'Delegated right to act, distinct from raw force.'),
    e('H3581', 'כֹּחַ', 'koach', 'Hebrew', 'noun', 'strength, power', 'Physical and creative capacity.'),
  ],
  authority: [
    e('G1849', 'ἐξουσία', 'exousia', 'Greek', 'noun', 'authority, right', 'What the crowds noticed in Jesus’ teaching (Mark 1:22).'),
  ],
  king: [
    e('G935', 'βασιλεύς', 'basileus', 'Greek', 'noun', 'king, sovereign', 'Root of basileia, "kingdom".'),
    e('H4428', 'מֶלֶךְ', 'melek', 'Hebrew', 'noun', 'king', 'Same root as Molech and Malchiah.'),
  ],
  kingdom: [
    e('G932', 'βασιλεία', 'basileia', 'Greek', 'noun', 'kingdom, reign, rule', 'More often the activity of reigning than a territory.'),
  ],
  christ: [
    e('G5547', 'Χριστός', 'Christos', 'Greek', 'name/noun', 'Anointed One, Messiah', 'A title before it became a name.'),
    e('H4899', 'מָשִׁיחַ', 'mashiach', 'Hebrew', 'noun', 'anointed one', 'Used of kings, priests, and the coming deliverer.'),
  ],
  jesus: [
    e('G2424', 'Ἰησοῦς', 'Iēsous', 'Greek', 'name', 'Jesus, Joshua', 'Greek form of Yeshua, "the LORD saves" — Matthew 1:21.'),
  ],
  son: [
    e('G5207', 'υἱός', 'huios', 'Greek', 'noun', 'son, descendant', 'Also idiomatic: "sons of light", "son of peace".'),
    e('H1121', 'בֵּן', 'ben', 'Hebrew', 'noun', 'son, child', 'Very broad — grandson, member of a class, one characterized by.'),
  ],
  father: [
    e('G3962', 'πατήρ', 'patēr', 'Greek', 'noun', 'father', 'Jesus’ characteristic address to God.'),
    e('G5', 'ἀββά', 'abba', 'Aramaic', 'noun', 'father (intimate address)', 'Retained untranslated in Mark 14:36 and Romans 8:15.'),
    e('H1', 'אָב', 'av', 'Hebrew', 'noun', 'father, ancestor', 'First word in the Hebrew lexicon.'),
  ],
  light: [
    e('G5457', 'φῶς', 'phōs', 'Greek', 'noun', 'light', 'A controlling image in John 1, 8, and 12.'),
    e('H216', 'אוֹר', 'or', 'Hebrew', 'noun', 'light', 'God’s first spoken creation.'),
  ],
  darkness: [
    e('G4653', 'σκοτία', 'skotia', 'Greek', 'noun', 'darkness', 'John’s counterpart to light: moral as well as physical.'),
    e('H2822', 'חֹשֶׁךְ', 'choshek', 'Hebrew', 'noun', 'darkness, obscurity', 'Over the face of the deep in Genesis 1:2.'),
  ],
  save: [
    e('G4982', 'σῴζω', 'sōzō', 'Greek', 'verb', 'to save, rescue, heal', 'Used of physical healing as well as eternal rescue.'),
    e('H3467', 'יָשַׁע', 'yasha', 'Hebrew', 'verb', 'to save, deliver, give victory', 'The root behind Joshua, Isaiah, and Hosea.'),
  ],
  salvation: [
    e('G4991', 'σωτηρία', 'sōtēria', 'Greek', 'noun', 'salvation, deliverance', 'Rescue with a future dimension in Paul.'),
    e('H3444', 'יְשׁוּעָה', 'yeshuah', 'Hebrew', 'noun', 'salvation, deliverance', 'The name Jesus is built on this root.'),
  ],
  redeem: [
    e('G629', 'ἀπολύτρωσις', 'apolytrōsis', 'Greek', 'noun', 'redemption, release by ransom', 'Manumission language from the slave market.'),
    e('H1350', 'גָּאַל', 'gaal', 'Hebrew', 'verb', 'to redeem as kinsman', 'The duty Boaz performs for Ruth.'),
  ],
  forgive: [
    e('G863', 'ἀφίημι', 'aphiēmi', 'Greek', 'verb', 'to send away, release, forgive', 'Also "leave" — the nets left behind in Mark 1:18.'),
    e('H5545', 'סָלַח', 'salach', 'Hebrew', 'verb', 'to forgive, pardon', 'In the OT, only ever God as the subject.'),
  ],
  repent: [
    e('G3340', 'μετανοέω', 'metanoeō', 'Greek', 'verb', 'to change one’s mind, repent', 'A reorientation of thought that redirects life.'),
    e('H7725', 'שׁוּב', 'shuv', 'Hebrew', 'verb', 'to turn, return', 'The prophets’ call: turn around and come back.'),
  ],
  pray: [
    e('G4336', 'προσεύχομαι', 'proseuchomai', 'Greek', 'verb', 'to pray', 'The general word for prayer directed to God.'),
    e('H6419', 'פָּלַל', 'palal', 'Hebrew', 'verb', 'to intercede, pray', 'Carries the sense of mediating or arbitrating.'),
  ],
  bless: [
    e('G2127', 'εὐλογέω', 'eulogeō', 'Greek', 'verb', 'to speak well of, bless', 'Source of "eulogy".'),
    e('G3107', 'μακάριος', 'makarios', 'Greek', 'adj', 'blessed, happy, fortunate', 'The Beatitudes word — a state, not a wish.'),
    e('H1288', 'בָּרַךְ', 'barak', 'Hebrew', 'verb', 'to kneel, to bless', 'Related to berek, "knee".'),
  ],
  glorify: [
    e('G1392', 'δοξάζω', 'doxazō', 'Greek', 'verb', 'to glorify, honor', 'In John, the cross is the hour of glorification.'),
  ],
  know: [
    e('G1097', 'γινώσκω', 'ginōskō', 'Greek', 'verb', 'to know by experience', 'Relational knowledge acquired over time.'),
    e('G1492', 'οἶδα', 'oida', 'Greek', 'verb', 'to know, perceive', 'Settled knowledge; perfect in form, present in sense.'),
    e('H3045', 'יָדַע', 'yada', 'Hebrew', 'verb', 'to know intimately', 'Covers experiential, covenantal, and marital knowing.'),
  ],
  hear: [
    e('G191', 'ἀκούω', 'akouō', 'Greek', 'verb', 'to hear, listen, obey', 'Root of "acoustic"; hearing implies heeding.'),
    e('H8085', 'שָׁמַע', 'shama', 'Hebrew', 'verb', 'to hear, obey', 'The first word of the Shema, Deuteronomy 6:4.'),
  ],
  see: [
    e('G3708', 'ὁράω', 'horaō', 'Greek', 'verb', 'to see, perceive', 'Often of spiritual perception in John.'),
    e('H7200', 'רָאָה', 'raah', 'Hebrew', 'verb', 'to see, look at, consider', 'Behind the name Jehovah-Jireh, "the LORD sees/provides".'),
  ],
  walk: [
    e('G4043', 'περιπατέω', 'peripateō', 'Greek', 'verb', 'to walk around, conduct oneself', 'A standard metaphor for the pattern of a life.'),
    e('H1980', 'הָלַךְ', 'halak', 'Hebrew', 'verb', 'to go, walk', 'Root of halakhah, the way one walks out the law.'),
  ],
  send: [
    e('G649', 'ἀποστέλλω', 'apostellō', 'Greek', 'verb', 'to send out with a commission', 'Root of "apostle" — a sent one with authority.'),
    e('H7971', 'שָׁלַח', 'shalach', 'Hebrew', 'verb', 'to send, stretch out', '"Whom shall I send?" — Isaiah 6:8.'),
  ],
  give: [
    e('G1325', 'δίδωμι', 'didōmi', 'Greek', 'verb', 'to give, grant', 'One of the most common NT verbs.'),
    e('H5414', 'נָתַן', 'nathan', 'Hebrew', 'verb', 'to give, put, set', 'Behind names like Nathan and Jonathan.'),
  ],
  come: [
    e('G2064', 'ἔρχομαι', 'erchomai', 'Greek', 'verb', 'to come, go', 'The "coming one" of messianic expectation.'),
    e('H935', 'בּוֹא', 'bo', 'Hebrew', 'verb', 'to come, go in, enter', 'Also used of the sun setting.'),
  ],
  abide: [
    e('G3306', 'μένω', 'menō', 'Greek', 'verb', 'to remain, stay, abide', 'John 15 uses it ten times in eleven verses.'),
  ],
  fear: [
    e('G5401', 'φόβος', 'phobos', 'Greek', 'noun', 'fear, reverence, terror', 'Root of "phobia"; can be dread or awe.'),
    e('H3374', 'יִרְאָה', 'yirah', 'Hebrew', 'noun', 'fear, reverence', '"The fear of the LORD is the beginning of wisdom."'),
  ],
  wisdom: [
    e('G4678', 'σοφία', 'sophia', 'Greek', 'noun', 'wisdom, skill', 'Contrasted with the world’s wisdom in 1 Corinthians 1.'),
    e('H2451', 'חָכְמָה', 'chokmah', 'Hebrew', 'noun', 'wisdom, skill', 'Used of craftsmen as well as sages.'),
  ],
  work: [
    e('G2041', 'ἔργον', 'ergon', 'Greek', 'noun', 'work, deed, task', 'Root of "energy"; Paul’s foil for faith.'),
    e('H4639', 'מַעֲשֶׂה', 'maaseh', 'Hebrew', 'noun', 'deed, work, act', 'The works of God’s hands.'),
  ],
  gospel: [
    e('G2098', 'εὐαγγέλιον', 'euangelion', 'Greek', 'noun', 'good news, gospel', 'Imperial vocabulary for the announcement of a victory.'),
  ],
  church: [
    e('G1577', 'ἐκκλησία', 'ekklēsia', 'Greek', 'noun', 'assembly, congregation', 'A called-out civic gathering before it was a religious term.'),
  ],
  body: [
    e('G4983', 'σῶμα', 'sōma', 'Greek', 'noun', 'body', 'Paul’s controlling image for the church.'),
  ],
  blood: [
    e('G129', 'αἷμα', 'haima', 'Greek', 'noun', 'blood', 'Shorthand for a sacrificial death.'),
    e('H1818', 'דָּם', 'dam', 'Hebrew', 'noun', 'blood', 'Wordplay with adam, "man", and adamah, "ground".'),
  ],
  water: [
    e('G5204', 'ὕδωρ', 'hydōr', 'Greek', 'noun', 'water', 'Living water in John 4 and 7.'),
    e('H4325', 'מַיִם', 'mayim', 'Hebrew', 'noun', 'water', 'Grammatically dual, as if waters always come in pairs.'),
  ],
  bread: [
    e('G740', 'ἄρτος', 'artos', 'Greek', 'noun', 'bread, loaf', 'Daily bread; the bread of life.'),
    e('H3899', 'לֶחֶם', 'lechem', 'Hebrew', 'noun', 'bread, food', 'Beth-lechem: "house of bread".'),
  ],
  name: [
    e('G3686', 'ὄνομα', 'onoma', 'Greek', 'noun', 'name, reputation', 'To act "in the name" is to act with the person’s authority.'),
    e('H8034', 'שֵׁם', 'shem', 'Hebrew', 'noun', 'name, renown', 'A name expresses character, not just a label.'),
  ],
  day: [
    e('G2250', 'ἡμέρα', 'hēmera', 'Greek', 'noun', 'day', '"The day of the Lord" as eschatological shorthand.'),
    e('H3117', 'יוֹם', 'yom', 'Hebrew', 'noun', 'day, time, year', 'Range runs from daylight hours to an era.'),
  ],
  time: [
    e('G2540', 'καιρός', 'kairos', 'Greek', 'noun', 'appointed time, season', 'The opportune moment rather than clock time.'),
    e('G5550', 'χρόνος', 'chronos', 'Greek', 'noun', 'time, duration', 'Measured, sequential time.'),
  ],
  therefore: [
    e('G3767', 'οὖν', 'oun', 'Greek', 'conj', 'therefore, then, accordingly', 'A hinge word — always ask what it is "there for".'),
    e('G1352', 'διό', 'dio', 'Greek', 'conj', 'wherefore, on account of which', 'Draws a strong inference from what precedes.'),
  ],
  but: [
    e('G1161', 'δέ', 'de', 'Greek', 'conj', 'but, and, now', 'Mild connective; often merely marks a new step.'),
    e('G235', 'ἀλλά', 'alla', 'Greek', 'conj', 'but, rather, on the contrary', 'Strong adversative — worth marking on the manuscript.'),
  ],
  for: [
    e('G1063', 'γάρ', 'gar', 'Greek', 'conj', 'for, because', 'Signals the ground or reason for what was just said.'),
  ],
  because: [
    e('G3754', 'ὅτι', 'hoti', 'Greek', 'conj', 'that, because, since', 'Introduces content clauses and causes alike.'),
  ],
  amen: [
    e('G281', 'ἀμήν', 'amēn', 'Greek', 'particle', 'truly, so be it', 'Jesus uniquely uses it to open statements: "Truly, truly...".'),
  ],
  angel: [
    e('G32', 'ἄγγελος', 'angelos', 'Greek', 'noun', 'messenger, angel', 'Context decides between a human messenger and a heavenly one.'),
    e('H4397', 'מַלְאָךְ', 'malak', 'Hebrew', 'noun', 'messenger, angel', 'Behind the name Malachi.'),
  ],
  servant: [
    e('G1401', 'δοῦλος', 'doulos', 'Greek', 'noun', 'slave, bondservant', 'Paul’s self-designation; stronger than "servant".'),
    e('H5650', 'עֶבֶד', 'eved', 'Hebrew', 'noun', 'servant, slave', 'The Servant Songs of Isaiah use this word.'),
  ],
  sanctify: [
    e('G37', 'ἁγιάζω', 'hagiazō', 'Greek', 'verb', 'to set apart, make holy', 'Same root as hagios, "holy".'),
  ],
  temple: [
    e('G3485', 'ναός', 'naos', 'Greek', 'noun', 'sanctuary, inner temple', 'The holy place itself, not the whole precinct (hieron).'),
    e('H1964', 'הֵיכָל', 'heikal', 'Hebrew', 'noun', 'palace, temple', 'A palace — because it is the King’s house.'),
  ],
  hallelujah: [
    e('H1984', 'הָלַל', 'halal', 'Hebrew', 'verb', 'to praise, boast, shine', '"Hallelu-Yah" = praise the LORD.'),
  ],
  praise: [
    e('H8416', 'תְּהִלָּה', 'tehillah', 'Hebrew', 'noun', 'praise, song of praise', 'Tehillim is the Hebrew title of the Psalms.'),
    e('G1868', 'ἔπαινος', 'epainos', 'Greek', 'noun', 'praise, commendation', 'Public approval or commendation.'),
  ],
}

// Words that resolve onto an existing headword.
const ALIASES = {
  loved: 'love', loves: 'love', loving: 'love', beloved: 'love', charity: 'love',
  lovingkindness: 'love', kindness: 'mercy', compassion: 'mercy', merciful: 'mercy',
  favour: 'grace', favor: 'grace', gracious: 'grace',
  faithful: 'faith', faithfulness: 'faith', believeth: 'believe', believed: 'believe',
  believes: 'believe', believing: 'believe', believer: 'believe', trust: 'faith',
  hoped: 'hope', hopes: 'hope', hoping: 'hope',
  messiah: 'christ', anointed: 'christ',
  gods: 'god', godly: 'god', deity: 'god',
  lords: 'lord', master: 'lord',
  ghost: 'spirit', spiritual: 'spirit', wind: 'spirit', breath: 'spirit',
  holiness: 'holy', saints: 'holy', saint: 'holy', sanctified: 'sanctify',
  sins: 'sin', sinned: 'sin', sinner: 'sin', sinners: 'sin', sinful: 'sin',
  trespass: 'sin', trespasses: 'sin', iniquity: 'sin', transgression: 'sin',
  justified: 'justify', justification: 'justify', justifies: 'justify',
  laws: 'law', commandment: 'law', commandments: 'law', torah: 'law',
  covenants: 'covenant', testament: 'covenant',
  glorified: 'glorify', glorious: 'glory',
  truly: 'truth', true: 'truth',
  lives: 'life', living: 'life', alive: 'life',
  everlasting: 'eternal', eternity: 'eternal', forever: 'eternal',
  worlds: 'world', age: 'time', ages: 'time', season: 'time', seasons: 'time',
  fleshly: 'flesh', carnal: 'flesh',
  hearts: 'heart', souls: 'soul', minds: 'mind', thinking: 'mind',
  mighty: 'power', strength: 'power', might: 'power', powerful: 'power',
  kings: 'king', reign: 'kingdom', kingdoms: 'kingdom',
  sons: 'son', child: 'son', children: 'son',
  fathers: 'father', abba: 'father',
  saved: 'save', saves: 'save', saviour: 'salvation', savior: 'salvation',
  redeemed: 'redeem', redemption: 'redeem', ransom: 'redeem',
  forgiven: 'forgive', forgiveness: 'forgive', pardon: 'forgive',
  repentance: 'repent', repented: 'repent',
  prayer: 'pray', prayed: 'pray', prayers: 'pray', praying: 'pray',
  blessed: 'bless', blessing: 'bless', blessings: 'bless', happy: 'bless',
  knew: 'know', known: 'know', knowing: 'know', knowledge: 'know', knoweth: 'know',
  heard: 'hear', hearing: 'hear', listen: 'hear', obey: 'hear', obeyed: 'hear',
  saw: 'see', seen: 'see', seeing: 'see', behold: 'see', look: 'see',
  walked: 'walk', walking: 'walk', walketh: 'walk', conduct: 'walk',
  sent: 'send', sending: 'send', apostle: 'send', apostles: 'send',
  gave: 'give', given: 'give', giving: 'give', gift: 'grace', gifts: 'grace',
  came: 'come', coming: 'come', cometh: 'come',
  abides: 'abide', abiding: 'abide', remain: 'abide', remains: 'abide', dwell: 'abide',
  afraid: 'fear', fears: 'fear', reverence: 'fear', awe: 'fear',
  wise: 'wisdom', wisely: 'wisdom',
  works: 'work', deeds: 'work', deed: 'work', labor: 'work',
  preach: 'gospel', preaching: 'gospel',
  churches: 'church', assembly: 'church', congregation: 'church',
  bodies: 'body',
  waters: 'water', loaves: 'bread',
  names: 'name', days: 'day', times: 'time',
  wherefore: 'therefore', thus: 'therefore', so: 'therefore',
  yet: 'but', however: 'but', nevertheless: 'but', since: 'because',
  verily: 'amen', angels: 'angel', messenger: 'angel',
  servants: 'servant', slave: 'servant', bondservant: 'servant',
  sanctification: 'sanctify', temples: 'temple', tabernacle: 'temple',
  praised: 'praise', praises: 'praise',
  righteously: 'righteousness', just: 'righteous', justice: 'righteousness',
  peaceful: 'peace', shalom: 'peace', rejoice: 'joy', rejoiced: 'joy', glad: 'joy',
  words: 'word', saying: 'word', sayings: 'word', logos: 'word',
  lights: 'light', dark: 'darkness', night: 'darkness',
}

export const normalizeWord = (raw) =>
  String(raw || '')
    .toLowerCase()
    // Strip surrounding punctuation and possessives but keep internal hyphens.
    .replace(/[’‘'"`.,;:!?()[\]{}“”—–*]/g, '')
    .trim()

const STEMS = [
  [/ies$/, 'y'],
  [/(eth|est)$/, ''],
  [/ing$/, ''],
  [/ed$/, ''],
  [/es$/, ''],
  [/s$/, ''],
]

/**
 * Look up a clicked word. Returns null when nothing is known, so the UI can show
 * an honest "not in the bundled lexicon" state instead of inventing a gloss.
 */
export function lookupStrongs(raw) {
  const word = normalizeWord(raw)
  if (!word || word.length < 2) return null

  const resolve = (key) => {
    if (Object.prototype.hasOwnProperty.call(LEXICON, key)) return { key, entries: LEXICON[key] }
    const alias = ALIASES[key]
    if (alias && LEXICON[alias]) return { key: alias, entries: LEXICON[alias] }
    return null
  }

  let hit = resolve(word)
  if (!hit) {
    for (const [re, replacement] of STEMS) {
      if (!re.test(word)) continue
      hit = resolve(word.replace(re, replacement))
      if (hit) break
    }
  }
  if (!hit) return null
  return { word: raw, headword: hit.key, entries: hit.entries }
}

export const lexiconSize = Object.keys(LEXICON).length
