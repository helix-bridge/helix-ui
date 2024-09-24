
$.verbose = true;

const baselink = 'https://helix-apps-c2zvua46q-itering.vercel.app/assets';

const files = `
Arc-QDJFTGH2-kQUVOusT.js
Brave-YATE5BIM-Crgwi_gE.js
Browser-HN7O5MN7-DHqH2OSI.js
Chrome-LGF33C3S-CKyHgdNL.js
Edge-K2JEGI5S-_s-lgiRS.js
Firefox-NP5SYEK5-7GCpd7vS.js
Linux-NS2LQPT4-BSWfZXoy.js
Macos-2KTZ2XLP-pPa2wwwq.js
Opera-KV54PXPA-7mn5oIb-.js
Safari-2QIYKJ4P-DQKkg1Bn.js
Windows-R3CKAIUV-PWNRgNSo.js
ar_AR-PQJDYWVZ-APfsCj9O.js
arbitrum-LYDBJZP3-BMNNBURC.js
assets-26YY4GVD-BJE_4jQP.js
avalanche-TFPKP544-BAW5xZLs.js
base-3MIUIYGA-BacvpD6v.js
braveWallet-BTBH4MDN-Dk8CDq00.js
bsc-S2GSW6VX-Bz0b4JEm.js
ccip-DjkOoLC9.js
coinbaseWallet-2OUR5TUP-CpvNSmI2.js
connect-XNDTNVUH-Rkfb_zm3.js
create-PAJXJDV3-CO2P7llu.js
cronos-DQKKIEX7-D-xN-IeE.js
es_419-GLICGTYE-DAMYsXQt.js
ethereum-4FY57XJF-BF1-Gkmk.js
fr_FR-UC7Z4T6O-B67bog61.js
hardhat-ARRFHFKB-BsaKr6xa.js
hi_IN-RGKVTIVE-Do-3nNHB.js
hooks.module-D456YPrV.js
id_ID-3SKVJ2RK-DLkFahck.js
index-Bl6Lkf65.js
index-C5o-2F8D.css
index-CPuAEUoa.js
index-Ca5iS1sT.js
index-Cnb0ezsQ.js
index-DKyRIqqa.js
index-Dy-WAr9t.js
index.es-BlHtwxd-.js
index.es-DAoTMZAm.js
injectedWallet-EUKDEAIU-CMyNXBNM.js
ja_JP-GYCPH6AT-B2ynLT17.js
ko_KR-V2HAEAHG-MSD6VZVz.js
lnaccess-controller-CY66MO2d.js
lnbridge-v3-CO3fue1_.js
lnv2-default-D6l1N3uU.js
lnv2-opposite-CY9WgYrv.js
login-ZSMM5UYL-DT0rm6wp.js
metaMaskWallet-ORHUNQRP-DhHH5FFG.js
msgline-messager-B71sigHl.js
okxWallet-GKYMI2XW-CdXZL5HC.js
optimism-UUP5Y7TB-BI-bx6R2.js
polygon-Z4QITDL7-DuMBfvk7.js
pt_BR-JDDVMLRA-aYSlgkhd.js
rabbyWallet-22VWIFCE-C-acKMUn.js
rainbowWallet-GGU64QEI-Buwz1oV3.js
refresh-5KGGHTJP-CHhFOl-t.js
ru_RU-3W6WVVOI-CElW9r3c.js
safeWallet-DFMLSLCR-7Jx5rkap.js
safeWallet-DFMLSLCR-BD-GpskT.js
scan-HZBLXLM4-DxZfTx07.js
sign-FZVB2CS6-DXQn9z7A.js
talismanWallet-W5EQ26N7-COwK-IAC.js
th_TH-UWDENI2F-isfr4Uax.js
tr_TR-NAI3OICG-BccpdJoF.js
uk_UA-H7BFRWP5-BxO6MaLd.js
walletConnectWallet-D6ZADJM7-BtZ74X7H.js
workbox-window.prod.es5-rX37VysU.js
xdc-5UHQ25DW-DoSn3ve8.js
zh_CN-BO5MSGV2-D6N76dxU.js
zkSync-XRUC4ZHO-CS2pRbzJ.js
zora-KVO7WIOK-CYiMysry.js
`;

for (const f of files.split('\n')) {
    if (!f) continue;
    const url = `${baselink}/${f}`;
    await $`curl -LO ${url}`;
}
