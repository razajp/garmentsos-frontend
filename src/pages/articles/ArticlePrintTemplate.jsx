import React from 'react';

const ArticlePrintView = ({ article }) => {
  const totals = {
    fabric: article.rates?.filter(r => r.category === 'fabric').reduce((sum, r) => sum + r.price, 0) || 0,
    work: article.rates?.filter(r => r.category === 'work').reduce((sum, r) => sum + r.price, 0) || 0,
    accessory: article.rates?.filter(r => r.category === 'accessory').reduce((sum, r) => sum + r.price, 0) || 0,
    labor: article.rates?.filter(r => r.category === 'labor').reduce((sum, r) => sum + r.price, 0) || 0,
  };

  return (
    <div className="print-only p-10 bg-white text-black font-sans min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Production Sheet</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">GarmentsOS • Internal Document</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-800">{article.article_no}</h2>
          <p className="text-sm font-medium text-slate-500">{article.season} | {article.category}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        {/* Specs */}
        <div className="space-y-4">
          <h3 className="font-bold uppercase text-xs border-b pb-2 text-slate-400">Basic Specifications</h3>
          <PrintRow label="Fabric Type" value={article.fabric_type} />
          <PrintRow label="Size Ratio" value={article.size} />
          <PrintRow label="Total Quantity" value={`${article.quantity} Pcs`} />
          <PrintRow label="Entry Date" value={new Date(article.createdAt).toLocaleDateString()} />
        </div>
        {/* Financials */}
        <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-200">
          <h3 className="font-bold uppercase text-xs text-slate-400 mb-2">Costing Summary</h3>
          <div className="flex justify-between text-sm"><span>Total Cost Price:</span> <span className="font-bold">Rs. {article.total_cost.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Target Retail:</span> <span className="font-bold">Rs. {article.sales_rate.toLocaleString()}</span></div>
          <div className="h-[1px] bg-slate-200 my-2" />
          <div className="flex justify-between text-lg font-black text-slate-900 uppercase"><span>Profit Margin:</span> <span>{(((article.sales_rate - article.total_cost) / article.sales_rate) * 100).toFixed(1)}%</span></div>
        </div>
      </div>

      {/* Rates Breakdown */}
      <div className="mb-10">
        <h3 className="font-bold uppercase text-xs border-b pb-4 mb-4 text-slate-400">Detailed Cost Breakdown</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-900 text-white"><th className="p-3">Category</th><th className="p-3">Title</th><th className="p-3 text-right">Unit Price</th></tr>
          </thead>
          <tbody className="divide-y">
            {article.rates?.map((rate, i) => (
              <tr key={i}>
                <td className="p-3 font-bold uppercase text-[10px] text-slate-500">{rate.category}</td>
                <td className="p-3 font-medium">{rate.title}</td>
                <td className="p-3 text-right font-bold tracking-wider">Rs. {rate.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Notes */}
      {article.description && (
        <div className="border-l-4 border-slate-200 pl-6 mt-10">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Production Notes:</h4>
          <p className="text-sm italic text-slate-600 leading-relaxed">{article.description}</p>
        </div>
      )}

      {/* Signatures */}
      <div className="mt-20 flex justify-between gap-10">
        <div className="w-48 border-t border-slate-400 pt-2 text-center text-[10px] uppercase font-bold text-slate-400">Production Manager</div>
        <div className="w-48 border-t border-slate-400 pt-2 text-center text-[10px] uppercase font-bold text-slate-400">Finance Approval</div>
      </div>
    </div>
  );
};

const PrintRow = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-100 py-1">
    <span className="text-xs text-slate-500 font-medium">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value || '---'}</span>
  </div>
);

export default ArticlePrintView;