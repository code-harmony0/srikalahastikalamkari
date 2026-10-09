export const SAREES_SUBCATEGORY_ORDER = [
  "Pure Silk Kanchipuram Pattu",
  "Semi silk Kanchi Pattu",
  "Tussar Silk",
  "Moonga Tussar",
  "Bangalore Silk",
  "Cotton",
  "Linen",
  "Pochampalli",
  "Dola Silk",
  "Pure Crepe"
];

export const getSubcategorySortIndex = (subCatName: string): number => {
  const index = SAREES_SUBCATEGORY_ORDER.findIndex(
    name => name.toLowerCase() === subCatName.toLowerCase()
  );
  return index === -1 ? 999 : index;
};
