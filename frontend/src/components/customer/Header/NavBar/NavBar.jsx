import React, { useState, useEffect } from 'react'
import { Box, Button, Menu, MenuItem, ListSubheader, Modal, TextField, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { fetchAllCategorysAPI } from '~/apis/categoryAPIs'
import { useNavigate } from 'react-router-dom'
import StarIcon from '@mui/icons-material/Star'
import { getRatingsByProductId } from '~/apis/ratingAPIs'
import { fetchAllProductsAPI, searchProductsAPI } from '~/apis/productAPIs'

// ==== Component con để load rating ====
function StarRating({ productId }) {
  const [avg, setAvg] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const ratings = await getRatingsByProductId(productId)
        const total = ratings.reduce((sum, r) => sum + r.star, 0)
        const average = ratings.length ? (total / ratings.length).toFixed(1) : 0
        setAvg(average)
      } catch {
        setAvg(0)
      }
    }
    fetch()
  }, [productId])

  return (
    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <StarIcon sx={{ fontSize: 20, color: 'gold' }} /> ({avg})
    </Typography>
  )
}

const StyledListHeader = styled(ListSubheader)({
  backgroundImage: 'var(--Paper-overlay)',
  fontWeight: 600
})

// ==== Hàm build tree danh mục ====
function buildCategoryTree(data) {
  const map = {}
  data.forEach((cat) => (map[cat._id] = { ...cat, children: [] }))
  const roots = []
  data.forEach((cat) => {
    if (cat.parentId) {
      map[cat.parentId]?.children.push(map[cat._id])
    } else {
      roots.push(map[cat._id])
    }
  })
  return roots
}

function NavBar() {
  const [_categories, setCategories] = useState([])
  const [categoryTree, setCategoryTree] = useState([])
  const [anchorEls, setAnchorEls] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [rows, setRows] = useState([])

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay)
      return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
  }

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!debouncedSearchQuery) {
          const data = await fetchAllProductsAPI()
          setRows(data)
        } else {
          const data = await searchProductsAPI(debouncedSearchQuery)
          setRows(data)
        }
      } catch {
        setRows([])
      }
    }
    fetchProducts()
  }, [debouncedSearchQuery])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchAllCategorysAPI()
        setCategories(data)
        setCategoryTree(buildCategoryTree(data))
      } catch {
        //
      }
    }
    fetchCategories()
  }, [])

  const handleMenuOpen = (event, id) => {
    setAnchorEls((prev) => ({ ...prev, [id]: event.currentTarget }))
  }

  const handleMenuClose = (id) => {
    setAnchorEls((prev) => ({ ...prev, [id]: null }))
  }

  const styleModal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 2
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: 50, px: 4 }}>
      {/* ==== Menu Danh mục ==== */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {categoryTree.map((root) => (
          <Box key={root._id}>
            <Button
              aria-controls={anchorEls[root._id] ? `${root._id}-menu` : undefined}
              aria-haspopup="true"
              onClick={(e) => handleMenuOpen(e, root._id)}
              sx={{ color: '#696969', textTransform: 'none', '&:hover': { backgroundColor: 'white' } }}
            >
              {root.name}
            </Button>
            <Menu
              id={`${root._id}-menu`}
              anchorEl={anchorEls[root._id]}
              open={Boolean(anchorEls[root._id])}
              onClose={() => handleMenuClose(root._id)}
              slotProps={{
                list: { sx: { width: 800, py: 0, display: 'flex', padding: '20px' } }
              }}
            >
              {root.children.map((type) => (
                <Box key={type._id} sx={{ flex: 1, pr: 2 }}>
                  <StyledListHeader>{type.name}</StyledListHeader>
                  {type.children.map((material) => (
                    <MenuItem
                      key={material._id}
                      onClick={() => {
                        navigate(`/listproduct/${root.slug}/${type.slug}/${material.slug}`)
                        handleMenuClose(root._id)}
                      }
                    >
                      {material.name}
                    </MenuItem>
                  ))}
                </Box>
              ))}
            </Menu>
          </Box>
        ))}
      </Box>

      {/* ==== Search nhanh ==== */}
      <Box>
        <Button
          onClick={() => setOpenModal(true)}
          sx={{
            height: 35,
            width: 350,
            backgroundColor: '#F5F5F5',
            color: '#696969',
            borderRadius: 6,
            textTransform: 'none',
            fontStyle: 'italic',
            display: 'flex',
            justifyContent: 'space-between',
            '&:hover': { backgroundColor: '#F5F5F5' }
          }}
        >
          Tìm kiếm nhanh
          <SearchOutlinedIcon />
        </Button>
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={styleModal}>
            <TextField fullWidth label="Tìm kiếm nhanh" type="search" sx={{ mb: 2 }} onChange={(e) => setSearchQuery(e.target.value)}/>
            <Box
              sx={{
                height: 400,
                borderTop: '6px solid #696969',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowX: 'hidden',
                overflowY: 'auto'
              }}
            >
              {!debouncedSearchQuery ? null : (
                rows.length === 0 ? (
                  <Box>
                    <img
                      style={{ height: 200 }}
                      src="https://cdn.pnj.io/images/2025/rebuild/a60759ad1dabe909c46a817ecbf71878.png"
                      alt=""
                    />
                    <Typography>Không tìm thấy kết quả</Typography>
                  </Box>
                ) : (
                  rows.map((product) => (
                    <Box
                      key={product._id}
                      sx={{
                        width: '850px',
                        maxHeight: '120px',
                        py: 2,
                        borderBottom: '2px solid #f7f7f7',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f9f9f9' }
                      }}
                      onClick={() => {
                        navigate(`/productdetail/${product._id}`)
                        setOpenModal(false)
                      }}
                    >
                      {/* Hình sản phẩm */}
                      <Box sx={{ backgroundColor: '#f7f7f7', height: '100%', borderRadius: '8px', mr: 2 }}>
                        <img
                          src={product.image || 'https://via.placeholder.com/120'}
                          alt={product.name}
                          style={{ height: '100%', width: 120, objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </Box>

                      {/* Thông tin sản phẩm */}
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="body2">
                            {product.price?.toLocaleString('vi-VN')} ₫
                          </Typography>
                          <StarRating productId={product._id} />
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
                            {product.sold || 0} đã bán
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                )
              )}
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  )
}

export default NavBar
