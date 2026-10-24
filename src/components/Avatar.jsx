import { initials, avatarColor } from "../utils/gamification.js";

export default function Avatar({ name, src, size = 48 }) {
  if (src) {
    return (
      // no-referrer: Google profile photos can refuse requests that carry a referrer
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-cream-50"
      style={{ width: size, height: size, backgroundColor: avatarColor(name), fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}
