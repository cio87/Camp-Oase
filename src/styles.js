export const siteStyle = {
  background: "#f5f1e8",
  minHeight: "100vh",
  fontFamily: "Arial, sans-serif",
  color: "#2f3e34",
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
  color: "#556b5d",
};

export const headerNavStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

export const headerNavLinkStyle = {
  color: "#556b5d",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "8px 10px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.55)",
};

export const heroStyle = {
  padding: "clamp(46px, 8vw, 90px) 20px",
  textAlign: "center",
  background: "linear-gradient(135deg, #dfe8df, #f5f1e8, #efe2c6)",
};

export const badgeStyle = {
  display: "inline-block",
  background: "white",
  padding: "8px 16px",
  borderRadius: "999px",
  color: "#556b5d",
  marginBottom: "20px",
  fontSize: "clamp(13px, 3vw, 16px)",
};

export const heroTitleStyle = {
  fontSize: "clamp(34px, 8vw, 64px)",
  margin: "0",
  color: "#435749",
  lineHeight: "1.08",
};

export const heroTextStyle = {
  fontSize: "clamp(16px, 4vw, 20px)",
  maxWidth: "700px",
  margin: "24px auto 0",
  color: "#6b756d",
  lineHeight: "1.6",
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
  display: "block",
  background: "white",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 14px 35px rgba(0,0,0,0.08)",
  cursor: "pointer",
  transition: "transform 180ms ease, box-shadow 180ms ease",
};

export const productAvailabilityBadgeStyle = {
  position: "absolute",
  top: "14px",
  left: "14px",
  zIndex: 1,
  background: "rgba(85, 107, 93, 0.92)",
  color: "white",
  padding: "7px 11px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "bold",
  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
};

export const productImageStyle = {
  width: "100%",
  height: "clamp(200px, 55vw, 240px)",
  objectFit: "contain",
  background: "#f5f1e8",
};

export const productTitleStyle = {
  fontSize: "clamp(21px, 5vw, 24px)",
  margin: "0 0 10px",
};

export const productPreviewTextStyle = {
  color: "#666",
  lineHeight: "1.6",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "78px",
};

export const priceRowStyle = {
  marginTop: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
};

export const productPriceStyle = {
  fontSize: "clamp(20px, 5vw, 22px)",
  color: "#556b5d",
};

export const productCardHintStyle = {
  color: "#7f9b76",
  fontSize: "14px",
  fontWeight: "bold",
  letterSpacing: "0.01em",
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
  background: "linear-gradient(135deg, #ffffff, #f8f2e6)",
  border: "1px solid #eadfcb",
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
  border: "1px solid #e8dfcf",
  borderRadius: "clamp(22px, 5vw, 30px)",
  padding: "clamp(22px, 5vw, 34px)",
  boxShadow: "0 16px 36px rgba(0,0,0,0.07)",
};

export const detailImageStyle = {
  width: "100%",
  maxHeight: "min(560px, 70vh)",
  objectFit: "contain",
  background: "#f5f1e8",
  borderRadius: "clamp(18px, 4vw, 26px)",
  display: "block",
};

export const detailTitleStyle = {
  fontSize: "clamp(30px, 7vw, 46px)",
  color: "#435749",
  lineHeight: "1.1",
  margin: "16px 0 0",
};

export const detailDescriptionStyle = {
  fontSize: "clamp(16px, 4vw, 18px)",
  lineHeight: "1.75",
  color: "#5f5f5f",
  margin: "18px 0 0",
  whiteSpace: "pre-line",
};

export const availabilityNoticeStyle = {
  marginTop: "20px",
  display: "block",
  background: "linear-gradient(135deg, #fff8e8, #f7ecd0)",
  color: "#6d5a2f",
  border: "1px solid #ead7a5",
  padding: "14px 16px",
  borderRadius: "18px",
  fontWeight: "bold",
  lineHeight: "1.5",
};

export const detailPriceStyle = {
  fontSize: "clamp(25px, 6vw, 34px)",
  color: "#556b5d",
  lineHeight: "1.1",
};

export const detailPriceSummaryStyle = {
  marginTop: "22px",
  background: "#f5f1e8",
  border: "1px solid #e4dac7",
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
  background: "#eef3ea",
  color: "#556b5d",
  border: "1px solid #d8e1d3",
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
  background: "#2f3e34",
  color: "white",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  flex: "1 1 220px",
  fontSize: "16px",
  padding: "14px 22px",
};

export const extrasPreviewBoxStyle = {
  marginTop: "22px",
  background: "#fbfaf6",
  padding: "clamp(16px, 4vw, 20px)",
  borderRadius: "22px",
  border: "1px solid #e8dfcf",
};

export const detailExtraSectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "10px",
  flexWrap: "wrap",
  color: "#435749",
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
  borderColor: "#8da382",
  boxShadow: "0 10px 22px rgba(85,107,93,0.13)",
};

export const detailExtraLineStyle = {
  background: "transparent",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  color: "#435749",
};

export const detailExtraDescriptionStyle = {
  display: "block",
  color: "#666",
  marginTop: "4px",
  lineHeight: "1.4",
};

export const detailExtraPriceStyle = {
  color: "#556b5d",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

export const detailTotalBoxStyle = {
  marginTop: "16px",
  background: "linear-gradient(135deg, #eef3ea, #f7f1e3)",
  color: "#435749",
  padding: "15px 16px",
  borderRadius: "18px",
  border: "1px solid #dbe4d4",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  fontWeight: "bold",
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
  background: "#556b5d",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "16px",
};

export const secondaryButtonStyle = {
  background: "white",
  color: "#556b5d",
  border: "1px solid #cfd8cf",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "15px",
  marginTop: "14px",
};

export const requestButtonStyle = {
  background: "#2f3e34",
  color: "white",
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
  background: "#d9c7a2",
  color: "#2f3e34",
  border: "none",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
};

export const completeInquiryButtonStyle = {
  background: "#556b5d",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "14px",
};

export const reopenInquiryButtonStyle = {
  background: "#eef3ea",
  color: "#435749",
  border: "1px solid #cfd8cf",
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
  color: "#435749",
  textAlign: "center",
};

export const adminProductStyle = {
  background: "white",
  padding: "18px",
  borderRadius: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

export const adminAvailabilityBadgeStyle = {
  display: "inline-block",
  marginTop: "4px",
  padding: "5px 10px",
  borderRadius: "999px",
  background: "#eef3ea",
  color: "#435749",
  fontSize: "13px",
  fontWeight: "bold",
};

export const adminActionRowStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "16px",
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
  color: "#556b5d",
  border: "1px solid #d6d3cc",
  padding: "12px 18px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export const adminTabActiveStyle = {
  background: "#556b5d",
  color: "white",
  border: "1px solid #556b5d",
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
  color: "#556b5d",
  border: "none",
  padding: "8px 12px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};

export const statusFilterActiveStyle = {
  background: "white",
  color: "#2f3e34",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export const inquiryBadgeStyle = {
  background: "#d9c7a2",
  color: "#2f3e34",
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
  background: "#fbfaf6",
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
  color: "#435749",
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
  background: "#fbfaf6",
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
  background: "#eef3ea",
  color: "#435749",
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
  background: "#f5f1e8",
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
  background: "#f5f1e8",
  borderRadius: "18px",
  padding: "18px",
  margin: "16px 0",
};

export const adminImagePreviewBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  background: "#f5f1e8",
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
  color: "#435749",
  fontWeight: "bold",
  marginTop: "10px",
  marginBottom: "-4px",
};

export const checkboxRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#435749",
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
  color: "#435749",
  background: "#eef3ea",
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: "999px",
};

export const adminSelectedExtrasStyle = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "14px",
  background: "#f5f1e8",
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
  color: "#556b5d",
};

export const modalHeaderStyle = {
  marginBottom: "22px",
};

export const modalBadgeStyle = {
  display: "inline-block",
  background: "#f5f1e8",
  color: "#556b5d",
  padding: "7px 13px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "14px",
};

export const modalTitleStyle = {
  margin: "0",
  color: "#435749",
  fontSize: "clamp(26px, 6vw, 34px)",
  lineHeight: "1.15",
};

export const modalIntroStyle = {
  color: "#6b756d",
  lineHeight: "1.6",
  marginTop: "12px",
};

export const modalProductBoxStyle = {
  background: "linear-gradient(135deg, #f5f1e8, #eef3ea)",
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
  color: "#435749",
  fontSize: "18px",
};

export const modalProductPriceStyle = {
  background: "white",
  color: "#556b5d",
  padding: "8px 12px",
  borderRadius: "999px",
  fontWeight: "bold",
};

export const extrasBoxStyle = {
  background: "#f5f1e8",
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
  color: "#435749",
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
  color: "#435749",
  padding: "12px 14px",
  borderRadius: "14px",
};

export const labelStyle = {
  display: "block",
  color: "#435749",
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
  color: "#435749",
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

export const footerLoginStyle = {
  color: "#9aa79b",
  textDecoration: "none",
  opacity: 0.65,
  fontSize: "12px",
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
  color: "#435749",
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
  background: "#f5f1e8",
  borderLeft: "4px solid #d9c7a2",
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
  border: "1px solid #e8dfcf",
  borderRadius: "20px",
  padding: "20px",
  color: "#435749",
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
  background: "#f5f1e8",
  marginBottom: "8px",
  fontSize: "20px",
};

export const aboutNoteStyle = {
  marginTop: "26px",
  background: "#eef3ea",
  border: "1px solid #d7e2d2",
  borderRadius: "20px",
  padding: "18px 20px",
  color: "#435749",
  lineHeight: "1.7",
  fontWeight: "bold",
};

export const contactInfoStyle = {
  marginTop: "22px",
  background: "rgba(255,255,255,0.86)",
  border: "1px solid #e8dfcf",
  borderRadius: "20px",
  padding: "18px 20px",
  color: "#435749",
  lineHeight: "1.7",
};

