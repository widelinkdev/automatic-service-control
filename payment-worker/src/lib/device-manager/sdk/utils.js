export function isMacAddress(mac) {
    const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macAddressRegex.test(mac);
}
//# sourceMappingURL=utils.js.map