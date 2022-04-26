"use strict"
const optCreateApp 			      = { canSelectFiles: false						, canSelectFolders: true };
const optInputAppName 		    = { placeHolder: "Application Name"			, prompt: "Please, input the Application Name (without special characters)" };
const optInputDomainName      = { placeHolder: "Domain Class Name", prompt: "Please, input the Domain Class Name" };
const optInputControllerName	= { placeHolder: "Controller Name"	, prompt: "Please, input the Controller Name (without 'Controller' in their name)." };
const optInputServiceName	    = { placeHolder: "Service Name"	, prompt: "Please, input the Service Name." };
const optInputFilterName	    = { placeHolder: "Filter Name"	, prompt: "Please, input the Filter Name." };
const optInputInterceptorName	    = { placeHolder: "Interceptor Name"	, prompt: "Please, input the Interceptor Name." };

module.exports = {
  optCreateApp,
  optInputAppName,
  optInputDomainName,
  optInputControllerName,
  optInputServiceName,
  optInputFilterName,
  optInputInterceptorName
}