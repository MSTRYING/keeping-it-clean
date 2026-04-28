// Cleaning Tasks Data - Calibrated for 4 people + 2 cats + 4 bedrooms + 4 bathrooms
// estimatedTime in minutes
const cleaningTasks = [
    // DAILY TASKS
    { id: "daily_1", name: "Vacuum/Sweep High-Traffic Areas", icon: "🧹", frequency: "daily", note: "Entryways, kitchen, hallways - heavy foot traffic with 4 people", estimatedTime: 15 },
    { id: "daily_2", name: "Wipe Kitchen Counters & Stove", icon: "🍳", frequency: "daily", note: "After each major use - family of 4 means frequent cooking", estimatedTime: 5 },
    { id: "daily_3", name: "Quick-Clean Bathroom Sinks & Toilets", icon: "🚽", frequency: "daily", note: "Surface wipe across all 4 bathrooms", estimatedTime: 10 },
    { id: "daily_4", name: "Dust High-Touch Surfaces", icon: "✨", frequency: "daily", note: "Doorknobs, light switches, remotes - germ hotspots with 6 occupants", estimatedTime: 5 },
    { id: "daily_5", name: "Empty All Trash Bins", icon: "🗑️", frequency: "daily", note: "Kitchen, bathrooms, general waste - fills fast with 4 people + cats", estimatedTime: 5 },
    { id: "daily_6", name: "Scoop Litter Boxes", icon: "🐱", frequency: "daily", note: "At least twice daily for 2 cats - morning and evening", estimatedTime: 5 },
    { id: "daily_7", name: "Wipe Dining Table & Surfaces", icon: "🍽️", frequency: "daily", note: "After meals - multiple eating sessions throughout the day", estimatedTime: 5 },
    { id: "daily_8", name: "Rinse Shower Walls/Tubs", icon: "🚿", frequency: "daily", note: "Quick rinse after use prevents soap scum buildup in 4 bathrooms", estimatedTime: 5 },
    { id: "daily_9", name: "Tidy Living Areas & Bedrooms", icon: "🛋️", frequency: "daily", note: "10-minute reset of common spaces and each bedroom", estimatedTime: 15 },
    { id: "daily_10", name: "Wipe Light Switches & Door Handles", icon: "💡", frequency: "daily", note: "Sanitize high-touch points - especially important with pets", estimatedTime: 5 },

    // WEEKLY TASKS
    { id: "weekly_1", name: "Change All Bed Sheets (4 beds)", icon: "🛏️", frequency: "weekly", note: "Weekly minimum with 4 people - bi-weekly max if using protectors", estimatedTime: 20 },
    { id: "weekly_2", name: "Wash Towels for Family", icon: "🧖", frequency: "weekly", note: "Full towel rotation for 4 people + 4 bathrooms", estimatedTime: 15 },
    { id: "weekly_3", name: "Mop All Tile Floors", icon: "💧", frequency: "weekly", note: "Kitchen, bathrooms, hallways - tile throughout most of house", estimatedTime: 30 },
    { id: "weekly_4", name: "Vacuum Bedroom Carpets Deeply", icon: "🔋", frequency: "weekly", note: "Carpets in all 4 bedrooms + cat hair collection zones", estimatedTime: 25 },
    { id: "weekly_5", name: "Deep-Clean All Bathrooms", icon: "🧼", frequency: "weekly", note: "Scrub tubs, toilets, tiles in all 4 bathrooms", estimatedTime: 45 },
    { id: "weekly_6", name: "Clean Mirrors & Glass Surfaces", icon: "🪞", frequency: "weekly", note: "All mirrors, glass doors, shower screens", estimatedTime: 15 },
    { id: "weekly_7", name: "Dust All Furniture & Shelves", icon: "📚", frequency: "weekly", note: "Throughout all rooms - pet dander settles quickly", estimatedTime: 20 },
    { id: "weekly_8", name: "Wash Pet Beds & Blankets", icon: "🐾", frequency: "weekly", note: "Cat beds, blankets where cats sleep - weekly wash recommended", estimatedTime: 10 },
    { id: "weekly_9", name: "Clean Kitchen Appliances Exterior", icon: "🔌", frequency: "weekly", note: "Fridge door, microwave outside, dishwasher front, oven exterior", estimatedTime: 10 },
    { id: "weekly_10", name: "Wash Bathroom Rugs & Mats", icon: "🧽", frequency: "weekly", note: "All bath mats from 4 bathrooms - line dry since no dryer", estimatedTime: 10 },
    { id: "weekly_11", name: "Clean Cat Water Bowls/Fountains", icon: "💦", frequency: "weekly", note: "Deep clean with vinegar solution to prevent biofilm", estimatedTime: 5 },

    // BI-WEEKLY TASKS
    { id: "biweekly_1", name: "Clean Inside Refrigerator", icon: "🧊", frequency: "bi-weekly", note: "Check expiry dates, wipe shelves - fills fast with 4 people shopping", estimatedTime: 20 },
    { id: "biweekly_2", name: "Descale Showerheads", icon: "🚿", frequency: "bi-weekly", note: "Vinegar soak for all showerheads in 4 bathrooms", estimatedTime: 15 },
    { id: "biweekly_3", name: "Dust Baseboards & Vents", icon: "🌬️", frequency: "bi-weekly", note: "Throughout all rooms - pet hair collects at floor level", estimatedTime: 25 },
    { id: "biweekly_4", name: "Shampoo Bedroom Carpets", icon: "🧽", frequency: "bi-weekly", note: "Deep clean carpets in 4 bedrooms - rotate rooms", estimatedTime: 30 },
    { id: "biweekly_5", name: "Clean Light Fixtures & Lamps", icon: "💡", frequency: "bi-weekly", note: "Dust shades and fixtures throughout house", estimatedTime: 20 },
    { id: "biweekly_6", name: "Wipe Cabinet Exteriors", icon: "🗄️", frequency: "bi-weekly", note: "Kitchen and bathroom cabinets - grease and moisture buildup", estimatedTime: 15 },
    { id: "biweekly_7", name: "Clean Pet Scratching Posts/Areas", icon: "🐱", frequency: "bi-weekly", note: "Vacuum or brush down scratching posts, clean surrounding areas", estimatedTime: 10 },
    { id: "biweekly_8", name: "Wash Kitchen Sponges & Cloths", icon: "🧽", frequency: "bi-weekly", note: "Replace or sanitize all cleaning cloths and sponges", estimatedTime: 5 },

    // MONTHLY TASKS
    { id: "monthly_1", name: "Deep-Clean Oven Interior", icon: "🔥", frequency: "monthly", note: "Baking soda paste method - eco-friendly deep clean", estimatedTime: 30 },
    { id: "monthly_2", name: "Wash Curtains & Blinds", icon: "🪟", frequency: "monthly", note: "Dust blinds, wash curtains throughout house", estimatedTime: 30 },
    { id: "monthly_3", name: "Clean AC Vents & Replace Filters", icon: "❄️", frequency: "monthly", note: "Check and clean air vents - important with pet dander", estimatedTime: 20 },
    { id: "monthly_4", name: "Scrub Tile Grout", icon: "🧱", frequency: "monthly", note: "Kitchen and bathroom grout lines - baking soda + vinegar method", estimatedTime: 40 },
    { id: "monthly_5", name: "Organize Closets & Pantries", icon: "👗", frequency: "monthly", note: "Quick declutter of 4 bedrooms' closets + kitchen pantry", estimatedTime: 30 },
    { id: "monthly_6", name: "Wipe Cabinet Doors Inside/Out", icon: "🚪", frequency: "monthly", note: "Full cabinet cleaning in kitchen and bathrooms", estimatedTime: 25 },
    { id: "monthly_7", name: "Clean Microwave Thoroughly", icon: "📡", frequency: "monthly", note: "Steam clean with lemon water method", estimatedTime: 10 },
    { id: "monthly_8", name: "Check & Clean Water Filters", icon: "💧", frequency: "monthly", note: "Fridge filter, faucet filters, shower filters if applicable", estimatedTime: 15 },

    // QUARTERLY TASKS
    { id: "quarterly_1", name: "Wash Mattress Protectors & Flip Mattresses", icon: "🛏️", frequency: "quarterly", note: "All 4 mattresses - rotate and wash protectors", estimatedTime: 30 },
    { id: "quarterly_2", name: "Move & Clean Behind Appliances", icon: "🔌", frequency: "quarterly", note: "Fridge, stove, washer - dust bunnies and pet hair collect here", estimatedTime: 30 },
    { id: "quarterly_3", name: "Deep Carpet Shampoo Bedrooms", icon: "🧽", frequency: "quarterly", note: "Professional-grade deep clean of all bedroom carpets", estimatedTime: 60 },
    { id: "quarterly_4", name: "Clean Exterior Windows", icon: "🪟", frequency: "quarterly", note: "All exterior windows - vinegar solution method", estimatedTime: 45 },
    { id: "quarterly_5", name: "Replace HVAC Air Filters", icon: "🌬️", frequency: "quarterly", note: "Critical with 2 cats and 4 people - may need monthly in peak season", estimatedTime: 15 },
    { id: "quarterly_6", name: "Wash Throw Pillows & Cushions", icon: "🛋️", frequency: "quarterly", note: "All decorative pillows, floor cushions, washable upholstery covers", estimatedTime: 20 },

    // ANNUAL TASKS
    { id: "annual_1", name: "Deep-Clean Upholstery", icon: "🛋️", frequency: "annual", note: "Professional clean or deep shampoo of sofas, chairs", estimatedTime: 60 },
    { id: "annual_2", name: "Full House Declutter Session", icon: "📦", frequency: "annual", note: "Room-by-room Marie Kondo style - keep only what sparks joy", estimatedTime: 120 },
    { id: "annual_3", name: "Wash Stored Seasonal Items", icon: "👔", frequency: "annual", note: "Blankets, comforters, seasonal clothing before storage", estimatedTime: 45 },
    { id: "annual_4", name: "Inspect & Touch-Up Paint/Walls", icon: "🎨", frequency: "annual", note: "Check for scuffs, water damage - especially near bathrooms", estimatedTime: 60 },
    { id: "annual_5", name: "Deep Floor Care (Seal/Polish)", icon: "✨", frequency: "annual", note: "Tile sealing if needed, carpet protection treatment", estimatedTime: 60 },
    { id: "annual_6", name: "Clean Range Hood Ductwork", icon: "💨", frequency: "annual", note: "Grease buildup in ventilation - fire safety and efficiency", estimatedTime: 30 }
];

const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annual", label: "Annual" }
];
