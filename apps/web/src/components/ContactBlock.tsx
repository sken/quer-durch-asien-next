import { contactLines } from "@/lib/contact";

/** Name, postal address and e-mail of the site owner (from the IMPRESSUM build variable). */
export default function ContactBlock() {
  return (
    <address className="contact-block">
      {contactLines().map((line, i) => (
        <span key={i}>{line}<br /></span>
      ))}
    </address>
  );
}
