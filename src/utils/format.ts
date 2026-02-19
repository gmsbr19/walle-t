import { Decimal } from "@/generated/runtime/client"

export function formatCurrency(value: number | string | Decimal) {
    const amount =
        typeof value === "object" && "toNumber" in value
            ? value.toNumber()
            : Number(value)

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(amount)
}

export function formatDateLabel(dateStr: string) {
    const date = new Date(dateStr)
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset())

    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    if (isToday) return "Hoje"

    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
}