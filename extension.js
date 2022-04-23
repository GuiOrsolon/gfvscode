const vscode = require('vscode');

const functions = require('./functions');

function activate(context) {

	if(functions.checkIfIsAGrailsProject())
		functions.defineAppProperties();

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
		vscode.commands.registerCommand('gfvscode.createApp', function(){
			functions.createApp();
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
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
