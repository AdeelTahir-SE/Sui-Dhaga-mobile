import { DesignToolScreen } from "../components/DesignToolScreen";
import {
  imageDesignImage,
  sketchDesignImage,
  textDesignImage,
} from "../constants/designStudioAssets";

export default function SketchToDesignScreen() {
  return (
    <DesignToolScreen
      title="Sketch to Design"
      uploadTitle="Upload Sketch"
      uploadedImage={sketchDesignImage}
      changeLabel="Change Sketch"
      promptLabel="Describe your design"
      promptValue="Add floral embroidery on yoke and border. Full sleeves."
      ctaLabel="Generate Design"
      previewImages={[sketchDesignImage, imageDesignImage, textDesignImage]}
    />
  );
}
