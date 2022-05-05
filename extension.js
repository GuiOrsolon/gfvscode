const vscode = require('vscode');

const functions = require('./functions');

function activate(context) {

  context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createApp', function(){
			functions.createApp();
		})
	);	

	if(functions.checkIfIsAGrailsProject()){
		functions.defineAppProperties();

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.test', function(){
				if(functions.filterVersion(functions.getGrailsVersion(),'create-filter')){
					vscode.window.showInformationMessage(`create-filter is avaiable.`);
				}else{
					vscode.window.showErrorMessage(`create-filter isn't avaiable.`);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.runnApp', function(){
				functions.runApp();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.stopApp', function(){
				functions.stopApp();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.addProxy', function(){
				functions.addProxy(false);
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.addProxyWithUser', function(){
				functions.addProxy(true);
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.clearProxy', function(){
				functions.clearProxy();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.removeProxy', function(){
				functions.removeProxy();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.createDomainClass', function(){
				functions.createDomainClass();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.createController', function(){
				functions.createController();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.createService', function(){
				functions.createService();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.createFilter', function(){
				functions.createService();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.createInterceptor', function(){
				functions.createInterceptor();
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('gfvscode.createHibernateCfg', function(){
				functions.createHibernateCfgXML();
			})
		);
	}
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
