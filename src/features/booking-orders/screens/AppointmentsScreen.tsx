import { View } from "react-native";

import { AppointmentCard } from "../components/AppointmentCard";
import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { BottomTabsPreview } from "../components/BottomTabsPreview";
import { SectionLabel } from "../components/SectionLabel";
import { SegmentedTabs } from "../components/SegmentedTabs";

export default function AppointmentsScreen() {
  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader
        title="Appointments"
        leftIcon="menu"
        rightIcon="notifications-outline"
        rightLabel="Notifications"
      />
      <View className="px-5">
        <SegmentedTabs tabs={["Upcoming (3)", "Completed (8)", "Cancelled (2)"]} />

        <SectionLabel title="Upcoming Appointments" />
        <AppointmentCard
          tailor="Rekha Tailors"
          service="Custom Anarkali Suit"
          date="22 May 2024"
          time="12:00 PM"
          status="Upcoming"
          placeholderTone="coral"
        />
        <AppointmentCard
          tailor="Stitch Craft"
          service="Blouse Stitching"
          date="25 May 2024"
          time="04:00 PM"
          status="Upcoming"
          placeholderTone="blue"
        />
        <AppointmentCard
          tailor="Aarav Bespoke"
          service="Wedding Sherwani"
          date="28 May 2024"
          time="11:00 AM"
          status="Upcoming"
          placeholderTone="gold"
        />

        <SectionLabel title="Completed Appointments" />
        <AppointmentCard
          tailor="Noor & Thread"
          service="Saree Fall & Pico"
          date="12 May 2024"
          time="03:00 PM"
          status="Completed"
          tone="green"
          placeholderTone="coral"
        />

        <SectionLabel title="Cancelled Appointments" />
        <AppointmentCard
          tailor="Ethnic Weaves"
          service="Lehenga Stitching"
          date="10 May 2024"
          time="02:00 PM"
          status="Cancelled"
          tone="red"
          placeholderTone="teal"
        />

        <BottomTabsPreview active="Tailors" />
      </View>
    </BookingOrdersScreenShell>
  );
}
