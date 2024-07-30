import { Token } from "./token";

const nativeToken = new Token(1, "0x0000000000000000000000000000000000000000", 18, "ETH", "ETH");
const tokenA = new Token(1, "0x0000000000000000000000000000000000000001", 18, "ETH", "ETH");
const tokenB = new Token(1, "0x0000000000000000000000000000000000000001", 18, "ETH", "ETH");
const tokenC = new Token(1, "0x0000000000000000000000000000000000000002", 18, "ETH", "ETH");
const tokenD = new Token(2, "0x0000000000000000000000000000000000000002", 18, "ETH", "ETH");

test("The token is native token", () => {
  expect(nativeToken.isNative).toBe(true);
});

test("The token is not a native token", () => {
  expect(tokenA.isNative).toBe(false);
});

test("The two tokens are equal", () => {
  expect(tokenA.isEqual(tokenB)).toBe(true);
});

test("The two tokens are not equal", () => {
  expect(tokenA.isEqual(tokenC)).toBe(false);
  expect(tokenC.isEqual(tokenD)).toBe(false);
});
