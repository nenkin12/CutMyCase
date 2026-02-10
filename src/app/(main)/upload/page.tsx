import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UploadWizard } from "@/components/features/upload/upload-wizard";

export const metadata = {
  title: "Upload Your Gear | CutMyCase",
  description: "Upload a photo of your gear and get a custom foam insert designed with AI precision.",
};

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4">
        <UploadWizard />
      </main>

      <Footer />
    </div>
  );
}
