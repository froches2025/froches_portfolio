import { getProfile } from "@/lib/content/queries";
import { DEFAULT_SHARE_IMAGE } from "@/lib/og/constants";
import {
  renderShareImage,
  SHARE_IMAGE_SIZE,
  SHARE_IMAGE_TYPE,
} from "@/lib/og/render";

// The site's default share image (FR-10.3), prerendered from the cached profile.
export const alt = DEFAULT_SHARE_IMAGE.alt;
export const size = SHARE_IMAGE_SIZE;
export const contentType = SHARE_IMAGE_TYPE;

export default async function Image() {
  const profile = await getProfile();
  return renderShareImage({
    title: profile.full_name,
    subtitle: [profile.headline, profile.location].filter(Boolean).join(", "),
  });
}
