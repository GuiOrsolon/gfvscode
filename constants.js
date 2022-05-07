"use strict"
const optCreateApp 			      = { canSelectFiles: false						, canSelectFolders: true };
const optCreatePlugin		      = { canSelectFiles: false						, canSelectFolders: true };
const optInputAppName 		    = { placeHolder: "Application Name"			, prompt: "Please, input the Application Name (without special characters)" };
const optInputPluginName 		  = { placeHolder: "Plugin Name"			, prompt: "Please, input the Plugin Name (without special characters)" };
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
const optInputGrailsCommand   = { placeHolder: "Grails Command"	, prompt: "Please, enter a command for grails."};
const optInputScriptName      = { placeHolder: "Script Name"	, prompt: "Please, enter a script name."};
const optInputTaglibName      = { placeHolder: "Taglib Name"	, prompt: "Please, enter a Tablib name."};
const optInputUnitTestName    = { placeHolder: "Unit Test Name"	, prompt: "Please, enter a Unit Test name."};

module.exports = {
  optCreateApp,
  optCreatePlugin,
  optInputAppName,
  optInputPluginName,
  optInputDomainName,
  optInputControllerName,
  optInputServiceName,
  optInputFilterName,
  optInputInterceptorName,
  optInputNameProxy,
  optInputHostProxy,
  optInputPortProxy,
  optInputUsernameProxy,
  optInputPasswordProxy,
  optInputGrailsCommand,
  optInputScriptName,
  optInputTaglibName,
  optInputUnitTestName
}