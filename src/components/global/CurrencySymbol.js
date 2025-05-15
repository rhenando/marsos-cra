import React from "react";
import { ReactComponent as SarIcon } from "../../assets/sar_symbol.svg";

const Currency = ({ amount, className = "", iconClass = "" }) => (
  <span className='inline-flex items-center gap-1'>
    <SarIcon className={`w-4 h-4 ${iconClass}`} />
    <span className={className}>{parseFloat(amount).toFixed(2)}</span>
  </span>
);

export default Currency;
