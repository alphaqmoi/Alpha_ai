import { TradingInterface } from "@/components/trading-interface"
import { BitgetTradingStatus } from "@/components/bitget-trading-status"

export default function TradingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Trading Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BitgetTradingStatus />
        <TradingInterface />
      </div>
    </div>
  )
}
