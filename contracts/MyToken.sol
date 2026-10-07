// Token : smart contract based
// BIT, ETH, XRP, KAIA : native token 

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MyToken {
    string public name;
    string public symbol;
    // uint8: 8bit unsigned integer, 0~255
    uint8 public decimals; // 1 ETH = 1 * 10^18 wei , 1 wei = 1 * 10^-18 ETH

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // 문자열을 파라미터로 받을 때 memory를 사용해야 함
    constructor(string memory _name, string memory _symbol, uint8 _decimal) {
        name = _name;
        symbol = _symbol;
        decimals = _decimal;
    }

    // function totalSupply() external view returns (uint256) {
    //     return totalSupply;
    // }

    // function balanceOf(address owner) external view returns (uint256) {
    //     return balanceOf[owner];
    // }

    // function name() external view returns (string memory) {
    //     return name;
    // }
}