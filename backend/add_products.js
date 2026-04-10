require('./load-env.js');
const pool = require('./db');

const newProducts = [
  // Toys
  { name: 'Action Figure Set', category: 'Toys', subcategory: 'Figures', price: 1499.00, brand: 'ToyHero', description: 'Collection of 5 superhero action figures with movable joints.' },
  { name: 'Building Blocks 1000pc', category: 'Toys', subcategory: 'Educational', price: 2999.00, brand: 'BlockMaster', description: 'Creative building block set with 1000 pieces for kids.' },
  { name: 'Remote Control Car', category: 'Toys', subcategory: 'RC Toys', price: 1999.00, brand: 'SpeedRC', description: 'Fast all-terrain remote control car with rechargeable battery.' },
  { name: 'Board Game - Strategy', category: 'Toys', subcategory: 'Games', price: 999.00, brand: 'PlayTime', description: 'Fun strategy board game for family and friends (2-6 players).' },
  { name: 'Plush Teddy Bear', category: 'Toys', subcategory: 'Soft Toys', price: 799.00, brand: 'SoftHugs', description: 'Giant 3ft plush teddy bear, extremely soft and cuddly.' },

  // Furniture
  { name: 'Office Chair Ergonomic', category: 'Furniture', subcategory: 'Office', price: 6999.00, brand: 'ComfortSeat', description: 'Ergonomic mesh office chair with lumbar support and armrests.' },
  { name: 'Wooden Coffee Table', category: 'Furniture', subcategory: 'Living Room', price: 4500.00, brand: 'WoodCraft', description: 'Solid wood coffee table with a rustic finish.' },
  { name: 'Bookshelf 5-Tier', category: 'Furniture', subcategory: 'Storage', price: 3500.00, brand: 'HomeDecor', description: '5-tier wooden bookshelf for living room or study.' },
  { name: 'TV Stand Modern', category: 'Furniture', subcategory: 'Living Room', price: 5499.00, brand: 'WoodCraft', description: 'Sleek modern TV stand with storage drawers and shelves.' },
  { name: 'Bean Bag Chair', category: 'Furniture', subcategory: 'Living Room', price: 1299.00, brand: 'LoungePlus', description: 'Comfortable bean bag chair, perfect for gaming or reading.' },
  { name: 'Premium Memory Foam Bean Bag', category: 'Furniture', subcategory: 'Living Room', price: 3499.00, brand: 'CozyCloud', description: 'Ultra-durable memory foam bean bag. Won\'t flatten over time.', avg_rating: 4.8, return_rate: 1 },
  { name: 'Giant Lounger XXL', category: 'Furniture', subcategory: 'Living Room', price: 4299.00, brand: 'RelaxMax', description: 'Spacious oversized bean bag with a washable premium suede cover.', avg_rating: 4.9, return_rate: 2 },
  { name: 'UltraPlush Bean Bag', category: 'Furniture', subcategory: 'Living Room', price: 2999.00, brand: 'ComfyCo', description: 'Plush velvet bean bag with durable double stitching.', avg_rating: 4.8, return_rate: 2 },

  // Automotive
  { name: 'Car Dash Camera', category: 'Automotive', subcategory: 'Electronics', price: 3499.00, brand: 'DriveSafe', description: '1080p HD dash cam with night vision and loop recording.' },
  { name: 'Tire Inflator Portable', category: 'Automotive', subcategory: 'Tools', price: 2199.00, brand: 'AirPump', description: '12V portable air compressor and tire inflator for cars.' },
  { name: 'Car Vacuum Cleaner', category: 'Automotive', subcategory: 'Cleaning', price: 1499.00, brand: 'AutoClean', description: 'Handheld car vacuum cleaner with strong suction.' },
  { name: 'Windshield Sun Shade', category: 'Automotive', subcategory: 'Accessories', price: 499.00, brand: 'SunBlock', description: 'Reflective sun shade to keep your car interior cool.' },
  { name: 'Car Polish Wax', category: 'Automotive', subcategory: 'Cleaning', price: 899.00, brand: 'ShineX', description: 'Premium car polish wax for a long-lasting glossy finish.' },

  // Pet Supplies
  { name: 'Dog Bed Washable', category: 'Pet Supplies', subcategory: 'Beds', price: 1599.00, brand: 'PetComfort', description: 'Soft and washable dog bed for medium to large dogs.' },
  { name: 'Cat Tree Tower', category: 'Pet Supplies', subcategory: 'Toys', price: 2999.00, brand: 'MeowHouse', description: 'Multi-level cat tree with scratching posts and a hammock.' },
  { name: 'Pet Water Fountain', category: 'Pet Supplies', subcategory: 'Bowls', price: 1899.00, brand: 'AquaPet', description: 'Automatic pet water fountain with filter.' },
  { name: 'Dog Chew Toys Pack', category: 'Pet Supplies', subcategory: 'Toys', price: 699.00, brand: 'ToughBite', description: 'Pack of 5 durable chew toys for aggressive chewers.' },
  { name: 'Automatic Pet Feeder', category: 'Pet Supplies', subcategory: 'Bowls', price: 4999.00, brand: 'SmartPet', description: 'Programmable automatic food dispenser for cats and dogs.' },

  // Books
  { name: 'Sci-Fi Novel Paperback', category: 'Books', subcategory: 'Fiction', price: 399.00, brand: 'PublisherA', description: 'Best-selling science fiction adventure novel.' },
  { name: 'Cookbook Healthy Meals', category: 'Books', subcategory: 'Non-Fiction', price: 599.00, brand: 'PublisherB', description: '100+ easy and healthy recipes for everyday cooking.' },
  { name: 'Notebook Ruled 5-Pack', category: 'Books', subcategory: 'Stationery', price: 450.00, brand: 'WriteWell', description: 'Pack of 5 A4 ruled notebooks, 200 pages each.' },
  { name: 'Business Strategy Book', category: 'Books', subcategory: 'Business', price: 799.00, brand: 'PublisherC', description: 'Learn advanced business strategies from industry experts.' },
  { name: 'Planner 2026', category: 'Books', subcategory: 'Stationery', price: 350.00, brand: 'OrganizeMe', description: 'Daily productivity planner for the year 2026.' },

  // Hardware
  { name: 'Toolkit 100-piece', category: 'Hardware', subcategory: 'Tools', price: 2999.00, brand: 'ProTool', description: 'Comprehensive 100-piece home repair tool kit.' },
  { name: 'Power Drill Cordless', category: 'Hardware', subcategory: 'Power Tools', price: 4500.00, brand: 'DrillMax', description: '20V cordless power drill with 2 batteries and charger.' },
  { name: 'Measuring Tape 5m', category: 'Hardware', subcategory: 'Tools', price: 250.00, brand: 'MeasurePro', description: 'Durable 5-meter measuring tape with locking mechanism.' },
  { name: 'Hammer with Claw', category: 'Hardware', subcategory: 'Tools', price: 499.00, brand: 'ProTool', description: 'Sturdy steel claw hammer with a rubber grip.' },
  { name: 'Screwdriver Set', category: 'Hardware', subcategory: 'Tools', price: 899.00, brand: 'ProTool', description: 'Magnetic screwdriver set, 12 pieces (Philips and Flathead).' },

  // Sports
  { name: 'Dumbbell Set 10kg', category: 'Sports', subcategory: 'Fitness', price: 1899.00, brand: 'FitGear', description: 'Adjustable 10kg dumbbell set for home workouts.' },
  { name: 'Resistance Bands', category: 'Sports', subcategory: 'Fitness', price: 699.00, brand: 'StretchPro', description: 'Set of 5 resistance bands with different tension levels.' },
  { name: 'Jump Rope Speed', category: 'Sports', subcategory: 'Fitness', price: 299.00, brand: 'CardioMax', description: 'Adjustable speed jump rope for cardio training.' },
  { name: 'Yoga Block Pair', category: 'Sports', subcategory: 'Fitness', price: 499.00, brand: 'YogaLife', description: 'High-density EVA foam yoga blocks for support and balance.' },
  { name: 'Water Bottle 2L', category: 'Sports', subcategory: 'Accessories', price: 399.00, brand: 'Hydrate+', description: 'BPA-free 2-liter water bottle with time markers.' },

  // Office Supplies
  { name: 'Desk Organizer', category: 'Office Supplies', subcategory: 'Accessories', price: 899.00, brand: 'OfficePro', description: 'Mesh metal desk organizer with 6 compartments.' },
  { name: 'Gel Pens Pack of 12', category: 'Office Supplies', subcategory: 'Writing', price: 250.00, brand: 'SmoothInk', description: 'Pack of 12 fine-point black gel pens.' },
  { name: 'Stapler Heavy Duty', category: 'Office Supplies', subcategory: 'Accessories', price: 450.00, brand: 'OfficePro', description: 'Heavy-duty stapler with 1000 staples included.' },
  { name: 'Sticky Notes Set', category: 'Office Supplies', subcategory: 'Paper', price: 199.00, brand: 'NoteIt', description: 'Colorful sticky notes, 4 pads of 100 sheets each.' },
  { name: 'Whiteboard Magnetic', category: 'Office Supplies', subcategory: 'Presentation', price: 1299.00, brand: 'BoardMax', description: 'Magnetic whiteboard (2x3 ft) with markers and eraser.' },

  // Musical Instruments
  { name: 'Acoustic Guitar', category: 'Musical Instruments', subcategory: 'String', price: 5999.00, brand: 'MelodyString', description: 'Beginner acoustic guitar with carrying bag and picks.' },
  { name: 'Electronic Keyboard', category: 'Musical Instruments', subcategory: 'Keys', price: 8499.00, brand: 'SoundPlay', description: '61-key electronic keyboard piano with stand.' },
  { name: 'Ukulele Beginner Set', category: 'Musical Instruments', subcategory: 'String', price: 1899.00, brand: 'IslandVibes', description: 'Soprano ukulele with tuner and gig bag.' },
  { name: 'Drumsticks Pair', category: 'Musical Instruments', subcategory: 'Percussion', price: 350.00, brand: 'BeatMaker', description: 'Professional hickory wood drumsticks (size 5A).' },
  { name: 'Guitar Tuner Clip-on', category: 'Musical Instruments', subcategory: 'Accessories', price: 499.00, brand: 'TunePrecise', description: 'Clip-on digital tuner for guitar, bass, and violin.' },

  // Groceries / Health
  { name: 'Protein Powder Whey', category: 'Health', subcategory: 'Supplements', price: 2499.00, brand: 'MuscleMax', description: '100% Whey protein isolate, chocolate flavor, 1kg.' },
  { name: 'Multivitamin Gummies', category: 'Health', subcategory: 'Supplements', price: 799.00, brand: 'VitaGlow', description: 'Daily multivitamin gummies for immune support.' },
  { name: 'Mixed Nuts 1kg', category: 'Groceries', subcategory: 'Snacks', price: 1299.00, brand: 'NatureSnack', description: 'Premium roasted mixed nuts (almonds, cashews, walnuts).' },
  { name: 'Olive Oil Extra Virgin', category: 'Groceries', subcategory: 'Cooking', price: 999.00, brand: 'ChefChoice', description: 'Cold-pressed extra virgin olive oil, 1 liter bottle.' },
  { name: 'Green Tea Bags 100pc', category: 'Groceries', subcategory: 'Beverages', price: 450.00, brand: 'LeafLife', description: 'Organic green tea bags for detox and wellness.' },

  // --- Alternative High-Rated Products for Recommendations ---
  { name: 'CrystalClear Earbuds', category: 'Electronics', subcategory: 'Audio', price: 2999.00, brand: 'AudioMax', description: 'Superior sound quality and 30-hour battery life.', avg_rating: 4.8, return_rate: 1 },
  { name: 'ZenithBook 14"', category: 'Electronics', subcategory: 'Laptops', price: 56999.00, brand: 'ZenithTech', description: 'Powerful laptop with excellent cooling and long-lasting battery.', avg_rating: 4.7, return_rate: 2 },
  { name: 'ActivePro Smartwatch', category: 'Electronics', subcategory: 'Wearables', price: 4299.00, brand: 'ActiveLife', description: 'Accurate sensors and reliable fitness tracking with 10-day battery.', avg_rating: 4.6, return_rate: 1 },
  { name: 'UltraSoft T-Shirt', category: 'Clothing', subcategory: 'T-Shirts', price: 899.00, brand: 'ComfortWear', description: '100% true cotton, colorfast, and extremely durable.', avg_rating: 4.8, return_rate: 2 },
  { name: 'FlexFit Denim Jeans', category: 'Clothing', subcategory: 'Jeans', price: 1999.00, brand: 'TrueDenim', description: 'Perfect fit with 4-way stretch and strong stitching.', avg_rating: 4.7, return_rate: 3 },
  { name: 'Authentic Silk Saree', category: 'Clothing', subcategory: 'Ethnic Wear', price: 6499.00, brand: 'HeritageSilk', description: '100% pure handwoven silk with genuine zari work.', avg_rating: 4.9, return_rate: 1 },
  { name: 'Titanium Cookware Set', category: 'Home & Kitchen', subcategory: 'Cookware', price: 4499.00, brand: 'KitchenPro', description: 'Scratch-resistant titanium coating with heat-proof handles.', avg_rating: 4.8, return_rate: 2 },
  { name: 'SmartClean Robot Vacuum', category: 'Home & Kitchen', subcategory: 'Appliances', price: 14999.00, brand: 'HomeGenius', description: 'Advanced mapping, high suction power, and quiet operation.', avg_rating: 4.7, return_rate: 2 },
  { name: 'Radiance Face Serum', category: 'Beauty', subcategory: 'Skincare', price: 799.00, brand: 'PureDerma', description: 'Dermatologist tested, stable Vitamin C formula for glowing skin.', avg_rating: 4.8, return_rate: 1 }
];

const seededScenarios = {
  'Bean Bag Chair': {
    avg_rating: 2.5,
    return_rate: 18,
    reviews: [
      {
        customer_name: 'Amit S.',
        rating: 2,
        review_text: 'The stitching tore open after just a week. Poor quality material and flimsy seams.',
        review_date: '2026-03-01',
        verified_purchase: true,
        helpful_votes: 12
      },
      {
        customer_name: 'Priya D.',
        rating: 1,
        review_text: 'Very flimsy and broke easily. The quality is terrible and the thread comes off.',
        review_date: '2026-03-10',
        verified_purchase: true,
        helpful_votes: 8
      }
    ],
    returns: [
      {
        customer_name: 'Rahul K.',
        return_date: '2026-03-15',
        return_reason: 'Quality issue',
        detailed_notes: 'The seam ripped and beans spilled everywhere. Very poor quality.',
        refund_amount: 1299.00,
        ai_extracted_issue: 'quality_poor'
      },
      {
        customer_name: 'Sneha M.',
        return_date: '2026-03-20',
        return_reason: 'Defective',
        detailed_notes: 'It fell apart at the seams. Terrible quality stitching.',
        refund_amount: 1299.00,
        ai_extracted_issue: 'quality_poor'
      }
    ],
    tickets: [
      {
        customer_name: 'Amit S.',
        issue_type: 'Product issue',
        message: 'The filling is leaking out from the side seam after normal use.',
        status: 'open',
        ticket_date: '2026-03-08'
      }
    ]
  },
  'UltraSoft T-Shirt': {
    avg_rating: 3.3,
    return_rate: 11,
    reviews: [
      {
        customer_name: 'Neha P.',
        rating: 2,
        review_text: 'Fabric feels soft but the color is much duller than the product photo. Looked beige instead of blush pink.',
        review_date: '2026-02-11',
        verified_purchase: true,
        helpful_votes: 6
      },
      {
        customer_name: 'Karan J.',
        rating: 3,
        review_text: 'Comfortable t-shirt, but the shade is off compared with the listing images.',
        review_date: '2026-02-18',
        verified_purchase: true,
        helpful_votes: 4
      }
    ],
    returns: [
      {
        customer_name: 'Neha P.',
        return_date: '2026-02-16',
        return_reason: 'Color mismatch',
        detailed_notes: 'The actual color is darker than shown in the picture and does not match the catalog photo.',
        refund_amount: 899.00,
        ai_extracted_issue: 'color_mismatch'
      }
    ]
  },
  'FlexFit Denim Jeans': {
    avg_rating: 3.1,
    return_rate: 13,
    reviews: [
      {
        customer_name: 'Rohit M.',
        rating: 2,
        review_text: 'Waist runs much smaller than the size chart. Could not get the jeans over my hips.',
        review_date: '2026-01-19',
        verified_purchase: true,
        helpful_votes: 7
      },
      {
        customer_name: 'Ananya R.',
        rating: 3,
        review_text: 'Good denim quality but the fit is inconsistent. One leg feels tighter than expected.',
        review_date: '2026-01-26',
        verified_purchase: true,
        helpful_votes: 5
      }
    ],
    returns: [
      {
        customer_name: 'Rohit M.',
        return_date: '2026-01-23',
        return_reason: 'Size issue',
        detailed_notes: 'Sizing runs small. The waist measurement is not accurate to the chart.',
        refund_amount: 1999.00,
        ai_extracted_issue: 'size_mismatch'
      }
    ]
  },
  'ActivePro Smartwatch': {
    avg_rating: 3.4,
    return_rate: 10,
    reviews: [
      {
        customer_name: 'Dev A.',
        rating: 2,
        review_text: 'Bluetooth disconnects during workouts and the watch keeps losing connection to the app.',
        review_date: '2026-03-05',
        verified_purchase: true,
        helpful_votes: 9
      },
      {
        customer_name: 'Tanya L.',
        rating: 3,
        review_text: 'Looks great but pairing is unstable and sync with the phone drops often.',
        review_date: '2026-03-08',
        verified_purchase: true,
        helpful_votes: 5
      }
    ],
    returns: [
      {
        customer_name: 'Dev A.',
        return_date: '2026-03-12',
        return_reason: 'Connectivity issue',
        detailed_notes: 'Bluetooth pairing fails repeatedly and the signal disconnects mid run.',
        refund_amount: 4299.00,
        ai_extracted_issue: 'connectivity_issue'
      }
    ],
    tickets: [
      {
        customer_name: 'Tanya L.',
        issue_type: 'Connectivity',
        message: 'The watch loses connection with the phone every few hours.',
        status: 'resolved',
        ticket_date: '2026-03-10'
      }
    ]
  },
  'SmartClean Robot Vacuum': {
    avg_rating: 3.5,
    return_rate: 9,
    reviews: [
      {
        customer_name: 'Manish K.',
        rating: 2,
        review_text: 'The app crashes during mapping and the vacuum freezes before finishing one room.',
        review_date: '2026-02-02',
        verified_purchase: true,
        helpful_votes: 10
      },
      {
        customer_name: 'Ishita V.',
        rating: 3,
        review_text: 'Hardware seems fine, but the software is buggy and the interface gets stuck after updates.',
        review_date: '2026-02-07',
        verified_purchase: true,
        helpful_votes: 4
      }
    ],
    returns: [
      {
        customer_name: 'Manish K.',
        return_date: '2026-02-09',
        return_reason: 'App issue',
        detailed_notes: 'Firmware update caused repeated crashes and the robot became unresponsive.',
        refund_amount: 14999.00,
        ai_extracted_issue: 'software_issue'
      }
    ]
  },
  'Radiance Face Serum': {
    avg_rating: 3.2,
    return_rate: 8,
    reviews: [
      {
        customer_name: 'Sonal B.',
        rating: 1,
        review_text: 'This caused a rash and burning sensation on my cheeks after two uses.',
        review_date: '2026-01-12',
        verified_purchase: true,
        helpful_votes: 11
      },
      {
        customer_name: 'Mahi T.',
        rating: 2,
        review_text: 'Strong chemical smell and skin irritation around my jawline.',
        review_date: '2026-01-14',
        verified_purchase: true,
        helpful_votes: 7
      }
    ],
    returns: [
      {
        customer_name: 'Sonal B.',
        return_date: '2026-01-18',
        return_reason: 'Skin reaction',
        detailed_notes: 'Product caused irritation, redness, and a mild breakout. Feels unsafe for sensitive skin.',
        refund_amount: 799.00,
        ai_extracted_issue: 'safety_concern'
      }
    ],
    tickets: [
      {
        customer_name: 'Mahi T.',
        issue_type: 'Safety',
        message: 'Need help with refund because the serum caused burning and irritation.',
        status: 'open',
        ticket_date: '2026-01-16'
      }
    ]
  },
  'Olive Oil Extra Virgin': {
    avg_rating: 3.6,
    return_rate: 7,
    reviews: [
      {
        customer_name: 'Vikram N.',
        rating: 2,
        review_text: 'Oil quality seems okay but the bottle arrived leaked and the packaging was soaked.',
        review_date: '2026-02-21',
        verified_purchase: true,
        helpful_votes: 6
      }
    ],
    returns: [
      {
        customer_name: 'Vikram N.',
        return_date: '2026-02-24',
        return_reason: 'Damaged delivery',
        detailed_notes: 'Cap was loose and the box had oil stains from shipping damage.',
        refund_amount: 999.00,
        ai_extracted_issue: 'shipping_damage'
      }
    ]
  },
  'ZenithBook 14"': {
    avg_rating: 3.5,
    return_rate: 6,
    reviews: [
      {
        customer_name: 'Arjun C.',
        rating: 3,
        review_text: 'Laptop is fast, but the battery life is nowhere near the 12 hours claimed in the listing.',
        review_date: '2026-03-03',
        verified_purchase: true,
        helpful_votes: 8
      }
    ],
    returns: [
      {
        customer_name: 'Arjun C.',
        return_date: '2026-03-09',
        return_reason: 'Not as described',
        detailed_notes: 'Advertised battery hours are misleading. Real usage lasted less than 6 hours.',
        refund_amount: 56999.00,
        ai_extracted_issue: 'misleading_specs'
      }
    ]
  },
  'CrystalClear Earbuds': {
    avg_rating: 4.8,
    return_rate: 1,
    reviews: [
      {
        customer_name: 'Harsh P.',
        rating: 5,
        review_text: 'Battery life is excellent, fit is secure, and the sound stays balanced even on calls.',
        review_date: '2026-02-03',
        verified_purchase: true,
        helpful_votes: 14
      },
      {
        customer_name: 'Deepa R.',
        rating: 5,
        review_text: 'Compact case, fast pairing, and no connection issues so far. Very reliable earbuds.',
        review_date: '2026-02-11',
        verified_purchase: true,
        helpful_votes: 9
      }
    ]
  },
  'Titanium Cookware Set': {
    avg_rating: 4.7,
    return_rate: 1,
    reviews: [
      {
        customer_name: 'Bhavna S.',
        rating: 5,
        review_text: 'Heats evenly, handles stay cool, and the coating still looks new after daily use.',
        review_date: '2026-01-09',
        verified_purchase: true,
        helpful_votes: 13
      },
      {
        customer_name: 'Ritesh G.',
        rating: 4,
        review_text: 'Solid cookware set with sturdy lids and easy cleanup. Feels premium.',
        review_date: '2026-01-13',
        verified_purchase: true,
        helpful_votes: 7
      }
    ]
  },
  'Premium Memory Foam Bean Bag': {
    avg_rating: 4.9,
    return_rate: 0,
    reviews: [
      {
        customer_name: 'Nupur W.',
        rating: 5,
        review_text: 'Supportive foam, durable cover, and still fluffy after a month of use.',
        review_date: '2026-03-04',
        verified_purchase: true,
        helpful_votes: 10
      },
      {
        customer_name: 'Sameer H.',
        rating: 5,
        review_text: 'Comfortable for long reading sessions and the stitching feels much stronger than cheaper options.',
        review_date: '2026-03-07',
        verified_purchase: true,
        helpful_votes: 8
      }
    ]
  }
};

async function insertSeedReviews(productId, reviews = []) {
  for (const review of reviews) {
    const [existingReviews] = await pool.query(
      `SELECT id FROM reviews
       WHERE product_id = ? AND customer_name = ? AND review_text = ?
       LIMIT 1`,
      [productId, review.customer_name, review.review_text]
    );

    if (existingReviews.length > 0) continue;

    await pool.query(
      `INSERT INTO reviews
      (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        review.customer_name,
        review.rating,
        review.review_text,
        review.review_date,
        review.verified_purchase,
        review.helpful_votes
      ]
    );
  }
}

async function insertSeedReturns(productId, returns = []) {
  for (const ret of returns) {
    const [existingReturns] = await pool.query(
      `SELECT id FROM returns
       WHERE product_id = ? AND customer_name = ? AND detailed_notes = ?
       LIMIT 1`,
      [productId, ret.customer_name, ret.detailed_notes]
    );

    if (existingReturns.length > 0) continue;

    await pool.query(
      `INSERT INTO returns
      (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, return_status, ai_extracted_issue)
      VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [
        productId,
        ret.customer_name,
        ret.return_date,
        ret.return_reason,
        ret.detailed_notes,
        ret.refund_amount,
        ret.ai_extracted_issue
      ]
    );
  }
}

async function insertSeedTickets(productId, tickets = []) {
  for (const ticket of tickets) {
    const [existingTickets] = await pool.query(
      `SELECT id FROM customer_support_tickets
       WHERE product_id = ? AND customer_name = ? AND message = ?
       LIMIT 1`,
      [productId, ticket.customer_name, ticket.message]
    );

    if (existingTickets.length > 0) continue;

    await pool.query(
      `INSERT INTO customer_support_tickets
      (product_id, customer_name, issue_type, message, status, ticket_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        productId,
        ticket.customer_name,
        ticket.issue_type,
        ticket.message,
        ticket.status,
        ticket.ticket_date
      ]
    );
  }
}

async function seedNewProducts() {
  try {
    let insertedCount = 0;
    let skippedCount = 0;

    for (const product of newProducts) {
      const scenario = seededScenarios[product.name];
      const [existingProducts] = await pool.query(
        'SELECT id FROM products WHERE name = ? AND brand = ? LIMIT 1',
        [product.name, product.brand]
      );

      if (existingProducts.length > 0) {
        const existingProductId = existingProducts[0].id;
        if (scenario) {
          await insertSeedReviews(existingProductId, scenario.reviews);
          await insertSeedReturns(existingProductId, scenario.returns);
          await insertSeedTickets(existingProductId, scenario.tickets);
        }
        skippedCount++;
        continue;
      }

      // Adding somewhat randomized stats so it looks real
      const total_sold = Math.floor(Math.random() * 800) + 100;
      // return rate between 2% and 15% unless specified
      const returnRatePercentage = scenario?.return_rate ?? product.return_rate ?? (Math.floor(Math.random() * 13) + 2);
      const seededReturnCount = scenario?.returns?.length || 0;
      const total_returned = Math.max(
        seededReturnCount,
        Math.floor((total_sold * returnRatePercentage) / 100)
      );
      const return_rate = (total_returned / total_sold) * 100;

      const avg_rating = scenario?.avg_rating ?? product.avg_rating ?? (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
      const seededReviewCount = scenario?.reviews?.length || 0;
      const total_reviews = Math.max(seededReviewCount, Math.floor(Math.random() * 80) + 10);

      const query = `
        INSERT INTO products 
        (name, category, subcategory, price, brand, description, avg_rating, total_reviews, total_sold, total_returned, return_rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.query(query, [
        product.name,
        product.category,
        product.subcategory,
        product.price,
        product.brand,
        product.description,
        parseFloat(avg_rating),
        total_reviews,
        total_sold,
        total_returned,
        return_rate.toFixed(2)
      ]);
      const productId = result.insertId;

      if (scenario) {
        await insertSeedReviews(productId, scenario.reviews);
        await insertSeedReturns(productId, scenario.returns);
        await insertSeedTickets(productId, scenario.tickets);
      }

      insertedCount++;
    }
    console.log(`Seed complete. Inserted ${insertedCount} products, skipped ${skippedCount} existing products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error inserting products:', error);
    process.exit(1);
  }
}

seedNewProducts();
