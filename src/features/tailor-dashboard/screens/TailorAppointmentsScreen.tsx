import { Text, View } from "react-native";

import { AppointmentRequestCard } from "../components/AppointmentRequestCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";

const appointmentImages = {
  riya: require("@/assets/illustrations/tailor-dashboard/appointments/riya-sharma.png"),
  neha: require("@/assets/illustrations/tailor-dashboard/appointments/neha-verma.png"),
  aman: require("@/assets/illustrations/tailor-dashboard/appointments/aman-verma.png"),
  pooja: require("@/assets/illustrations/tailor-dashboard/appointments/pooja-singh.png"),
};

export default function TailorAppointmentsScreen() {
  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Appointments" />}
    >
      <TailorDashboardHeader title="Appointments" showBack rightIcon="clipboard-outline" />
      <View className="px-5">
        <View className="mb-4 flex-row gap-2">
          {["Requests 5", "Upcoming 8", "Completed"].map((tab, index) => (
            <View key={tab} className={`rounded-lg px-3 py-2 ${index === 0 ? "bg-primary-50" : "bg-white border border-brand-border"}`}>
              <Text className={`text-[11px] font-medium ${index === 0 ? "text-primary" : "text-brand-dark"}`}>{tab}</Text>
            </View>
          ))}
        </View>
        <AppointmentRequestCard image={appointmentImages.riya} name="Riya Sharma" service="Fitting Appointment" date="22 May 2024" time="11:00 AM" newRequest tone="coral" />
        <AppointmentRequestCard image={appointmentImages.neha} name="Neha Verma" service="Design Consultation" date="22 May 2024" time="02:00 PM" tone="blue" />
        <AppointmentRequestCard image={appointmentImages.aman} name="Aman Verma" service="Measurement" date="23 May 2024" time="10:00 AM" tone="gold" />
        <AppointmentRequestCard image={appointmentImages.pooja} name="Pooja Singh" service="Trial Fitting" date="24 May 2024" time="03:00 PM" tone="teal" />
      </View>
    </TailorDashboardShell>
  );
}
