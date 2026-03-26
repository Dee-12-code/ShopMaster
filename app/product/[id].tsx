// app/product/[id].tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { API } from "@/services/api";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { StorageService } from "@/services/storage";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { colors } = useTheme();
  const router = useRouter();

  // Fetch product with useCallback
  const fetchProduct = useCallback(async () => {
    try {
      const data = await API.getProduct(Number(id));
      setProduct(data);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Memoized price calculation
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return product.price * quantity;
  }, [product, quantity]);

  // Handlers with useCallback
  const handleIncrement = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      // Get existing cart
      const existingCart = await StorageService.getCartItems();

      // Check if product already in cart
      const existingIndex = existingCart.findIndex(
        (item: any) => item.id === product.id,
      );

      let newCart;
      if (existingIndex >= 0) {
        // Update quantity
        newCart = [...existingCart];
        newCart[existingIndex].quantity += quantity;
      } else {
        // Add new item
        newCart = [...existingCart, { ...product, quantity }];
      }

      await StorageService.setCartItems(newCart);

      // Navigate to cart
      router.push("/(tabs)/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, quantity, router]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(tabs)/cart")}>
          <Ionicons name="cart-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View
          style={[styles.imageContainer, { backgroundColor: colors.surface }]}
        >
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <Text style={[styles.category, { color: colors.textSecondary }]}>
            {product.category.toUpperCase()}
          </Text>

          <Text style={[styles.title, { color: colors.text }]}>
            {product.title}
          </Text>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={
                    star <= Math.round(product.rating.rate)
                      ? "star"
                      : "star-outline"
                  }
                  size={16}
                  color="#fbbf24"
                />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {product.rating.rate} ({product.rating.count} reviews)
            </Text>
          </View>

          <Text style={[styles.price, { color: colors.primary }]}>
            ${product.price.toFixed(2)}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description}
          </Text>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quantity
            </Text>
            <View
              style={[
                styles.quantityContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecrement}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.text }]}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncrement}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
          <Text style={[styles.totalPrice, { color: colors.text }]}>
            ${totalPrice.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.addButtonText}>Add to Cart</Text>
          )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  imageContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 20,
  },
  image: {
    width: "80%",
    height: "80%",
  },
  content: {
    padding: 24,
  },
  category: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stars: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  quantitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
