// Shared placeholder media, keyed by day-of-month. Real photos arrive via API;
// only the 21st is populated so the gallery demonstrates both the populated
// grid and the empty state as you tab across the week strip.
const media1 = require('../assets/home/photos/media1.png');
const media2 = require('../assets/home/photos/media2.png');
const event1 = require('../assets/home/photos/event1.png');

export const PHOTOS = [media1, media2, event1];

export const PHOTOS_BY_DAY = {
  21: PHOTOS,
};
