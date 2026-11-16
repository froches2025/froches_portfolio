import { Entrance } from "@/components/motion/entrance";
import { HomeLayout } from "@/components/public/home-layout";

// Shell only: step 4 adds the hero copy, sections and section nav.
export default function HomePage() {
  return (
    <HomeLayout
      intro={
        <Entrance>
          <h1 className="text-[60px] leading-[0.92] font-extrabold tracking-[-0.04em] lg:text-[88px] lg:leading-[0.9] lg:tracking-[-0.045em]">
            Favour Michael
          </h1>
        </Entrance>
      }
    />
  );
}
