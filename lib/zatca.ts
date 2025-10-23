
function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function generateZatcaTlvBase64(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  invoiceTotal: string,
  vatTotal: string
): string {
  const fields = [
    { tag: 1, value: sellerName },
    { tag: 2, value: vatNumber },
    { tag: 3, value: timestamp },
    { tag: 4, value: invoiceTotal },
    { tag: 5, value: vatTotal },
  ];

  const allBytes: number[] = [];
  fields.forEach(field => {
    const valueBytes = textToBytes(field.value);
    // TLV: Tag, Length, Value
    allBytes.push(field.tag, valueBytes.length, ...Array.from(valueBytes));
  });
  
  const finalByteArray = new Uint8Array(allBytes);
  return bytesToBase64(finalByteArray);
}
