-- ============================================================
-- AI-POWERED RETURNS INTELLIGENCE SYSTEM
-- Seed Data (seed.sql)
-- ============================================================
-- This file fills our tables with REALISTIC sample data.
-- Run this AFTER schema.sql and AFTER the canonical product seed.
--
-- We intentionally create patterns so our AI can find them:
--   - Some products have high return rates (color mismatch, sizing)
--   - Some reviews are deliberately "fake" (repetitive, overly positive)
--   - Support tickets match return patterns
-- ============================================================

USE supply_chain;

-- ============================================================
-- USERS
-- Sample accounts for login
-- business01 / business123
-- customer01 / customer123
-- ============================================================
INSERT INTO users (login_id, display_name, role, password_hash, password_salt) VALUES
('business01', 'Operations Manager', 'business', 'c8725161b117774558069cf1e5fbcb2b12fb8e601067ccaad6b44fe4d782d11514bea8f35bc18fb99c51ad10ff5fb0aefe5cf8ffbe0b7efa1e29a6c0052d4573', 'business01-salt'),
('customer01', 'Priya Customer', 'customer', 'b86cf529d122b30437c2945e775a48bd3c0318efff2f51980655400c3242439f0f94d929261e033ed4e00eb8a2f1000adc8d9234f6aa162e0a51b32c7fd4d796', 'customer01-salt')
ON DUPLICATE KEY UPDATE
display_name = VALUES(display_name),
role = VALUES(role),
password_hash = VALUES(password_hash),
password_salt = VALUES(password_salt);

-- ============================================================
-- PRODUCTS
-- Canonical product data now lives in backend/products.json and is seeded
-- through backend/seed_products.js. Seed that catalog first so the sample
-- reviews, returns, and support tickets below attach to the expected IDs.
-- ============================================================

-- ============================================================
-- REVIEWS (200+ reviews)
-- Mix of real reviews and deliberately FAKE ones
-- The fake ones have patterns our AI will detect:
--   - Repetitive/generic language
--   - Overly promotional
--   - Mismatch between text and rating
-- ============================================================

-- ----- PRODUCT 1: ProMax Wireless Earbuds (high returns) -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(1, 'Rahul M.', 2, 'Sound quality is average at best. The bass they advertise is nowhere close to reality. Battery dies in 4-5 hours, not 24 as claimed. Returning this.', '2025-12-15', TRUE, 34),
(1, 'Priya S.', 1, 'One earbud stopped working within a week. Terrible quality control. The noise cancellation is basically non-existent. Complete waste of money.', '2025-12-20', TRUE, 45),
(1, 'Amit K.', 4, 'Decent earbuds for the price. Sound is good, not great. Battery lasts about 8-10 hours which is fine. Comfortable fit.', '2025-12-22', TRUE, 12),
(1, 'Sneha R.', 1, 'Received a defective piece. Left earbud has a buzzing sound. Charging case doesn''t close properly. Very disappointed.', '2026-01-02', TRUE, 38),
(1, 'Vikram D.', 3, 'Sound quality is okay for calls but music experience is poor. They feel cheap and plasticky. Expected more for this price.', '2026-01-10', TRUE, 15),
-- FAKE REVIEW for Product 1:
(1, 'Happy Customer', 5, 'Amazing product! Best earbuds ever! Must buy! Everyone should buy these amazing earbuds! 5 stars! Highly recommended! Best purchase ever!', '2026-01-05', FALSE, 2),
(1, 'Satisfied Buyer', 5, 'Wonderful product! Exceeded all expectations! Best in class! Amazing sound! Amazing battery! Amazing everything! Buy now!', '2026-01-06', FALSE, 1),
(1, 'Neha P.', 2, 'The earbuds keep disconnecting from my phone. Bluetooth connectivity is very poor. Had to return.', '2026-01-15', TRUE, 22),
(1, 'Arjun V.', 3, 'Average product. Nothing special about it. The marketing overpromises. Sound is mediocre.', '2026-01-18', TRUE, 8),
(1, 'Meera J.', 1, 'Worst earbuds I''ve ever used. Sound quality is terrible, fit is uncomfortable, and they fall out during exercise.', '2026-01-25', TRUE, 41);

-- ----- PRODUCT 3: SmartFit Watch Pro (highest returns in electronics) -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(3, 'Rohan S.', 1, 'Heart rate monitor is completely inaccurate. Shows 120 bpm while sitting idle. GPS tracking is way off. Returned immediately.', '2025-11-20', TRUE, 52),
(3, 'Kavita M.', 2, 'Watch face scratched within 3 days. Battery barely lasts 2 days, not 7 as advertised. Screen is hard to read in sunlight.', '2025-11-28', TRUE, 38),
(3, 'Suresh P.', 2, 'App keeps crashing. Step counter is inaccurate — shows 5000 steps when I''ve only walked 2000. Very unreliable.', '2025-12-05', TRUE, 44),
(3, 'Anita R.', 1, 'The strap broke after 2 weeks. Watch stopped syncing with phone. Customer support was unhelpful. Total waste.', '2025-12-12', TRUE, 56),
(3, 'Deepak K.', 3, 'Design looks nice but functionality is poor. Sleep tracking makes no sense — says I slept 3 hours when I slept 8.', '2025-12-18', TRUE, 25),
-- FAKE REVIEWS for Product 3:
(3, 'Best Product', 5, 'This is the best smartwatch in the market! Better than Apple Watch! Must buy immediately! You won''t regret it! Amazing amazing amazing!', '2025-12-08', FALSE, 0),
(3, 'Love It', 5, 'Perfect watch! Perfect features! Perfect battery! Perfect everything! Best watch ever made! Highly highly recommended!', '2025-12-09', FALSE, 1),
(3, 'Super Buyer', 5, 'Excellent product excellent quality excellent service. Must buy must buy must buy. Five stars deserved!', '2025-12-10', FALSE, 0),
(3, 'Manish T.', 2, 'Notifications don''t work properly. Watch vibration is too weak to feel. Display quality is average for this price.', '2026-01-02', TRUE, 18),
(3, 'Priyanka D.', 1, 'Returned within 24 hours. Heart rate sensor doesn''t work. Fake product with fake specs. Misleading advertisement.', '2026-01-08', TRUE, 61);

-- ----- PRODUCT 7: Premium Cotton T-Shirt (clothing — color mismatch issues) -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(7, 'Rajesh K.', 2, 'Color is completely different from what''s shown in the photo. I ordered navy blue but received something that looks grey-blue. Returning.', '2025-12-01', TRUE, 45),
(7, 'Sunita M.', 1, 'Fabric quality is not premium at all. Feels like cheap polyester, not cotton. Color faded after first wash. Do not buy.', '2025-12-08', TRUE, 52),
(7, 'Arun P.', 2, 'Size runs very small. I ordered XL but it fits like a medium. Had to return. Size chart is misleading.', '2025-12-15', TRUE, 38),
(7, 'Divya S.', 3, 'Okay quality but the color shown on screen vs actual product is very different. Maroon looks more like brown in real life.', '2025-12-22', TRUE, 28),
(7, 'Karan T.', 1, 'Stitching came apart after two wears. Thread quality is terrible. The t-shirt shrank significantly after washing.', '2026-01-05', TRUE, 42),
(7, 'Pooja R.', 2, 'The green color I ordered looks completely different in person — more of a muddy olive. Photos are clearly edited. Returning.', '2026-01-12', TRUE, 35),
(7, 'Nikhil B.', 4, 'Comfortable fit and decent fabric. But I agree with others that colors are slightly different from photos.', '2026-01-15', TRUE, 10),
-- FAKE REVIEWS for Product 7:
(7, 'Fashion Lover', 5, 'Best t-shirt ever! Amazing quality! Amazing color! Amazing fabric! Buy 10 of these! Best in India! Highly recommended!', '2026-01-08', FALSE, 1),
(7, 'Great Purchase', 5, 'Superb quality t-shirt! Color is exactly as shown! Perfect fit! Must buy for everyone! Five stars easily!', '2026-01-09', FALSE, 0),
(7, 'Rekha V.', 2, 'Material pills after a few washes. Not worth the "premium" label. Regular market t-shirts are better.', '2026-01-20', TRUE, 22);

-- ----- PRODUCT 8: Slim Fit Denim Jeans (highest return rate) -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(8, 'Rohit S.', 1, 'Size 32 fits like size 28. Extremely tight. The size chart on the website is completely wrong. Had to return immediately.', '2025-11-15', TRUE, 65),
(8, 'Anjali M.', 2, 'Material is stiff and uncomfortable. No stretch at all despite claiming "stretch fabric". Color bleeds when washed.', '2025-11-22', TRUE, 48),
(8, 'Sanjay P.', 1, 'Zipper broke on first use. Quality is terrible for this price. Looks nothing like the model in photos.', '2025-12-01', TRUE, 55),
(8, 'Meghna K.', 2, 'Waist fits fine but legs are too tight. The "slim fit" is more like "skinny fit". Very misleading description.', '2025-12-10', TRUE, 42),
(8, 'Vivek R.', 3, 'Decent look but fades very quickly. After 3 washes it looks like an old pair of jeans. Not durable.', '2025-12-18', TRUE, 30),
(8, 'Nisha T.', 1, 'Button popped off within hours. Returned immediately. The denim feels thin and cheap. Very poor quality.', '2026-01-02', TRUE, 58),
(8, 'Gaurav D.', 2, 'Length is shorter than what I ordered. 32 length feels like 30. Plus the color is darker than shown.', '2026-01-10', TRUE, 35),
-- FAKE REVIEW:
(8, 'Denim Fan', 5, 'Best jeans in India! Perfect fit! Perfect color! Must buy immediately! Amazing product! Will buy again and again!', '2025-12-05', FALSE, 0),
(8, 'Kunal A.', 2, 'Can''t even sit comfortably. Way too tight around thighs. Size chart needs serious correction.', '2026-01-20', TRUE, 40),
(8, 'Pallavi V.', 1, 'Seam ripped on the first day. Quality control is non-existent. This brand needs to fix their sizing ASAP.', '2026-01-28', TRUE, 47);

-- ----- PRODUCT 9: Running Shoes AirMax -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(9, 'Aditya S.', 2, 'Size 9 feels like size 8. Very tight and uncomfortable. The air cushion is hard, not soft as described.', '2025-12-05', TRUE, 35),
(9, 'Ritu M.', 3, 'Looks good but sole started peeling after a month. Not suitable for actual running, only casual wear.', '2025-12-15', TRUE, 28),
(9, 'Varun K.', 1, 'Color received is different from what I ordered. Asked for white/blue, got white/grey. Photos are misleading.', '2025-12-25', TRUE, 42),
(9, 'Swati P.', 4, 'Comfortable for daily wear. Looks stylish. But I wouldn''t use these for serious running — cushioning is basic.', '2026-01-05', TRUE, 12),
(9, 'Manoj R.', 2, 'Left shoe is slightly bigger than right shoe. Quality control issue. Had to return.', '2026-01-15', TRUE, 38),
(9, 'Buyer123', 5, 'Best shoes ever! Amazing quality! Amazing comfort! Must buy! Everyone should buy! Best in market!', '2026-01-08', FALSE, 0);

-- ----- PRODUCT 10: Formal Blazer Suit -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(10, 'Ashish M.', 2, 'Fit is very boxy, nothing like the "modern slim cut" shown. Shoulders are too wide. Had to return.', '2025-12-08', TRUE, 32),
(10, 'Lakshmi R.', 1, 'Color is dull charcoal, not the rich black shown in photos. Fabric feels like synthetic, not wool blend.', '2025-12-18', TRUE, 45),
(10, 'Pankaj S.', 3, 'Okay for the price but buttons feel cheap. Lining inside is poor quality. Not for formal events.', '2025-12-28', TRUE, 18),
(10, 'Shweta K.', 2, 'Sleeves are different lengths! Seriously, one is a full inch longer. How does this pass quality check?', '2026-01-08', TRUE, 55),
(10, 'Style Expert', 5, 'Perfect blazer! Best quality! Amazing fit! Just like Armani! Must buy for every man! Highly recommended!', '2026-01-02', FALSE, 1);

-- ----- PRODUCT 12: Silk Saree (highest return rate overall!) -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(12, 'Geeta P.', 1, 'This is NOT pure silk! It''s clearly polyester with a silk-like finish. I''ve worn real silk — this is fake. Complete fraud.', '2025-11-10', TRUE, 72),
(12, 'Madhuri S.', 2, 'Color in real life is nothing like the photo. Ordered magenta, received something close to pink. Zari work is dull.', '2025-11-20', TRUE, 58),
(12, 'Usha K.', 1, 'Received damaged product. Saree has pulls and loose threads. Pallu design is different from what was shown. Returning.', '2025-12-01', TRUE, 65),
(12, 'Radha M.', 2, 'Fabric feels rough, not smooth like real silk. Blouse piece is extremely low quality. Size of saree is shorter than 6 yards.', '2025-12-12', TRUE, 48),
(12, 'Jyoti V.', 3, 'Design is beautiful but material quality is questionable. For 5499 I expected genuine silk, this feels mixed.', '2025-12-22', TRUE, 35),
(12, 'Silk Lover', 5, 'Beautiful saree! Pure silk! Amazing zari! Best saree shop online! Must buy! Every woman should own this!', '2025-12-15', FALSE, 0),
(12, 'Best Saree', 5, 'Excellent quality! Best silk! Amazing design! Perfect for wedding! Must buy immediately! Highly recommended!', '2025-12-16', FALSE, 1),
(12, 'Annapurna R.', 1, 'Zari is peeling off after one dry clean. Color is bleeding. This is definitely not handwoven. False advertising.', '2026-01-05', TRUE, 60),
(12, 'Kalyani D.', 2, 'The embroidery work is uneven and patchy. Nothing close to the designer quality promised. Very overpriced for what you get.', '2026-01-15', TRUE, 42),
(12, 'Bhavna T.', 2, 'Packaging was poor — saree arrived wrinkled and had stains. Color is faded compared to website photos.', '2026-01-25', TRUE, 38);

-- ----- PRODUCT 14: Non-Stick Cookware Set -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(14, 'Sunita D.', 2, 'Non-stick coating started coming off after 2 months. Food sticks now. Handles get very hot despite claiming heat-resistant.', '2025-12-10', TRUE, 40),
(14, 'Ranjit K.', 3, 'Average quality. The pans are lighter than expected — feel flimsy. Non-stick works initially but deteriorates fast.', '2025-12-20', TRUE, 25),
(14, 'Kavitha M.', 1, 'Received only 4 pieces, not 5 as advertised. One pan had a dent. Very poor packaging and quality control.', '2026-01-02', TRUE, 48),
(14, 'Cook Master', 5, 'Best cookware set! Amazing quality! Non-stick is perfect! Must buy for every kitchen! Five stars!', '2025-12-25', FALSE, 0),
(14, 'Pradeep S.', 2, 'The coating releases chemical smell when heated. Doesn''t feel safe. Had to discard and return.', '2026-01-12', TRUE, 55);

-- ----- PRODUCT 17: Robot Vacuum Cleaner (high return rate) -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(17, 'Ajay R.', 1, 'Gets stuck under furniture constantly. Mapping feature doesn''t work — cleans random areas. Mopping barely wets the floor.', '2025-11-15', TRUE, 62),
(17, 'Sarita K.', 2, 'Suction power is very weak. Can''t pick up pet hair or crumbs properly. Battery dies in 30 minutes, not 120 as claimed.', '2025-11-25', TRUE, 55),
(17, 'Rakesh M.', 1, 'App is terrible — crashes constantly, loses connection. The robot bumps into walls and furniture hard. Left marks on my wall.', '2025-12-05', TRUE, 48),
(17, 'Lalita P.', 2, 'Scheduling feature never works. It starts cleaning at random times. Dustbin is tiny — needs emptying every room.', '2025-12-15', TRUE, 38),
(17, 'Smart Home Fan', 5, 'Best robot vacuum! Cleans perfectly! Better than Roomba! Must buy! Amazing technology! Life changing product!', '2025-12-10', FALSE, 0),
(17, 'Clean Freak', 5, 'Perfect cleaning! Absolutely amazing! Best purchase ever! Every home needs this! Five stars are not enough!', '2025-12-11', FALSE, 1),
(17, 'Vinod S.', 1, 'Returned within a week. It fell down the stairs because the sensors didn''t detect the edge. Dangerous product.', '2026-01-05', TRUE, 70),
(17, 'Deepa V.', 2, 'Noise level is very high — cannot use while sleeping or working. Cleaning quality is below average.', '2026-01-15', TRUE, 33);

-- ----- PRODUCT 19: Vitamin C Face Serum -----
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(19, 'Aarti S.', 2, 'Caused breakouts on my face within 3 days. The "for all skin types" claim is false. Returned immediately.', '2025-12-05', TRUE, 48),
(19, 'Poornima K.', 1, 'Product arrived already oxidized — dark orange color instead of clear. Obviously old stock. Ineffective.', '2025-12-15', TRUE, 55),
(19, 'Namita R.', 3, 'No visible results after 4 weeks of daily use. Maybe it works for some people but not for me.', '2025-12-25', TRUE, 22),
(19, 'Glow Queen', 5, 'Best serum ever! Amazing glow in 1 day! Must buy! Everyone will compliment you! Miracle product! Buy now!', '2025-12-20', FALSE, 0),
(19, 'Skin Expert', 5, 'Transformed my skin overnight! Best vitamin C in India! Must buy must buy must buy! Amazing results!', '2025-12-21', FALSE, 1),
(19, 'Tanvi M.', 2, 'Packaging leaked during delivery. Half the product was gone. Also has a strange chemical smell unlike real vitamin C serums.', '2026-01-10', TRUE, 38),
(19, 'Megha D.', 2, 'Caused redness and irritation even though I have normal skin. Ingredient list seems different from what''s on the website.', '2026-01-20', TRUE, 42);

-- Additional reviews for products with moderate issues
-- Product 2: UltraSlim Laptop
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(2, 'Sunil K.', 4, 'Good laptop for daily work. Fast boot time, nice keyboard. Screen could be brighter though.', '2025-12-10', TRUE, 18),
(2, 'Preeti M.', 3, 'Heats up quite a bit under load. Fan noise is noticeable. For basic use it''s fine, not for heavy tasks.', '2025-12-20', TRUE, 25),
(2, 'Ramesh T.', 5, 'Excellent value for money. Fast, lightweight, and battery lasts 6-7 hours. Very happy.', '2026-01-05', TRUE, 30),
(2, 'Techie', 5, 'Best laptop! Amazing performance! Best screen! Best keyboard! Must buy! Nothing comes close!', '2026-01-10', FALSE, 0),
(2, 'Anjali V.', 2, 'Laptop gets very hot within 30 minutes and the fan noise becomes loud. Battery life is nowhere close to the hours claimed on the listing.', '2026-01-14', TRUE, 21),
(2, 'Mohit R.', 2, 'The laptop freezes during video calls and the keyboard stopped working twice. Feels faulty for this price.', '2026-01-19', TRUE, 19),
(2, 'Sana P.', 1, 'Received a defective laptop. It overheats, shuts down suddenly, and sometimes does not turn on without charging again.', '2026-01-24', TRUE, 27);

-- Product 5: PowerBank
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(5, 'Mohit S.', 5, 'Charges my phone 4 times easily. Fast charging works great. Compact for 20000mAh.', '2025-12-08', TRUE, 22),
(5, 'Kriti P.', 4, 'Good product. Slightly heavy but expected for this capacity. LED indicators are helpful.', '2025-12-18', TRUE, 15),
(5, 'Ajit R.', 5, 'Best power bank I''ve owned. Reliable, fast, and built solid. Great for travel.', '2026-01-05', TRUE, 28);

-- Product 6: Smart Home Speaker
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(6, 'Neeraj M.', 3, 'Sound quality is good for music but voice commands are hit or miss. Often misunderstands Indian accents.', '2025-12-12', TRUE, 30),
(6, 'Savita K.', 2, 'Can''t connect to my smart devices half the time. WiFi drops constantly. Very frustrating for a "smart" speaker.', '2025-12-22', TRUE, 42),
(6, 'Tarun P.', 4, 'Bass is surprisingly good for this size. Setup was easy. Works well for playing music and setting alarms.', '2026-01-08', TRUE, 15),
(6, 'Smart Fan', 5, 'Best speaker ever! Better than Alexa! Better than Google! Must buy! Amazing smart home!', '2026-01-05', FALSE, 0);

-- Product 11: Winter Puffer Jacket
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(11, 'Vishal K.', 4, 'Very warm and comfortable. Keeps wind out effectively. Slightly bulky but expected for a puffer.', '2025-11-20', TRUE, 20),
(11, 'Shikha R.', 3, 'Decent jacket but zipper gets stuck sometimes. Color is slightly lighter than shown online.', '2025-12-05', TRUE, 15),
(11, 'Anand S.', 5, 'Survived -5°C in Shimla with just this jacket. Excellent quality and warmth. Worth every penny.', '2025-12-20', TRUE, 35);

-- Product 13: Leather Wallet
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(13, 'Jay M.', 5, 'Genuine leather, you can smell it. RFID blocking works. Slim profile fits in front pocket easily.', '2025-12-10', TRUE, 25),
(13, 'Ravi K.', 4, 'Good wallet. Stitching is neat. Card slots are a bit tight initially but loosen up with use.', '2025-12-25', TRUE, 18),
(13, 'Neeta S.', 4, 'Bought as a gift. Looks premium and feels expensive. Great packaging too.', '2026-01-08', TRUE, 12);

-- Product 15: Memory Foam Pillow
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(15, 'Ashok P.', 3, 'Comfortable but has a strong chemical smell initially. Takes about a week to air out. Cooling gel works.', '2025-12-15', TRUE, 22),
(15, 'Maya R.', 2, 'Too firm for me. Expected soft memory foam but this feels like sleeping on a brick. Returned.', '2025-12-28', TRUE, 35),
(15, 'Sachin T.', 4, 'Neck pain reduced significantly after using this. Takes getting used to but worth it.', '2026-01-10', TRUE, 28),
(15, 'Sleep Expert', 5, 'Best pillow ever! Cured all my problems! Must buy! Amazing comfort! Life changing!', '2026-01-05', FALSE, 0);

-- Product 16: LED Desk Lamp
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(16, 'Tushar M.', 5, 'Excellent lamp. Multiple brightness levels, warm/cool modes, and USB charging is super convenient.', '2025-12-20', TRUE, 15),
(16, 'Shalini K.', 4, 'Clean design, adjustable arm works smoothly. Touch controls are responsive. Great for study desk.', '2026-01-05', TRUE, 12);

-- Product 18: Air Purifier
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(18, 'Naresh D.', 4, 'Noticeable difference in air quality. Filter replacement is a bit expensive though. Good for pollution season.', '2025-12-10', TRUE, 20),
(18, 'Asha M.', 3, 'Works well for small rooms but struggles with 500 sq ft as claimed. Noise on high setting is annoying.', '2025-12-25', TRUE, 28),
(18, 'Siddharth R.', 4, 'Helped with my allergies. Sleep mode is very quiet. App control could be better.', '2026-01-08', TRUE, 18);

-- Product 20: Hair Dryer
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(20, 'Prerna S.', 4, 'Good heat settings, dries hair fast. Cord is a bit short. Ionic technology does reduce frizz.', '2025-12-15', TRUE, 15),
(20, 'Ritika M.', 3, 'Works fine but gets very hot on the body. Attachments feel cheap and don''t attach firmly.', '2025-12-28', TRUE, 22),
(20, 'Smita K.', 5, 'Salon-quality results at home. Lightweight, powerful, and love the cool shot button.', '2026-01-12', TRUE, 18);

-- Product 4: 4K Action Camera
INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(4, 'Nitin S.', 4, 'Great for adventure trips. Waterproof feature works well. 4K footage is sharp. Battery could be better.', '2025-12-12', TRUE, 22),
(4, 'Deepa R.', 3, 'Image stabilization is decent but not as smooth as GoPro. For the price, it''s acceptable.', '2025-12-28', TRUE, 18),
(4, 'Raj M.', 4, 'Used on a Goa trip — video quality impressed everyone. Night mode is weak though.', '2026-01-15', TRUE, 25);


-- ============================================================
-- RETURNS (80+ returns with realistic patterns)
-- ============================================================

-- Product 1: ProMax Wireless Earbuds (Sound/quality issues)
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(1, 'Rahul M.', '2025-12-18', 'Not as expected', 'Sound quality is nothing like advertised. Bass is weak. Battery life is way below 24 hours claim.', 2499.00, 'misleading_specs'),
(1, 'Priya S.', '2025-12-23', 'Defective product', 'Left earbud stopped working. No sound from left side. Charging case lid is loose.', 2499.00, 'defective'),
(1, 'Sneha R.', '2026-01-05', 'Defective product', 'Buzzing noise in left earbud. Charging case doesnt close properly.', 2499.00, 'defective'),
(1, 'Neha P.', '2026-01-18', 'Product malfunction', 'Bluetooth keeps disconnecting every few minutes. Cannot maintain stable connection.', 2499.00, 'connectivity_issue'),
(1, 'Customer A', '2026-01-20', 'Not satisfied', 'Noise cancellation is terrible. Can hear everything around me.', 2499.00, 'misleading_specs'),
(1, 'Customer B', '2026-01-22', 'Quality issue', 'Earbuds feel cheap and plasticky. Sound tinny and hollow.', 2499.00, 'quality_poor'),
(1, 'Customer C', '2026-01-25', 'Not as described', 'Battery lasts 5 hours max, not 24 as shown on listing.', 2499.00, 'misleading_specs'),
(1, 'Customer D', '2026-02-01', 'Defective product', 'One earbud charges, other doesnt. Defective charging case.', 2499.00, 'defective');

-- Product 3: SmartFit Watch Pro (Accuracy/reliability issues)
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(3, 'Rohan S.', '2025-11-23', 'Product malfunction', 'Heart rate sensor gives completely wrong readings. GPS is off by miles.', 3999.00, 'sensor_inaccurate'),
(3, 'Kavita M.', '2025-12-01', 'Quality issue', 'Screen scratched in 3 days. Battery lasts 2 days not 7. Poor screen visibility.', 3999.00, 'quality_poor'),
(3, 'Suresh P.', '2025-12-08', 'Not as expected', 'Step counter shows double the actual steps. Sleep tracking is nonsensical.', 3999.00, 'sensor_inaccurate'),
(3, 'Anita R.', '2025-12-15', 'Defective product', 'Strap broke. Watch wont sync anymore. Customer support gave no solution.', 3999.00, 'defective'),
(3, 'Priyanka D.', '2026-01-09', 'Fake product', 'Heart rate sensor doesnt work at all. Specs are completely fabricated.', 3999.00, 'misleading_specs'),
(3, 'Customer E', '2026-01-12', 'Not as described', 'Battery 2 days max, advertised 7 days. Fitness tracking unreliable.', 3999.00, 'misleading_specs'),
(3, 'Customer F', '2026-01-15', 'App issues', 'Companion app crashes constantly. Cannot view any data.', 3999.00, 'software_issue'),
(3, 'Customer G', '2026-01-18', 'Not satisfied', 'Display too dim. Touch response slow. Notification sync broken.', 3999.00, 'quality_poor'),
(3, 'Customer H', '2026-01-22', 'Quality issue', 'Watch face cracked without any impact. Very fragile build.', 3999.00, 'defective'),
(3, 'Customer I', '2026-01-28', 'Not as expected', 'GPS tracking wildly inaccurate. Shows wrong location and distance.', 3999.00, 'sensor_inaccurate');

-- Product 7: Premium Cotton T-Shirt (Color/size mismatch)
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(7, 'Rajesh K.', '2025-12-04', 'Color mismatch', 'Navy blue looks grey-blue in real life. Color on website is heavily edited.', 799.00, 'color_mismatch'),
(7, 'Sunita M.', '2025-12-11', 'Quality issue', 'Not cotton, feels like polyester. Color faded in first wash.', 799.00, 'material_quality'),
(7, 'Arun P.', '2025-12-18', 'Wrong size', 'XL fits like medium. Size chart completely wrong.', 799.00, 'size_mismatch'),
(7, 'Divya S.', '2025-12-25', 'Color mismatch', 'Maroon appears brown in reality. Photo editing misleading.', 799.00, 'color_mismatch'),
(7, 'Karan T.', '2026-01-08', 'Quality issue', 'Stitching tore after 2 wears. Thread quality terrible. Shrank after wash.', 799.00, 'quality_poor'),
(7, 'Pooja R.', '2026-01-15', 'Color mismatch', 'Green looks like dirty olive in person. Website photos are fake.', 799.00, 'color_mismatch'),
(7, 'Customer J', '2026-01-18', 'Wrong size', 'Large fits like small. Completely wrong sizing.', 799.00, 'size_mismatch'),
(7, 'Customer K', '2026-01-22', 'Color mismatch', 'Red looks more like brick orange. Very different from listing.', 799.00, 'color_mismatch'),
(7, 'Customer L', '2026-01-25', 'Not as expected', 'Fabric pills immediately, cheap quality.', 799.00, 'material_quality'),
(7, 'Customer M', '2026-02-01', 'Color mismatch', 'White has yellowish tinge, not pure white.', 799.00, 'color_mismatch');

-- Product 8: Slim Fit Denim Jeans (Size issues — highest return rate)
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(8, 'Rohit S.', '2025-11-18', 'Wrong size', 'Size 32 feels like 28. Impossible to button. Size chart is fiction.', 1899.00, 'size_mismatch'),
(8, 'Anjali M.', '2025-11-25', 'Quality issue', 'No stretch at all. Stiff material. Color bleeds.', 1899.00, 'material_quality'),
(8, 'Sanjay P.', '2025-12-04', 'Defective product', 'Zipper broke day one. Looks nothing like photos.', 1899.00, 'defective'),
(8, 'Meghna K.', '2025-12-13', 'Wrong fit', 'Waist fine but legs too tight. Misleading slim fit description.', 1899.00, 'size_mismatch'),
(8, 'Nisha T.', '2026-01-05', 'Defective product', 'Button popped off in hours. Thin cheap denim.', 1899.00, 'defective'),
(8, 'Gaurav D.', '2026-01-13', 'Wrong size', 'Length shorter than ordered. 32 length = 30 actual. Color darker than shown.', 1899.00, 'size_mismatch'),
(8, 'Kunal A.', '2026-01-23', 'Wrong fit', 'Too tight around thighs. Cannot sit comfortably.', 1899.00, 'size_mismatch'),
(8, 'Pallavi V.', '2026-01-30', 'Quality issue', 'Seam ripped first day. Zero quality control.', 1899.00, 'quality_poor'),
(8, 'Customer N', '2026-02-02', 'Wrong size', 'Ordered 34, feels like 31. Size chart is wrong.', 1899.00, 'size_mismatch'),
(8, 'Customer O', '2026-02-05', 'Color mismatch', 'Dark wash looks washed out grey in reality.', 1899.00, 'color_mismatch');

-- Product 9: Running Shoes AirMax
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(9, 'Aditya S.', '2025-12-08', 'Wrong size', 'Size 9 fits like 8. Too tight. Air cushion hard, not soft.', 3499.00, 'size_mismatch'),
(9, 'Varun K.', '2025-12-28', 'Color mismatch', 'Ordered white/blue, got white/grey. Photos misleading.', 3499.00, 'color_mismatch'),
(9, 'Manoj R.', '2026-01-18', 'Defective product', 'Left shoe bigger than right. Manufacturing defect.', 3499.00, 'defective'),
(9, 'Customer P', '2026-01-22', 'Not as expected', 'Sole too hard. Not comfortable for running.', 3499.00, 'quality_poor'),
(9, 'Customer Q', '2026-01-28', 'Wrong size', 'Runs one size small. Had to return.', 3499.00, 'size_mismatch');

-- Product 10: Formal Blazer
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(10, 'Ashish M.', '2025-12-11', 'Wrong fit', 'Very boxy, not slim cut. Shoulders too wide.', 4999.00, 'size_mismatch'),
(10, 'Lakshmi R.', '2025-12-21', 'Color mismatch', 'Dull charcoal not rich black. Fabric feels synthetic.', 4999.00, 'color_mismatch'),
(10, 'Shweta K.', '2026-01-11', 'Defective product', 'Sleeves are different lengths! One inch difference.', 4999.00, 'defective'),
(10, 'Customer R', '2026-01-18', 'Wrong fit', 'Too tight in chest despite ordering correct size.', 4999.00, 'size_mismatch'),
(10, 'Customer S', '2026-01-25', 'Not as expected', 'Cheap buttons, poor lining inside. Not formal quality.', 4999.00, 'quality_poor');

-- Product 12: Silk Saree (highest return rate!)
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(12, 'Geeta P.', '2025-11-13', 'Fake product', 'Not pure silk. Clearly polyester with silk finish. Fraud.', 5499.00, 'material_quality'),
(12, 'Madhuri S.', '2025-11-23', 'Color mismatch', 'Ordered magenta, received pink. Zari work is dull.', 5499.00, 'color_mismatch'),
(12, 'Usha K.', '2025-12-04', 'Damaged product', 'Saree has pulls and loose threads. Pallu design different from photo.', 5499.00, 'defective'),
(12, 'Radha M.', '2025-12-15', 'Quality issue', 'Rough fabric, not soft silk. Bad blouse piece. Shorter than 6 yards.', 5499.00, 'material_quality'),
(12, 'Annapurna R.', '2026-01-08', 'Quality issue', 'Zari peeling off after dry clean. Color bleeding.', 5499.00, 'quality_poor'),
(12, 'Kalyani D.', '2026-01-18', 'Not as expected', 'Uneven embroidery. Not designer quality. Overpriced.', 5499.00, 'quality_poor'),
(12, 'Bhavna T.', '2026-01-28', 'Damaged in transit', 'Arrived wrinkled with stains. Color faded vs website.', 5499.00, 'shipping_damage'),
(12, 'Customer T', '2026-02-01', 'Fake product', 'Not real silk. Burns test proves polyester. Scam.', 5499.00, 'material_quality'),
(12, 'Customer U', '2026-02-05', 'Color mismatch', 'Royal blue looks navy. Completely wrong shade.', 5499.00, 'color_mismatch'),
(12, 'Customer V', '2026-02-08', 'Not as expected', 'Photos heavily edited. Actual product looks cheap.', 5499.00, 'misleading_specs');

-- Product 14: Non-Stick Cookware
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(14, 'Sunita D.', '2025-12-13', 'Quality issue', 'Non-stick coating coming off in 2 months. Handles get hot.', 3999.00, 'quality_poor'),
(14, 'Kavitha M.', '2026-01-05', 'Incomplete/wrong', 'Only 4 pieces received, not 5. One pan dented.', 3999.00, 'shipping_damage'),
(14, 'Pradeep S.', '2026-01-15', 'Safety concern', 'Chemical smell when heated. Doesnt feel safe to cook.', 3999.00, 'safety_concern'),
(14, 'Customer W', '2026-01-20', 'Quality issue', 'Coating scratches easily. Pan warped after first use.', 3999.00, 'quality_poor');

-- Product 17: Robot Vacuum Cleaner  
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(17, 'Ajay R.', '2025-11-18', 'Not as expected', 'Gets stuck everywhere. Mapping broken. Mopping useless.', 12999.00, 'misleading_specs'),
(17, 'Sarita K.', '2025-11-28', 'Product malfunction', 'Weak suction. Cant pick up hair. Battery 30 min not 120.', 12999.00, 'misleading_specs'),
(17, 'Rakesh M.', '2025-12-08', 'Product malfunction', 'App crashes. Robot damages walls and furniture.', 12999.00, 'software_issue'),
(17, 'Lalita P.', '2025-12-18', 'Not as expected', 'Scheduling broken. Starts randomly. Tiny dustbin.', 12999.00, 'software_issue'),
(17, 'Vinod S.', '2026-01-08', 'Safety concern', 'Robot fell down stairs. Sensors didnt detect edge. Dangerous!', 12999.00, 'safety_concern'),
(17, 'Deepa V.', '2026-01-18', 'Not satisfied', 'Too noisy. Cleaning is below average. Not worth 13000.', 12999.00, 'quality_poor');

-- Product 19: Vitamin C Serum
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(19, 'Aarti S.', '2025-12-08', 'Adverse reaction', 'Caused breakouts and irritation. Not for all skin types as claimed.', 699.00, 'safety_concern'),
(19, 'Poornima K.', '2025-12-18', 'Expired/old product', 'Already oxidized dark orange. Old stock. Useless.', 699.00, 'quality_poor'),
(19, 'Tanvi M.', '2026-01-13', 'Damaged in transit', 'Packaging leaked. Half product gone. Chemical smell.', 699.00, 'shipping_damage'),
(19, 'Megha D.', '2026-01-23', 'Adverse reaction', 'Redness and irritation on normal skin. Wrong ingredients.', 699.00, 'safety_concern'),
(19, 'Customer X', '2026-01-28', 'Not as expected', 'No results after month of use. Feels like water.', 699.00, 'misleading_specs');

-- A few returns for medium-return products
INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(2, 'Preeti M.', '2025-12-28', 'Not as expected', 'Overheats during regular tasks. Not powerful enough.', 54999.00, 'quality_poor'),
(2, 'Anjali V.', '2026-01-17', 'Not as described', 'Battery life is far below the hours claimed. Laptop gets hot quickly and loud fan noise starts during normal work.', 54999.00, 'misleading_specs'),
(2, 'Mohit R.', '2026-01-22', 'Defective product', 'Keyboard stopped working, laptop froze repeatedly, and the device feels faulty during normal office use.', 54999.00, 'defective'),
(2, 'Sana P.', '2026-01-26', 'Defective product', 'Laptop overheats, shuts down suddenly, and sometimes wont turn on. Seems like a manufacturing defect.', 54999.00, 'defective'),
(6, 'Savita K.', '2025-12-28', 'Product malfunction', 'WiFi drops, cant connect to smart devices. Very buggy.', 4499.00, 'connectivity_issue'),
(6, 'Customer Y', '2026-01-15', 'Not as expected', 'Doesnt understand Indian accents. Smart features unreliable.', 4499.00, 'software_issue'),
(15, 'Maya R.', '2025-12-30', 'Not comfortable', 'Too firm. Like sleeping on a brick. Not memory foam feel.', 1499.00, 'misleading_specs'),
(11, 'Customer Z', '2025-12-15', 'Color mismatch', 'Color lighter than shown online.', 2999.00, 'color_mismatch');


-- ============================================================
-- CUSTOMER SUPPORT TICKETS
-- These supplement the return/review data
-- ============================================================
INSERT INTO customer_support_tickets (product_id, customer_name, issue_type, message, resolution, ticket_date, status) VALUES
-- Product 1: Earbuds
(1, 'Rahul M.', 'Quality', 'Sound quality nothing like advertised. False claims about bass and battery. Want full refund.', 'Refund processed', '2025-12-16', 'resolved'),
(1, 'Priya S.', 'Defective', 'One earbud dead within a week. This is unacceptable quality. Need replacement or refund.', 'Replacement sent', '2025-12-21', 'resolved'),
(1, 'Vikram D.', 'Complaint', 'Product feels very cheap for 2500 rupees. Marketing is misleading. Others should be warned.', 'Feedback noted', '2026-01-11', 'closed'),

-- Product 3: Smartwatch
(3, 'Rohan S.', 'Technical', 'Heart rate shows 120bpm while sitting. GPS distance off by 40%. Features dont work.', 'Refund processed', '2025-11-21', 'resolved'),
(3, 'Anita R.', 'Defective', 'Strap broke and watch wont sync. I called 3 times — nobody helped properly.', 'Refund + apology', '2025-12-13', 'resolved'),
(3, 'Deepak K.', 'Complaint', 'Sleep tracking shows I slept 3 hours when I slept 8. Completely useless fitness tracker.', 'Firmware update suggested', '2025-12-19', 'closed'),
(3, 'Priyanka D.', 'Fraud Report', 'Heart rate sensor does NOT work. Your product specs are fabricated. This is fraud.', 'Full refund', '2026-01-09', 'resolved'),

-- Product 2: UltraSlim Laptop
(2, 'Anjali V.', 'Performance', 'Laptop gets very hot during Excel and browser use. Fan noise is loud and the battery life is much lower than advertised.', 'Refund approved', '2026-01-16', 'resolved'),
(2, 'Mohit R.', 'Defective', 'Keyboard stopped working twice and the laptop froze during meetings. This unit feels faulty.', 'Replacement offered', '2026-01-21', 'resolved'),
(2, 'Sana P.', 'Technical', 'Device overheats, shuts down on its own, and sometimes does not turn on. Please investigate this manufacturing defect.', 'Full refund', '2026-01-25', 'resolved'),

-- Product 7: T-Shirt color issues
(7, 'Rajesh K.', 'Color Issue', 'Color of t-shirt is completely different from the photo. This is false advertising.', 'Return accepted', '2025-12-03', 'resolved'),
(7, 'Pooja R.', 'Color Issue', 'Third time ordering from you — every time color is different from photo. Fix your listings!', 'Refund processed', '2026-01-13', 'resolved'),

-- Product 8: Jeans sizing
(8, 'Rohit S.', 'Size Issue', 'Your size chart is completely wrong. 32 fits like 28. Multiple customers complaining.', 'Return accepted', '2025-11-16', 'resolved'),
(8, 'Nisha T.', 'Defective', 'Button popped off within hours. Is there no quality check before shipping?', 'Refund + 10% discount', '2026-01-03', 'resolved'),
(8, 'Pallavi V.', 'Quality', 'Seam ripped on day one. This is the worst quality denim I have ever seen.', 'Full refund', '2026-01-29', 'resolved'),

-- Product 12: Silk Saree
(12, 'Geeta P.', 'Fraud Report', 'This is NOT silk. I tested it with burn test — its polyester! You are cheating customers.', 'Full refund + investigation', '2025-11-11', 'resolved'),
(12, 'Usha K.', 'Damaged', 'Saree arrived with pulls, loose threads, and the pallu design is different from listing photo.', 'Replacement offered', '2025-12-02', 'resolved'),
(12, 'Annapurna R.', 'Quality', 'Zari work peeling after dry cleaning. If this was real silk, zari would not peel. Fake product.', 'Refund processed', '2026-01-06', 'resolved'),

-- Product 17: Robot Vacuum
(17, 'Ajay R.', 'Technical', 'Vacuum gets stuck 10 times per cleaning session. Mapping is useless. Mopping leaves floor wet.', 'Return accepted', '2025-11-16', 'resolved'),
(17, 'Rakesh M.', 'App Issue', 'Your app crashes every 2 minutes. Robot bumps into everything and left marks on walls.', 'Firmware fix pending', '2025-12-06', 'in_progress'),
(17, 'Vinod S.', 'Safety', 'Robot FELL DOWN STAIRS — it could have hurt someone! Edge sensors are defective. Safety hazard!', 'Full refund + escalation', '2026-01-06', 'resolved'),

-- Product 19: Serum
(19, 'Aarti S.', 'Health Concern', 'Your serum caused painful breakouts on my face. Claim of "all skin types" is dangerous and false.', 'Refund + medical costs', '2025-12-06', 'resolved'),
(19, 'Poornima K.', 'Expired Product', 'Product arrived oxidized (dark orange). This serum is old/expired. Selling expired products is illegal.', 'Full refund', '2025-12-16', 'resolved');

-- ============================================================
-- DATA EXPANSION FOR STRONGER DASHBOARD METRICS
-- Adds more realistic activity so charts and KPIs look richer
-- ============================================================

UPDATE products
SET total_sold = total_sold + 1200,
    total_returned = total_returned + 144,
    total_reviews = total_reviews + 12,
    avg_rating = 3.80,
    return_rate = ROUND(((total_returned + 144) / (total_sold + 1200)) * 100, 2)
WHERE id = 2;

UPDATE products
SET total_sold = total_sold + 600,
    total_returned = total_returned + 96,
    total_reviews = total_reviews + 14,
    avg_rating = 2.70,
    return_rate = ROUND(((total_returned + 96) / (total_sold + 600)) * 100, 2)
WHERE id = 3;

UPDATE products
SET total_sold = total_sold + 900,
    total_returned = total_returned + 198,
    total_reviews = total_reviews + 16,
    avg_rating = 2.90,
    return_rate = ROUND(((total_returned + 198) / (total_sold + 900)) * 100, 2)
WHERE id = 7;

UPDATE products
SET total_sold = total_sold + 700,
    total_returned = total_returned + 210,
    total_reviews = total_reviews + 16,
    avg_rating = 2.70,
    return_rate = ROUND(((total_returned + 210) / (total_sold + 700)) * 100, 2)
WHERE id = 8;

UPDATE products
SET total_sold = total_sold + 450,
    total_returned = total_returned + 170,
    total_reviews = total_reviews + 14,
    avg_rating = 2.60,
    return_rate = ROUND(((total_returned + 170) / (total_sold + 450)) * 100, 2)
WHERE id = 12;

UPDATE products
SET total_sold = total_sold + 200,
    total_returned = total_returned + 80,
    total_reviews = total_reviews + 12,
    avg_rating = 2.50,
    return_rate = ROUND(((total_returned + 80) / (total_sold + 200)) * 100, 2)
WHERE id = 17;

UPDATE products
SET total_sold = total_sold + 500,
    total_returned = total_returned + 110,
    total_reviews = total_reviews + 12,
    avg_rating = 3.20,
    return_rate = ROUND(((total_returned + 110) / (total_sold + 500)) * 100, 2)
WHERE id = 19;

INSERT INTO reviews (product_id, customer_name, rating, review_text, review_date, verified_purchase, helpful_votes) VALUES
(2, 'Harsh K.', 2, 'Battery drains too quickly and the laptop gets hot during simple browser work. Fan noise becomes distracting.', '2026-02-02', TRUE, 14),
(2, 'Laptop Guru', 5, 'Best laptop ever! Amazing battery! Amazing speed! Must buy immediately! Perfect for everyone!', '2026-02-03', FALSE, 0),
(7, 'Meena D.', 1, 'Color is nothing like the photo and the fabric feels cheap. It also shrank badly after one wash.', '2026-02-04', TRUE, 24),
(7, 'Tee Lover', 5, 'Perfect t-shirt! Amazing color! Amazing fit! Must buy for the whole family! Best quality!', '2026-02-05', FALSE, 0),
(8, 'Harpreet S.', 1, 'Size chart is useless. Waist is too tight, length is too short, and the denim feels rough.', '2026-02-06', TRUE, 31),
(8, 'Denim Star', 5, 'Best jeans ever! Perfect fit! Amazing quality! Buy now buy now buy now!', '2026-02-07', FALSE, 0),
(12, 'Shobha N.', 1, 'This saree is not pure silk. The color is wrong, zari work is dull, and fabric feels synthetic.', '2026-02-08', TRUE, 29),
(12, 'Wedding Queen', 5, 'Amazing saree! Best silk! Best design! Every bride should buy this! Highly recommended!', '2026-02-09', FALSE, 1),
(17, 'Renu T.', 1, 'Robot keeps hitting walls, gets stuck under sofa, and the app crashes. Cleaning quality is very poor.', '2026-02-10', TRUE, 26),
(17, 'Home Tech Fan', 5, 'Best vacuum ever! Amazing cleaning! Perfect mapping! Must buy now!', '2026-02-11', FALSE, 0),
(19, 'Sonal R.', 2, 'Caused irritation and redness. Bottle also looked partly oxidized on arrival.', '2026-02-12', TRUE, 23),
(19, 'Glow Lover', 5, 'Miracle serum! Best glow ever! Must buy! Amazing amazing amazing results!', '2026-02-13', FALSE, 0);

INSERT INTO returns (product_id, customer_name, return_date, return_reason, detailed_notes, refund_amount, ai_extracted_issue) VALUES
(2, 'Harsh K.', '2026-02-05', 'Not as expected', 'Battery life much lower than advertised and the laptop gets hot with loud fan noise during normal work.', 54999.00, 'misleading_specs'),
(7, 'Meena D.', '2026-02-06', 'Color mismatch', 'Color is different from the photo and fabric shrank after one wash. Looks cheap in person.', 799.00, 'color_mismatch'),
(8, 'Harpreet S.', '2026-02-08', 'Wrong size', 'Waist too tight, length too short, and the fit is nothing like the size chart.', 1899.00, 'size_mismatch'),
(12, 'Shobha N.', '2026-02-10', 'Fake product', 'Not real silk. Fabric feels synthetic and the zari quality is poor.', 5499.00, 'material_quality'),
(17, 'Renu T.', '2026-02-12', 'Product malfunction', 'Robot gets stuck, app crashes, and mapping does not work properly.', 12999.00, 'software_issue'),
(19, 'Sonal R.', '2026-02-14', 'Adverse reaction', 'Serum caused irritation and redness and looked oxidized on opening.', 699.00, 'safety_concern');

INSERT INTO customer_support_tickets (product_id, customer_name, issue_type, message, resolution, ticket_date, status) VALUES
(2, 'Harsh K.', 'Performance', 'Battery backup is far below claim and the laptop overheats during browser and spreadsheet use.', 'Refund approved', '2026-02-04', 'resolved'),
(7, 'Meena D.', 'Color Issue', 'Actual t-shirt color is different from the listing photo and the material quality is poor.', 'Refund processed', '2026-02-05', 'resolved'),
(8, 'Harpreet S.', 'Size Issue', 'Jeans size chart is incorrect. Waist and length both feel much smaller than ordered.', 'Return accepted', '2026-02-07', 'resolved'),
(12, 'Shobha N.', 'Fraud Report', 'This saree is being sold as pure silk but the material feels synthetic and low quality.', 'Full refund', '2026-02-09', 'resolved'),
(17, 'Renu T.', 'Technical', 'Robot vacuum app crashes and the device keeps getting stuck under furniture.', 'Refund approved', '2026-02-11', 'resolved'),
(19, 'Sonal R.', 'Health Concern', 'Serum caused redness and skin irritation after first use. Product may not be safe for sensitive skin.', 'Refund issued', '2026-02-13', 'resolved');
