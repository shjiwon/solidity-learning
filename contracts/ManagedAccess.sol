
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract ManagedAccess {
    address public owner;
    address public manager;

    // 여러 Manager와 승인 상태 관리
    address[] public managers;
    mapping(address => bool) public isManager;
    mapping(address => bool) public confirmed;

    constructor(address _owner, address _manager) {
        owner = _owner;
        manager = _manager;

        // 기존 manager를 첫 번째 Manager로 등록
        managers.push(_manager);
        isManager[_manager] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            "You are not authorized to manage this contract"
        );
        _;
    }

    // Manager 등록 (Owner만 가능)
    function addManager(address _manager) external onlyOwner {
        require(!isManager[_manager], "Already a manager");
        require(_manager != address(0), "Invalid manager");

        managers.push(_manager);
        isManager[_manager] = true;
    }

    // Manager 승인
    function confirm() external {
        require(isManager[msg.sender], "You are not a manager");
        require(!confirmed[msg.sender], "Already confirmed");

        confirmed[msg.sender] = true;
    }

    // 모든 Manager가 승인했는지 확인
    modifier onlyAllConfirmed() {
        require(isManager[msg.sender], "You are not a manager");
        require(managers.length >= 3, "Not all confirmed yet");

        for (uint256 i = 0; i < managers.length; i++) {
            require(confirmed[managers[i]], "Not all confirmed yet");
        }
        _;
    }
}