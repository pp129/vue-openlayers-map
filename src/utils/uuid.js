let counter = 0;
function generateUUId() {
  const prefix = crypto.getRandomValues(new Uint8Array(8)).reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");
  return `${prefix}-${Atomics.add(new Int32Array(new SharedArrayBuffer(4)), 0, 1)}`;
}

export { generateUUId };
