export const siteStyle = {
  background: "#f5efe3",
  minHeight: "100vh",
  fontFamily: "Arial, sans-serif",
  color: "#3b3329",
};

export const pageStyle = {
  ...siteStyle,
  padding: "clamp(24px, 5vw, 40px)",
};

export const adminShellStyle = {
  width: "100%",
  maxWidth: "1120px",
  margin: "0 auto",
};

export const headerStyle = {
  padding: "clamp(14px, 3vw, 20px) max(18px, calc((100vw - 1200px) / 2))",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(10px)",
};

export const logoStyle = {
  width: "clamp(52px, 10vw, 64px)",
  height: "clamp(52px, 10vw, 64px)",
  borderRadius: "50%",
  objectFit: "cover",
};

export const brandTextStyle = {
  fontSize: "clamp(22px, 5vw, 26px)",
  color: "#344238",
};

export const headerNavStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  alignItems: "center",
};

export const headerNavLinkStyle = {
  color: "#2F3A34",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 700,
  padding: "9px 13px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.58)",
  border: "1px solid rgba(216, 224, 210, 0.78)",
  boxShadow: "0 6px 16px rgba(47, 58, 52, 0.04)",
};

export const headerBrandLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  color: "inherit",
  textDecoration: "none",
};

export const hamburgerButtonStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "999px",
  border: "1px solid #D8E0D2",
  background: "rgba(255,255,255,0.9)",
  color: "#2F3A34",
  cursor: "pointer",
  fontSize: "24px",
  lineHeight: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 22px rgba(47, 58, 52, 0.08)",
};

export const menuOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  background: "rgba(47, 58, 52, 0.3)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "clamp(96px, 18vh, 128px) 18px 24px",
};

export const menuPanelStyle = {
  width: "min(430px, 100%)",
  maxHeight: "calc(100vh - 124px)",
  overflowY: "auto",
  background: "linear-gradient(145deg, #fffdf8 0%, #F7F1E8 100%)",
  border: "1px solid #D8E0D2",
  borderRadius: "26px",
  boxShadow: "0 18px 42px rgba(47, 58, 52, 0.14)",
  padding: "clamp(20px, 6vw, 28px)",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

export const menuHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
};

export const menuCloseButtonStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  border: "1px solid #D8E0D2",
  background: "#fffaf3",
  color: "#2F3A34",
  cursor: "pointer",
  fontSize: "24px",
  lineHeight: 1,
};

export const menuLinkStyle = {
  display: "block",
  color: "#2F3A34",
  textDecoration: "none",
  fontSize: "19px",
  fontWeight: 700,
  padding: "17px 18px",
  borderRadius: "18px",
  background: "rgba(255, 250, 243, 0.82)",
  border: "1px solid rgba(216, 224, 210, 0.82)",
  boxShadow: "0 6px 16px rgba(47, 58, 52, 0.035)",
  textAlign: "center",
};

export const announcementBannerStyle = {
  maxWidth: "1120px",
  margin: "clamp(18px, 4vw, 30px) auto 0",
  padding: "0 clamp(14px, 5vw, 32px)",
  color: "#2F3A34",
};

export const announcementBannerInnerStyle = {
  background: "linear-gradient(135deg, #F7F1E8, #E8F1EF)",
  border: "1px solid #D8E0D2",
  borderRadius: "22px",
  boxShadow: "0 14px 34px rgba(0,0,0,0.07)",
  padding: "clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)",
  textAlign: "center",
  fontSize: "clamp(15px, 3vw, 18px)",
  fontWeight: "bold",
  overflow: "hidden",
};

export const announcementBannerLinkStyle = {
  color: "#2F3A34",
  textDecoration: "none",
  minWidth: 0,
  flex: "1 1 auto",
};

export const announcementBannerTextWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  width: "100%",
  minWidth: 0,
  flexWrap: "wrap",
};

export const announcementBannerBadgeStyle = {
  flex: "0 0 auto",
  background: "#F6D8BE",
  color: "#2F3A34",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  letterSpacing: "0.02em",
  textTransform: "uppercase",
};

export const announcementBannerTextViewportStyle = {
  display: "block",
  minWidth: 0,
  width: "100%",
  overflow: "hidden",
  textAlign: "center",
};

export const announcementBannerMarqueeStyle = {
  display: "inline-block",
  whiteSpace: "nowrap",
  paddingLeft: "20px",
  minWidth: "max-content",
  animation: "campoase-marquee 30s linear infinite",
};

export const pillBackLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  color: "#2F3A34",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "9px 13px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #D8E0D2",
  boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
};

export const heroStyle = {
  padding: "clamp(46px, 8vw, 90px) 20px",
  textAlign: "center",
  background: "linear-gradient(120deg, #eef2e8 0%, #f7f1e6 58%, #efe0cd 100%)",
};

export const badgeStyle = {
  display: "inline-block",
  background: "rgba(255, 250, 243, 0.9)",
  padding: "8px 16px",
  borderRadius: "999px",
  color: "#465740",
  marginBottom: "20px",
  fontSize: "clamp(13px, 3vw, 16px)",
};

export const heroTitleStyle = {
  fontSize: "clamp(34px, 8vw, 64px)",
  margin: "0",
  color: "#344238",
  lineHeight: "1.08",
};

export const heroTextStyle = {
  fontSize: "clamp(16px, 4vw, 20px)",
  maxWidth: "700px",
  margin: "24px auto 0",
  color: "#5f594e",
  lineHeight: "1.6",
};

export const homeBrandSectionStyle = {
  maxWidth: "1120px",
  margin: "clamp(16px, 5vw, 38px) auto 0",
  padding: "0 clamp(14px, 5vw, 32px)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "clamp(10px, 3vw, 18px)",
  alignItems: "stretch",
};

export const homeBrandIntroStyle = {
  background: "linear-gradient(135deg, rgba(255,250,243,0.94), #efe6d7)",
  border: "1px solid #eadfcd",
  borderRadius: "24px",
  padding: "clamp(16px, 4vw, 28px)",
  boxShadow: "0 12px 28px rgba(72, 54, 34, 0.055)",
};

export const homeBrandTitleStyle = {
  margin: "10px 0 0",
  color: "#344238",
  fontSize: "clamp(25px, 5vw, 34px)",
  lineHeight: "1.15",
};

export const homeBrandTextStyle = {
  margin: "clamp(8px, 2vw, 14px) 0 0",
  color: "#5f594e",
  lineHeight: "1.6",
  fontSize: "clamp(15px, 3vw, 17px)",
};

export const homeBrandCardGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: "clamp(8px, 2vw, 12px)",
};

export const homeBrandCardStyle = {
  background: "rgba(255,250,243,0.86)",
  border: "1px solid #eadfcd",
  borderRadius: "20px",
  padding: "clamp(13px, 3vw, 18px)",
  color: "#3b3329",
  lineHeight: "1.45",
  boxShadow: "0 8px 20px rgba(72, 54, 34, 0.045)",
};

export const sectionStyle = {
  padding: "clamp(36px, 6vw, 60px) clamp(18px, 5vw, 40px)",
};

export const sectionTitleStyle = {
  fontSize: "clamp(28px, 7vw, 38px)",
  marginTop: "8px",
};

export const productGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "28px",
  marginTop: "32px",
};

export const productCardStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  background: "linear-gradient(180deg, #fffaf3 0%, #f7efe2 100%)",
  border: "1px solid #eadfcd",
  borderRadius: "26px",
  overflow: "hidden",
  boxShadow: "0 12px 28px rgba(72, 54, 34, 0.065)",
  cursor: "pointer",
  transition: "transform 180ms ease, box-shadow 180ms ease",
};

export const productAvailabilityBadgeStyle = {
  position: "absolute",
  top: "14px",
  left: "14px",
  zIndex: 1,
  background: "rgba(246, 216, 190, 0.92)",
  color: "#3A2B1F",
  border: "1px solid rgba(120, 85, 50, 0.18)",
  padding: "0.45rem 0.7rem",
  borderRadius: "999px",
  fontSize: "0.78rem",
  fontWeight: 700,
  boxShadow: "0 6px 14px rgba(50, 35, 20, 0.12)",
};

export const productImageStyle = {
  width: "100%",
  height: "clamp(210px, 55vw, 248px)",
  objectFit: "contain",
  background: "linear-gradient(135deg, #f7f1e6, #efe6d7)",
};

export const productCardContentStyle = {
  padding: "24px 24px 0",
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
};

export const productCardMetaRowStyle = {
  minHeight: "30px",
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "10px",
};

export const productExtrasBadgeStyle = {
  display: "inline-block",
  background: "#eef2e8",
  color: "#465740",
  border: "1px solid #d8e0d2",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
};

export const productTitleStyle = {
  fontSize: "clamp(21px, 5vw, 24px)",
  margin: "0 0 10px",
  color: "#344238",
  lineHeight: "1.2",
};

export const productPreviewTextStyle = {
  color: "#665e52",
  lineHeight: "1.6",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "78px",
};

export const priceRowStyle = {
  marginTop: "22px",
  background: "#f4eadb",
  border: "1px solid #e4d7c3",
  borderRadius: "18px",
  padding: "13px 15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
};

export const productPriceStyle = {
  fontSize: "clamp(20px, 5vw, 22px)",
  color: "#344238",
};

export const productPriceStackStyle = {
  display: "grid",
  gap: "2px",
};

export const productOldPriceStyle = {
  color: "#8f958c",
  fontSize: "14px",
  textDecoration: "line-through",
};

export const productActionPriceStyle = {
  ...productPriceStyle,
  color: "#7a4f35",
};

export const productCardHintStyle = {
  color: "#465740",
  fontSize: "14px",
  fontWeight: "bold",
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
};

export const taxHintStyle = {
  color: "#7f8f82",
  fontSize: "12px",
  lineHeight: "1.45",
  margin: "8px 0 0",
 };

export const detailSectionStyle = {
  padding: "clamp(28px, 6vw, 64px) clamp(18px, 5vw, 40px)",
};

export const detailLayoutStyle = {
  width: "100%",
  maxWidth: "1180px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))",
  gap: "clamp(22px, 5vw, 42px)",
  alignItems: "start",
};

export const detailMediaPanelStyle = {
  background: "linear-gradient(135deg, #ffffff, #F7F1E8)",
  border: "1px solid #E8F1EF",
  borderRadius: "clamp(22px, 5vw, 34px)",
  padding: "clamp(12px, 3vw, 18px)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.08)",
};

export const detailMediaStickyStyle = {
  position: "sticky",
  top: "110px",
  alignSelf: "start",
};

export const detailInfoPanelStyle = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #E8F1EF",
  borderRadius: "clamp(22px, 5vw, 30px)",
  padding: "clamp(22px, 5vw, 34px)",
  boxShadow: "0 16px 36px rgba(0,0,0,0.07)",
};

export const detailImageStyle = {
  width: "100%",
  maxHeight: "min(560px, 70vh)",
  objectFit: "contain",
  background: "#F7F1E8",
  borderRadius: "clamp(18px, 4vw, 26px)",
  display: "block",
};

export const detailTitleStyle = {
  fontSize: "clamp(30px, 7vw, 46px)",
  color: "#2F3A34",
  lineHeight: "1.1",
  margin: "16px 0 0",
};

export const detailDescriptionStyle = {
  fontSize: "clamp(16px, 4vw, 18px)",
  lineHeight: "1.75",
  color: "#5f5f5f",
  margin: "18px 0 0",
};

export const availabilityNoticeStyle = {
  marginTop: "20px",
  display: "block",
  background: "linear-gradient(135deg, #F7F1E8, #F3E7D8)",
  color: "#2F3A34",
  border: "1px solid #F6D8BE",
  padding: "14px 16px",
  borderRadius: "18px",
  fontWeight: "bold",
  lineHeight: "1.5",
};

export const detailPriceStyle = {
  fontSize: "clamp(25px, 6vw, 34px)",
  color: "#2F3A34",
  lineHeight: "1.1",
};

export const detailPriceContentStyle = {
  display: "grid",
  justifyItems: "end",
  gap: "3px",
};

export const detailOldPriceStyle = {
  color: "#8f958c",
  fontSize: "16px",
  textDecoration: "line-through",
};

export const detailPriceSummaryStyle = {
  marginTop: "22px",
  background: "#F7F1E8",
  border: "1px solid #E8F1EF",
  borderRadius: "20px",
  padding: "16px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
  color: "#7a7f75",
  fontSize: "14px",
  fontWeight: "bold",
};

export const detailTrustRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "20px",
};

export const detailTrustPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  background: "#E8F1EF",
  color: "#2F3A34",
  border: "1px solid #D8E0D2",
  borderRadius: "999px",
  padding: "7px 11px",
  fontSize: "13px",
  fontWeight: "bold",
};

export const detailActionRowStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "22px",
};

export const detailRequestButtonStyle = {
  background: "#6f8069",
  color: "#fffaf3",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  flex: "1 1 220px",
  fontSize: "16px",
  padding: "14px 22px",
};

export const extrasPreviewBoxStyle = {
  marginTop: "22px",
  background: "#F7F1E8",
  padding: "clamp(16px, 4vw, 20px)",
  borderRadius: "22px",
  border: "1px solid #E8F1EF",
};

export const detailExtraSectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "10px",
  flexWrap: "wrap",
  color: "#2F3A34",
  fontWeight: "bold",
};

export const detailExtraGridStyle = {
  marginTop: "14px",
  display: "grid",
  gap: "12px",
};

export const detailExtraChoiceCardStyle = {
  background: "white",
  border: "1px solid #ece4d8",
  borderRadius: "18px",
  padding: "14px",
  boxShadow: "0 8px 18px rgba(0,0,0,0.04)",
  transition: "border-color 160ms ease, box-shadow 160ms ease",
};

export const detailExtraCardSelectedStyle = {
  borderColor: "#D8E0D2",
  boxShadow: "0 10px 22px rgba(85,107,93,0.13)",
};

export const detailExtraLineStyle = {
  background: "transparent",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  color: "#2F3A34",
};

export const detailExtraDescriptionStyle = {
  display: "block",
  color: "#666",
  marginTop: "4px",
  lineHeight: "1.4",
};

export const detailExtraPriceStyle = {
  color: "#2F3A34",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

export const detailTotalBoxStyle = {
  marginTop: "16px",
  background: "linear-gradient(135deg, #E8F1EF, #F7F1E8)",
  color: "#2F3A34",
  padding: "15px 16px",
  borderRadius: "18px",
  border: "1px solid #D8E0D2",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  fontWeight: "bold",
};

export const cartPageStyle = {
  width: "100%",
  maxWidth: "1080px",
  margin: "0 auto",
};

export const cartItemStyle = {
  background: "rgba(255,255,255,0.86)",
  border: "1px solid #E8F1EF",
  borderRadius: "22px",
  padding: "clamp(16px, 4vw, 22px)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: "18px",
  alignItems: "start",
  boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
};

export const cartImageStyle = {
  width: "100%",
  maxWidth: "160px",
  aspectRatio: "1 / 1",
  objectFit: "contain",
  background: "#F7F1E8",
  borderRadius: "18px",
};

export const cartQuantityRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

export const cartQuantityButtonStyle = {
  width: "40px",
  height: "40px",
  border: "1px solid #D8E0D2",
  borderRadius: "12px",
  background: "#E8F1EF",
  color: "#2F3A34",
  cursor: "pointer",
  fontSize: "18px",
  fontWeight: "bold",
};

export const cartSummaryStyle = {
  marginTop: "18px",
  background: "linear-gradient(135deg, #E8F1EF, #F7F1E8)",
  border: "1px solid #D8E0D2",
  borderRadius: "22px",
  padding: "clamp(18px, 4vw, 24px)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  flexWrap: "wrap",
  color: "#2F3A34",
};

export const cartEmptyStyle = {
  background: "rgba(255,255,255,0.86)",
  border: "1px solid #E8F1EF",
  borderRadius: "22px",
  padding: "clamp(22px, 5vw, 32px)",
  boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
  color: "#5f665f",
  lineHeight: "1.7",
};

export const formStyle = {
  width: "100%",
  maxWidth: "700px",
  background: "white",
  padding: "clamp(22px, 5vw, 30px)",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  margin: "30px auto 0",
  boxSizing: "border-box",
};

export const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "12px",
  marginBottom: "12px",
  borderRadius: "14px",
  border: "1px solid #ddd",
  fontSize: "16px",
  boxSizing: "border-box",
};

export const buttonStyle = {
  background: "#6f8069",
  color: "#fffaf3",
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "16px",
};

export const secondaryButtonStyle = {
  background: "white",
  color: "#2F3A34",
  border: "1px solid #D8E0D2",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "15px",
  marginTop: "14px",
};

export const requestButtonStyle = {
  background: "#6f8069",
  color: "#fffaf3",
  border: "none",
  padding: "10px 16px",
  borderRadius: "14px",
  cursor: "pointer",
};

export const deleteButtonStyle = {
  background: "#9b4d4d",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
};

export const smallDeleteButtonStyle = {
  background: "#9b4d4d",
  color: "white",
  border: "none",
  padding: "8px 10px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "13px",
};

export const editButtonStyle = {
  background: "#6f8069",
  color: "#fffaf3",
  border: "none",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
};

export const completeInquiryButtonStyle = {
  background: "#D8E0D2",
  color: "#2F3A34",
  border: "none",
  padding: "8px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "14px",
};

export const reopenInquiryButtonStyle = {
  background: "#E8F1EF",
  color: "#2F3A34",
  border: "1px solid #D8E0D2",
  padding: "8px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "14px",
};

export const compactEditButtonStyle = {
  ...editButtonStyle,
  padding: "8px 12px",
  borderRadius: "10px",
  fontSize: "14px",
};

export const compactDeleteButtonStyle = {
  ...deleteButtonStyle,
  padding: "8px 12px",
  borderRadius: "10px",
  fontSize: "14px",
};

export const adminTitleStyle = {
  marginTop: "30px",
  fontSize: "clamp(30px, 8vw, 42px)",
  color: "#2F3A34",
  textAlign: "center",
};

export const adminProductStyle = {
  background: "white",
  padding: "14px 16px",
  borderRadius: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  flexWrap: "wrap",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

export const adminAvailabilityBadgeStyle = {
  display: "inline-block",
  marginTop: "4px",
  padding: "5px 10px",
  borderRadius: "999px",
  background: "#E8F1EF",
  color: "#2F3A34",
  fontSize: "13px",
  fontWeight: "bold",
};

export const adminActionRowStyle = {
  display: "flex",
  gap: "8px",
  marginTop: "4px",
  flexWrap: "wrap",
};

export const adminTabsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginTop: "32px",
  marginBottom: "10px",
  flexWrap: "wrap",
};

export const adminTabButtonStyle = {
  background: "white",
  color: "#2F3A34",
  border: "1px solid #d6d3cc",
  padding: "12px 18px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export const adminTabActiveStyle = {
  background: "#D8E0D2",
  color: "#2F3A34",
  border: "1px solid #D8E0D2",
};

export const statusFilterRowStyle = {
  width: "fit-content",
  display: "flex",
  gap: "4px",
  margin: "14px auto 0",
  padding: "4px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.68)",
  border: "1px solid #e3ded4",
  flexWrap: "wrap",
};

export const statusFilterButtonStyle = {
  background: "transparent",
  color: "#2F3A34",
  border: "none",
  padding: "8px 12px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};

export const statusFilterActiveStyle = {
  background: "white",
  color: "#2F3A34",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export const inquiryBadgeStyle = {
  background: "#F6D8BE",
  color: "#2F3A34",
  padding: "2px 8px",
  borderRadius: "999px",
  marginLeft: "6px",
  fontSize: "13px",
};

export const inquiryCardStyle = {
  background: "white",
  padding: "clamp(16px, 4vw, 20px)",
  borderRadius: "16px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

export const inquiryCardDoneStyle = {
  opacity: 0.72,
  background: "#F7F1E8",
};

export const inquiryListStyle = {
  width: "100%",
  display: "grid",
  gap: "12px",
  margin: "16px auto 0",
  maxWidth: "920px",
};

export const inquiryHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  flexWrap: "wrap",
};

export const inquiryTitleStyle = {
  margin: 0,
  color: "#2F3A34",
  fontSize: "clamp(18px, 4vw, 22px)",
  lineHeight: "1.25",
};

export const inquiryInfoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
  marginTop: "14px",
};

export const inquiryInfoBoxStyle = {
  background: "#F7F1E8",
  border: "1px solid #eee7da",
  borderRadius: "12px",
  padding: "10px 12px",
  lineHeight: "1.4",
  overflowWrap: "anywhere",
};

export const inquiryInfoLabelStyle = {
  display: "block",
  marginBottom: "3px",
  color: "#888",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

export const statusBadgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  background: "#E8F1EF",
  color: "#2F3A34",
  fontSize: "12px",
  fontWeight: "bold",
};

export const statusBadgeDoneStyle = {
  background: "#eee9df",
  color: "#777",
};

export const inquiryMetaStyle = {
  color: "#888",
  fontSize: "13px",
  margin: "5px 0 0",
};

export const inquiryMessageStyle = {
  marginTop: "12px",
  padding: "12px 14px",
  background: "#F7F1E8",
  borderRadius: "12px",
  color: "#444",
  whiteSpace: "pre-line",
  lineHeight: "1.5",
  fontSize: "14px",
};

export const inquiryActionRowStyle = {
  display: "flex",
  gap: "8px",
  marginTop: "14px",
  flexWrap: "wrap",
  alignItems: "center",
};

export const emptyBoxStyle = {
  maxWidth: "920px",
  margin: "20px auto 0",
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  color: "#666",
};

export const adminExtrasBoxStyle = {
  background: "#F7F1E8",
  borderRadius: "18px",
  padding: "18px",
  margin: "16px 0",
};

export const adminImagePreviewBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  background: "#F7F1E8",
  borderRadius: "16px",
  padding: "12px",
  margin: "12px 0",
  flexWrap: "wrap",
};

export const adminImagePreviewImageStyle = {
  width: "92px",
  height: "72px",
  objectFit: "cover",
  borderRadius: "12px",
  background: "white",
};

export const adminImagePreviewOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(47, 62, 52, 0.58)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "clamp(16px, 4vw, 34px)",
};

export const adminImagePreviewModalStyle = {
  position: "relative",
  maxWidth: "min(920px, 100%)",
  maxHeight: "min(82vh, 760px)",
  background: "linear-gradient(135deg, #ffffff, #F7F1E8)",
  border: "1px solid #E8F1EF",
  borderRadius: "24px",
  padding: "clamp(12px, 3vw, 18px)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.28)",
};

export const adminImagePreviewModalImageStyle = {
  display: "block",
  maxWidth: "100%",
  maxHeight: "76vh",
  objectFit: "contain",
  borderRadius: "18px",
  background: "#F7F1E8",
};

export const adminImagePreviewTextStyle = {
  margin: "6px 0 10px",
  color: "#667",
  fontSize: "14px",
  lineHeight: "1.5",
};

export const customExtraCardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "14px",
};

export const customExtraHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "10px",
};

export const adminExtraLabelStyle = {
  display: "block",
  color: "#2F3A34",
  fontWeight: "bold",
  marginTop: "10px",
  marginBottom: "-4px",
};

export const checkboxRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#2F3A34",
  fontWeight: "bold",
};

export const adminHintStyle = {
  color: "#667",
  fontSize: "14px",
  lineHeight: "1.5",
};

export const adminProductExtrasInfoStyle = {
  margin: "8px 0 0",
  color: "#7f8f82",
  fontSize: "14px",
  lineHeight: "1.5",
};

export const adminTotalStyle = {
  marginTop: "14px",
  color: "#2F3A34",
  background: "#E8F1EF",
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: "999px",
};

export const adminSelectedExtrasStyle = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "14px",
  background: "#F7F1E8",
  color: "#444",
  lineHeight: "1.6",
};

export const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
  zIndex: 9999,
};

export const modalStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "560px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "clamp(20px, 5vw, 28px)",
  padding: "clamp(22px, 5vw, 32px)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

export const modalCloseButtonStyle = {
  position: "absolute",
  right: "18px",
  top: "14px",
  border: "none",
  background: "transparent",
  fontSize: "34px",
  cursor: "pointer",
  color: "#2F3A34",
};

export const modalHeaderStyle = {
  marginBottom: "22px",
};

export const modalBadgeStyle = {
  display: "inline-block",
  background: "#F7F1E8",
  color: "#2F3A34",
  padding: "7px 13px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "14px",
};

export const modalTitleStyle = {
  margin: "0",
  color: "#2F3A34",
  fontSize: "clamp(26px, 6vw, 34px)",
  lineHeight: "1.15",
};

export const modalIntroStyle = {
  color: "#6b756d",
  lineHeight: "1.6",
  marginTop: "12px",
};

export const modalProductBoxStyle = {
  background: "linear-gradient(135deg, #F7F1E8, #E8F1EF)",
  border: "1px solid #e2ded3",
  borderRadius: "20px",
  padding: "18px",
  marginBottom: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

export const modalProductLabelStyle = {
  display: "block",
  fontSize: "13px",
  color: "#7f8f82",
  marginBottom: "5px",
};

export const modalProductTitleStyle = {
  color: "#2F3A34",
  fontSize: "18px",
};

export const modalProductPriceStyle = {
  background: "white",
  color: "#2F3A34",
  padding: "8px 12px",
  borderRadius: "999px",
  fontWeight: "bold",
};

export const extrasBoxStyle = {
  background: "#F7F1E8",
  border: "1px solid #e2ded3",
  borderRadius: "20px",
  padding: "18px",
  marginBottom: "20px",
};

export const extraChoiceCardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "14px",
  marginTop: "12px",
};

export const extraOptionStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  margin: "0",
  color: "#2F3A34",
  fontWeight: "bold",
};

export const extraDescriptionStyle = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "8px 0 0 26px",
};

export const totalBoxStyle = {
  marginTop: "16px",
  background: "white",
  color: "#2F3A34",
  padding: "12px 14px",
  borderRadius: "14px",
};

export const labelStyle = {
  display: "block",
  color: "#2F3A34",
  fontWeight: "bold",
  marginTop: "14px",
  marginBottom: "-4px",
};

export const privacyHintStyle = {
  fontSize: "13px",
  color: "#7f8f82",
  lineHeight: "1.5",
  marginTop: "4px",
};

export const fullButtonStyle = {
  ...buttonStyle,
  width: "100%",
  marginTop: "14px",
  padding: "14px 18px",
};

export const disabledButtonStyle = {
  ...fullButtonStyle,
  opacity: 0.65,
  cursor: "not-allowed",
};

export const successBoxStyle = {
  marginTop: "16px",
  background: "#eef5ee",
  color: "#2F3A34",
  border: "1px solid #cddfcd",
  padding: "14px",
  borderRadius: "14px",
  fontWeight: "bold",
};

export const errorBoxStyle = {
  marginTop: "16px",
  background: "#f8eeee",
  color: "#8a3d3d",
  border: "1px solid #e2bcbc",
  padding: "14px",
  borderRadius: "14px",
  fontWeight: "bold",
};

export const footerStyle = {
  padding: "28px 20px",
  textAlign: "center",
  color: "#7f8f82",
  fontSize: "13px",
  lineHeight: "2",
};

export const footerDotStyle = {
  margin: "0 8px",
  color: "#a1a89f",
};

export const footerLinkStyle = {
  color: "#7f8f82",
  textDecoration: "none",
};

export const legalContentStyle = {
  maxWidth: "820px",
  margin: "0 auto",
  background: "white",
  padding: "clamp(24px, 5vw, 36px)",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  lineHeight: "1.8",
  color: "#555",
};

export const legalTitleStyle = {
  color: "#2F3A34",
  fontSize: "clamp(32px, 8vw, 42px)",
};

export const aboutPageStyle = {
  maxWidth: "980px",
  margin: "0 auto",
  background: "linear-gradient(135deg, #ffffff 0%, #fbf7ed 100%)",
  padding: "clamp(24px, 5vw, 48px)",
  borderRadius: "28px",
  boxShadow: "0 16px 38px rgba(0,0,0,0.08)",
  border: "1px solid rgba(232, 223, 207, 0.9)",
};

export const aboutIntroStyle = {
  maxWidth: "780px",
  color: "#4f5b51",
  fontSize: "clamp(18px, 4vw, 22px)",
  lineHeight: "1.8",
  marginBottom: "22px",
};

export const aboutStoryStyle = {
  maxWidth: "760px",
  background: "#F7F1E8",
  borderLeft: "4px solid #F6D8BE",
  borderRadius: "18px",
  padding: "18px 20px",
  color: "#5f665f",
  lineHeight: "1.8",
  fontSize: "16px",
};

export const aboutCardGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: "18px",
  marginTop: "30px",
};

export const aboutCardStyle = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #E8F1EF",
  borderRadius: "20px",
  padding: "20px",
  color: "#2F3A34",
  lineHeight: "1.6",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
};

export const aboutCardIconStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "38px",
  height: "38px",
  borderRadius: "999px",
  background: "#F7F1E8",
  marginBottom: "8px",
  fontSize: "20px",
};

export const aboutNoteStyle = {
  marginTop: "26px",
  background: "#E8F1EF",
  border: "1px solid #D8E0D2",
  borderRadius: "20px",
  padding: "18px 20px",
  color: "#2F3A34",
  lineHeight: "1.7",
  fontWeight: "bold",
};

export const contactInfoStyle = {
  marginTop: "22px",
  background: "rgba(255,255,255,0.86)",
  border: "1px solid #E8F1EF",
  borderRadius: "20px",
  padding: "18px 20px",
  color: "#2F3A34",
  lineHeight: "1.7",
};

