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
    constructor(
        string memory _name, 
        string memory _symbol, 
        uint8 _decimal, 
        uint256 _amount
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimal;
        //transaction
        // from, to, data, value, gas, ...
        _mint(_amount*10**uint256(decimals), msg.sender);  // 1 MT를 발행 (sender에게)
    }

    function _mint(uint256 amount, address owner) internal {
        totalSupply += amount;
        balanceOf[owner] += amount;
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

    function transfer(uint256 amount, address to) external {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
    }
}