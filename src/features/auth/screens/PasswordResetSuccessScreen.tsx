import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthButton } from "../components/AuthButton";
import { AuthEdgeDecorations } from "../components/AuthEdgeDecorations";

const successIllustration = require("@/assets/illustrations/auth-flow/auth-password-reset-successful.png");

export default function PasswordResetSuccessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <AuthEdgeDecorations variant="coral" />
      <View className="flex-1 px-6 justify-center pt-8 pb-4">
        {/* Success Illustration */}
        <View className="items-center mt-4 mb-4">
          <Image
            source={successIllustration}
            style={{ width: 280, height: 200 }}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <Text className="text-[24px] font-bold text-brand-dark text-center">
          Password Reset{"\n"}Successfully!
        </Text>
        <Text className="text-[14px] text-brand-gray text-center mt-3 mb-8 leading-[20px]">
          Your password has been reset.{"\n"}You can now login to your account.
        </Text>

        {/* Go to Login */}
        <AuthButton
          title="Go to Login"
          onPress={() => router.replace("/auth/login" as any)}
        />

        {/* Back to Home */}
        <View className="mt-4">
          <AuthButton
            title="Back to Home"
            onPress={() => router.replace("/" as any)}
            variant="outlined"
            icon="home-outline"
          />
        </View>
      </View>
    </View>
  );
}
