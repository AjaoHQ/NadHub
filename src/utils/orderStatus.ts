export type OrderStatus =
    | "pending"       // customer created
    | "confirmed"     // shop approved order
    | "assigned"      // rider accepted
    | "picked_up"     // rider picked items
    | "delivered"     // rider delivered to customer
    // Legacy Statuses (Keep for backward compatibility during migration)
    | "PENDING_STORE_CONFIRM"
    | "STORE_CONFIRMED"
    | "WAITING_RIDER"
    | "RIDER_HEADING_TO_STORE"
    | "PICKED_UP" // Duplicate with lowercase? No, case sensitive.
    | "RIDER_ARRIVED"
    | "DELIVERED_WAITING_PAYMENT"
    | "COMPLETED"
    | "CANCELLED";

export function getOrderStatusLabel(status: OrderStatus): string {
    switch (status) {
        case "pending":
        case "PENDING_STORE_CONFIRM":
            return "ร้านค้ากำลังตรวจสอบคำสั่งซื้อ";
        case "confirmed":
        case "STORE_CONFIRMED":
            return "ร้านค้ายืนยันคำสั่งแล้ว รอไรเดอร์รับงาน";
        case "assigned":
        case "WAITING_RIDER":
        case "RIDER_HEADING_TO_STORE":
            return "ไรเดอร์รับงานแล้ว";
        case "picked_up":
        case "PICKED_UP":
            return "ไรเดอร์รับสินค้าแล้ว กำลังนำส่ง";
        case "delivered":
        case "DELIVERED_WAITING_PAYMENT":
        case "COMPLETED":
            return "จัดส่งสำเร็จ";
        case "RIDER_ARRIVED":
            return "ไรเดอร์ถึงที่อยู่แล้ว";
        case "CANCELLED":
            return "ถูกยกเลิก";
        default:
            return "ไม่ทราบสถานะ";
    }
}

export function getOrderStatusColor(status: OrderStatus): string {
    switch (status) {
        case "pending":
        case "PENDING_STORE_CONFIRM":
            return "#F5A623"; // Yellow
        case "confirmed":
        case "STORE_CONFIRMED":
            return "#36D873"; // Green
        case "assigned":
        case "picked_up":
        case "delivered":
        case "WAITING_RIDER":
        case "RIDER_HEADING_TO_STORE":
        case "PICKED_UP":
        case "RIDER_ARRIVED":
        case "DELIVERED_WAITING_PAYMENT":
        case "COMPLETED":
            return "#36D873"; // Green
        case "CANCELLED":
            return "#FF5C5C"; // Red
        default:
            return "#8FA3A3";
    }
}

export function isActiveStatus(status: OrderStatus): boolean {
    return (
        status !== "COMPLETED" &&
        status !== "CANCELLED"
    );
}
