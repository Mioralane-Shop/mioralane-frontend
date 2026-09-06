import { notFound } from "next/navigation";
import { ImageUploadTest } from "@/components/dev/image-upload-test";

export default function ImageUploadTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ImageUploadTest />;
}
