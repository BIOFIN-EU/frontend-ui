import { PageBackdrop } from "@/components/PageBackdrop";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeTiles } from "@/components/home/HomeTiles";
import { photoCredits } from "@/lib/photo-credits";
import bertraghboyBay from "../../public/images/bertraghboy-bay.jpg";

export default function HomePage() {
  return (
    <div className="relative isolate">
      <PageBackdrop
        image={bertraghboyBay}
        credit={photoCredits.bertraghboyBay}
        heightClassName="h-[640px] sm:h-[620px] lg:h-[600px]"
        objectPositionClassName="object-[65%_45%]"
        scrim="left"
      />

      <div className="mx-auto max-w-7xl space-y-10 px-0 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
        <HomeHero />
        <HomeTiles />
        <HomeIntro />
      </div>
    </div>
  );
}
