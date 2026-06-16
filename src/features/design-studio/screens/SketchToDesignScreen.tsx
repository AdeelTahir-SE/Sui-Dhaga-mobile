import { DesignToolScreen } from "../components/DesignToolScreen";
import {
  sketchPreviewImages,
  sketchUploadImage,
} from "../constants/designStudioAssets";

export default function SketchToDesignScreen() {
  return (
    <DesignToolScreen
      title="Sketch to Design"
      uploadTitle="Upload Sketch"
      uploadedImage={sketchUploadImage}
      changeLabel="Change Sketch"
      promptLabel="Describe your design"
      promptValue="Add floral embroidery on yoke and border. Full sleeves."
      ctaLabel="Generate Design"
      previewImages={sketchPreviewImages}
    />
  );
}
