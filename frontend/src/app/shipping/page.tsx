export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-20 text-center">
          <h1 className="text-[12vw] sm:text-[8vw] leading-none font-black tracking-tighter uppercase text-black mb-4">
            Shipping
          </h1>
          <p className="text-neutral-500 font-medium uppercase tracking-widest text-sm">Delivery & Returns Policy</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-neutral max-w-none">
          
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-6 border-b-2 border-black pb-2">Domestic Shipping</h2>
          <div className="overflow-x-auto mb-16">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-300">
                  <th className="py-4 font-bold uppercase tracking-widest text-xs">Method</th>
                  <th className="py-4 font-bold uppercase tracking-widest text-xs">Delivery Time</th>
                  <th className="py-4 font-bold uppercase tracking-widest text-xs text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-4 font-medium text-black">Standard Ground</td>
                  <td className="py-4">3-5 Business Days</td>
                  <td className="py-4 text-right font-mono">$10.00</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-4 font-medium text-black">Express 2-Day</td>
                  <td className="py-4">2 Business Days</td>
                  <td className="py-4 text-right font-mono">$25.00</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-4 font-medium text-black">Overnight</td>
                  <td className="py-4">Next Business Day</td>
                  <td className="py-4 text-right font-mono">$45.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-6 border-b-2 border-black pb-2">International Shipping</h2>
          <p className="text-neutral-500 mb-12 leading-relaxed">
            We ship to over 150 countries worldwide. International shipping costs are calculated at checkout based on the weight and destination of your order. Please note that international orders may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country. E-Shop is not responsible for these charges if they are applied and are your responsibility as the customer.
          </p>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-6 border-b-2 border-black pb-2">Returns & Exchanges</h2>
          <p className="text-neutral-500 mb-6 leading-relaxed">
            We want you to be completely satisfied with your purchase. If for any reason you are not, we accept returns within 14 days of delivery.
          </p>
          <ul className="list-disc pl-6 text-neutral-500 space-y-2 mb-12">
            <li>Items must be unworn, unwashed, and have original tags attached.</li>
            <li>Footwear must include the original shoe box in its original condition.</li>
            <li>Final sale items cannot be returned or exchanged.</li>
            <li>A return shipping fee of $8.00 will be deducted from your refund.</li>
          </ul>

        </div>
        
      </div>
    </div>
  );
}
