import { View, Text } from 'react-native';

type StatusBadgeVariant =
  | 'progress'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'verified'
  | 'topRated';

type StatusBadgeProps = {
  label: string;
  variant: StatusBadgeVariant;
};

const variantStyles: Record<
  StatusBadgeVariant,
  { bg: string; text: string }
> = {
  progress: { bg: '#FEF3C7', text: '#B45309' },
  confirmed: { bg: '#DCFCE7', text: '#15803D' },
  completed: { bg: '#DCFCE7', text: '#15803D' },
  cancelled: { bg: '#FEE2E2', text: '#B91C1C' },
  verified: { bg: '#E0F7F7', text: '#14919B' },
  topRated: { bg: '#FEF3C7', text: '#B45309' },
};

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const style = variantStyles[variant];

  return (
    <View
      className="rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: style.bg }}
    >
      <Text
        className="text-[11px] font-semibold"
        style={{ color: style.text }}
      >
        {label}
      </Text>
    </View>
  );
}
