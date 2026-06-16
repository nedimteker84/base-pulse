// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CheckIn
/// @notice Records one check-in per wallet per 24-hour period.
contract CheckIn {
    uint256 public constant CHECK_IN_COOLDOWN = 24 hours;

    mapping(address => uint256) public lastCheckInAt;

    event CheckedIn(address indexed account, uint256 timestamp);

    error CheckInCooldownActive(uint256 lastCheckInAt, uint256 nextCheckInAt);

    function checkIn() external {
        uint256 lastTimestamp = lastCheckInAt[msg.sender];
        uint256 nextTimestamp = lastTimestamp + CHECK_IN_COOLDOWN;

        if (lastTimestamp != 0 && block.timestamp < nextTimestamp) {
            revert CheckInCooldownActive(lastTimestamp, nextTimestamp);
        }

        lastCheckInAt[msg.sender] = block.timestamp;

        emit CheckedIn(msg.sender, block.timestamp);
    }

    function canCheckIn(address account) external view returns (bool) {
        uint256 lastTimestamp = lastCheckInAt[account];

        return lastTimestamp == 0 || block.timestamp >= lastTimestamp + CHECK_IN_COOLDOWN;
    }

    function nextCheckInAt(address account) external view returns (uint256) {
        uint256 lastTimestamp = lastCheckInAt[account];

        if (lastTimestamp == 0) {
            return 0;
        }

        return lastTimestamp + CHECK_IN_COOLDOWN;
    }
}