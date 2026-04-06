// frontend/src/pages/customer/StoreLocator.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Box, Container, Grid, Typography, Select, MenuItem, FormControl, InputLabel,
  Paper, Collapse, Chip, Stack, Button, CircularProgress, Tooltip
} from '@mui/material'
import RoomIcon from '@mui/icons-material/Room'
import PhoneIcon from '@mui/icons-material/Phone'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { getBranches } from '~/apis/branchAPIs'

// uniq + sort
const uniqSort = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))

/* Card chi tiết 1 cửa hàng (collapse dưới mỗi pill) */
const DetailCard = ({ store }) => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${store.name} ${store.address} ${store.districtCode || ''} ${store.provinceCode || ''}`
  )}`

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E6E9EF' }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#12395B', mb: 1 }}>
        {store.name}
      </Typography>

      <Stack spacing={1.2}>
        <Typography variant="body2"><b>Địa chỉ:</b> {store.address || '—'}</Typography>
        <Typography variant="body2"><b>Tỉnh/TP:</b> {store.provinceCode || '—'}</Typography>
        <Typography variant="body2"><b>Quận/Huyện:</b> {store.districtCode || '—'}</Typography>

        <Stack direction="row" alignItems="center" gap={1}>
          <PhoneIcon fontSize="small" />
          <Typography variant="body2">{store.phone || '—'}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" gap={1}>
          <AccessTimeIcon fontSize="small" />
          <Typography variant="body2">{store.openingHours || '—'}</Typography>
        </Stack>

        {!!store.services?.length && (
          <Stack direction="row" flexWrap="wrap" gap={1} mt={0.5}>
            {store.services.map((s, i) => (
              <Chip key={i} label={s} size="small" sx={{ borderRadius: 1.5 }} />
            ))}
          </Stack>
        )}

        <Stack direction="row" gap={1.5} mt={1}>
          <Button href={mapUrl} target="_blank" rel="noreferrer" variant="outlined">Xem bản đồ</Button>
          {store.phone && (
            <Button href={`tel:${store.phone}`} startIcon={<PhoneIcon />} variant="contained">
              Gọi ngay
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}

export default function StoreLocator() {
  const [loading, setLoading] = useState(true)
  const [allBranches, setAllBranches] = useState([])

  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [limit, setLimit] = useState(12)
  const [openId, setOpenId] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getBranches()
      const list = Array.isArray(data) ? data : (data?.data || [])
      setAllBranches(list.filter(b => b?.isActive !== false))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // options dropdown
  const provinceOptions = useMemo(
    () => uniqSort(allBranches.map(b => b.provinceCode)),
    [allBranches]
  )
  const districtOptions = useMemo(() => {
    const inProvince = province ? allBranches.filter(b => b.provinceCode === province) : allBranches
    return uniqSort(inProvince.map(b => b.districtCode))
  }, [allBranches, province])

  // danh sách sau lọc
  const filtered = useMemo(() => {
    let rs = allBranches
    if (province) rs = rs.filter(b => b.provinceCode === province)
    if (district) rs = rs.filter(b => b.districtCode === district)
    return rs
  }, [allBranches, province, district])

  // 1 item “pill” như PNJ
  const PillItem = ({ store }) => {
    const isOpen = openId === store._id
    return (
      <Box>
        <Paper
          elevation={0}
          onClick={() => setOpenId(isOpen ? null : store._id)}
          sx={{
            height: 56,
            px: 2.25,
            borderRadius: '10px',
            border: '1px solid #E6E9EF',
            display: 'flex',
            alignItems: 'center',
            gap: 1.1,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            '&:hover': { boxShadow: '0 6px 12px rgba(0,0,0,0.08)' }
          }}
        >
          <RoomIcon sx={{ color: '#12395B' }} />
          <Tooltip title={store.name}>
            <Typography noWrap sx={{ flex: 1, color: '#12395B', fontWeight: 700 }}>
              {store.name}
            </Typography>
          </Tooltip>
          <KeyboardArrowDownIcon
            sx={{
              color: '#6B7280',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: '0.2s'
            }}
          />
        </Paper>

        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 1.25 }}>
            <DetailCard store={store} />
          </Box>
        </Collapse>
      </Box>
    )
  }
  return (
    <Box sx={{ bgcolor: '#fff', py: 4 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        {/* === BANNER: 2 cục nằm ngang bằng flex === */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            mb: 3,
            mt: { xs: 1, md: 2 },
            flexWrap: { xs: 'wrap', md: 'nowrap' }
          }}
        >
          {/* Trái: tiêu đề + mô tả */}
          <Paper
            elevation={0}
            sx={{
              flex: '1 1 0',
              minWidth: 300,
              px: { xs: 3, md: 4 },
              py: { xs: 2.75, md: 3 },
              borderRadius: '22px',
              bgcolor: '#F7F0DE',
              border: '1px solid #E7DECA',
              boxShadow: '0 10px 22px rgba(0,0,0,0.06)'
            }}
          >
            <Typography sx={{ fontSize: { xs: 20, md: 22 }, fontWeight: 800, color: '#12395B', mb: 1 }}>
                Tư vấn online, nhận ngay ưu đãi
            </Typography>
            <Typography sx={{ fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
                Chỉ cần một cuộc gọi miễn phí, ưu đãi độc quyền online dành riêng cho bạn
            </Typography>
          </Paper>

          {/* Phải: pill phone + time + nút gọi + ghi chú */}
          <Paper
            elevation={0}
            sx={{
              flex: '1 1 0',
              minWidth: 300,
              px: { xs: 3, md: 4 },
              py: { xs: 2.75, md: 3 },
              borderRadius: '22px',
              bgcolor: '#F7F0DE',
              border: '1px solid #E7DECA',
              boxShadow: '0 10px 22px rgba(0,0,0,0.06)'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              {/* Viên thuốc: phone + time */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  height: 56,
                  px: 1.5,
                  border: '2px solid #0B3557',
                  borderRadius: 9999,
                  background: '#fff',
                  boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <PhoneIcon sx={{ color: '#0B6ECF', fontSize: 22 }} />
                  <Typography sx={{ color: '#0B3557', fontWeight: 1200, fontSize: 14 }}>
                  1800 5454 57
                  </Typography>
                </Box>

                <Box sx={{ width: 1.5, height: 24, bgcolor: '#0B3557', opacity: 0.18 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ color: '#0B6ECF', fontSize: 22 }} />
                  <Typography sx={{ color: '#0B3557', fontSize: 17.5 }}>
                  08:00 AM - 21:00 PM
                  </Typography>
                </Box>
              </Box>

              {/* Nút gọi ngay */}
              <Button
                href="tel:1800545457"
                variant="contained"
                sx={{
                  bgcolor: '#0B3557',
                  borderRadius: 9999,
                  px: 3.5,
                  height: 44,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  boxShadow: '0 8px 16px rgba(11,53,87,0.25)',
                  '&:hover': { bgcolor: '#072642' }
                }}
              >
              GỌI NGAY
              </Button>
            </Box>

            {/* Ghi chú – italic, nhỏ, đặt ngay dưới pill */}
            <Typography
              sx={{ mt: 1.25, fontStyle: 'italic', color: '#6B7280', fontSize: 14.5, lineHeight: 1.6 }}
            >
                (Vui lòng nhấn phím 1 để chọn ngôn ngữ tiếng Việt, tiếp tục nhấn phím 1 để gặp ngay nhân viên tư vấn)
            </Typography>
          </Paper>
        </Box>

        {/* TIÊU ĐỀ */}
        <Typography
          variant="h6"
          sx={{ color: '#12395B', fontWeight: 800, mt: 3, mb: 2, fontSize: 28 }}
        >
            Hệ thống cửa hàng
        </Typography>

        {/* BỘ LỌC */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            flexWrap: { xs: 'wrap', md: 'nowrap' }
          }}
        >
          {/* Tỉnh/Thành phố: chiếm ~45% hàng, minWidth lớn hơn */}
          <FormControl
            fullWidth
            size="small"
            sx={{
              flex: { xs: '1 1 100%', md: '1 1 45%' },
              minWidth: { md: 360 }
            }}
          >
            <InputLabel>Tỉnh/Thành phố</InputLabel>
            <Select
              value={province}
              label="Tỉnh/Thành phố"
              onChange={(e) => {
                setProvince(e.target.value)
                setDistrict('')
                setLimit(12)
              }}
              sx={{
                bgcolor: '#fff',
                borderRadius: '10px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                '& .MuiSelect-select': { color: '#12395B', fontWeight: 700 }
              }}
            >
              <MenuItem value=""><em>— Chọn Tỉnh/TP —</em></MenuItem>
              {provinceOptions.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quận/Huyện: chiếm ~55% hàng, dài hơn nữa */}
          <FormControl
            fullWidth
            size="small"
            disabled={!province && districtOptions.length === 0}
            sx={{
              flex: { xs: '1 1 100%', md: '1 1 55%' },
              minWidth: { md: 420 }
            }}
          >
            <InputLabel>Quận/Huyện</InputLabel>
            <Select
              value={district}
              label="Quận/Huyện"
              onChange={(e) => {
                setDistrict(e.target.value)
                setLimit(12)
              }}
              sx={{
                bgcolor: '#fff',
                borderRadius: '10px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                '& .MuiSelect-select': { color: '#12395B', fontWeight: 700 }
              }}
            >
              <MenuItem value=""><em>— Chọn Quận/Huyện —</em></MenuItem>
              {districtOptions.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>


        {/* DANH SÁCH */}
        <Typography variant="h6" fontWeight={700} mb={1.5} sx={{ color: '#12395B' }}>
            Danh sách các cửa hàng
        </Typography>

        {loading ? (
          <Box py={8} display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <Typography>Không tìm thấy cửa hàng phù hợp.</Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2}>
              {filtered.slice(0, limit).map((store) => (
                <Grid item xs={12} md={6} lg={4} key={store._id}>
                  <PillItem store={store} />
                </Grid>
              ))}
            </Grid>

            {filtered.length > limit && (
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  onClick={() => setLimit((x) => x + 12)}
                  sx={{
                    bgcolor: '#12395B',
                    borderRadius: 2,
                    px: 4,
                    height: 46,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(18,57,91,0.25)',
                    '&:hover': { bgcolor: '#0f2f4d' }
                  }}
                >
                    Xem thêm
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  )

}
