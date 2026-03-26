import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { StorageService } from "@/services/storage";
import { Ionicons } from "@expo/vector-icons";

type PaymentMethod = "card" | "transfer" | "cash";

export default function CheckoutScreen() {
  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    zipCode: "",
    country: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const { colors } = useTheme();
  const router = useRouter();

  // Calculate totals
  const { subtotal, shipping, total } = useMemo(() => {
    // In real app, get from cart context
    return { subtotal: 150.0, shipping: 10.0, total: 160.0 };
  }, []);

  const handleConfirmOrder = useCallback(async () => {
    // Validation
    if (!address.fullName || !address.street || !address.city) {
      alert("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(async () => {
      // Clear cart
      await StorageService.removeCartItems();
      setIsProcessing(false);
      router.push("/success");
    }, 2000);
  }, [address, router]);

  const renderInput = useCallback(
    (
      key: keyof typeof address,
      placeholder: string,
      keyboardType: any = "default",
    ) => (
      <View style={styles.inputContainer} key={key}>
        <Text style={[styles.label, { color: colors.text }]}>
          {placeholder}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder={`Enter ${placeholder.toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
          value={address[key]}
          onChangeText={(text) =>
            setAddress((prev) => ({ ...prev, [key]: text }))
          }
          keyboardType={keyboardType}
        />
      </View>
    ),
    [address, colors],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Checkout
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Delivery Address
          </Text>
          {renderInput("fullName", "Full Name")}
          {renderInput("street", "Street Address")}
          <View style={styles.row}>
            {renderInput("city", "City")}
            {renderInput("zipCode", "ZIP Code", "number-pad")}
          </View>
          {renderInput("country", "Country")}
          {renderInput("phone", "Phone Number", "phone-pad")}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>
          <View style={styles.paymentOptions}>
            {(["card", "transfer", "cash"] as PaymentMethod[]).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentOption,
                  {
                    backgroundColor:
                      paymentMethod === method
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      paymentMethod === method ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <Ionicons
                  name={
                    method === "card"
                      ? "card-outline"
                      : method === "transfer"
                        ? "swap-horizontal-outline"
                        : "cash-outline"
                  }
                  size={24}
                  color={paymentMethod === method ? "white" : colors.text}
                />
                <Text
                  style={[
                    styles.paymentText,
                    { color: paymentMethod === method ? "white" : colors.text },
                  ]}
                >
                  {method === "card"
                    ? "Credit Card"
                    : method === "transfer"
                      ? "Bank Transfer"
                      : "Cash on Delivery"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Shipping
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${shipping.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.primary }]}
          onPress={handleConfirmOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  confirmButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
