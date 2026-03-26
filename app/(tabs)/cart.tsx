import { useState, useEffect, useCallback, useMemo,  } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { StorageService } from "@/services/storage";
import { CartItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

// Memoized Cart Item Component
const CartItemCard = React.memo(
  ({
    item,
    onUpdateQuantity,
    onRemove,
    colors,
  }: {
    item: CartItem;
    onUpdateQuantity: (id: number, delta: number) => void;
    onRemove: (id: number) => void;
    colors: any;
  }) => {
    return (
      <View style={[styles.cartItem, { backgroundColor: colors.surface }]}>
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="contain"
        />

        <View style={styles.itemDetails}>
          <Text
            style={[styles.itemName, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>
            ${item.price.toFixed(2)}
          </Text>

          <View style={styles.quantityRow}>
            <View
              style={[
                styles.quantityControl,
                { backgroundColor: colors.background },
              ]}
            >
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => onUpdateQuantity(item.id, -1)}
              >
                <Ionicons name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.text }]}>
                {item.quantity}
              </Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => onUpdateQuantity(item.id, 1)}
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => onRemove(item.id)}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();
  const router = useRouter();

  // Load cart from secure storage
  const loadCart = useCallback(async () => {
    try {
      const items = await StorageService.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Persist cart whenever it changes
  useEffect(() => {
    if (!isLoading) {
      StorageService.setCartItems(cartItems);
    }
  }, [cartItems, isLoading]);

  // Handlers with useCallback
  const updateQuantity = useCallback((id: number, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Memoized calculations
  const { subtotal, totalItems } = useMemo(() => {
    const sub = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const items = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal: sub, totalItems: items };
  }, [cartItems]);

  const shipping = useMemo(() => (subtotal > 100 ? 0 : 10), [subtotal]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return;
    router.push("/(tabs)/checkout");
  }, [cartItems, router]);

  // Render functions
  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemCard
        item={item}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        colors={colors}
      />
    ),
    [updateQuantity, removeItem, colors],
  );

  const keyExtractor = useCallback((item: CartItem) => item.id.toString(), []);

  // Empty state
  if (!isLoading && cartItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cart-outline"
            size={80}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Looks like you haven't added anything yet
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Shopping Cart
        </Text>
        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary */}
      <View
        style={[
          styles.summary,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Subtotal
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${subtotal.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Shipping
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            ${total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleCheckout}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  itemCount: {
    fontSize: 16,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 200,
  },
  cartItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "white",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 4,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    padding: 8,
  },
  summary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
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
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  checkoutButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
