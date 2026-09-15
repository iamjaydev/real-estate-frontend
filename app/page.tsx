import GoogleMap from "@/components/map/GoogleMap";
import RealEstateAssistant from "@/components/assistant/RealEstateAssistant";

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <GoogleMap />
      <RealEstateAssistant />
    </main>
  );
}