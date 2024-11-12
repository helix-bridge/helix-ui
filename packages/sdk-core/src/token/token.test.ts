import { Token } from "./token";

const nativeToken10 = new Token(1, "0x0000000000000000000000000000000000000000", 18, "ETH", "ETH");
const nativeToken11 = new Token(1, "0x0000000000000000000000000000000000000000", 18, "ETH", "ETH");
const nativeToken20 = new Token(2, "0x0000000000000000000000000000000000000000", 18, "ETH", "ETH");

const token10 = new Token(1, "0x0000000000000000000000000000000000000001", 18, "ETH", "ETH");
const token11 = new Token(1, "0x0000000000000000000000000000000000000001", 18, "ETH", "ETH");
const token20 = new Token(2, "0x0000000000000000000000000000000000000001", 18, "ETH", "ETH");
const token21 = new Token(2, "0x0000000000000000000000000000000000000002", 18, "ETH", "ETH");

test("The token is native token", () => {
  expect(nativeToken10.isNative).toBe(true);
  expect(nativeToken11.isNative).toBe(true);
  expect(nativeToken20.isNative).toBe(true);
});

test("The token is not a native token", () => {
  expect(token10.isNative).toBe(false);
  expect(token11.isNative).toBe(false);
  expect(token20.isNative).toBe(false);
  expect(token21.isNative).toBe(false);
});

test("The two tokens are equal", () => {
  expect(nativeToken10.isEqual(nativeToken11)).toBe(true);
  expect(token10.isEqual(token11)).toBe(true);
});

test("The two tokens are not equal", () => {
  expect(token11.isEqual(token20)).toBe(false);
  expect(token20.isEqual(token21)).toBe(false);
});

test("The token format ether", () => {
  expect(token10.formatEther(12345678876543210000000000n)).toBe("12345678.87654321");
});

test("The token parse ether", () => {
  expect(token10.parseEther("12345678.87654321")).toBe(12345678876543210000000000n);
});
