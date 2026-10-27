import {
  createOpenGraphImage,
  openGraphImageSize,
} from "@/components/seo/open-graph-image";

export const alt =
  "Fawredd Thoughts Assistant: organiza tus pensamientos con IA";
export const size = openGraphImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createOpenGraphImage("es");
}
