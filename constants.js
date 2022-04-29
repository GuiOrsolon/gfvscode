"use strict"
const optCreateApp 			      = { canSelectFiles: false						, canSelectFolders: true };
const optInputAppName 		    = { placeHolder: "Application Name"			, prompt: "Please, input the Application Name (without special characters)" };
const optInputDomainName      = { placeHolder: "Domain Class Name", prompt: "Please, input the Domain Class Name" };
const optInputControllerName	= { placeHolder: "Controller Name"	, prompt: "Please, input the Controller Name (without 'Controller' in their name)." };
const optInputServiceName	    = { placeHolder: "Service Name"	, prompt: "Please, input the Service Name." };
const optInputFilterName	    = { placeHolder: "Filter Name"	, prompt: "Please, input the Filter Name." };
const optInputInterceptorName	= { placeHolder: "Interceptor Name"	, prompt: "Please, input the Interceptor Name." };
const optInputNameProxy	      = { placeHolder: "Configuration Proxy Name (required)"	, prompt: "Please, enter the Configuration Proxy Name." };
const optInputHostProxy	      = { placeHolder: "Hostname Proxy (required)"	, prompt: "Please, enter the Hostname." };
const optInputPortProxy       = { placeHolder: "Port (required, only numbers)"	, prompt: "Please, enter the port of Proxy." };
const optInputUsernameProxy   = { placeHolder: "Username (optional)"	, prompt: "Please, enter the Username proxy if exists." };
const optInputPasswordProxy   = { placeHolder: "Password (optional)"	, prompt: "Please, enter the Password proxy if exists.", password: true };

module.exports = {
  optCreateApp,
  optInputAppName,
  optInputDomainName,
  optInputControllerName,
  optInputServiceName,
  optInputFilterName,
  optInputInterceptorName,
  optInputNameProxy,
  optInputHostProxy,
  optInputPortProxy,
  optInputUsernameProxy,
  optInputPasswordProxy
}