"use strict"
const optCreateApp 			      = { canSelectFiles: false						, canSelectFolders: true };
const optInputAppName 		    = { placeHolder: "Application Name"			, prompt: "Please, input the Application Name (without special characters)" };
const optInputDomainName      = { placeHolder: "Domain Class Name", prompt: "Please, input the Domain Class Name" };
const optInputControllerName	= { placeHolder: "Controller Name"	, prompt: "Please, input the Controller Name (without 'Controller' in their name)." };

module.exports = {
  optCreateApp,
  optInputAppName,
  optInputDomainName,
  optInputControllerName
}