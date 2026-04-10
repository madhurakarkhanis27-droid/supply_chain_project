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

async function seedNewProducts() {
  try {
    for (const product of newProducts) {
      // Adding somewhat randomized stats so it looks real
      const total_sold = Math.floor(Math.random() * 800) + 100;
      // return rate between 2% and 15% unless specified
      const returnRatePercentage = product.return_rate || (Math.floor(Math.random() * 13) + 2);
      const total_returned = Math.floor((total_sold * returnRatePercentage) / 100);
      const return_rate = (total_returned / total_sold) * 100;

      const avg_rating = product.avg_rating || (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
      const total_reviews = Math.floor(Math.random() * 80) + 10;

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

      // Force realistic issue data for the Bean Bag Chair so the AI Root Cause engine activates!
      if (product.name === 'Bean Bag Chair' && product.brand === 'LoungePlus') {
        const badReview1 = `INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES (?, 'Amit S.', 2, 'The stitching tore open after just a week! Poor quality material and flimsy.', '2026-03-01', TRUE, 12)`;
        const badReview2 = `INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES (?, 'Priya D.', 1, 'Very flimsy and broke easily. The quality is terrible and thread comes off.', '2026-03-10', TRUE, 8)`;
        const badReturn1 = `INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES (?, 'Rahul K.', '2026-03-15', 'Quality issue', 'The seam ripped and beans spilled everywhere. Very poor quality.', 1299.00, 'quality_poor')`;
        const badReturn2 = `INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES (?, 'Sneha M.', '2026-03-20', 'Defective', 'It fell apart at the seams. Terrible quality stitching.', 1299.00, 'quality_poor')`;
        
        await pool.query(badReview1, [productId]);
        await pool.query(badReview2, [productId]);
        await pool.query(badReturn1, [productId]);
        await pool.query(badReturn2, [productId]);
      }
    }
    console.log('Successfully inserted 50 new products!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting products:', error);
    process.exit(1);
  }
}

seedNewProducts();
