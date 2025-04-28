import { NextResponse } from "next/server"
import * as BitgetService from "@/lib/bitget-trading-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  switch (action) {
    case "status":
      return NextResponse.json(BitgetService.getTradingStatus())

    case "account":
      const accountInfo = await BitgetService.getAccountInfo()
      return NextResponse.json(accountInfo)

    case "transactions":
      return NextResponse.json({
        success: true,
        transactions: BitgetService.getTransactions(),
      })

    default:
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action",
        },
        { status: 400 },
      )
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action } = body

  switch (action) {
    case "start":
      const startResult = await BitgetService.startBackgroundTrading()
      return NextResponse.json(startResult)

    case "stop":
      const stopResult = BitgetService.stopBackgroundTrading()
      return NextResponse.json(stopResult)

    case "trade":
      const { symbol, side, quantity } = body
      if (!symbol || !side || !quantity) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required parameters",
          },
          { status: 400 },
        )
      }

      const tradeResult = await BitgetService.placeTrade(symbol, side, quantity)
      return NextResponse.json(tradeResult)

    case "check-order":
      const { orderId } = body
      if (!orderId) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing order ID",
          },
          { status: 400 },
        )
      }

      const orderStatus = await BitgetService.checkOrderStatus(orderId)
      return NextResponse.json(orderStatus)

    default:
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action",
        },
        { status: 400 },
      )
  }
}
