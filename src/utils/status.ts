export function getOrderStatusLabel(status: string) {
    const s = String(status || "").toUpperCase();
    switch (s) {
        case "PENDING": return "รอรับงาน";
        case "ACCEPTED": return "รับงานแล้ว";
        case "PICKED_UP": return "รับของแล้ว";
        case "DELIVERING": return "กำลังส่ง";
        case "DELIVERED": return "ส่งสำเร็จ";
        case "CANCELLED": return "ยกเลิก";
        default: return status || "-";
    }
}

export function getOrderStatusColor(status: string) {
    const s = String(status || "").toUpperCase();
    switch (s) {
        case "PENDING": return "#f59e0b";
        case "ACCEPTED": return "#3b82f6";
        case "PICKED_UP": return "#8b5cf6";
        case "DELIVERING": return "#06b6d4";
        case "DELIVERED": return "#22c55e";
        case "CANCELLED": return "#ef4444";
        default: return "#6b7280";
    }
}
