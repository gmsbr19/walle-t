import NavSidebar from "@/components/NavSidebar"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getDailyHistory, getTransactionYearMonths } from "@/services/transactions"
import { formatCurrency, formatDateLabel } from "@/utils/format"
import { DollarSign } from "lucide-react"
import Image from "next/image"
import React from "react"

export default async function Home() {
    const groupedTransactions = await getDailyHistory(2026, 2)
    const yearMonths = await getTransactionYearMonths()
    const days = Object.keys(groupedTransactions)

    console.log(yearMonths)

    return (
        <SidebarProvider>
            <NavSidebar />
            <main className="w-full">
                {/* <SidebarTrigger /> */}
                <section className="w-full px-40 flex flex-col gap-4">
                    {days.map((day) => (
                        <React.Fragment key={day}>
                            <div key={day} className="flex flex-col gap-2">
                                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                    {formatDateLabel(day)}
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {groupedTransactions[day].map((t) => (
                                        <Item className="hover:cursor-pointer hover:bg-accent">
                                            <ItemMedia variant="icon">
                                                <DollarSign size={24} />
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemTitle className="leading-7">
                                                    {t.description}
                                                </ItemTitle>
                                            </ItemContent>
                                            <ItemActions>
                                                <span className="font-mono">
                                                    {formatCurrency(t.amount)}
                                                </span>
                                            </ItemActions>
                                        </Item>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                        </React.Fragment>
                    ))}
                </section>
            </main>
        </SidebarProvider>
    )
}
