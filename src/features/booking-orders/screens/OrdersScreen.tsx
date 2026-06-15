import { View } from "react-native";

import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { BottomTabsPreview } from "../components/BottomTabsPreview";
import { OrderCard } from "../components/OrderCard";
import { SectionLabel } from "../components/SectionLabel";
import { SegmentedTabs } from "../components/SegmentedTabs";

export default function OrdersScreen() {
  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader
        title="My Orders"
        leftIcon="menu"
        rightIcon="notifications-outline"
        rightLabel="Notifications"
      />
      <View className="px-5">
        <SegmentedTabs tabs={["Active (2)", "Completed (6)", "Cancelled (1)"]} />

        <SectionLabel title="Active Orders" />
        <OrderCard
          id="ORD12345"
          item="Custom Lehenga"
          tailor="Rekha Tailors"
          placedOn="20 May 2024"
          price="₹18,900"
          delivery="05 Jun 2024"
          status="In Progress"
          placeholderTone="coral"
        />
        <OrderCard
          id="ORD12344"
          item="Sherwani Set"
          tailor="Stitch Craft"
          placedOn="18 May 2024"
          price="₹15,500"
          delivery="03 Jun 2024"
          status="Confirmed"
          statusTone="blue"
          placeholderTone="teal"
        />

        <SectionLabel title="Completed Orders" />
        <OrderCard
          id="ORD12320"
          item="Saree Stitching"
          tailor="Noor & Thread"
          placedOn="10 May 2024"
          price="₹4,200"
          delivery="Delivered"
          status="Delivered"
          statusTone="green"
          buttonLabel="View Details"
          placeholderTone="gold"
        />

        <SectionLabel title="Cancelled Orders" />
        <OrderCard
          id="ORD12310"
          item="Blouse Stitching"
          tailor="Ethnic Weaves"
          placedOn="08 May 2024"
          price="₹1,200"
          delivery="Cancelled"
          status="Cancelled"
          statusTone="red"
          buttonLabel="View Details"
          placeholderTone="blue"
        />

        <BottomTabsPreview active="Orders" />
      </View>
    </BookingOrdersScreenShell>
  );
}
