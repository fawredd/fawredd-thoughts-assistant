import {
  createOpenGraphImage,
  openGraphImageSize,
} from "@/components/seo/open-graph-image";

export const alt = "Fawredd Thoughts Assistant: organize your thoughts with AI";
export const size = openGraphImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return createOpenGraphImage("en");
}
