import { Box, Typography } from '@mui/material'

export function PNJBrand() {
  return (
    <Box
      sx={{
        flex: '1 1 250px',
        maxWidth: '280px',
        p: 3,
        borderRadius: '6px',
        backgroundColor: '#fff4ec',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        textAlign: 'left',
        minHeight: '180px',
      }}
    >
      <Box
        component='img'
        src="/logos/pnj.png"
        alt="PNJ"
        sx={{ width: 100, height: 'auto', mb: 2 }}
      />
      <Typography sx={{ fontSize: '14px', color: '#333', lineHeight: 1.6 }}>
        PNJ là thương hiệu cao cấp với đa dạng sản phẩm tinh tế, chất lượng
        tôn vinh vẻ đẹp của con người và cuộc sống. Các sản phẩm PNJ luôn kết
        hợp hài hòa giữa sang trọng và hiện đại.
      </Typography>
    </Box>
  )
}

export function PNJArtBrand() {
  return (
    <Box sx={{ ...brandBoxStyle }}>
      <Box
        component='img'
        src="/logos/pnjart.png"
        alt="PNJArt"
        sx={{ width: 100, height: 'auto', mb: 2 }}
      />
      <Typography sx={textStyle}>
        PNJArt là thương hiệu quà tặng đẳng cấp, giá trị ý nghĩa. Đẳng cấp
        (Classy) – Tinh tế (Elegant) – Ý Nghĩa (Meaningful).
      </Typography>
    </Box>
  )
}

export function StyleBrand() {
  return (
    <Box sx={{ ...brandBoxStyle }}>
      <Box
        component='img'
        src="/logos/style.png"
        alt="Style"
        sx={{ width: 100, height: 'auto', mb: 2 }}
      />
      <Typography sx={textStyle}>
        Style by PNJ là thương hiệu phụ kiện thời trang giúp giới trẻ khám phá
        và thể hiện bản thân qua nhiều phong cách khác nhau.
      </Typography>
    </Box>
  )
}

// ================= Collab brands =================
export function DisneyBrand() {
  return (
    <Box sx={{ ...brandBoxStyle }}>
      <Box
        component='img'
        src="/logos/disney.png"
        alt="Disney"
        sx={{ width: 100, height: 'auto', mb: 2 }}
      />
      <Typography sx={textStyle}>
        Disney | PNJ là thương hiệu trang sức mang đến những câu chuyện ý nghĩa
        và giàu cảm xúc, đồng hành cùng các cô gái trên hành trình tỏa sáng.
      </Typography>
    </Box>
  )
}

export function HelloKittyBrand() {
  return (
    <Box sx={{ ...brandBoxStyle }}>
      <Box
        component='img'
        src="/logos/hellokitty.png"
        alt="Hello Kitty"
        sx={{ width: 100, height: 'auto', mb: 2 }}
      />
      <Typography sx={textStyle}>
        PNJ ❤ Hello Kitty là người bạn đồng hành cùng mỗi bạn trẻ nữ, mang đến
        sự dễ thương và niềm vui.
      </Typography>
    </Box>
  )
}

export function MancodeBrand() {
  return (
    <Box sx={{ ...brandBoxStyle }}>
      <Box
        component='img'
        src="/logos/mancode.png"
        alt="Mancode"
        sx={{ width: 100, height: 'auto', mb: 2 }}
      />
      <Typography sx={textStyle}>
        Mancode là lựa chọn phong cách của quý ông, khẳng định sự khác biệt và
        giá trị bản lĩnh.
      </Typography>
    </Box>
  )
}

// ================= Style reuse =================
const brandBoxStyle = {
  flex: '1 1 250px',
  maxWidth: '280px',
  p: 3,
  borderRadius: '6px',
  backgroundColor: '#fff4ec',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  textAlign: 'left',
  minHeight: '180px',
}

const textStyle = {
  fontSize: '14px',
  color: '#333',
  lineHeight: 1.6,
}
