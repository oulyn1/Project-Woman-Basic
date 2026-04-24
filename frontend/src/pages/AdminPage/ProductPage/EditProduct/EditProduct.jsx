import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import FieldCustom from "~/components/admin/FieldCustom/FieldCustom";
import ImageUpload from "~/components/admin/ImageUpload/ImageUpload";
import {
  getProductDetailAPI,
  uploadImageToCloudinaryAPI,
  updateProductAPI,
} from "~/apis/productAPIs";
import { fetchAllCategoriesAPI } from "~/apis/categoryAPIs";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];
const COLOR_PALETTE = [
  { name: "Đen", hex: "#000000" },
  { name: "Trắng", hex: "#ffffff" },
  { name: "Đỏ", hex: "#ff0000" },
  { name: "Xanh dương", hex: "#0000ff" },
  { name: "Xanh lá", hex: "#00ff00" },
  { name: "Vàng", hex: "#ffff00" },
  { name: "Cam", hex: "#ff8c00" },
  { name: "Hồng", hex: "#ffc0cb" },
  { name: "Tím", hex: "#800080" },
  { name: "Xám", hex: "#808080" },
];

function EditProduct({ open, productId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    price: "",
    description: "",
    tags: "",
    files: [],
    currentImages: [],
  });

  const [categories, setCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [variantsMatrix, setVariantsMatrix] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchAllCategoriesAPI();
        const options = data.map((cat) => ({
          value: cat._id,
          label: cat.name,
        }));
        setCategories(options);
      } catch {
        /* ... */
      }
    };
    if (open) fetchCategories();
  }, [open]);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const res = await getProductDetailAPI(productId);
        const product = res.data;

        setFormData({
          categoryId: product.categoryId || "",
          name: product.name || "",
          price: product.price?.toString() || "",
          description: product.description || "",
          tags: (product.tags || []).join(", "),
          files: [],
          currentImages: product.images || [],
        });

        if (product.variants) {
          const sizes = [...new Set(product.variants.map((v) => v.size))];
          const uniqueColorsMap = {};
          const matrix = {};

          product.variants.forEach((v) => {
            uniqueColorsMap[v.color.hex] = v.color;
            matrix[`${v.size}-${v.color.hex}`] = v.stock;
            matrix[`${v.size}-${v.color.hex}_FULL`] = v;
          });

          setSelectedSizes(sizes);
          setSelectedColors(Object.values(uniqueColorsMap));
          setVariantsMatrix(matrix);
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Lỗi tải dữ liệu!",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    if (open && productId) fetchProductData();
  }, [open, productId]);

  const handleSizeChange = (event, newSizes) => {
    setSelectedSizes(newSizes);
  };

  const handleColorToggle = (color) => {
    setSelectedColors((prev) => {
      const isSelected = prev.find((c) => c.hex === color.hex);
      if (isSelected) return prev.filter((c) => c.hex !== color.hex);
      return [...prev, color];
    });
  };

  const currentVariants = useMemo(() => {
    const matrix = [];
    selectedSizes.forEach((size) => {
      selectedColors.forEach((color) => {
        const original = variantsMatrix[`${size}-${color.hex}_FULL`];
        matrix.push({
          size,
          color,
          _id: original?._id,
          sku: original?.sku,
        });
      });
    });
    return matrix;
  }, [selectedSizes, selectedColors, variantsMatrix]);

  const handleStockChange = (size, colorHex, value) => {
    setVariantsMatrix((prev) => ({ ...prev, [`${size}-${colorHex}`]: value }));
  };

  const generateSkuPrefix = (name) => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 3)
      .toUpperCase();
  };

  const generateObjectId = () => {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
    return (
      timestamp +
      "xxxxxxxxxxxxxxxx"
        .replace(/[x]/g, () => {
          return ((Math.random() * 16) | 0).toString(16);
        })
        .toLowerCase()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newImageUrls = await Promise.all(
        formData.files.map((file) =>
          uploadImageToCloudinaryAPI(file).then((res) => res.secure_url),
        ),
      );

      const skuPrefix = generateSkuPrefix(formData.name);

      const payload = {
        categoryId: formData.categoryId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug: formData.name
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, ""),
        price: Number(formData.price),
        images: [...formData.currentImages, ...newImageUrls],
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((t) => t),
        variants: currentVariants.map((v) => ({
          _id: v._id || generateObjectId(),
          size: v.size,
          color: v.color,
          stock: Number(variantsMatrix[`${v.size}-${v.color.hex}`] || 0),
          sku:
            v.sku ||
            `${skuPrefix}-${v.size}-${v.color.name.toUpperCase().substring(0, 3)}`,
        })),
      };

      const updatedProduct = await updateProductAPI(productId, payload);
      setSnackbar({
        open: true,
        message: "Cập nhật thành công!",
        severity: "success",
      });
      // Optimistic UI: notify other admin components about the updated product
      try {
        window.dispatchEvent(
          new CustomEvent("PRODUCT_UPDATED", { detail: updatedProduct }),
        );
      } catch {
        // ignore if event dispatch fails
      }
      onSuccess();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi khi cập nhật!",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: "#1a1a1a",
            color: "white",
            borderRadius: "12px",
            border: "1px solid #333",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #333",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Chỉnh sửa sản phẩm
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#888" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            <>
              <Stack direction="row" spacing={3} mt={2}>
                <FieldCustom
                  label="Tên sản phẩm"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <FieldCustom
                  label="Danh mục"
                  required
                  select
                  options={categories}
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                />
              </Stack>

              <Stack direction="row" spacing={3}>
                <FieldCustom
                  label="Giá (VNĐ)"
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                <FieldCustom
                  label="Slug"
                  disabled
                  value={formData.name
                    .toLowerCase()
                    .replace(/ /g, "-")
                    .replace(/[^\w-]+/g, "")}
                />
              </Stack>

              <Box sx={{ mt: 1 }}>
                <FieldCustom
                  label="Mô tả sản phẩm"
                  required
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả sản phẩm..."
                />
              </Box>

              <Box sx={{ mt: 1 }}>
                <FieldCustom
                  label="Tags (phân cách bởi dấu phẩy)"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="áo thun, mùa hè, mới"
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: "#ccc" }}>
                  Size hỗ trợ
                </Typography>
                <ToggleButtonGroup
                  value={selectedSizes}
                  onChange={handleSizeChange}
                  sx={{ gap: 1, flexWrap: "wrap" }}
                >
                  {SIZE_OPTIONS.map((size) => (
                    <ToggleButton
                      key={size}
                      value={size}
                      sx={{
                        borderRadius: "50px !important",
                        border: "1px solid #333 !important",
                        color: "white",
                        px: 3,
                        py: 0.5,
                        textTransform: "none",
                        "&.Mui-selected": {
                          backgroundColor: "#e8f5e9 !important",
                          color: "#2e7d32 !important",
                          borderColor: "#2e7d32 !important",
                        },
                      }}
                    >
                      {size}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: "#ccc" }}>
                  Màu sắc
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 2 }}
                >
                  {COLOR_PALETTE.map((color) => (
                    <Box
                      key={color.hex}
                      onClick={() => handleColorToggle(color)}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: color.hex,
                        borderRadius: "50%",
                        border: selectedColors.find((c) => c.hex === color.hex)
                          ? "2px solid #2e7d32"
                          : "2px solid transparent",
                        boxShadow: "0 0 0 1px #444",
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": { transform: "scale(1.1)" },
                      }}
                    />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selectedColors.map((color) => (
                    <Chip
                      key={color.hex}
                      label={color.name}
                      onDelete={() => handleColorToggle(color)}
                      size="small"
                      sx={{
                        backgroundColor: "#333",
                        color: "white",
                        borderRadius: "4px",
                        "& .MuiChip-deleteIcon": { color: "#888" },
                      }}
                      icon={
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: color.hex,
                            ml: 1,
                          }}
                        />
                      }
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ mt: 5 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "#ccc" }}>
                  Tồn kho theo biến thể
                </Typography>
                <Box
                  sx={{
                    border: "1px solid #333",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "#252525" }}>
                      <TableRow>
                        <TableCell
                          sx={{ color: "#888", borderBottom: "1px solid #333" }}
                        >
                          Size \ Màu
                        </TableCell>
                        {selectedColors.map((c) => (
                          <TableCell
                            key={c.hex}
                            align="center"
                            sx={{
                              color: "#888",
                              borderBottom: "1px solid #333",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: c.hex,
                                }}
                              />
                              <Typography variant="caption">
                                {c.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSizes.map((size) => (
                        <TableRow key={size}>
                          <TableCell
                            sx={{
                              color: "white",
                              borderBottom: "1px solid #333",
                              fontWeight: "bold",
                            }}
                          >
                            {size}
                          </TableCell>
                          {selectedColors.map((color) => (
                            <TableCell
                              key={color.hex}
                              align="center"
                              sx={{ borderBottom: "1px solid #333" }}
                            >
                              <Box
                                component="input"
                                type="number"
                                value={
                                  variantsMatrix[`${size}-${color.hex}`] || ""
                                }
                                onChange={(e) =>
                                  handleStockChange(
                                    size,
                                    color.hex,
                                    e.target.value,
                                  )
                                }
                                sx={{
                                  width: 50,
                                  backgroundColor: "#1a1a1a",
                                  border: "1px solid #444",
                                  borderRadius: "4px",
                                  color: "white",
                                  textAlign: "center",
                                  py: 0.5,
                                  "&:focus": {
                                    outline: "none",
                                    borderColor: "#2e7d32",
                                  },
                                }}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>

              <Box sx={{ mt: 4 }}>
                <ImageUpload
                  multiple
                  onImageChange={(files) =>
                    setFormData((p) => ({ ...p, files }))
                  }
                  currentImageUrl={formData.currentImages}
                  label="Quản lý Ảnh"
                />
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: "1px solid #333" }}>
          <Button
            onClick={onClose}
            sx={{ color: "#888", textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              textTransform: "none",
              fontWeight: "bold",
              px: 4,
              "&:hover": { backgroundColor: "#c8e6c9" },
            }}
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default EditProduct;
