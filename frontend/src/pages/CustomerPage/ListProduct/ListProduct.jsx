import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Container,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  InputBase,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAllProductsAPI } from "~/apis/productAPIs";
import { fetchAllCategoriesAPI } from "~/apis/categoryAPIs";
import { fetchAllPromotionsAPI } from "~/apis/promotionAPIs";
import ProductCard from "~/components/customer/ProductHome/ProductCard/ProductCard";
import SearchIcon from "@mui/icons-material/Search";

function ListProduct() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // States for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity }); // null or {min, max}
  const [sortBy, setSortBy] = useState("newest");

  // Load current user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, prodRes, promos] = await Promise.all([
          fetchAllCategoriesAPI(),
          fetchAllProductsAPI(),
          fetchAllPromotionsAPI(),
        ]);
        setCategories(cats);
        setAllProducts(prodRes.data || []);
        setPromotions(promos.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  // Helper: promotions applicable to a given product for current user
  const promosForProduct = (prod) => {
    if (!prod) return [];
    const now = new Date();
    return promotions.filter((p) => {
      const isProductPromo =
        p.productIds?.includes("ALL") || p.productIds?.includes(prod._id);
      const isActive =
        p.computedStatus === "active" &&
        (!p.startDate || new Date(p.startDate) <= now) &&
        (!p.endDate || p.endDate === null || new Date(p.endDate) >= now);
      const cond = p.condition ?? {
        type: "all",
        loyalTiers: [],
        specificCustomerIds: [],
      };
      let eligible = true;
      switch (cond.type) {
        case "all":
          eligible = true;
          break;
        case "loyal":
          eligible =
            !!currentUser?.loyaltyTier &&
            (cond.loyalTiers ?? []).includes(currentUser.loyaltyTier);
          break;
        case "specific":
          eligible =
            !!currentUser?._id &&
            (cond.specificCustomerIds ?? []).some(
              (id) => String(id) === String(currentUser._id),
            );
          break;
        case "new":
          eligible = (cond.newCustomerMaxOrders ?? null) == null;
          break;
        default:
          eligible = true;
      }
      return isProductPromo && isActive && eligible;
    });
  };

  // Calculate Product Count per Category
  const categoryCounts = useMemo(() => {
    const counts = {};
    allProducts.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  // Centralized Filtering and Sorting Logic
  const processedProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Filter by Primary Logic (Category Slug)
    if (categorySlug === "newest") {
      //handled in sort later, but only in-stock
      result = result.filter(
        (p) => p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) > 0,
      );
    } else if (categorySlug === "sale") {
      result = result.filter((p) =>
        promotions.some(
          (promo) =>
            promo.computedStatus === "active" &&
            (promo.productIds?.includes("ALL") ||
              promo.productIds?.includes(p._id)),
        ),
      );
    } else if (categorySlug && categorySlug !== "all") {
      const targetCat = categories.find((c) => c.slug === categorySlug);
      if (targetCat) {
        result = result.filter((p) => p.categoryId === targetCat._id);
      } else {
        return []; // Slug doesn't match anything
      }
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // 3. Filter by Price Range
    if (priceRange.max !== Infinity || priceRange.min !== 0) {
      result = result.filter(
        (p) => p.price >= priceRange.min && p.price <= priceRange.max,
      );
    }

    // 4. Always filter by Stock
    result = result.filter(
      (p) => p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) > 0,
    );

    // 5. Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "priceAsc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    allProducts,
    categorySlug,
    categories,
    promotions,
    searchQuery,
    priceRange,
    sortBy,
  ]);

  const handlePriceClick = (min, max) => {
    if (priceRange.min === min && priceRange.max === max) {
      setPriceRange({ min: 0, max: Infinity }); // Toggle off
    } else {
      setPriceRange({ min, max });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 10, pb: 10 }}>
      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ position: "sticky", top: 120 }}>
            {/* Search Bar */}
            <Paper
              elevation={0}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                bgcolor: "#f2f2f2",
                borderRadius: 50,
                mb: 4,
              }}
            >
              <InputBase
                sx={{ ml: 2, flex: 1, fontSize: "0.9rem" }}
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <IconButton sx={{ p: "10px" }}>
                <SearchIcon />
              </IconButton>
            </Paper>

            {/* Price Filter */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Giá tiền
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
              {[
                { label: "0-100K", min: 0, max: 100000 },
                { label: "100-500K", min: 100000, max: 500000 },
                { label: "500K-1000K", min: 500000, max: 1000000 },
              ].map((btn) => (
                <Button
                  key={btn.label}
                  variant={
                    priceRange.min === btn.min && priceRange.max === btn.max
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => handlePriceClick(btn.min, btn.max)}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    bgcolor:
                      priceRange.min === btn.min && priceRange.max === btn.max
                        ? "#ccc"
                        : "transparent",
                    color: "black",
                    borderColor: "#ccc",
                    "&:hover": { borderColor: "#999", bgcolor: "#eee" },
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </Box>

            {/* Category Filter */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Danh Mục Sản Phẩm
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {categories.map((cat) => (
                <Typography
                  key={cat._id}
                  onClick={() => navigate(`/listproduct/${cat.slug}`)}
                  sx={{
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    color: categorySlug === cat.slug ? "#000" : "#666",
                    fontWeight: categorySlug === cat.slug ? 700 : 400,
                    "&:hover": { color: "#000" },
                  }}
                >
                  {cat.name} ({categoryCounts[cat._id] || 0})
                </Typography>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing all {processedProducts.length} results
            </Typography>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                variant="outlined"
                sx={{ borderRadius: 1, bgcolor: "#fff", fontSize: "0.9rem" }}
              >
                <MenuItem value="newest">Sắp xếp theo mới nhất</MenuItem>
                <MenuItem value="priceAsc">Giá: Thấp đến Cao</MenuItem>
                <MenuItem value="priceDesc">Giá: Cao đến Thấp</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {processedProducts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography variant="h5" color="text.secondary">
                Không tìm thấy sản phẩm phù hợp.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {processedProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Box
                    onClick={() => navigate(`/productdetail/${product._id}`)}
                  >
                    <ProductCard
                      product={product}
                      promotions={promosForProduct(product)}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default ListProduct;
