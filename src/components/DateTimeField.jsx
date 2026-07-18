import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateTimeField({ value, onChange, required }) {
  const selected = value ? new Date(value) : null;

  return (
    <DatePicker
      selected={selected}
      onChange={(date) => onChange(date ? date.toISOString() : "")}
      showTimeSelect
      timeIntervals={15}
      timeFormat="h:mm aa"
      dateFormat="MMM d, yyyy h:mm aa"
      minDate={new Date()}
      placeholderText="Select date and time"
      required={required}
      wrapperClassName="w-full"
      popperClassName="fs-datepicker-popper"
      calendarClassName="fs-datepicker"
      className="w-full rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none transition-colors focus:border-terracotta-500"
    />
  );
}
