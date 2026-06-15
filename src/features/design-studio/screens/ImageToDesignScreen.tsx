import { DesignToolScreen } from "../components/DesignToolScreen";
import {
  imageDesignImage,
  sketchDesignImage,
  textDesignImage,
} from "../constants/designStudioAssets";

export default function ImageToDesignScreen() {
  return (
    <DesignToolScreen
      title="Image to Design"
      uploadTitle="Upload Reference Image"
      uploadedImage={imageDesignImage}
      changeLabel="Change Image"
      promptLabel="Describe what you want"
      promptValue="Make it a floor length Anarkali with similar embroidery and style"
      ctaLabel="Generate Design"
      previewImages={[textDesignImage, imageDesignImage, sketchDesignImage]}
    />
  );
}
