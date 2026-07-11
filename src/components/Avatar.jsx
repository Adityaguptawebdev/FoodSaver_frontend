import { initials, avatarColor } from "../utils/gamification.js";

export default function Avatar({ name, size = 48 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-cream-50"
      style={{ width: size, height: size, backgroundColor: avatarColor(name), fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}
