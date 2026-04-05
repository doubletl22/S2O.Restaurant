/**
 * ITC_4.2: Vietnamese String Normalization Utils
 * Xử lý diacritics (dấu tiếng Việt) và special characters
 * 
 * VD: 
 * - "Phở Bò" → "pho bo"
 * - "Café" → "cafe"
 * - "Bánh mì" → "banh mi"
 */

/**
 * Chuẩn hóa string: Xóa diacritics, chuyển thường, loại khoảng trắng thừa
 * @param str Input string
 * @returns Normalized string
 */
export function normalizeString(str: string): string {
  if (!str) return "";
  
  return str
    .normalize("NFD")                          // Tách diacritics
    .replace(/[\u0300-\u036f]/g, "")          // Xóa combining diacritical marks
    .toLowerCase()
    .trim();
}

/**
 * So sánh 2 strings bỏ qua diacritics (ITC_4.2)
 * VD: "Phở" === "Pho" → true
 */
export function compareIgnoreDiacritics(str1: string, str2: string): boolean {
  return normalizeString(str1) === normalizeString(str2);
}

/**
 * Kiểm tra xem string có chứa substring (ignore diacritics)
 * VD: "Phở Bò".includes("Pho") → true
 */
export function includesIgnoreDiacritics(str: string, search: string): boolean {
  return normalizeString(str).includes(normalizeString(search));
}

/**
 * Xóa toàn bộ khoảng trắng thừa (multiple spaces → single space)
 */
export function trimExtraSpaces(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Truncate string với ellipsis
 * VD: "Nhà Hàng Phở Bò" với maxLength=10 → "Nhà Hàng ..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
