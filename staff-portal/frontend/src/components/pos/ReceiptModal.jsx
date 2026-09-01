import React, { useRef } from 'react';

const ReceiptModal = ({ sale, onClose }) => {
  const printRef = useRef();

  if (!sale) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'width=600,height=800');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Receipt - ${sale.invoiceNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-header h2 { margin: 0; font-size: 24px; }
            .receipt-header p { margin: 5px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .totals { margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    windowPrint.print();
    windowPrint.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto flex-1 text-black" ref={printRef}>
          <div className="receipt-header">
            <h2>SUPER STORE ERP</h2>
            <p>123 Store Address, City</p>
            <p>Phone: +1 234 567 8900</p>
          </div>
          
          <div className="divider"></div>
          
          <div>
            <p><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}</p>
            <p><strong>Invoice #:</strong> {sale.invoiceNumber}</p>
            {sale.customer && <p><strong>Customer:</strong> {sale.customer.name}</p>}
            <p><strong>Cashier:</strong> {sale.cashierId?.name || 'Staff'}</p>
          </div>

          <div className="divider"></div>

          <div className="mb-2 font-bold flex justify-between">
            <span>Item</span>
            <span>Total</span>
          </div>
          
          {sale.items.map((item, index) => (
            <div key={index} className="item-row text-sm">
              <div className="flex-1 pr-4">
                <div>{item.productName}</div>
                <div className="text-gray-500 text-xs">{item.quantity} x Rs. {item.unitPrice}</div>
              </div>
              <div className="font-medium">Rs. {item.total}</div>
            </div>
          ))}

          <div className="divider"></div>

          <div className="totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>Rs. {sale.subtotal}</span>
            </div>
            <div className="totals-row text-xl mt-2">
              <span>Total</span>
              <span>Rs. {sale.total}</span>
            </div>
          </div>

          <div className="divider"></div>
          
          <div className="footer">
            <p>Payment Status: {sale.paymentStatus.toUpperCase()}</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-4">
          <button 
            onClick={handlePrint}
            className="flex-1 bg-[#6C3CE1] hover:bg-[#5b32bf] text-white py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print / Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
