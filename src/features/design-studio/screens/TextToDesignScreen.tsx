import { DesignToolScreen } from "../components/DesignToolScreen";
import {
  imageDesignImage,
  sketchDesignImage,
  textDesignImage,
} from "../constants/designStudioAssets";

export default function TextToDesignScreen() {
  return (
    <DesignToolScreen
      title="Text to Design"
      promptLabel="Describe your design"
      promptValue="A pastel green Anarkali with floral embroidery, full sleeves, and a boat neckline"
      ctaLabel="Generate Design"
      previewImages={[textDesignImage, imageDesignImage, sketchDesignImage]}
    />
  );
}
