// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Upload is ERC2771Context {

  struct Access{
     address user;
     bool access;
  }
  mapping(address=>string[]) value;
  mapping(address=>mapping(address=>bool)) ownership;
  mapping(address=>Access[]) accessList;
  mapping(address=>mapping(address=>bool)) previousData;

  constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

  function add(address _user,string memory url) external {
      value[_user].push(url);
  }
  function allow(address user) external {
      ownership[_msgSender()][user]=true;
      if(previousData[_msgSender()][user]){
         for(uint i=0;i<accessList[_msgSender()].length;i++){
             if(accessList[_msgSender()][i].user==user){
                  accessList[_msgSender()][i].access=true;
             }
         }
      }else{
          accessList[_msgSender()].push(Access(user,true));
          previousData[_msgSender()][user]=true;
      }
  }
  function disallow(address user) public{
      ownership[_msgSender()][user]=false;
      for(uint i=0;i<accessList[_msgSender()].length;i++){
          if(accessList[_msgSender()][i].user==user){
              accessList[_msgSender()][i].access=false;
          }
      }
  }

  function display(address _user) external view returns(string[] memory){
      require(_user==_msgSender() || ownership[_user][_msgSender()],"You don't have access");
      return value[_user];
  }

  function shareAccess() public view returns(Access[] memory){
      return accessList[_msgSender()];
  }
}
