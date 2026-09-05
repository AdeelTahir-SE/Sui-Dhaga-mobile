import React from "react";
import { ActivityIndicator, View } from "react-native";

import { AppointmentCard } from "../components/AppointmentCard";
import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { BottomTabsPreview } from "../components/BottomTabsPreview";
import { SectionLabel } from "../components/SectionLabel";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { useAppointments } from "../hooks/useAppointments";

export default function AppointmentsScreen() {
  const { appointments, isLoading } = useAppointments();

  const getTone = (index: number) => {
    const tones: ("coral" | "blue" | "gold" | "teal")[] = ["coral", "blue", "gold", "teal"];
    return tones[index % tones.length];
  };

  const upcoming = appointments.filter((a) => a.status === "Upcoming" || !a.status);
  const completed = appointments.filter((a) => a.status === "Completed");
  const cancelled = appointments.filter((a) => a.status === "Cancelled");

  return (
    <BookingOrdersScreenShell bottomTabs={<BottomTabsPreview active="Tailors" />}>
      <BookingOrdersHeader
        title="Appointments"
        leftIcon="menu"
        rightIcon="notifications-outline"
        rightLabel="Notifications"
      />
      <View className="px-5 pb-8">
        <SegmentedTabs
          tabs={[
            `Upcoming (${upcoming.length})`,
            `Completed (${completed.length || 8})`,
            `Cancelled (${cancelled.length || 2})`,
          ]}
        />

        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : (
          <>
            <SectionLabel title="Upcoming Appointments" />
            {upcoming.map((appt, index) => (
              <AppointmentCard
                key={appt.id || index}
                tailor={appt.tailorName || "Rekha Tailors"}
                service={appt.serviceType || "Custom Outfit"}
                date={appt.appointmentDate || "Upcoming"}
                time={appt.appointmentTime || "12:00 PM"}
                status="Upcoming"
                placeholderTone={getTone(index)}
              />
            ))}

            <SectionLabel title="Completed Appointments" />
            {completed.length > 0 ? (
              completed.map((appt, index) => (
                <AppointmentCard
                  key={appt.id || index}
                  tailor={appt.tailorName || "Tailor"}
                  service={appt.serviceType}
                  date={appt.appointmentDate}
                  time={appt.appointmentTime}
                  status="Completed"
                  tone="green"
                  placeholderTone={getTone(index + 1)}
                />
              ))
            ) : (
              <AppointmentCard
                tailor="Noor & Thread"
                service="Saree Fall & Pico"
                date="12 May 2024"
                time="03:00 PM"
                status="Completed"
                tone="green"
                placeholderTone="coral"
              />
            )}

            <SectionLabel title="Cancelled Appointments" />
            {cancelled.length > 0 ? (
              cancelled.map((appt, index) => (
                <AppointmentCard
                  key={appt.id || index}
                  tailor={appt.tailorName || "Tailor"}
                  service={appt.serviceType}
                  date={appt.appointmentDate}
                  time={appt.appointmentTime}
                  status="Cancelled"
                  tone="red"
                  placeholderTone={getTone(index + 2)}
                />
              ))
            ) : (
              <AppointmentCard
                tailor="Ethnic Weaves"
                service="Lehenga Stitching"
                date="10 May 2024"
                time="02:00 PM"
                status="Cancelled"
                tone="red"
                placeholderTone="teal"
              />
            )}
          </>
        )}
      </View>
    </BookingOrdersScreenShell>
  );
}
