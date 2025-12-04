export type ProductCategoryId =
    | "ready_food"
    | "fresh"
    | "drink"
    | "snack"
    | "home"
    | "convenience"
    | "other";

export type ProductCategory = {
    id: ProductCategoryId;
    label: string;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
    { id: "ready_food", label: "อาหารพร้อมทาน" },
    { id: "fresh", label: "วัตถุดิบ / ของสด" },
    { id: "drink", label: "เครื่องดื่ม" },
    { id: "snack", label: "ขนม / เบเกอรี่" },
    { id: "home", label: "ของใช้ในบ้าน" },
    { id: "convenience", label: "ร้านสะดวกซื้อ" },
    { id: "other", label: "อื่น ๆ" },
];
