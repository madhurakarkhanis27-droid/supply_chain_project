require('./load-env.js');
const db = require('./db');

const GENERIC_BROKEN_NOTE = 'It was broken when I opened the box. Poor quality.';
const GENERIC_CHEAP_NOTE = 'Materials feel very cheap and ripped easily.';

function getReturnTemplates(product) {
  const name = String(product.name || '').toLowerCase();
  const category = String(product.category || '').toLowerCase();

  if (name.includes('tire inflator')) {
    return [
      ['Product malfunction', 'Pressure gauge gives inaccurate readings and the nozzle leaks air during use.', 'sensor_inaccurate'],
      ['Build quality issue', 'The hose connector feels flimsy and the cable insulation started cracking quickly.', 'quality_poor'],
    ];
  }

  if (name.includes('bean bag')) {
    return [
      ['Quality issue', 'The inner seam opened and the filling started spilling out after light use.', 'quality_poor'],
      ['Defective stitching', 'Double stitching came apart near the zipper within the first week.', 'defective'],
    ];
  }

  if (name.includes('yoga block')) {
    return [
      ['Material issue', 'Foam compresses too easily and the edges crumble during basic poses.', 'material_quality'],
      ['Wrong density', 'Blocks feel much softer than advertised and do not provide stable support.', 'misleading_specs'],
    ];
  }

  if (name.includes('screwdriver')) {
    return [
      ['Defective product', 'Two screwdriver tips were already stripped and the handle loosened on first use.', 'defective'],
      ['Quality issue', 'Metal feels soft and the magnetic heads lose grip very quickly.', 'quality_poor'],
    ];
  }

  if (name.includes('sci-fi novel') || name.includes('cookbook') || name.includes('business strategy book') || name.includes('planner') || name.includes('notebook')) {
    return [
      ['Damaged delivery', 'Book arrived with bent corners, cover scratches, and pages folded from poor packaging.', 'shipping_damage'],
      ['Print quality issue', 'Paper is too thin and the print alignment is uneven on multiple pages.', 'quality_poor'],
    ];
  }

  if (name.includes('whiteboard')) {
    return [
      ['Not as described', 'Board surface leaves ghost marks after one wipe and the magnetic backing is weak.', 'misleading_specs'],
      ['Damaged delivery', 'Frame arrived dented on one corner and the writing surface had scratches.', 'shipping_damage'],
    ];
  }

  if (name.includes('watch')) {
    return [
      ['Sensor issue', 'Heart-rate and step tracking are clearly inaccurate during normal workouts.', 'sensor_inaccurate'],
      ['Software issue', 'The companion app keeps crashing and the watch fails to sync reliably.', 'software_issue'],
    ];
  }

  if (name.includes('earbuds') || name.includes('speaker')) {
    return [
      ['Connectivity issue', 'Bluetooth pairing drops frequently and one side disconnects at random.', 'connectivity_issue'],
      ['Not as described', 'Battery backup is far below the listing claim and call quality is inconsistent.', 'misleading_specs'],
    ];
  }

  if (name.includes('robot vacuum') || name.includes('vacuum')) {
    return [
      ['Software issue', 'App mapping fails repeatedly and the cleaner gets stuck after updates.', 'software_issue'],
      ['Not as expected', 'Suction strength is much lower than advertised and it misses fine dust.', 'misleading_specs'],
    ];
  }

  if (name.includes('jeans') || name.includes('blazer') || name.includes('shoes') || name.includes('t-shirt') || name.includes('saree')) {
    return [
      ['Wrong size', 'Fit is inconsistent with the size chart and the product feels tighter than expected.', 'size_mismatch'],
      ['Color mismatch', 'Actual shade looks noticeably different from the listing photos.', 'color_mismatch'],
    ];
  }

  if (name.includes('serum') || name.includes('gummies') || name.includes('protein')) {
    return [
      ['Safety concern', 'Product caused irritation/discomfort soon after use and did not feel safe to continue.', 'safety_concern'],
      ['Not as described', 'Texture, taste, or results do not match what the listing promised.', 'misleading_specs'],
    ];
  }

  if (name.includes('olive oil') || name.includes('green tea') || name.includes('mixed nuts')) {
    return [
      ['Damaged delivery', 'Packaging arrived crushed/leaking and some contents were spoiled in transit.', 'shipping_damage'],
      ['Quality issue', 'Product freshness and overall quality felt below what was advertised.', 'quality_poor'],
    ];
  }

  if (name.includes('chair') || name.includes('bookshelf') || name.includes('table') || name.includes('tv stand')) {
    return [
      ['Defective product', 'Assembly holes do not align properly and one part arrived cracked.', 'defective'],
      ['Quality issue', 'Finish scratches easily and the overall build feels weaker than expected.', 'quality_poor'],
    ];
  }

  if (name.includes('guitar') || name.includes('keyboard') || name.includes('ukulele') || name.includes('drumsticks') || name.includes('tuner')) {
    return [
      ['Defective product', 'Tuning/keys/components were not functioning correctly out of the box.', 'defective'],
      ['Quality issue', 'Materials and finish feel cheaper than expected for the price.', 'quality_poor'],
    ];
  }

  if (name.includes('pet feeder') || name.includes('water fountain')) {
    return [
      ['Product malfunction', 'Motor stops intermittently and dispensing flow is unreliable.', 'defective'],
      ['Safety concern', 'Plastic smell and exposed edges make it feel unsafe for pets.', 'safety_concern'],
    ];
  }

  if (name.includes('dog bed') || name.includes('cat tree') || name.includes('chew toys') || name.includes('teddy bear') || name.includes('action figure') || name.includes('blocks') || name.includes('board game') || name.includes('remote control car')) {
    return [
      ['Quality issue', 'Material wears out quickly and does not hold up to normal use.', 'quality_poor'],
      ['Not as described', 'Durability/features are below what the product listing suggests.', 'misleading_specs'],
    ];
  }

  if (name.includes('dumbbell') || name.includes('resistance bands') || name.includes('jump rope') || name.includes('water bottle')) {
    return [
      ['Quality issue', 'Grip/material quality degrades quickly with regular workouts.', 'quality_poor'],
      ['Not as described', 'Weight, resistance, or build quality does not match the listing details.', 'misleading_specs'],
    ];
  }

  if (name.includes('desk organizer') || name.includes('stapler') || name.includes('pens') || name.includes('sticky notes')) {
    return [
      ['Quality issue', 'Build quality is weaker than expected and parts bend or loosen easily.', 'quality_poor'],
      ['Not as described', 'Size/capacity/adhesion is below what the listing promised.', 'misleading_specs'],
    ];
  }

  if (name.includes('drill') || name.includes('hammer') || name.includes('toolkit') || name.includes('measuring tape')) {
    return [
      ['Defective product', 'Tool mechanism jams or slips during first use.', 'defective'],
      ['Quality issue', 'Metal and grip quality feel below standard for repeated use.', 'quality_poor'],
    ];
  }

  if (name.includes('dash camera') || name.includes('sun shade') || name.includes('car vacuum') || name.includes('polish')) {
    return [
      ['Not as described', 'Performance does not match the listing claims in actual car use.', 'misleading_specs'],
      ['Quality issue', 'Materials and finish feel subpar and wear out too quickly.', 'quality_poor'],
    ];
  }

  if (category === 'books') {
    return [
      ['Damaged delivery', 'Item arrived bent and scuffed because of weak outer packaging.', 'shipping_damage'],
      ['Quality issue', 'Paper/binding quality is lower than expected.', 'quality_poor'],
    ];
  }

  return [
    ['Defective product', 'Product did not function as expected when first used.', 'defective'],
    ['Quality issue', 'Overall material and finish quality felt below the listing promise.', 'quality_poor'],
  ];
}

async function normalizeGenericReturns() {
  try {
    const [rows] = await db.query(`
      SELECT r.id, r.return_reason, r.detailed_notes, p.name, p.category
      FROM returns r
      JOIN products p ON p.id = r.product_id
      WHERE r.detailed_notes IN (?, ?)
      ORDER BY p.name, r.id
    `, [GENERIC_BROKEN_NOTE, GENERIC_CHEAP_NOTE]);

    let updated = 0;

    for (const row of rows) {
      const [firstTemplate, secondTemplate] = getReturnTemplates(row);
      const replacement = row.detailed_notes === GENERIC_BROKEN_NOTE ? firstTemplate : secondTemplate;

      await db.query(
        `UPDATE returns
         SET return_reason = ?, detailed_notes = ?, ai_extracted_issue = ?
         WHERE id = ?`,
        [replacement[0], replacement[1], replacement[2], row.id]
      );
      updated++;
    }

    console.log(`Generic return normalization complete. Updated ${updated} rows.`);
    process.exit(0);
  } catch (error) {
    console.error('Normalization failed:', error);
    process.exit(1);
  }
}

normalizeGenericReturns();
