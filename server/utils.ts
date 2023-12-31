export const addDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class Vector3 {
  constructor(readonly x: number, readonly y: number, readonly z: number) {}
}
