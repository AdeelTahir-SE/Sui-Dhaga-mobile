import { Text } from "react-native";

type SectionLabelProps = {
  title: string;
};

export function SectionLabel({ title }: SectionLabelProps) {
  return (
    <Text className="mb-3 mt-5 text-[13px] font-semibold text-brand-dark">
      {title}
    </Text>
  );
}
