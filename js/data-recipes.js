// DIY Eco-Friendly Cleaning Recipes
const cleaningRecipes = [
    {
        id: "recipe_1",
        name: "Rice Water Counter Cleaner",
        emoji: "🍚",
        ingredients: ["Starchy water from rinsing rice (before cooking)", "Clean cotton cloth or sponge"],
        steps: [
            "Collect the cloudy water left over from rinsing rice before cooking.",
            "Pour into a spray bottle or small container.",
            "Wipe kitchen counters, stovetops, and tabletops with a clean cloth dipped in the solution.",
            "Buff dry with a second clean cloth for a streak-free finish.",
            "Use within 24 hours to prevent fermentation odor."
        ],
        tags: ["multi-purpose", "cat-safe", "kitchen", "counters"],
        isPetSafe: true,
        note: "Traditional method — the natural starch acts as a mild abrasive and deodorizer. Zero waste since you're using water that would otherwise be discarded."
    },
    {
        id: "recipe_2",
        name: "Vinegar Wiping Solution",
        emoji: "🧴",
        ingredients: ["White vinegar — 1 part", "Water — 1 part", "Soft cotton cloth"],
        steps: [
            "Mix equal parts white vinegar and water in a spray bottle.",
            "Spray onto glass surfaces, mirrors, countertops, or bathroom tiles.",
            "Wipe with a clean cotton cloth.",
            "For tough stains, let sit for 2-3 minutes before wiping.",
            "Allow to air dry for best results."
        ],
        tags: ["multi-purpose", "cat-safe", "glass", "bathroom", "kitchen"],
        isPetSafe: true,
        note: "Su-fuki has been used in homes for centuries. Vinegar kills 99% of bacteria naturally. Safe around cats once fully dried — the acetic acid evaporates."
    },
    {
        id: "recipe_3",
        name: "Used Tea Leaves Deodorizer",
        emoji: "🍵",
        ingredients: ["Used green tea leaves (matcha or sencha work best)", "Small muslin bags or coffee filters"],
        steps: [
            "Spread used tea leaves on a tray and let them dry completely (1-2 days in sun).",
            "Place dried leaves into small cloth bags or folded coffee filters.",
            "Position bags in drawers, cabinets, refrigerator, shoes, or car.",
            "Replace every 2-3 weeks for maximum odor absorption.",
            "Compost old tea leaves afterward as natural fertilizer."
        ],
        tags: ["deodorizer", "cat-safe", "closet", "fridge", "zero-waste"],
        isPetSafe: true,
        note: "Chakara has been used for centuries to absorb odors. Green tea's tannins neutralize smells rather than masking them. Completely safe around cats."
    },
    {
        id: "recipe_4",
        name: "Charcoal Odor Absorber",
        emoji: "🪵",
        ingredients: ["Activated charcoal or binchotan pieces", "Muslin bags or mesh pouches"],
        steps: [
            "Break charcoal into small pieces (2-3 cm chunks).",
            "Place in breathable cloth bags (about 50g per bag).",
            "Put bags in bathrooms, closets, fridge, or any damp area.",
            "Recharge every month by placing in direct sunlight for 2-3 hours.",
            "Charcoal can be reused for 6-12 months before replacing."
        ],
        tags: ["deodorizer", "cat-safe", "moisture-control", "bathroom", "closet"],
        isPetSafe: true,
        note: "Mokuzen is a cornerstone of home care. Binchotan charcoal absorbs moisture and odors naturally. It also releases negative ions for fresher air."
    },
    {
        id: "recipe_5",
        name: "Citrus Peel Vinegar Cleaner",
        emoji: "🍊",
        ingredients: ["Orange, lemon, or yuzu peels (dried in sun for 2-3 days)", "White vinegar — enough to cover peels", "Glass jar with lid", "Spray bottle"],
        steps: [
            "Dry citrus peels in the sun for 2-3 days until brittle.",
            "Place dried peels in a glass jar, filling about half.",
            "Pour white vinegar over peels until fully submerged.",
            "Seal and let sit for 2 weeks in a cool, dark place.",
            "Strain into a spray bottle. Dilute 1:1 with water for general use.",
            "Use on kitchen counters, grease buildup, and stovetops."
        ],
        tags: ["multi-purpose", "cat-safe", "kitchen", "grease-cutter"],
        isPetSafe: true,
        note: "When diluted properly, citrus cleaners are safe around cats. The essential oils in peels cut grease naturally. Yuzu peel is especially prized in cleaning traditions."
    },
    {
        id: "recipe_6",
        name: "Baking Soda Scrub Paste",
        emoji: "🫧",
        ingredients: ["Baking soda — 3 tablespoons", "Water — enough to make a paste", "Old toothbrush or scrub sponge"],
        steps: [
            "Mix baking soda with small amounts of water until you get a thick paste.",
            "Apply directly to sinks, tubs, stovetops, or any stained surface.",
            "Let sit for 5-10 minutes on tough stains.",
            "Scrub gently with a brush or sponge.",
            "Rinse thoroughly with warm water."
        ],
        tags: ["scrub", "cat-safe", "bathroom", "kitchen", "stain-remover"],
        isPetSafe: true,
        note: "Juu-so is a household staple. Baking soda is mildly abrasive without scratching surfaces and completely non-toxic. Safe for cats even during application."
    },
    {
        id: "recipe_7",
        name: "Rice Water Floor Wash",
        emoji: "🧹",
        ingredients: ["Second-rinse water from washing rice (cloudy)", "Large bucket or mop basin"],
        steps: [
            "When washing rice, save the second rinse water (it's cloudier and richer in starch).",
            "Pour into a mop bucket.",
            "Mop tile floors as usual — kitchen, bathrooms, hallways.",
            "The starch leaves a natural shine on tile surfaces.",
            "No need to rinse afterward. Let air dry."
        ],
        tags: ["floors", "cat-safe", "tile", "zero-waste"],
        isPetSafe: true,
        note: "A traditional floor care method. The rice starch creates a gentle natural polish on tile floors. Completely safe for cats to walk on once dry."
    },
    {
        id: "recipe_8",
        name: "Volcanic Drain Cleaner",
        emoji: "🌋",
        ingredients: ["Baking soda — ½ cup", "White vinegar — 1 cup", "Boiling water — 1 cup"],
        steps: [
            "Pour baking soda directly down the drain.",
            "Follow immediately with white vinegar — it will fizz vigorously.",
            "Cover the drain with a plug or cloth to contain the reaction.",
            "Let sit for 15-30 minutes.",
            "Flush with boiling water to clear dissolved gunk."
        ],
        tags: ["drain", "cat-safe", "kitchen", "bathroom"],
        isPetSafe: true,
        note: "The fizzy reaction helps break down grease and hair buildup naturally. Use monthly as prevention. Much safer than chemical drain cleaners for homes with pets."
    },
    {
        id: "recipe_9",
        name: "Green Tea Surface Polish",
        emoji: "🍃",
        ingredients: ["Green tea bags (2-3) or loose leaf green tea", "Hot water — 1 cup", "Soft microfiber cloth"],
        steps: [
            "Brew a strong pot of green tea and let it cool completely.",
            "Pour cooled tea into a spray bottle.",
            "Spray onto wood furniture, tables, or general surfaces.",
            "Wipe with a soft microfiber cloth in the direction of the grain (for wood).",
            "The tannins gently clean while leaving a subtle sheen."
        ],
        tags: ["multi-purpose", "cat-safe", "wood-furniture", "polish"],
        isPetSafe: true,
        note: "Ryokucha-maki uses tea tannins as a natural cleaner. Green tea has antioxidant properties that help preserve wood finishes. Completely safe around cats."
    },
    {
        id: "recipe_10",
        name: "Salt & Vinegar Glass Cleaner",
        emoji: "🪟",
        ingredients: ["Sea salt or table salt — 2 tablespoons", "White vinegar — ½ cup", "Warm water — 1 cup", "Newspaper or microfiber cloth"],
        steps: [
            "Dissolve salt in warm water, then add vinegar.",
            "Pour into a spray bottle and shake gently.",
            "Spray onto windows, mirrors, or glass surfaces.",
            "Wipe with newspaper for streak-free results (traditional method) or microfiber cloth.",
            "The salt acts as a mild abrasive to remove smudges."
        ],
        tags: ["glass", "cat-safe", "windows", "mirrors"],
        isPetSafe: true,
        note: "A time-tested combination. Salt provides gentle abrasion while vinegar dissolves grime. Using newspaper for polishing glass is a traditional technique still used by window cleaners."
    },
    {
        id: "recipe_11",
        name: "Lemon Sun Bleach",
        emoji: "🍋",
        ingredients: ["Fresh lemon juice — ½ cup (about 2 lemons)", "Water — 1 cup", "Spray bottle"],
        steps: [
            "Mix fresh lemon juice with water in a spray bottle.",
            "Apply to stained fabric areas (white cotton works best).",
            "Lay the fabric flat in direct sunlight for 1-2 hours.",
            "The sun activates the citric acid's natural bleaching power.",
            "Wash as normal afterward."
        ],
        tags: ["stain-remover", "cat-safe-when-dry", "fabrics", "whitening"],
        isPetSafe: true,
        note: "Keep cats away from wet treated fabrics. Once fully dry, it's completely safe. The combination of citric acid + UV light creates a natural bleaching effect — no harsh chemicals needed."
    },
    {
        id: "recipe_12",
        name: "All-Purpose Castile Spray",
        emoji: "🧼",
        ingredients: ["Castile soap (liquid) — 2 tablespoons", "Warm water — 2 cups", "Optional: 5 drops lavender essential oil (cat-safe in tiny amounts)", "Spray bottle"],
        steps: [
            "Mix warm water and castile soap in a spray bottle.",
            "Add lavender oil if desired (use sparingly around cats).",
            "Shake gently before each use — do not shake vigorously (creates too many suds).",
            "Spray on counters, floors, bathroom surfaces, or any general cleaning need.",
            "Wipe with a clean cloth. No rinsing needed for most surfaces."
        ],
        tags: ["multi-purpose", "cat-safe", "floors", "kitchen", "bathroom"],
        isPetSafe: true,
        note: "Castile soap is plant-based and biodegradable. One bottle replaces dozens of chemical cleaners. Use minimal essential oil around cats — their livers process certain compounds differently."
    },
    {
        id: "recipe_13",
        name: "Rice Bran Scrub Pad",
        emoji: "🌾",
        ingredients: ["Rice bran — 2-3 tablespoons", "Warm water — enough to dampen", "Clean cloth or your hands"],
        steps: [
            "Sprinkle rice bran onto a damp cloth or directly onto the surface.",
            "For pots and pans: rub rice bran directly on stained areas.",
            "The natural oils and mild abrasiveness lift grease without scratching.",
            "Rinse thoroughly with warm water.",
            "Compost leftover rice bran as organic fertilizer."
        ],
        tags: ["scrub", "cat-safe", "kitchen", "pots-pans"],
        isPetSafe: true,
        note: "Okomi-nuka-maki is a centuries-old cleaning method. Rice bran contains natural oils that help dissolve grease while its texture provides gentle scrubbing power."
    },
    {
        id: "recipe_14",
        name: "Cat-Safe Carpet Freshener",
        emoji: "🐱",
        ingredients: ["Baking soda — ½ cup", "Dried lavender buds — 1 tablespoon (optional, minimal)", "Cornstarch — 2 tablespoons"],
        steps: [
            "Mix baking soda and cornstarch in a jar.",
            "Add a tiny amount of dried lavender if desired (cats are sensitive to strong scents).",
            "Sprinkle generously over carpets and bedroom rugs.",
            "Let sit for 15-30 minutes to absorb odors and moisture.",
            "Vacuum thoroughly."
        ],
        tags: ["carpet", "cat-safe", "deodorizer", "bedroom"],
        isPetSafe: true,
        note: "Specifically formulated for homes with cats. Baking soda absorbs pet odors while cornstarch helps trap moisture. Use minimal lavender — some cats are sensitive to strong fragrances."
    },
    {
        id: "recipe_15",
        name: "Shoji-Style Wood Cleaner",
        emoji: "🏠",
        ingredients: ["Mild dish soap (plant-based) — 1 teaspoon", "Warm water — 2 cups", "Soft natural bristle brush or cloth"],
        steps: [
            "Dissolve a tiny amount of mild soap in warm water.",
            "Dampen (don't soak) a soft cloth in the solution.",
            "Wipe wood surfaces following the grain direction.",
            "Immediately dry with a second clean cloth to prevent water damage.",
            "For deeper cleaning, use a soft brush on carved or textured areas."
        ],
        tags: ["wood-furniture", "cat-safe", "multi-purpose"],
        isPetSafe: true,
        note: "Inspired by traditional shoji screen care. The key is using minimal water and drying immediately — this preserves wood finishes and prevents warping."
    }
];

const recipeFilterTags = [
    { value: "all", label: "All" },
    { value: "multi-purpose", label: "Multi-Purpose" },
    { value: "cat-safe", label: "🐱 Cat-Safe" },
    { value: "kitchen", label: "Kitchen" },
    { value: "bathroom", label: "Bathroom" },
    { value: "floors", label: "Floors" },
    { value: "deodorizer", label: "Deodorizer" },
    { value: "glass", label: "Glass" },
    { value: "scrub", label: "Scrub" }
];