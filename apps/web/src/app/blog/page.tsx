import type { Metadata } from "next";
import BlogList from "@/components/BlogList";

export const metadata: Metadata = {
  title: "Reiseblog",
  description: "Der Reiseblog von quer-durch-asien.de: Vorbereitung, Berichte von unterwegs aus Russland, der Mongolei, China, Tibet, Nepal und Indien, und was danach kam.",
};

export default function BlogIndex() {
  return <BlogList page={1} />;
}
