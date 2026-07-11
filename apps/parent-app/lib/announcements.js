// Shared announcements for the News list + details screens. Real data arrives
// via @nms/data; this mirrors the Figma sample content. Only room-targeted
// announcements are populated so the Nursery-wide tab shows the empty state.
const icon = require('../assets/home/photos/announcement-icon.png');
const detailImage = require('../assets/home/photos/event2.png');

const BODY =
  'Lorem ipsum dolor sit amet consectetur. Egestas sit enim ut orci amet ac pellentesque risus. Ante eget commodo ipsum enim accumsan adipiscing semper. Nisl duis vulputate orci consequat. Ac lorem sollicitudin amet gravida.';

export const ANN_ICON = icon;

export const ANNOUNCEMENTS = Array.from({ length: 4 }, (_, i) => ({
  id: String(i + 1),
  scope: 'room',
  title: 'New Update from the Classroom',
  preview: 'Your child’s class had a special activity today. Check out what the kids enjoyed and learned together!',
  date: 'Mar 30- 10:30 PM',
  body: BODY,
  image: detailImage,
}));

export const ANNOUNCEMENT_BY_ID = Object.fromEntries(ANNOUNCEMENTS.map((a) => [a.id, a]));
