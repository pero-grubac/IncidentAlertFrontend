import { Box, Stack, Typography } from "@mui/material";
import { useT } from "../i18n";

export function BrandMark({ size = 36 }) {
  return (
    <Box
      component="img"
      src="/favicon.svg"
      alt=""
      sx={{ width: size, height: size, borderRadius: size / 4, boxShadow: "0 6px 14px -4px rgba(225, 29, 72, 0.55)", flexShrink: 0 }}
    />
  );
}

export default function Brand({ subtitleKey = "brand.tagline" }) {
  const t = useT();
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <BrandMark />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" component="h1" lineHeight={1.15} noWrap>
          Incident Alert
        </Typography>
        <Typography variant="caption" color="text.secondary" lineHeight={1.2} display="block" noWrap>
          {t(subtitleKey)}
        </Typography>
      </Box>
    </Stack>
  );
}
