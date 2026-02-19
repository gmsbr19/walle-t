'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTransaction(data: any) {
    try {
        const payload = {
            description: data.description,
            amount: data.amount,
            type: data.type,
            date: data.date,
            competenceDate: data.competenceDate,
            isPaid: Boolean(data.isPaid),
            
            categoryId: Number(data.categoryId),
            fromAccId: Number(data.fromAccId),
            
            installmentTotal: data.installmentTotal ? Number(data.installmentTotal) : null,
            installmentCurrent: data.installmentCurrent ? Number(data.installmentCurrent) : null,
        }


        const transaction = await prisma.transaction.create({
            data: payload
        })

        revalidatePath("/")
        
        return { success: true, data: {...transaction, amount: Number(transaction.amount)} }
        
    } catch (error: any) {
        console.error("Mensagem:", error.message)
        console.error("Código:", error.code) 
        console.error("Meta:", error.meta)
        
        return { success: false, error: error.message }
    }
}