import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RegisterStepIndicatorProps = {
  currentStep: 1 | 2 | 3;
};

export function RegisterStepIndicator({ currentStep }: RegisterStepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Step 1 */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.circle,
              currentStep > 1
                ? styles.circleCompleted
                : currentStep === 1
                ? styles.circleActive
                : styles.circleInactive,
            ]}
          >
            {currentStep > 1 ? (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep === 1 ? styles.textActive : styles.textInactive,
                ]}
              >
                1
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              currentStep === 1
                ? styles.labelActive
                : currentStep > 1
                ? styles.labelCompleted
                : styles.labelInactive,
            ]}
          >
            Role
          </Text>
        </View>

        {/* Line 1 -> 2 */}
        <View
          style={[
            styles.line,
            currentStep >= 2 ? styles.lineActive : styles.lineInactive,
          ]}
        />

        {/* Step 2 */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.circle,
              currentStep > 2
                ? styles.circleCompleted
                : currentStep === 2
                ? styles.circleActive
                : styles.circleInactive,
            ]}
          >
            {currentStep > 2 ? (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep === 2 ? styles.textActive : styles.textInactive,
                ]}
              >
                2
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              currentStep === 2
                ? styles.labelActive
                : currentStep > 2
                ? styles.labelCompleted
                : styles.labelInactive,
            ]}
          >
            Details
          </Text>
        </View>

        {/* Line 2 -> 3 */}
        <View
          style={[
            styles.line,
            currentStep >= 3 ? styles.lineActive : styles.lineInactive,
          ]}
        />

        {/* Step 3 */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.circle,
              currentStep === 3 ? styles.circleActive : styles.circleInactive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep === 3 ? styles.textActive : styles.textInactive,
              ]}
            >
              3
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              currentStep === 3 ? styles.labelActive : styles.labelInactive,
            ]}
          >
            Security
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepItem: {
    alignItems: "center",
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  circleCompleted: {
    backgroundColor: "#14919B",
    borderColor: "#14919B",
  },
  circleActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#14919B",
  },
  circleInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E6E8EC",
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: "bold",
  },
  textActive: {
    color: "#14919B",
  },
  textInactive: {
    color: "#6F767E",
  },
  stepLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: "600",
  },
  labelActive: {
    color: "#14919B",
    fontWeight: "bold",
  },
  labelCompleted: {
    color: "#1A1D1F",
  },
  labelInactive: {
    color: "#6F767E",
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginTop: -16,
  },
  lineActive: {
    backgroundColor: "#14919B",
  },
  lineInactive: {
    backgroundColor: "#E6E8EC",
  },
});
